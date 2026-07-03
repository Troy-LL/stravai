#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const APP_ROOT = resolve(__dirname, "../../..");
const MARKER_FILE = join(ROOT, ".stravai-last-commit");

function loadEnv() {
  const envPath = join(APP_ROOT, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env) || !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv();

function run(cmd, cwd = process.cwd()) {
  return execSync(cmd, { cwd, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
}

function requireGitRepo() {
  try {
    run("git rev-parse --git-dir");
  } catch {
    console.error("stravai: not inside a git repository");
    process.exit(1);
  }
}

function getRepoName(cwd) {
  try {
    const remote = run("git remote get-url origin", cwd);
    const match = remote.match(/[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
    return match ? match[1] : remote;
  } catch {
    return run("git rev-parse --show-toplevel", cwd).split(/[/\\]/).pop() ?? "unknown";
  }
}

function parseShortstat(output) {
  let locAdded = 0;
  let locRemoved = 0;
  const insertMatch = output.match(/(\d+) insertion/);
  const deleteMatch = output.match(/(\d+) deletion/);
  if (insertMatch) locAdded = Number(insertMatch[1]);
  if (deleteMatch) locRemoved = Number(deleteMatch[1]);
  return { locAdded, locRemoved };
}

function getDiffStats(cwd) {
  try {
    const stat = run("git diff --shortstat HEAD~1..HEAD", cwd);
    return parseShortstat(stat);
  } catch {
    try {
      const stat = run("git diff --shortstat", cwd);
      return parseShortstat(stat);
    } catch {
      return { locAdded: 0, locRemoved: 0 };
    }
  }
}

function getDurationSec(cwd) {
  const now = Date.now();
  let startedAt = new Date(now - 5 * 60 * 1000);

  if (existsSync(MARKER_FILE)) {
    try {
      const marker = JSON.parse(readFileSync(MARKER_FILE, "utf8"));
      if (marker.timestamp) {
        const elapsed = Math.floor((now - marker.timestamp) / 1000);
        const capped = Math.min(Math.max(elapsed, 60), 4 * 60 * 60);
        startedAt = new Date(now - capped * 1000);
      }
    } catch {
      // ignore bad marker
    }
  }

  try {
    const commitTime = run("git log -1 --format=%ct", cwd);
    const commitMs = Number(commitTime) * 1000;
    if (commitMs > 0 && commitMs < now) {
      const elapsed = Math.floor((now - commitMs) / 1000);
      const capped = Math.min(Math.max(elapsed, 60), 4 * 60 * 60);
      startedAt = new Date(now - capped * 1000);
    }
  } catch {
    // keep marker/default
  }

  const durationSec = Math.max(60, Math.floor((now - startedAt.getTime()) / 1000));
  return { startedAt, durationSec };
}

async function postActivity(payload) {
  const url = (process.env.STRAVAI_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const token = process.env.STRAVAI_TOKEN;

  if (!token) {
    console.error("stravai: STRAVAI_TOKEN is not set. Generate one at /settings.");
    process.exit(1);
  }

  const res = await fetch(`${url}/api/activities`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error(`stravai: API error ${res.status}:`, err.error ?? res.statusText);
    process.exit(1);
  }

  return res.json();
}

async function record() {
  requireGitRepo();
  const cwd = process.cwd();
  const { locAdded, locRemoved } = getDiffStats(cwd);
  const { startedAt, durationSec } = getDurationSec(cwd);
  const repo = getRepoName(cwd);

  const result = await postActivity({
    startedAt: startedAt.toISOString(),
    durationSec,
    locAdded,
    locRemoved,
    commitCount: 1,
    repo,
  });

  writeFileSync(MARKER_FILE, JSON.stringify({ timestamp: Date.now() }));

  console.log(`Recorded: ${result.activity.title} (${result.activity.locNet} LOC net)`);
}

function installHook() {
  requireGitRepo();
  const cwd = process.cwd();
  const gitDir = run("git rev-parse --git-dir", cwd);
  const hooksDir = gitDir.startsWith(".")
    ? join(cwd, gitDir, "hooks")
    : join(gitDir, "hooks");

  if (!existsSync(hooksDir)) mkdirSync(hooksDir, { recursive: true });

  const hookPath = join(hooksDir, "post-commit");

  const hookContent = `#!/bin/sh
# StravAI post-commit hook
STRAVAI_URL="${process.env.STRAVAI_URL ?? "http://localhost:3000"}"
STRAVAI_TOKEN="${process.env.STRAVAI_TOKEN ?? ""}"
export STRAVAI_URL STRAVAI_TOKEN
node "${join(ROOT, "bin", "stravai.js")}" record
`;

  writeFileSync(hookPath, hookContent, { mode: 0o755 });

  console.log(`Installed post-commit hook at ${hookPath}`);
  if (!process.env.STRAVAI_TOKEN) {
    console.warn("Warning: STRAVAI_TOKEN not set in current shell. Set it before committing.");
  }
}

const [command] = process.argv.slice(2);

switch (command) {
  case "record":
    await record();
    break;
  case "install-hook":
    installHook();
    break;
  default:
    console.log(`StravAI CLI

Usage:
  stravai record          Log the latest commit as a coding activity
  stravai install-hook    Install a git post-commit hook

Environment:
  STRAVAI_URL    API base URL (default: http://localhost:3000)
  STRAVAI_TOKEN  Bearer token from /settings
`);
}

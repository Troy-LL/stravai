import * as vscode from "vscode";
import { execSync } from "child_process";
import * as path from "path";

let sessionStart: Date | null = null;
let statusBar: vscode.StatusBarItem | null = null;
let tickTimer: NodeJS.Timeout | null = null;

function getConfig() {
  const config = vscode.workspace.getConfiguration("stravai");
  return {
    apiUrl: (config.get<string>("apiUrl") ?? "http://localhost:3000").replace(/\/$/, ""),
    token: config.get<string>("token") ?? "",
  };
}

function runGit(args: string, cwd: string): string {
  return execSync(`git ${args}`, { cwd, encoding: "utf8" }).trim();
}

function getRepoName(cwd: string): string | undefined {
  try {
    const remote = runGit("remote get-url origin", cwd);
    const match = remote.match(/[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
    return match ? match[1] : path.basename(cwd);
  } catch {
    try {
      return path.basename(runGit("rev-parse --show-toplevel", cwd));
    } catch {
      return undefined;
    }
  }
}

function getLocStats(cwd: string): { locAdded: number; locRemoved: number } {
  try {
    const stat = runGit("diff --shortstat", cwd);
    let locAdded = 0;
    let locRemoved = 0;
    const insertMatch = stat.match(/(\d+) insertion/);
    const deleteMatch = stat.match(/(\d+) deletion/);
    if (insertMatch) locAdded = Number(insertMatch[1]);
    if (deleteMatch) locRemoved = Number(deleteMatch[1]);
    return { locAdded, locRemoved };
  } catch {
    return { locAdded: 0, locRemoved: 0 };
  }
}

function updateStatusBar() {
  if (!statusBar || !sessionStart) return;
  const elapsed = Math.floor((Date.now() - sessionStart.getTime()) / 1000);
  const min = Math.floor(elapsed / 60);
  const sec = elapsed % 60;
  statusBar.text = `$(run) StravAI ${min}:${sec.toString().padStart(2, "0")}`;
}

async function postActivity(body: Record<string, unknown>) {
  const { apiUrl, token } = getConfig();
  if (!token) {
    throw new Error("stravai.token is not set. Generate a token at StravAI Settings.");
  }

  const res = await fetch(`${apiUrl}/api/activities`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return res.json();
}

function startSession() {
  if (sessionStart) {
    vscode.window.showWarningMessage("StravAI session already running.");
    return;
  }

  sessionStart = new Date();
  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBar.command = "stravai.stopSession";
  statusBar.tooltip = "Click to stop StravAI session";
  statusBar.show();
  updateStatusBar();
  tickTimer = setInterval(updateStatusBar, 1000);
  vscode.window.showInformationMessage("StravAI session started.");
}

async function stopSession() {
  if (!sessionStart) {
    vscode.window.showWarningMessage("No active StravAI session.");
    return;
  }

  const startedAt = sessionStart;
  const endedAt = new Date();
  const durationSec = Math.max(60, Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000));

  const folders = vscode.workspace.workspaceFolders;
  const cwd = folders?.[0]?.uri.fsPath ?? process.cwd();
  const { locAdded, locRemoved } = getLocStats(cwd);
  const repo = getRepoName(cwd);

  try {
    const result = await postActivity({
      startedAt: startedAt.toISOString(),
      durationSec,
      locAdded,
      locRemoved,
      commitCount: 0,
      repo,
    });

    const activity = (result as { activity: { title: string; locNet: number } }).activity;
    vscode.window.showInformationMessage(
      `Recorded: ${activity.title} (${activity.locNet} LOC net)`,
    );
  } catch (err) {
    vscode.window.showErrorMessage(
      err instanceof Error ? err.message : "Failed to record activity",
    );
  } finally {
    sessionStart = null;
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = null;
    statusBar?.dispose();
    statusBar = null;
  }
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("stravai.startSession", startSession),
    vscode.commands.registerCommand("stravai.stopSession", stopSession),
  );
}

export function deactivate() {
  if (tickTimer) clearInterval(tickTimer);
  statusBar?.dispose();
}

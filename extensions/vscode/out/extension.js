"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
let sessionStart = null;
let statusBar = null;
let tickTimer = null;
function getConfig() {
    const config = vscode.workspace.getConfiguration("stravai");
    return {
        apiUrl: (config.get("apiUrl") ?? "http://localhost:3000").replace(/\/$/, ""),
        token: config.get("token") ?? "",
    };
}
function runGit(args, cwd) {
    return (0, child_process_1.execSync)(`git ${args}`, { cwd, encoding: "utf8" }).trim();
}
function getRepoName(cwd) {
    try {
        const remote = runGit("remote get-url origin", cwd);
        const match = remote.match(/[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
        return match ? match[1] : path.basename(cwd);
    }
    catch {
        try {
            return path.basename(runGit("rev-parse --show-toplevel", cwd));
        }
        catch {
            return undefined;
        }
    }
}
function getLocStats(cwd) {
    try {
        const stat = runGit("diff --shortstat", cwd);
        let locAdded = 0;
        let locRemoved = 0;
        const insertMatch = stat.match(/(\d+) insertion/);
        const deleteMatch = stat.match(/(\d+) deletion/);
        if (insertMatch)
            locAdded = Number(insertMatch[1]);
        if (deleteMatch)
            locRemoved = Number(deleteMatch[1]);
        return { locAdded, locRemoved };
    }
    catch {
        return { locAdded: 0, locRemoved: 0 };
    }
}
function updateStatusBar() {
    if (!statusBar || !sessionStart)
        return;
    const elapsed = Math.floor((Date.now() - sessionStart.getTime()) / 1000);
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    statusBar.text = `$(run) StravAI ${min}:${sec.toString().padStart(2, "0")}`;
}
async function postActivity(body) {
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
        throw new Error(err.error ?? `HTTP ${res.status}`);
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
        const activity = result.activity;
        vscode.window.showInformationMessage(`Recorded: ${activity.title} (${activity.locNet} LOC net)`);
    }
    catch (err) {
        vscode.window.showErrorMessage(err instanceof Error ? err.message : "Failed to record activity");
    }
    finally {
        sessionStart = null;
        if (tickTimer)
            clearInterval(tickTimer);
        tickTimer = null;
        statusBar?.dispose();
        statusBar = null;
    }
}
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand("stravai.startSession", startSession), vscode.commands.registerCommand("stravai.stopSession", stopSession));
}
function deactivate() {
    if (tickTimer)
        clearInterval(tickTimer);
    statusBar?.dispose();
}
//# sourceMappingURL=extension.js.map
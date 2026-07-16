"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

const HANDLES = ["alex", "jordan", "sam", "taylor"];

export function DevLogin({ redirectTo = "/" }: { redirectTo?: string }) {
  const [handle, setHandle] = useState("alex");

  return (
    <div className="w-full rounded-2xl border border-dashed border-border bg-card p-4 text-left">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Dev login (local only)
      </p>
      <div className="mt-2 flex gap-2">
        <select
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          {HANDLES.map((h) => (
            <option key={h} value={h}>
              @{h}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => signIn("dev", { handle, redirectTo })}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background"
        >
          Enter
        </button>
      </div>
    </div>
  );
}

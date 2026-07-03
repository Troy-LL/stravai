"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RecordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const defaultStart = new Date(now.getTime() - 60 * 60 * 1000);
  const defaultStartValue = defaultStart.toISOString().slice(0, 16);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const startedAt = form.get("startedAt") as string;
    const durationMin = Number(form.get("durationMin"));
    const locAdded = Number(form.get("locAdded"));
    const locRemoved = Number(form.get("locRemoved"));
    const commitCount = Number(form.get("commitCount"));
    const repo = (form.get("repo") as string) || undefined;
    const title = (form.get("title") as string) || undefined;

    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          startedAt: new Date(startedAt).toISOString(),
          durationSec: durationMin * 60,
          locAdded,
          locRemoved,
          commitCount,
          repo,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to record activity");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          Title <span className="text-muted">(optional)</span>
        </label>
        <input
          id="title"
          name="title"
          placeholder="Auto-generated if blank"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-accent"
        />
      </div>

      <div>
        <label htmlFor="startedAt" className="mb-1 block text-sm font-medium">
          Started at
        </label>
        <input
          id="startedAt"
          name="startedAt"
          type="datetime-local"
          required
          defaultValue={defaultStartValue}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-accent"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="durationMin" className="mb-1 block text-sm font-medium">
            Duration (minutes)
          </label>
          <input
            id="durationMin"
            name="durationMin"
            type="number"
            min={1}
            required
            defaultValue={60}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="commitCount" className="mb-1 block text-sm font-medium">
            Commits
          </label>
          <input
            id="commitCount"
            name="commitCount"
            type="number"
            min={0}
            defaultValue={1}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="locAdded" className="mb-1 block text-sm font-medium">
            LOC added
          </label>
          <input
            id="locAdded"
            name="locAdded"
            type="number"
            min={0}
            required
            defaultValue={200}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="locRemoved" className="mb-1 block text-sm font-medium">
            LOC removed
          </label>
          <input
            id="locRemoved"
            name="locRemoved"
            type="number"
            min={0}
            defaultValue={50}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label htmlFor="repo" className="mb-1 block text-sm font-medium">
          Repo <span className="text-muted">(optional)</span>
        </label>
        <input
          id="repo"
          name="repo"
          placeholder="acme/my-project"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-accent"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
      >
        {loading ? "Recording…" : "Record activity"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type KudosButtonProps = {
  activityId: string;
  initialCount: number;
  initialHasKudoed: boolean;
};

export function KudosButton({
  activityId,
  initialCount,
  initialHasKudoed,
}: KudosButtonProps) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [hasKudoed, setHasKudoed] = useState(initialHasKudoed);
  const [loading, setLoading] = useState(false);

  async function toggleKudos() {
    setLoading(true);
    try {
      const res = await fetch(`/api/activities/${activityId}/kudos`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setCount(data.kudosCount);
      setHasKudoed(data.hasKudoed);
      router.refresh();
    } catch {
      // keep prior state on failure
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleKudos}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        hasKudoed
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-background text-foreground hover:border-accent/50"
      }`}
      aria-pressed={hasKudoed}
    >
      <span aria-hidden>👏</span>
      <span>Kudos</span>
      {count > 0 && <span className="text-muted">({count})</span>}
    </button>
  );
}

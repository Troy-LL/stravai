"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type CommentData = {
  id: string;
  body: string;
  createdAt: string;
  user: { name: string; handle: string; avatarUrl: string | null };
};

export function CommentThread({
  activityId,
  initial,
}: {
  activityId: string;
  initial: CommentData[];
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initial);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/activities/${activityId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setComments((c) => [...c, data.comment]);
      setBody("");
      router.refresh();
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 space-y-2">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-2 text-sm">
          <span className="font-semibold">{c.user.name}</span>
          <span className="text-foreground/80">{c.body}</span>
        </div>
      ))}
      <form onSubmit={submit} className="flex gap-2 pt-1">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading || !body.trim()}
          className="chip disabled:opacity-50"
        >
          Post
        </button>
      </form>
    </div>
  );
}

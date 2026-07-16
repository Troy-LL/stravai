"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function JoinButton({
  challengeId,
  initialJoined,
}: {
  challengeId: string;
  initialJoined: boolean;
}) {
  const [joined, setJoined] = useState(initialJoined);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/challenges/${challengeId}/join`, {
        method: "POST",
      });
      const data = await res.json();
      setJoined(data.joined);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (joined) {
    return (
      <button className="chip" onClick={toggle} disabled={loading}>
        Leave
      </button>
    );
  }

  return (
    <button className="btn-accent px-4 py-2 text-sm" onClick={toggle} disabled={loading}>
      Join challenge
    </button>
  );
}

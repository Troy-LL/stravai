"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type TokenRow = {
  id: string;
  name: string;
  lastUsedAt: string | null;
  createdAt: string;
};

type TokenManagerProps = {
  initialTokens: TokenRow[];
};

export function TokenManager({ initialTokens }: TokenManagerProps) {
  const router = useRouter();
  const [tokens, setTokens] = useState(initialTokens);
  const [name, setName] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createToken(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNewToken(null);

    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "CLI token" }),
      });
      if (!res.ok) throw new Error("Failed to create token");
      const data = await res.json();
      setNewToken(data.token.rawToken);
      setTokens((prev) => [
        {
          id: data.token.id,
          name: data.token.name,
          createdAt: data.token.createdAt,
          lastUsedAt: null,
        },
        ...prev,
      ]);
      setName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function revokeToken(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tokens/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to revoke token");
      setTokens((prev) => prev.filter((t) => t.id !== id));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={createToken} className="space-y-3">
        <div>
          <label htmlFor="tokenName" className="mb-1 block text-sm font-medium">
            Token name
          </label>
          <input
            id="tokenName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. MacBook CLI"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-60"
        >
          Generate token
        </button>
      </form>

      {newToken && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
          <p className="text-sm font-medium text-accent">
            Copy this token now — it won&apos;t be shown again.
          </p>
          <code className="mt-2 block break-all rounded-lg bg-background px-3 py-2 text-sm">
            {newToken}
          </code>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Active tokens
        </h2>
        {tokens.length === 0 ? (
          <p className="text-sm text-muted">No tokens yet.</p>
        ) : (
          <ul className="space-y-2">
            {tokens.map((token) => (
              <li
                key={token.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="font-medium">{token.name}</p>
                  <p className="text-xs text-muted">
                    Created {new Date(token.createdAt).toLocaleDateString()}
                    {token.lastUsedAt
                      ? ` · Last used ${new Date(token.lastUsedAt).toLocaleDateString()}`
                      : " · Never used"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => revokeToken(token.id)}
                  disabled={loading}
                  className="text-sm font-medium text-red-600 hover:underline disabled:opacity-60"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

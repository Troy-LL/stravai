import { TokenManager } from "@/components/TokenManager";
import { getCurrentUser } from "@/lib/currentUser";
import { listApiTokens } from "@/lib/tokens";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const tokens = await listApiTokens(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-muted">
          API tokens let the CLI, git hook, and VS Code extension post activities
          as <span className="font-medium text-foreground">{user.name}</span>.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">API tokens</h2>
        <TokenManager
          initialTokens={tokens.map((t) => ({
            id: t.id,
            name: t.name,
            lastUsedAt: t.lastUsedAt?.toISOString() ?? null,
            createdAt: t.createdAt.toISOString(),
          }))}
        />
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 text-sm text-muted">
        <h2 className="mb-2 font-semibold text-foreground">Usage</h2>
        <pre className="overflow-x-auto rounded-lg bg-background p-3 text-xs">
{`export STRAVAI_URL=http://localhost:3000
export STRAVAI_TOKEN=sai_...

# CLI
npx stravai record

# curl
curl -X POST $STRAVAI_URL/api/activities \\
  -H "Authorization: Bearer $STRAVAI_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"startedAt":"...","durationSec":3600,"locAdded":100,"locRemoved":20,"commitCount":1}'`}
        </pre>
      </section>
    </div>
  );
}

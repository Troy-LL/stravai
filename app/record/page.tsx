import { RecordForm } from "@/components/RecordForm";

export default function RecordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Record activity</h1>
        <p className="mt-1 text-muted">
          Log a coding session manually. A VS Code extension will post to the same
          API later.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <RecordForm />
      </div>
    </div>
  );
}

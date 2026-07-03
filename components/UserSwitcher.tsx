"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type UserOption = {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string | null;
};

type UserSwitcherProps = {
  users: UserOption[];
  currentHandle: string;
};

export function UserSwitcher({ users, currentHandle }: UserSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const current = users.find((u) => u.handle === currentHandle);

  async function handleChange(handle: string) {
    await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
    });
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-muted sm:inline">Viewing as</span>
      <select
        value={currentHandle}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm font-medium outline-none focus:border-accent"
        aria-label="Switch demo user"
      >
        {users.map((user) => (
          <option key={user.id} value={user.handle}>
            {user.name}
          </option>
        ))}
      </select>
      {current?.avatarUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={current.avatarUrl}
          alt=""
          className="hidden h-8 w-8 rounded-full sm:block"
        />
      )}
    </label>
  );
}

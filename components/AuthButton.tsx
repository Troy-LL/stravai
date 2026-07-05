import { signOut } from "@/auth";
import { getCurrentUser } from "@/lib/currentUser";

export async function AuthButton() {
  const user = await getCurrentUser();

  return (
    <div className="flex items-center gap-2">
      {user.avatarUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatarUrl}
          alt=""
          className="h-8 w-8 rounded-full"
        />
      )}
      <span className="hidden text-sm font-medium sm:inline">{user.name}</span>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button
          type="submit"
          className="rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium text-foreground/80 transition hover:border-accent hover:text-accent"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

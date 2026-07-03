import Link from "next/link";
import { getAllUsers, getCurrentUser } from "@/lib/currentUser";
import { UserSwitcher } from "@/components/UserSwitcher";

const links = [
  { href: "/", label: "Feed" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/record", label: "Record" },
  { href: "/settings", label: "Settings" },
];

export async function Nav() {
  const [currentUser, users] = await Promise.all([
    getCurrentUser(),
    getAllUsers(),
  ]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-accent">
            StravAI
          </Link>
          <nav className="hidden items-center gap-4 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/80 transition hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={`/profile/${currentUser.handle}`}
              className="text-sm font-medium text-foreground/80 transition hover:text-accent"
            >
              Profile
            </Link>
          </nav>
        </div>
        <UserSwitcher users={users} currentHandle={currentUser.handle} />
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-border px-4 py-2 sm:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap text-sm font-medium text-foreground/80"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href={`/profile/${currentUser.handle}`}
          className="whitespace-nowrap text-sm font-medium text-foreground/80"
        >
          Profile
        </Link>
      </nav>
    </header>
  );
}

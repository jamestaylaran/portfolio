import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { verifySession } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";
import DatabaseNotice from "@/components/DatabaseNotice";
import { logout } from "../actions";

// Admin pages read the owner's session cookie, so they must render per request
// and can't be statically prerendered.
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/achievements", label: "Achievements" },
  { href: "/admin/involvement", label: "Involvement" },
  { href: "/admin/password", label: "Password" },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // No database connected yet: show setup instructions instead of a 500.
  if (!isDatabaseConfigured()) {
    return <DatabaseNotice />;
  }

  // Real authorization check (in addition to the optimistic proxy check).
  const isOwner = await verifySession();
  if (!isOwner) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <span className="font-semibold">
              Owner <span className="text-muted">Dashboard</span>
            </span>
            <nav>
              <ul className="flex items-center gap-1 text-sm">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded-md px-3 py-2 text-muted transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-muted hover:text-foreground">
              View site ↗
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}

import Link from "next/link";
import { getProfile } from "@/lib/data";
import { isDatabaseConfigured } from "@/lib/db";
import DatabaseNotice from "@/components/DatabaseNotice";
import type { ReactNode } from "react";

// Render at request time so edits from the dashboard appear immediately and the
// build never needs database access.
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/achievements", label: "Achievements" },
  { href: "/involvement", label: "Involvement" },
  { href: "/contact", label: "Contact" },
];

export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  // No database connected yet: show setup instructions instead of a 500.
  if (!isDatabaseConfigured()) {
    return <DatabaseNotice />;
  }

  const profile = await getProfile();
  const year = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold tracking-tight">
            {profile.avatar_text ? (
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ background: profile.accent }}
              >
                {profile.avatar_text}
              </span>
            ) : (
              <span className="gradient-text">{profile.name}</span>
            )}
          </Link>
          <ul className="flex items-center gap-1 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="nav-link rounded-md px-3 py-2 text-muted transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-muted sm:flex-row">
          <p>
            © {year} {profile.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {profile.social_github && (
              <a
                href={profile.social_github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                GitHub
              </a>
            )}
            {profile.social_linkedin && (
              <a
                href={profile.social_linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                LinkedIn
              </a>
            )}
            <Link href="/admin" className="hover:text-foreground">
              Owner
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

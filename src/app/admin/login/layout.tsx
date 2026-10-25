import type { ReactNode } from "react";
import { isDatabaseConfigured } from "@/lib/db";
import DatabaseNotice from "@/components/DatabaseNotice";

// Login reads the session cookie and the stored password hash, so it must
// render per request rather than be statically prerendered.
export const dynamic = "force-dynamic";

/**
 * The login route sits OUTSIDE the auth-gated (dashboard) group on purpose:
 * the dashboard layout redirects unauthenticated visitors to this page, so it
 * must not apply its own auth check here (that caused an infinite redirect).
 */
export default function LoginLayout({ children }: { children: ReactNode }) {
  if (!isDatabaseConfigured()) {
    return <DatabaseNotice />;
  }
  return <>{children}</>;
}

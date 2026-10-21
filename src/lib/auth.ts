import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { SESSION_COOKIE, decrypt } from "./session";

/**
 * Verify the owner session from the cookie. Memoized per render pass.
 * Returns true when a valid, unexpired owner session exists.
 */
export const verifySession = cache(async (): Promise<boolean> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = await decrypt(token);
  return payload?.role === "owner";
});

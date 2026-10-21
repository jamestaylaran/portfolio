"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@vercel/postgres";
import { ensureSchema } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  encrypt,
  sessionCookieOptions,
} from "@/lib/session";
import { verifySession } from "@/lib/auth";

export type AuthState = { error?: string } | undefined;

async function getStoredPasswordHash(): Promise<string | null> {
  await ensureSchema();
  const { rows } =
    await sql`SELECT value FROM settings WHERE key = 'password_hash'`;
  return rows[0]?.value ?? null;
}

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const stored = await getStoredPasswordHash();

  if (!stored || !verifyPassword(password, stored)) {
    return { error: "Incorrect password. Please try again." };
  }

  const token = await encrypt({
    role: "owner",
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());

  redirect("/admin");
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function changePassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (!(await verifySession())) {
    return { error: "You must be logged in." };
  }

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!next || next.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (next !== confirm) {
    return { error: "New passwords do not match." };
  }

  const stored = await getStoredPasswordHash();
  if (!stored || !verifyPassword(current, stored)) {
    return { error: "Current password is incorrect." };
  }

  await sql`UPDATE settings SET value = ${hashPassword(next)} WHERE key = 'password_hash'`;

  return {};
}

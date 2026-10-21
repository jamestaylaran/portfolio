import { sql } from "@vercel/postgres";
import { ensureSchema } from "./db";
import type { Achievement, Activity, Profile, Role } from "./types";

// All reads run at request time against Postgres. ensureSchema() creates the
// tables and seeds placeholder content on first run.

export async function getProfile(): Promise<Profile> {
  await ensureSchema();
  const { rows } = await sql`SELECT * FROM profile WHERE id = 1`;
  return rows[0] as Profile;
}

export async function getAchievements(): Promise<Achievement[]> {
  await ensureSchema();
  const { rows } =
    await sql`SELECT * FROM achievements ORDER BY sort_order ASC, date DESC`;
  return rows as Achievement[];
}

export async function getRoles(): Promise<Role[]> {
  await ensureSchema();
  const { rows } =
    await sql`SELECT * FROM roles ORDER BY sort_order ASC, start_date DESC`;
  return rows as Role[];
}

export async function getActivities(): Promise<Activity[]> {
  await ensureSchema();
  const { rows } =
    await sql`SELECT * FROM activities ORDER BY sort_order ASC, date DESC`;
  return rows as Activity[];
}

export async function getSkills(): Promise<string[]> {
  const profile = await getProfile();
  return profile.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

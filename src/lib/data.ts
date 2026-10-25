import { ensureSchema } from "./db";
import { isDatabaseConfigured, sql } from "./sql";
import type { Achievement, Activity, Profile, Role } from "./types";

// All reads run at request time against Postgres. ensureSchema() creates the
// tables and seeds placeholder content on first run.
//
// When no database is connected yet, these return inert placeholder values
// instead of throwing, so pages never crash. The layouts show setup
// instructions in that situation.

const PLACEHOLDER_PROFILE: Profile = {
  id: 1,
  name: "",
  headline: "",
  tagline: "",
  bio: "",
  location: "",
  email: "",
  phone: "",
  website: "",
  resume_url: "",
  avatar_text: "",
  accent: "#6366f1",
  social_github: "",
  social_linkedin: "",
  social_twitter: "",
  social_facebook: "",
  skills: "",
};

export async function getProfile(): Promise<Profile> {
  if (!isDatabaseConfigured()) return PLACEHOLDER_PROFILE;
  await ensureSchema();
  const rows = await sql`SELECT * FROM profile WHERE id = 1`;
  return (rows[0] as unknown as Profile) ?? PLACEHOLDER_PROFILE;
}

export async function getAchievements(): Promise<Achievement[]> {
  if (!isDatabaseConfigured()) return [];
  await ensureSchema();
  const rows =
    await sql`SELECT * FROM achievements ORDER BY sort_order ASC, date DESC`;
  return rows as unknown as Achievement[];
}

export async function getRoles(): Promise<Role[]> {
  if (!isDatabaseConfigured()) return [];
  await ensureSchema();
  const rows =
    await sql`SELECT * FROM roles ORDER BY sort_order ASC, start_date DESC`;
  return rows as unknown as Role[];
}

export async function getActivities(): Promise<Activity[]> {
  if (!isDatabaseConfigured()) return [];
  await ensureSchema();
  const rows =
    await sql`SELECT * FROM activities ORDER BY sort_order ASC, date DESC`;
  return rows as unknown as Activity[];
}

export async function getSkills(): Promise<string[]> {
  const profile = await getProfile();
  return profile.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

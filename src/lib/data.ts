import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "./db";
import type { Achievement, Activity, Profile, Role } from "./types";

// Every public read is cached under the "content" tag and refreshed with a long
// lifetime. The owner dashboard calls updateTag("content") after each edit so
// changes show up immediately without a redeploy.

export async function getProfile(): Promise<Profile> {
  "use cache";
  cacheLife("max");
  cacheTag("content");
  const db = getDb();
  return db.prepare("SELECT * FROM profile WHERE id = 1").get() as Profile;
}

export async function getAchievements(): Promise<Achievement[]> {
  "use cache";
  cacheLife("max");
  cacheTag("content");
  const db = getDb();
  return db
    .prepare("SELECT * FROM achievements ORDER BY sort_order ASC, date DESC")
    .all() as Achievement[];
}

export async function getRoles(): Promise<Role[]> {
  "use cache";
  cacheLife("max");
  cacheTag("content");
  const db = getDb();
  return db
    .prepare("SELECT * FROM roles ORDER BY sort_order ASC, start_date DESC")
    .all() as Role[];
}

export async function getActivities(): Promise<Activity[]> {
  "use cache";
  cacheLife("max");
  cacheTag("content");
  const db = getDb();
  return db
    .prepare("SELECT * FROM activities ORDER BY sort_order ASC, date DESC")
    .all() as Activity[];
}

export async function getSkills(): Promise<string[]> {
  const profile = await getProfile();
  return profile.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// The footer shows the current year. It's cached (rather than a bare
// new Date()) so it's stable during prerender and refreshes daily.
export async function getCopyrightYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

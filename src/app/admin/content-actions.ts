"use server";

import { revalidatePath } from "next/cache";
import { ensureSchema } from "@/lib/db";
import { sql } from "@/lib/sql";
import { verifySession } from "@/lib/auth";

export type ContentState = { error?: string; ok?: boolean } | undefined;

/**
 * Every mutation below is guarded by verifySession(). Server Actions are
 * reachable via direct POST requests, so the check must live here — not only
 * in the UI.
 */
async function requireOwner() {
  const ok = await verifySession();
  if (!ok) throw new Error("Unauthorized");
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/achievements");
  revalidatePath("/involvement");
  revalidatePath("/about");
  revalidatePath("/contact");
}

// ---------- Profile ----------

export async function updateProfile(
  _prev: ContentState,
  formData: FormData
): Promise<ContentState> {
  await requireOwner();
  await ensureSchema();

  const v = (f: string) => String(formData.get(f) ?? "").trim();

  await sql`
    UPDATE profile SET
      name = ${v("name")},
      headline = ${v("headline")},
      tagline = ${v("tagline")},
      bio = ${v("bio")},
      location = ${v("location")},
      email = ${v("email")},
      phone = ${v("phone")},
      website = ${v("website")},
      resume_url = ${v("resume_url")},
      avatar_text = ${v("avatar_text")},
      accent = ${v("accent")},
      social_github = ${v("social_github")},
      social_linkedin = ${v("social_linkedin")},
      social_twitter = ${v("social_twitter")},
      social_facebook = ${v("social_facebook")},
      skills = ${v("skills")}
    WHERE id = 1
  `;

  revalidateAll();
  return { ok: true };
}

// ---------- Achievements ----------

export async function saveAchievement(
  _prev: ContentState,
  formData: FormData
): Promise<ContentState> {
  await requireOwner();
  await ensureSchema();

  const id = Number(formData.get("id") ?? 0);
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const organization = String(formData.get("organization") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!title) return { error: "Title is required." };

  if (id) {
    await sql`
      UPDATE achievements SET
        title = ${title}, description = ${description},
        organization = ${organization}, date = ${date},
        category = ${category}, sort_order = ${sortOrder}
      WHERE id = ${id}
    `;
  } else {
    await sql`
      INSERT INTO achievements (title, description, organization, date, category, sort_order)
      VALUES (${title}, ${description}, ${organization}, ${date}, ${category}, ${sortOrder})
    `;
  }

  revalidateAll();
  return { ok: true };
}

export async function deleteAchievement(formData: FormData): Promise<void> {
  await requireOwner();
  await ensureSchema();
  await sql`DELETE FROM achievements WHERE id = ${Number(formData.get("id"))}`;
  revalidateAll();
}

// ---------- Roles ----------

export async function saveRole(
  _prev: ContentState,
  formData: FormData
): Promise<ContentState> {
  await requireOwner();
  await ensureSchema();

  const id = Number(formData.get("id") ?? 0);
  const organization = String(formData.get("organization") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDate = String(formData.get("end_date") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "Officer").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!organization || !position) {
    return { error: "Organization and position are required." };
  }

  if (id) {
    await sql`
      UPDATE roles SET
        organization = ${organization}, position = ${position},
        start_date = ${startDate}, end_date = ${endDate},
        description = ${description}, type = ${type}, sort_order = ${sortOrder}
      WHERE id = ${id}
    `;
  } else {
    await sql`
      INSERT INTO roles (organization, position, start_date, end_date, description, type, sort_order)
      VALUES (${organization}, ${position}, ${startDate}, ${endDate}, ${description}, ${type}, ${sortOrder})
    `;
  }

  revalidateAll();
  return { ok: true };
}

export async function deleteRole(formData: FormData): Promise<void> {
  await requireOwner();
  await ensureSchema();
  await sql`DELETE FROM roles WHERE id = ${Number(formData.get("id"))}`;
  revalidateAll();
}

// ---------- Activities ----------

export async function saveActivity(
  _prev: ContentState,
  formData: FormData
): Promise<ContentState> {
  await requireOwner();
  await ensureSchema();

  const id = Number(formData.get("id") ?? 0);
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const activityType = String(formData.get("activity_type") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!title) return { error: "Title is required." };

  if (id) {
    await sql`
      UPDATE activities SET
        title = ${title}, description = ${description},
        activity_type = ${activityType}, date = ${date},
        link = ${link}, sort_order = ${sortOrder}
      WHERE id = ${id}
    `;
  } else {
    await sql`
      INSERT INTO activities (title, description, activity_type, date, link, sort_order)
      VALUES (${title}, ${description}, ${activityType}, ${date}, ${link}, ${sortOrder})
    `;
  }

  revalidateAll();
  return { ok: true };
}

export async function deleteActivity(formData: FormData): Promise<void> {
  await requireOwner();
  await ensureSchema();
  await sql`DELETE FROM activities WHERE id = ${Number(formData.get("id"))}`;
  revalidateAll();
}

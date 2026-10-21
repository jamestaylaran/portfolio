"use server";

import { revalidatePath, updateTag } from "next/cache";
import { getDb } from "@/lib/db";
import { verifySession } from "@/lib/auth";

export type ContentState = { error?: string; ok?: boolean } | undefined;

/**
 * Every mutation below is guarded by verifySession(). Server Actions are
 * reachable via direct POST requests, so the check must live here — not only
 * in the UI.
 */
function requireOwner() {
  // verifySession redirects are not used here; we throw so the action aborts.
  return verifySession().then((ok) => {
    if (!ok) throw new Error("Unauthorized");
    return ok;
  });
}

function revalidateAll() {
  updateTag("content");
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

  const fields = [
    "name",
    "headline",
    "tagline",
    "bio",
    "location",
    "email",
    "phone",
    "website",
    "resume_url",
    "avatar_text",
    "accent",
    "social_github",
    "social_linkedin",
    "social_twitter",
    "social_facebook",
    "skills",
  ] as const;

  const values = fields.map((f) => String(formData.get(f) ?? "").trim());

  const db = getDb();
  db.prepare(
    `UPDATE profile SET ${fields.map((f) => `${f} = ?`).join(", ")} WHERE id = 1`
  ).run(...values);

  revalidateAll();
  return { ok: true };
}

// ---------- Achievements ----------

export async function saveAchievement(
  _prev: ContentState,
  formData: FormData
): Promise<ContentState> {
  await requireOwner();

  const id = Number(formData.get("id") ?? 0);
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const organization = String(formData.get("organization") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!title) return { error: "Title is required." };

  const db = getDb();
  if (id) {
    db.prepare(
      `UPDATE achievements SET title=?, description=?, organization=?, date=?, category=?, sort_order=? WHERE id=?`
    ).run(title, description, organization, date, category, sortOrder, id);
  } else {
    db.prepare(
      `INSERT INTO achievements (title, description, organization, date, category, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(title, description, organization, date, category, sortOrder);
  }

  revalidateAll();
  return { ok: true };
}

export async function deleteAchievement(formData: FormData): Promise<void> {
  await requireOwner();
  const id = Number(formData.get("id"));
  const db = getDb();
  db.prepare("DELETE FROM achievements WHERE id = ?").run(id);
  revalidateAll();
}

// ---------- Roles ----------

export async function saveRole(
  _prev: ContentState,
  formData: FormData
): Promise<ContentState> {
  await requireOwner();

  const id = Number(formData.get("id") ?? 0);
  const organization = String(formData.get("organization") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim();
  const start_date = String(formData.get("start_date") ?? "").trim();
  const end_date = String(formData.get("end_date") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "Officer").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!organization || !position) {
    return { error: "Organization and position are required." };
  }

  const db = getDb();
  if (id) {
    db.prepare(
      `UPDATE roles SET organization=?, position=?, start_date=?, end_date=?, description=?, type=?, sort_order=? WHERE id=?`
    ).run(
      organization,
      position,
      start_date,
      end_date,
      description,
      type,
      sortOrder,
      id
    );
  } else {
    db.prepare(
      `INSERT INTO roles (organization, position, start_date, end_date, description, type, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      organization,
      position,
      start_date,
      end_date,
      description,
      type,
      sortOrder
    );
  }

  revalidateAll();
  return { ok: true };
}

export async function deleteRole(formData: FormData): Promise<void> {
  await requireOwner();
  const id = Number(formData.get("id"));
  const db = getDb();
  db.prepare("DELETE FROM roles WHERE id = ?").run(id);
  revalidateAll();
}

// ---------- Activities ----------

export async function saveActivity(
  _prev: ContentState,
  formData: FormData
): Promise<ContentState> {
  await requireOwner();

  const id = Number(formData.get("id") ?? 0);
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const activity_type = String(formData.get("activity_type") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const link = String(formData.get("link") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!title) return { error: "Title is required." };

  const db = getDb();
  if (id) {
    db.prepare(
      `UPDATE activities SET title=?, description=?, activity_type=?, date=?, link=?, sort_order=? WHERE id=?`
    ).run(title, description, activity_type, date, link, sortOrder, id);
  } else {
    db.prepare(
      `INSERT INTO activities (title, description, activity_type, date, link, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(title, description, activity_type, date, link, sortOrder);
  }

  revalidateAll();
  return { ok: true };
}

export async function deleteActivity(formData: FormData): Promise<void> {
  await requireOwner();
  const id = Number(formData.get("id"));
  const db = getDb();
  db.prepare("DELETE FROM activities WHERE id = ?").run(id);
  revalidateAll();
}

"use client";

import { useActionState, useState } from "react";
import {
  deleteAchievement,
  saveAchievement,
  type ContentState,
} from "../../content-actions";
import type { Achievement } from "@/lib/types";

const CATEGORIES = [
  "Academic",
  "Competition",
  "Leadership",
  "Certification",
  "Award",
  "Other",
];

const EMPTY = {
  id: 0,
  title: "",
  description: "",
  organization: "",
  date: "",
  category: "Academic",
  sort_order: 0,
};

export function AchievementsManager({
  achievements,
}: {
  achievements: Achievement[];
}) {
  const [editing, setEditing] = useState(EMPTY);
  const [state, formAction, pending] = useActionState<ContentState, FormData>(
    saveAchievement,
    undefined
  );

  return (
    <div className="space-y-8">
      <div className="card p-6">
        <h2 className="font-semibold">
          {editing.id ? "Edit achievement" : "Add achievement"}
        </h2>
        <form action={formAction} className="mt-4 space-y-4">
          <input type="hidden" name="id" value={editing.id} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="field sm:col-span-2">
              <label htmlFor="a-title">Title</label>
              <input
                id="a-title"
                name="title"
                value={editing.title}
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
                required
              />
            </div>
            <div className="field">
              <label htmlFor="a-org">Organization</label>
              <input
                id="a-org"
                name="organization"
                value={editing.organization}
                onChange={(e) =>
                  setEditing({ ...editing, organization: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="a-date">Date</label>
              <input
                id="a-date"
                name="date"
                type="date"
                value={editing.date}
                onChange={(e) =>
                  setEditing({ ...editing, date: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="a-category">Category</label>
              <select
                id="a-category"
                name="category"
                value={editing.category}
                onChange={(e) =>
                  setEditing({ ...editing, category: e.target.value })
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="a-sort">Sort order</label>
              <input
                id="a-sort"
                name="sort_order"
                type="number"
                value={editing.sort_order}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    sort_order: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="field sm:col-span-2">
              <label htmlFor="a-desc">Description</label>
              <textarea
                id="a-desc"
                name="description"
                rows={3}
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
              />
            </div>
          </div>

          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
          {state?.ok && <p className="text-sm text-green-400">Saved.</p>}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={pending} className="btn btn-primary">
              {pending ? "Saving…" : editing.id ? "Update" : "Add"}
            </button>
            {editing.id !== 0 && (
              <button
                type="button"
                onClick={() => setEditing(EMPTY)}
                className="btn btn-ghost"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {achievements.map((a) => (
          <div
            key={a.id}
            className="card flex items-center justify-between gap-4 p-4"
          >
            <div>
              <p className="font-medium">{a.title}</p>
              <p className="text-sm text-muted">
                {a.organization} · {a.category} · {a.date}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setEditing({
                    id: a.id,
                    title: a.title,
                    description: a.description,
                    organization: a.organization,
                    date: a.date,
                    category: a.category,
                    sort_order: a.sort_order,
                  })
                }
                className="btn btn-ghost"
              >
                Edit
              </button>
              <form action={deleteAchievement}>
                <input type="hidden" name="id" value={a.id} />
                <button type="submit" className="btn btn-danger">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
        {achievements.length === 0 && (
          <p className="text-muted">No achievements yet.</p>
        )}
      </div>
    </div>
  );
}

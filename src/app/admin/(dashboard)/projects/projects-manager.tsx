"use client";

import { useActionState, useState } from "react";
import { deleteActivity, saveActivity, type ContentState } from "../../content-actions";
import type { Activity } from "@/lib/types";

const ACTIVITY_TYPES = ["Project"];

const EMPTY_PROJECT = {
  id: 0,
  title: "",
  description: "",
  activity_type: "Project",
  date: "",
  link: "",
  sort_order: 0,
};

export function ProjectsManager({
  projects,
}: {
  projects: Activity[];
}) {
  const [project, setProject] = useState(EMPTY_PROJECT);
  const [state, formAction, pending] = useActionState<ContentState, FormData>(
    saveActivity,
    undefined
  );

  return (
    <div className="space-y-10">
      <div className="card p-6">
        <h2 className="font-semibold">
          {project.id ? "Edit project" : "Add project"}
        </h2>
        <form action={formAction} className="mt-4 space-y-4">
          <input type="hidden" name="id" value={project.id} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="field sm:col-span-2">
              <label htmlFor="pr-title">Title</label>
              <input
                id="pr-title"
                name="title"
                value={project.title}
                onChange={(e) =>
                  setProject({ ...project, title: e.target.value })
                }
                required
              />
            </div>
            <div className="field">
              <label htmlFor="pr-type">Type</label>
              <select
                id="pr-type"
                name="activity_type"
                value={project.activity_type}
                onChange={(e) =>
                  setProject({ ...project, activity_type: e.target.value })
                }
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="pr-date">Date</label>
              <input
                id="pr-date"
                name="date"
                type="date"
                value={project.date}
                onChange={(e) =>
                  setProject({ ...project, date: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="pr-link">Link (optional)</label>
              <input
                id="pr-link"
                name="link"
                value={project.link}
                onChange={(e) =>
                  setProject({ ...project, link: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="pr-sort">Sort order</label>
              <input
                id="pr-sort"
                name="sort_order"
                type="number"
                value={project.sort_order}
                onChange={(e) =>
                  setProject({
                    ...project,
                    sort_order: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="field sm:col-span-2">
              <label htmlFor="pr-desc">Description</label>
              <textarea
                id="pr-desc"
                name="description"
                rows={3}
                value={project.description}
                onChange={(e) =>
                  setProject({ ...project, description: e.target.value })
                }
              />
            </div>
          </div>
          {state?.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}
          {state?.ok && (
            <p className="text-sm text-green-400">Saved.</p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="btn btn-primary"
            >
              {pending ? "Saving…" : project.id ? "Update" : "Add project"}
            </button>
            {project.id !== 0 && (
              <button
                type="button"
                onClick={() => setProject(EMPTY_PROJECT)}
                className="btn btn-ghost"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mt-4 space-y-3">
        {projects.map((a) => (
          <div
            key={a.id}
            className="card flex items-center justify-between gap-4 p-4"
          >
            <div>
              <p className="font-medium">{a.title}</p>
              <p className="text-sm text-muted">
                {a.activity_type} · {a.date}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setProject({
                    id: a.id,
                    title: a.title,
                    description: a.description,
                    activity_type: a.activity_type,
                    date: a.date,
                    link: a.link,
                    sort_order: a.sort_order,
                  })
                }
                className="btn btn-ghost"
              >
                Edit
              </button>
              <form action={deleteActivity}>
                <input type="hidden" name="id" value={a.id} />
                <button type="submit" className="btn btn-danger">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
        {projects.length === 0 && <p className="text-muted">No projects yet.</p>}
      </div>
    </div>
  );
}

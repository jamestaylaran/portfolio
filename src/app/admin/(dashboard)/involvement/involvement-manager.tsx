"use client";

import { useActionState, useState } from "react";
import {
  deleteActivity,
  deleteRole,
  saveActivity,
  saveRole,
  type ContentState,
} from "../../content-actions";
import type { Activity, Role } from "@/lib/types";

const ROLE_TYPES = ["Officer", "Member", "Volunteer", "Committee"];
const ACTIVITY_TYPES = [
  "Event",
  "Workshop",
  "Volunteer",
  "Contribution",
  "Project",
  "Other",
];

const EMPTY_ROLE = {
  id: 0,
  organization: "",
  position: "",
  start_date: "",
  end_date: "Present",
  description: "",
  type: "Officer",
  sort_order: 0,
};

const EMPTY_ACTIVITY = {
  id: 0,
  title: "",
  description: "",
  activity_type: "Event",
  date: "",
  link: "",
  sort_order: 0,
};

export function InvolvementManager({
  roles,
  activities,
}: {
  roles: Role[];
  activities: Activity[];
}) {
  const [role, setRole] = useState(EMPTY_ROLE);
  const [activity, setActivity] = useState(EMPTY_ACTIVITY);

  const [roleState, roleAction, rolePending] = useActionState<
    ContentState,
    FormData
  >(saveRole, undefined);
  const [actState, actAction, actPending] = useActionState<
    ContentState,
    FormData
  >(saveActivity, undefined);

  return (
    <div className="space-y-10">
      {/* Roles */}
      <section>
        <div className="card p-6">
          <h2 className="font-semibold">
            {role.id ? "Edit role" : "Add organization role"}
          </h2>
          <form action={roleAction} className="mt-4 space-y-4">
            <input type="hidden" name="id" value={role.id} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="field">
                <label htmlFor="r-org">Organization</label>
                <input
                  id="r-org"
                  name="organization"
                  value={role.organization}
                  onChange={(e) =>
                    setRole({ ...role, organization: e.target.value })
                  }
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="r-pos">Position</label>
                <input
                  id="r-pos"
                  name="position"
                  value={role.position}
                  onChange={(e) =>
                    setRole({ ...role, position: e.target.value })
                  }
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="r-start">Start date</label>
                <input
                  id="r-start"
                  name="start_date"
                  type="date"
                  value={role.start_date}
                  onChange={(e) =>
                    setRole({ ...role, start_date: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="r-end">End date</label>
                <input
                  id="r-end"
                  name="end_date"
                  value={role.end_date}
                  placeholder="Present"
                  onChange={(e) =>
                    setRole({ ...role, end_date: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="r-type">Type</label>
                <select
                  id="r-type"
                  name="type"
                  value={role.type}
                  onChange={(e) => setRole({ ...role, type: e.target.value })}
                >
                  {ROLE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="r-sort">Sort order</label>
                <input
                  id="r-sort"
                  name="sort_order"
                  type="number"
                  value={role.sort_order}
                  onChange={(e) =>
                    setRole({ ...role, sort_order: Number(e.target.value) })
                  }
                />
              </div>
              <div className="field sm:col-span-2">
                <label htmlFor="r-desc">Description</label>
                <textarea
                  id="r-desc"
                  name="description"
                  rows={3}
                  value={role.description}
                  onChange={(e) =>
                    setRole({ ...role, description: e.target.value })
                  }
                />
              </div>
            </div>
            {roleState?.error && (
              <p className="text-sm text-red-400">{roleState.error}</p>
            )}
            {roleState?.ok && (
              <p className="text-sm text-green-400">Saved.</p>
            )}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={rolePending}
                className="btn btn-primary"
              >
                {rolePending ? "Saving…" : role.id ? "Update" : "Add role"}
              </button>
              {role.id !== 0 && (
                <button
                  type="button"
                  onClick={() => setRole(EMPTY_ROLE)}
                  className="btn btn-ghost"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="mt-4 space-y-3">
          {roles.map((r) => (
            <div
              key={r.id}
              className="card flex items-center justify-between gap-4 p-4"
            >
              <div>
                <p className="font-medium">
                  {r.position} — {r.organization}
                </p>
                <p className="text-sm text-muted">
                  {r.type} · {r.start_date} – {r.end_date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setRole({
                      id: r.id,
                      organization: r.organization,
                      position: r.position,
                      start_date: r.start_date,
                      end_date: r.end_date,
                      description: r.description,
                      type: r.type,
                      sort_order: r.sort_order,
                    })
                  }
                  className="btn btn-ghost"
                >
                  Edit
                </button>
                <form action={deleteRole}>
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" className="btn btn-danger">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
          {roles.length === 0 && <p className="text-muted">No roles yet.</p>}
        </div>
      </section>

      {/* Activities */}
      <section>
        <div className="card p-6">
          <h2 className="font-semibold">
            {activity.id ? "Edit activity" : "Add activity"}
          </h2>
          <form action={actAction} className="mt-4 space-y-4">
            <input type="hidden" name="id" value={activity.id} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="field sm:col-span-2">
                <label htmlFor="ac-title">Title</label>
                <input
                  id="ac-title"
                  name="title"
                  value={activity.title}
                  onChange={(e) =>
                    setActivity({ ...activity, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="ac-type">Type</label>
                <select
                  id="ac-type"
                  name="activity_type"
                  value={activity.activity_type}
                  onChange={(e) =>
                    setActivity({ ...activity, activity_type: e.target.value })
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
                <label htmlFor="ac-date">Date</label>
                <input
                  id="ac-date"
                  name="date"
                  type="date"
                  value={activity.date}
                  onChange={(e) =>
                    setActivity({ ...activity, date: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="ac-link">Link (optional)</label>
                <input
                  id="ac-link"
                  name="link"
                  value={activity.link}
                  onChange={(e) =>
                    setActivity({ ...activity, link: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="ac-sort">Sort order</label>
                <input
                  id="ac-sort"
                  name="sort_order"
                  type="number"
                  value={activity.sort_order}
                  onChange={(e) =>
                    setActivity({
                      ...activity,
                      sort_order: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="field sm:col-span-2">
                <label htmlFor="ac-desc">Description</label>
                <textarea
                  id="ac-desc"
                  name="description"
                  rows={3}
                  value={activity.description}
                  onChange={(e) =>
                    setActivity({ ...activity, description: e.target.value })
                  }
                />
              </div>
            </div>
            {actState?.error && (
              <p className="text-sm text-red-400">{actState.error}</p>
            )}
            {actState?.ok && (
              <p className="text-sm text-green-400">Saved.</p>
            )}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={actPending}
                className="btn btn-primary"
              >
                {actPending ? "Saving…" : activity.id ? "Update" : "Add activity"}
              </button>
              {activity.id !== 0 && (
                <button
                  type="button"
                  onClick={() => setActivity(EMPTY_ACTIVITY)}
                  className="btn btn-ghost"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="mt-4 space-y-3">
          {activities.map((a) => (
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
                    setActivity({
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
          {activities.length === 0 && (
            <p className="text-muted">No activities yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

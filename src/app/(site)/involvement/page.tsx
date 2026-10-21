import { getActivities, getRoles } from "@/lib/data";

export default async function InvolvementPage() {
  const [roles, activities] = await Promise.all([getRoles(), getActivities()]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="text-3xl font-bold tracking-tight">Involvement</h1>
      <p className="mt-2 text-muted">
        Leadership roles in organizations and activities I&apos;ve taken part in.
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Organization & leadership</h2>
        <div className="mt-6 space-y-4">
          {roles.map((r) => (
            <div key={r.id} className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{r.position}</h3>
                  <p className="text-sm text-muted">{r.organization}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                    {r.type}
                  </span>
                  <span className="text-xs text-muted">
                    {r.start_date} – {r.end_date}
                  </span>
                </div>
              </div>
              {r.description && (
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {r.description}
                </p>
              )}
            </div>
          ))}
          {roles.length === 0 && (
            <p className="text-muted">No roles added yet.</p>
          )}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold">Activities & projects</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {activities.map((act) => (
            <div key={act.id} className="card card-hover p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                  {act.activity_type}
                </span>
                <span className="text-xs text-muted">{act.date}</span>
              </div>
              <h3 className="mt-3 font-semibold">{act.title}</h3>
              {act.description && (
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {act.description}
                </p>
              )}
              {act.link && (
                <a
                  href={act.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm text-accent hover:underline"
                >
                  Learn more →
                </a>
              )}
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-muted">No activities added yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

import { getActivities, getRoles } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";
import { ActivityCards } from "./activity-cards";

export default async function InvolvementPage() {
  const [roles, activities] = await Promise.all([getRoles(), getActivities()]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 relative z-10">
      <ScrollReveal className="reveal animate-slide-up">
        <h1 className="text-3xl font-bold tracking-tight section-head reveal-line">Involvement</h1>
        <p className="mt-2 text-muted reveal">
          Leadership roles in organizations and activities I&apos;ve taken part in.
        </p>
      </ScrollReveal>

      <section className="mt-12 relative z-10">
        <ScrollReveal className="reveal">
          <h2 className="text-xl font-semibold section-head reveal-line">Organization & leadership</h2>
          <div className="mt-6 space-y-4">
            {roles.map((r, i) => (
              <ScrollReveal
                key={r.id}
                className="card card-lift p-6 reveal"
                delay={i * 100}
              >
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
                  <p className="mt-3 text-sm leading-relaxed text-muted reveal">
                    {r.description}
                  </p>
                )}
              </ScrollReveal>
            ))}
            {roles.length === 0 && (
              <p className="text-muted reveal">No roles added yet.</p>
            )}
          </div>
        </ScrollReveal>
      </section>

      <ActivityCards activities={activities} />
    </div>
  );
}

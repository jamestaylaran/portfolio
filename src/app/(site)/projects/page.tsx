import { getActivities } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";

export default async function ProjectsPage() {
  const activities = await getActivities();
  const projects = activities.filter((a) => a.activity_type === "Project");

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 relative z-10">
      <ScrollReveal className="reveal animate-slide-up">
        <h1 className="text-3xl font-bold tracking-tight section-head reveal-line">Projects</h1>
        <p className="mt-2 text-muted reveal">
          Projects I&apos;ve built and contributed to.
        </p>
      </ScrollReveal>

      <section className="mt-16 relative z-10">
        <ScrollReveal className="reveal" delay={150}>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {projects.map((p, i) => (
              <ScrollReveal
                key={p.id}
                className="card card-lift card-hover p-6 reveal"
                delay={i * 100}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                    {p.activity_type}
                  </span>
                  <span className="text-xs text-muted">{p.date}</span>
                </div>
                <h3 className="mt-3 font-semibold">{p.title}</h3>
                {p.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted reveal">
                    {p.description}
                  </p>
                )}
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm text-accent hover:underline"
                  >
                    Learn more →
                  </a>
                )}
              </ScrollReveal>
            ))}
            {projects.length === 0 && (
              <p className="text-muted reveal">No projects added yet.</p>
            )}
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

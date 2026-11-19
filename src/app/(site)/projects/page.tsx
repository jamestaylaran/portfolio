import { getActivities } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";

export default async function ProjectsPage() {
  const activities = await getActivities();
  const projects = activities.filter((a) => a.activity_type === "Project");

  return (
    <div className="mx-auto max-w-5xl px-6 py-24 relative z-10">
      {/* Hero header */}
      <div className="relative reveal animate-slide-up mb-20">
        <div className="absolute -top-40 left-[50%] -translate-x-[50%] w-[600px] h-[300px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <h1 className="text-5xl font-bold tracking-tight text-white mb-4 reveal-line">
          Projects
        </h1>
        <p className="text-lg text-muted max-w-2xl reveal">
          Things I&apos;ve built — from concept to deployment.
        </p>
      </div>

      {/* Projects grid */}
      <section className="relative z-10">
        <ScrollReveal className="reveal animate-slide-up">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <ScrollReveal
                key={p.id}
                className="card card-lift card-hover p-6 reveal flex flex-col h-full"
                delay={i * 80}
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent border border-accent/30">
                    {p.activity_type}
                  </span>
                  <span className="text-xs text-muted">{p.date}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{p.title}</h3>
                {p.description && (
                  <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-3">
                    {p.description}
                  </p>
                )}
                <div className="mt-auto pt-4">
                  {p.link && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-white transition-colors"
                    >
                      View project <span>→</span>
                    </a>
                  )}
                </div>
              </ScrollReveal>
            ))}
            {projects.length === 0 && (
              <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center reveal">
                <div className="w-16 h-16 rounded-full bg-surface border border-border mx-auto mb-4 flex items-center justify-center">
                  <span className="text-accent text-xl">📦</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
                <p className="text-sm text-muted max-w-xs mx-auto">
                  Add your first project from the dashboard to showcase it here.
                </p>
              </div>
            )}
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

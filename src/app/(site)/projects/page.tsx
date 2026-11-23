import { getActivities } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";

const STACK = ["TypeScript", "React.js", "Next.js", "Python"];

export default async function ProjectsPage() {
  const activities = await getActivities();
  const projects = activities.filter((a) => a.activity_type === "Project");
  const withLinks = projects.filter((p) => p.link && p.link !== "#").length;

  const stats = [
    { label: "Projects", value: projects.length },
    { label: "Live demos", value: withLinks },
    { label: "Stack", value: "TS · React · Next" },
  ];

  return (
    <div className="relative glow min-h-screen">
      {/* Grid background pattern — same as the home page */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdHlwZT0icmVwZWF0ZXkiPjxwYXRoIGQ9Ik0gNCAwIEwgMCA0IE0gNDAgNAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzI2MjYzMyIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+')] [background-size:40px_40px] opacity-40" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-20 sm:px-10 lg:px-16 lg:pt-28">
        {/* Hero — mirrors the home page's landing */}
        <section className="relative mb-16">
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <span className="hero-orb -top-24 right-10 h-72 w-72 bg-white/[0.04]" />
            <span
              className="hero-orb -bottom-32 -left-16 h-80 w-80"
              style={{ background: "var(--accent-soft)" }}
            />
          </div>

          <div className="relative flex flex-col items-start gap-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
              <span className="avatar-pill h-2 w-2 rounded-full bg-accent" />
              selected work
            </span>

            <h1 className="text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
              <span className="block">Things I&apos;ve</span>
              <span className="block gradient-text">Built.</span>
            </h1>

            <p className="text-sm uppercase tracking-[0.35em] text-muted">
              projects &amp; side builds
              <span className="type-cursor">_</span>
            </p>

            <p className="max-w-xl text-sm leading-relaxed text-muted">
              A selection of the things I&apos;ve designed, coded, and shipped —
              from small experiments to full applications.
            </p>

            <div className="flex flex-wrap gap-3">
              {STACK.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="text-[10px] uppercase tracking-[0.25em] text-muted">
              ↓ explore the projects below
            </div>
          </div>
        </section>

        {/* Stats row — same card language as the home page */}
        <section className="relative z-10 mb-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((s, i) => (
              <ScrollReveal key={s.label} delay={i * 100}>
                <div className="card p-6">
                  <p className="text-3xl font-bold gradient-text">{s.value}</p>
                  <p className="mt-1 text-sm text-muted">{s.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Projects grid */}
        <section className="relative z-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold section-head">All projects</h2>
            <span className="text-sm text-muted">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {projects.map((p, i) => (
              <ScrollReveal
                key={p.id}
                className="card card-lift card-hover p-6 reveal flex flex-col"
                delay={i * 90}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                    {p.activity_type}
                  </span>
                  <span className="text-xs text-muted">{p.date}</span>
                </div>

                <h3 className="mt-3 text-lg font-semibold">{p.title}</h3>

                {p.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {p.description}
                  </p>
                )}

                {p.link && p.link !== "#" && (
                  <div className="mt-auto pt-4">
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-foreground"
                    >
                      View project <span aria-hidden="true">→</span>
                    </a>
                  </div>
                )}
              </ScrollReveal>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="card mt-6 flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface">
                <span className="text-xl text-accent">📦</span>
              </div>
              <h3 className="text-lg font-semibold">No projects yet</h3>
              <p className="mt-2 max-w-xs text-sm text-muted">
                Add your first project from the dashboard to showcase it here.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

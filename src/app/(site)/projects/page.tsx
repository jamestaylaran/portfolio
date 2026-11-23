import { getActivities } from "@/lib/data";
import ProjectsCarousel from "./projects-carousel";

export default async function ProjectsPage() {
  const activities = await getActivities();
  const projects = activities.filter((a) => a.activity_type === "Project");

  return (
    <div className="relative glow min-h-screen overflow-hidden bg-background">
      {/* Grid background pattern — same as the home page */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdHlwZT0icmVwZWF0ZXkiPjxwYXRoIGQ9Ik0gNCAwIEwgMCA0IE0gNDAgNAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzI2MjYzMyIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+')] [background-size:40px_40px] opacity-40" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-14 sm:px-10 lg:pt-20">
        <header className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[10px] font-medium uppercase tracking-[0.28em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Selected work
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            <span className="gradient-text">Projects</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted">
            A collection of things I&apos;ve designed, coded, and shipped — drag
            through the gallery or use the arrows to explore.
          </p>
        </header>

        <ProjectsCarousel projects={projects} />
      </div>
    </div>
  );
}

import { getAchievements } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";

export default async function AchievementsPage() {
  const achievements = await getAchievements();

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 relative z-10">
      <ScrollReveal className="reveal animate-slide-up">
        <h1 className="text-3xl font-bold tracking-tight section-head reveal-line">Achievements</h1>
        <p className="mt-2 text-muted reveal">
          Awards, certifications, and recognition I&apos;ve received.
        </p>
      </ScrollReveal>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 relative z-10">
        {achievements.map((a, i) => (
          <ScrollReveal
            key={a.id}
            className="card card-lift card-hover p-6 reveal"
            delay={i * 100}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                {a.category}
              </span>
              <span className="text-xs text-muted">{a.date}</span>
            </div>
            <h2 className="mt-3 text-lg font-semibold">{a.title}</h2>
            <p className="mt-1 text-sm text-muted">{a.organization}</p>
            {a.description && (
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {a.description}
              </p>
            )}
          </ScrollReveal>
        ))}

        {achievements.length === 0 && (
          <p className="mt-10 text-muted reveal">No achievements added yet.</p>
        )}
      </div>
    </div>
  );
}

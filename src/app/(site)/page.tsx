import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import {
  getAchievements,
  getActivities,
  getProfile,
  getRoles,
} from "@/lib/data";

export default async function HomePage() {
  const [profile, achievements, roles, activities] = await Promise.all([
    getProfile(),
    getAchievements(),
    getRoles(),
    getActivities(),
  ]);

  const stats = [
    { label: "Achievements", value: achievements.length },
    { label: "Leadership Roles", value: roles.length },
    { label: "Activities", value: activities.length },
  ];

  return (
    <div className="glow">
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 sm:pt-28 relative z-10">
        <ScrollReveal
          className="relative z-10 flex flex-col items-start gap-6 animate-slide-up"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
            <span
              className="avatar-pill h-2 w-2 rounded-full"
              style={{ background: profile.accent }}
            />
            {profile.location}
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl gradient-text-shimmer">
            Hi, I&apos;m <span className="gradient-text">{profile.name}</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted reveal">
            {profile.headline}
          </p>
          <p className="max-w-2xl text-muted reveal" style={{ transitionDelay: "100ms" }}>
            {profile.tagline}
          </p>
          <div className="flex flex-wrap items-center gap-3 reveal" style={{ transitionDelay: "200ms" }}>
            <Link href="/contact" className="btn btn-primary">
              Get in touch
            </Link>
            <Link href="/achievements" className="btn btn-ghost">
              View achievements
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20 relative z-10">
        <ScrollReveal className="reveal">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="card p-6 reveal"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <p className="text-3xl font-bold gradient-text">{s.value}</p>
                <p className="mt-1 text-sm text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24 relative z-10">
        <ScrollReveal className="reveal">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold section-head reveal-line">
              Featured achievements
            </h2>
            <Link href="/achievements" className="text-sm text-muted hover:text-foreground">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {achievements.slice(0, 4).map((a, i) => (
              <div
                key={a.id}
                className="card card-lift card-hover p-6 reveal"
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                    {a.category}
                  </span>
                  <span className="text-xs text-muted">{a.date}</span>
                </div>
                <h3 className="mt-3 font-semibold">{a.title}</h3>
                <p className="mt-1 text-sm text-muted">{a.organization}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

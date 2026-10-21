import Link from "next/link";
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
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 sm:pt-28">
        <div className="relative z-10 flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: profile.accent }}
            />
            {profile.location}
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Hi, I&apos;m <span className="gradient-text">{profile.name}</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted">{profile.headline}</p>
          <p className="max-w-2xl text-muted">{profile.tagline}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/contact" className="btn btn-primary">
              Get in touch
            </Link>
            <Link href="/achievements" className="btn btn-ghost">
              View achievements
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="card p-6">
              <p className="text-3xl font-bold gradient-text">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Featured achievements</h2>
          <Link href="/achievements" className="text-sm text-muted hover:text-foreground">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {achievements.slice(0, 4).map((a) => (
            <div key={a.id} className="card card-hover p-6">
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
      </section>
    </div>
  );
}

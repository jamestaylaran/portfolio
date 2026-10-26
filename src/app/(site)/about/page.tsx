import { getProfile, getSkills } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";

export default async function AboutPage() {
  const profile = await getProfile();
  const skills = await getSkills();

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 relative z-10">
      <ScrollReveal className="reveal animate-slide-up">
        <h1 className="text-3xl font-bold tracking-tight section-head reveal-line">About me</h1>
        <p className="mt-2 text-muted reveal">{profile.headline}</p>
      </ScrollReveal>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3 relative z-10">
        <ScrollReveal className="lg:col-span-2 reveal">
          <h2 className="text-lg font-semibold section-head reveal-line">Biography</h2>
          <p className="mt-4 leading-relaxed text-muted reveal">{profile.bio}</p>
        </ScrollReveal>

        <ScrollReveal className="aside reveal" delay={150}>
          <aside>
            <h2 className="text-lg font-semibold section-head reveal-line">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span
                  key={skill}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-muted reveal card-lift"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  {skill}
                </span>
              ))}
            </div>

            <h2 className="mt-8 text-lg font-semibold section-head reveal-line">Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="reveal" style={{ transitionDelay: "100ms" }}>
                <dt className="text-muted">Location</dt>
                <dd>{profile.location}</dd>
              </div>
              <div className="reveal" style={{ transitionDelay: "200ms" }}>
                <dt className="text-muted">Email</dt>
                <dd>{profile.email}</dd>
              </div>
            </dl>
          </aside>
        </ScrollReveal>
      </div>
    </div>
  );
}

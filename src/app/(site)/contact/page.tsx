import { existsSync } from "fs";
import path from "path";
import { getProfile } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";

// Seed placeholders ("...", "#") shouldn't render as broken links.
const real = (v: string) => (v && v !== "..." && v !== "#" ? v : "");

export default async function ContactPage() {
  const profile = await getProfile();

  const links = [
    { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { label: "Phone", value: profile.phone, href: `tel:${profile.phone}` },
    { label: "Website", value: profile.website, href: profile.website },
    { label: "GitHub", value: profile.social_github, href: profile.social_github },
    { label: "LinkedIn", value: profile.social_linkedin, href: profile.social_linkedin },
    { label: "Twitter", value: profile.social_twitter, href: profile.social_twitter },
    { label: "Facebook", value: profile.social_facebook, href: profile.social_facebook },
  ]
    .map((l) => ({ ...l, value: real(l.value), href: real(l.href) }))
    .filter((l) => l.value && l.href);

  // Only offer the résumé download once the PDF actually exists in /public.
  const resumeHref = real(profile.resume_url);
  const hasResume =
    resumeHref.startsWith("/") &&
    existsSync(path.join(process.cwd(), "public", resumeHref.slice(1)));

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 relative z-10">
      <ScrollReveal className="reveal animate-slide-up">
        <h1 className="text-3xl font-bold tracking-tight section-head reveal-line">Contact</h1>
        <p className="mt-2 text-muted reveal">
          I&apos;m currently seeking a software engineering internship — feel
          free to reach out about opportunities, collaborations, or projects.
        </p>
      </ScrollReveal>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
        {links.map((l, i) => (
          <ScrollReveal
            key={l.label}
            className="card card-lift card-hover p-6 reveal"
            delay={i * 100}
          >
            <p className="text-sm text-muted">{l.label}</p>
            <p className="mt-1 break-all font-medium">{l.value}</p>
          </ScrollReveal>
        ))}
      </div>

      {hasResume && (
        <ScrollReveal className="reveal" delay={300}>
          <a
            href={resumeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-10"
          >
            Download résumé
          </a>
        </ScrollReveal>
      )}
    </div>
  );
}

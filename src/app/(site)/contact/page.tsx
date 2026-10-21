import { getProfile } from "@/lib/data";

export default async function ContactPage() {
  const profile = await getProfile();

  const links = [
    { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { label: "Phone", value: profile.phone, href: `tel:${profile.phone}` },
    { label: "Website", value: profile.website, href: `https://${profile.website}` },
    { label: "GitHub", value: profile.social_github, href: profile.social_github },
    { label: "LinkedIn", value: profile.social_linkedin, href: profile.social_linkedin },
    { label: "Twitter", value: profile.social_twitter, href: profile.social_twitter },
    { label: "Facebook", value: profile.social_facebook, href: profile.social_facebook },
  ].filter((l) => l.value);

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
      <p className="mt-2 text-muted">
        Feel free to reach out — I&apos;m always open to new opportunities and
        collaborations.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="card card-hover p-6"
          >
            <p className="text-sm text-muted">{l.label}</p>
            <p className="mt-1 break-all font-medium">{l.value}</p>
          </a>
        ))}
      </div>

      {profile.resume_url && (
        <a
          href={profile.resume_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary mt-10"
        >
          Download résumé
        </a>
      )}
    </div>
  );
}

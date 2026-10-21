import { getProfile, getSkills } from "@/lib/data";

export default async function AboutPage() {
  const profile = await getProfile();
  const skills = await getSkills();

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="text-3xl font-bold tracking-tight">About me</h1>
      <p className="mt-2 text-muted">{profile.headline}</p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold">Biography</h2>
          <p className="mt-4 leading-relaxed text-muted whitespace-pre-line">
            {profile.bio}
          </p>
        </div>

        <aside>
          <h2 className="text-lg font-semibold">Skills</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-muted"
              >
                {skill}
              </span>
            ))}
          </div>

          <h2 className="mt-8 text-lg font-semibold">Details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted">Location</dt>
              <dd>{profile.location}</dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd>{profile.email}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

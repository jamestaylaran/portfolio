/**
 * Shown instead of a 500 error when POSTGRES_URL is missing. Turns a cryptic
 * server error into click-by-click setup instructions.
 */
export default function DatabaseNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-2xl">
        <span className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-white"
          style={{ background: "#6366f1" }}>
          !
        </span>

        <h1 className="text-3xl font-semibold tracking-tight">
          Connect the database to finish setup
        </h1>

        <p className="mt-3 text-muted">
          The site deployed successfully, but it has no database attached yet, so
          every page returns a server error. This is a one-time setup step in the
          Vercel dashboard — no code changes needed.
        </p>

        <ol className="mt-8 space-y-5">
          {[
            {
              t: "Open Storage in your Vercel project",
              d: "Go to vercel.com → your project → portfolio → click the Storage tab.",
            },
            {
              t: "Create a Postgres database",
              d: "Click Create Database → choose Postgres → pick any name (e.g. portfolio-db) → Hobby/free plan.",
            },
            {
              t: "Connect it to this project",
              d: 'When prompted, choose to connect it to your project. This automatically sets the POSTGRES_URL environment variable.',
            },
            {
              t: "Redeploy the site",
              d: "Deployments tab → click the newest deployment → ⋯ menu → Redeploy. Environment variables only apply to new deployments.",
            },
          ].map((s, i) => (
            <li key={i} className="flex gap-4">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-sm font-semibold">
                {i + 1}
              </span>
              <div>
                <p className="font-medium">{s.t}</p>
                <p className="text-sm text-muted">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-lg border border-border bg-surface p-4 text-sm">
          <p className="text-muted">
            The tables and sample content create themselves automatically on the
            first page load after the redeploy. Once that is done, log in at{" "}
            <span className="text-foreground">/admin</span> with password{" "}
            <span className="text-foreground">admin123</span> and change it
            immediately.
          </p>
        </div>
      </div>
    </div>
  );
}

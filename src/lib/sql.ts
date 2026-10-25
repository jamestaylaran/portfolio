import postgres from "postgres";

/**
 * Database connection, shared by every query in the app.
 *
 * Uses `postgres` (postgres.js) rather than `@vercel/postgres`, because the
 * latter only speaks Neon's HTTP protocol and cannot talk to Supabase or other
 * standard Postgres providers. postgres.js works with any Postgres:
 * Supabase, Neon, Vercel Postgres, Railway, or a local instance.
 *
 * Vercel's Supabase integration exposes the connection string as POSTGRES_URL;
 * the other names are accepted as fallbacks for manual setups.
 */
function readConnectionString(): string {
  return (
    process.env.POSTGRES_URL ||
    process.env.SUPABASE_POSTGRES_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.DATABASE_URL ||
    ""
  );
}

const url = readConnectionString();

/** False until a database is connected; used to show setup instructions. */
export function isDatabaseConfigured(): boolean {
  return Boolean(url);
}

const isLocal =
  url.includes("localhost") || url.includes("127.0.0.1") || url === "";

export const sql = postgres(url, {
  // Remote Postgres (Supabase, Neon, Vercel) requires TLS; local dev does not.
  ssl: isLocal ? undefined : "require",
  // Supabase's transaction pooler does not support prepared statements. Disabling
  // them is safe everywhere and avoids errors on pooled connection strings.
  prepare: false,
  // Keep the pool small: serverless instances run many concurrent cold starts.
  max: 5,
  connect_timeout: 10,
});

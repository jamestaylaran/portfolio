export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(
    `User-agent: *
Allow: /game
Allow: /

Sitemap: https://example.com/sitemap.xml`,
    {
      headers: { "Content-Type": "text/plain" },
    },
  );
}

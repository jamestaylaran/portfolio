export const dynamic = "force-dynamic";

export default function Robots() {
  return `
User-agent: *
Allow: /game
Allow: /

Sitemap: https://example.com/sitemap.xml
`.trim();
}

/**
 * Canonical site origin for SEO: sitemap, robots, Open Graph, JSON-LD, and metadataBase.
 * Set `NEXT_PUBLIC_SITE_URL` in production (e.g. https://www.example.com).
 */
export const getSiteUrl = (): URL => {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "http://localhost:3000";
  const normalized = raw.endsWith("/") ? raw.slice(0, -1) : raw;

  try {
    return new URL(normalized);
  } catch {
    return new URL("http://localhost:3000");
  }
};

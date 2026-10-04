export default function robots() {
  const siteUrl = process.env.SITE_URL?.replace(/\/$/, '');
  return { rules: { userAgent: '*', allow: '/' }, sitemap: siteUrl ? `${siteUrl}/sitemap.xml` : undefined };
}

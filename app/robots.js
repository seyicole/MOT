export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  return { rules: { userAgent: '*', allow: '/' }, sitemap: siteUrl ? `${siteUrl}/sitemap.xml` : undefined };
}

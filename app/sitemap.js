export default function sitemap() {
  const siteUrl = process.env.SITE_URL?.replace(/\/$/, '');
  if (!siteUrl) return [];
  const pages = ['', '/how-to-read-mot-history', '/mot-advisories-explained', '/buying-car-with-mot-failures'];
  return pages.map(path => ({ url: `${siteUrl}${path}`, lastModified: new Date(), changeFrequency: path ? 'monthly' : 'weekly', priority: path ? 0.7 : 1 }));
}

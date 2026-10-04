import './styles.css';

const siteUrl = process.env.SITE_URL?.replace(/\/$/, '');

export const metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: { default: 'Free MOT History Check | Car Advisor', template: '%s | Car Advisor' },
  description: 'Understand a used car’s MOT history in plain English. Check MOT results, advisories, mileage patterns and questions to ask before viewing.',
  alternates: siteUrl ? { canonical: '/' } : undefined,
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    title: 'Free MOT History Check | Car Advisor',
    description: 'A clearer way to understand a used car’s MOT history before you view it.'
  },
  twitter: { card: 'summary', title: 'Free MOT History Check | Car Advisor', description: 'Understand a used car’s MOT history before you view it.' },
  robots: { index: true, follow: true }
};
export default function RootLayout({ children }) { return <html lang="en"><body>{children}</body></html>; }

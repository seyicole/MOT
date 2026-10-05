import './styles.css';
import Script from 'next/script';

const siteUrl = process.env.SITE_URL?.replace(/\/$/, '');
const googleAnalyticsId = process.env.GA_MEASUREMENT_ID;

export const metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: { default: 'Free MOT History Check | MOT Brief', template: '%s | MOT Brief' },
  description: 'Understand a used car’s MOT history in plain English. Check MOT results, advisories, mileage patterns and questions to ask before viewing.',
  alternates: siteUrl ? { canonical: '/' } : undefined,
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    title: 'Free MOT History Check | MOT Brief',
    description: 'A clearer way to understand a used car’s MOT history before you view it.'
  },
  twitter: { card: 'summary', title: 'Free MOT History Check | MOT Brief', description: 'Understand a used car’s MOT history before you view it.' },
  robots: { index: true, follow: true }
};
export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}
    {googleAnalyticsId ? <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', ${JSON.stringify(googleAnalyticsId)});`}</Script>
    </> : null}
  </body></html>;
}

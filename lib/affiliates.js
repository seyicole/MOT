/** Build an approved affiliate link server-side. Never show a CTA without an ID. */
export function motorCheckHistoryUrl(registration) {
  const affiliateId = process.env.MOTORCHECK_AFFILIATE_ID?.trim();
  if (!affiliateId) return null;
  return `https://www.motorcheck.co.uk/free-car-check?vrm=${encodeURIComponent(registration)}#${encodeURIComponent(affiliateId)}`;
}

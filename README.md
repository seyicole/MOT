# Car Buying Advisor (Next.js + JavaScript)

A plain-JavaScript React/Next.js website for screening UK used cars. It uses official DVLA vehicle data and DVSA MOT history, then turns the results into an explainable health score and inspection prompts.

## Run locally

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Then visit `http://localhost:3000`.

For live MOT lookups, add the five DVSA credentials to `.env.local`:

- `DVSA_MOT_API_KEY`, `DVSA_MOT_CLIENT_ID`, `DVSA_MOT_CLIENT_SECRET`, `DVSA_MOT_SCOPE_URL` and `DVSA_MOT_TOKEN_URL` — all five are supplied in the [DVSA MOT History API](https://documentation.history.mot.api.gov.uk/mot-history-api/register) credentials email. The app obtains and caches OAuth access tokens server-side.

`DVLA_API_KEY` is optional. Add it later if you gain access to the [DVLA Vehicle Enquiry Service](https://developer-portal.driver-vehicle-licensing.api.gov.uk/apis/vehicle-enquiry-service/vehicle-enquiry-service-description.html); it enriches the displayed vehicle attributes, but is not required for the MOT health score.

`OPENAI_API_KEY` is optional and enables a concise buyer briefing. API keys are only used on the server route and are never sent to the browser.

## Optional affiliate link

MotorCheck has an affiliate programme for its paid vehicle-history reports. Once your application is approved, add the unique ID they provide as `MOTORCHECK_AFFILIATE_ID` in `.env.local`. The site will then show one clearly disclosed link after an MOT report, pre-filled with the registration. Until you add this ID, the link remains hidden.

## Commands

```bash
npm test
npm run build
```

## Before deployment

Set `NEXT_PUBLIC_SITE_URL` in your deployment environment to the final HTTPS URL (for example, `https://www.yourdomain.co.uk`). It enables canonical URLs and the XML sitemap. After launch, submit `https://www.yourdomain.co.uk/sitemap.xml` to Google Search Console.

The score is a screening aid only. It cannot check finance, theft, write-offs, service history, recall completion or true market value. Always verify the V5C and VIN and obtain an independent inspection.

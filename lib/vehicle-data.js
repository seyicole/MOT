const DVLA_URL = 'https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles';
const DVSA_URL = 'https://history.mot.api.gov.uk/v1/trade/vehicles/registration/';

let tokenCache = null;

async function getMotAccessToken() {
  const clientId = process.env.DVSA_MOT_CLIENT_ID;
  const clientSecret = process.env.DVSA_MOT_CLIENT_SECRET;
  const scope = process.env.DVSA_MOT_SCOPE_URL;
  const tokenUrl = process.env.DVSA_MOT_TOKEN_URL;
  if (!clientId || !clientSecret || !scope || !tokenUrl) {
    throw new Error('DVSA MOT authentication is not configured. Add the Client ID, Client Secret, Scope URL and Token URL to .env.local.');
  }
  if (tokenCache && tokenCache.expiresAt > Date.now()) return tokenCache.accessToken;
  const body = new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret, scope });
  const response = await fetch(tokenUrl, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body, cache: 'no-store' });
  if (!response.ok) throw new Error('DVSA access-token request failed. Check the OAuth credentials in .env.local.');
  const data = await response.json();
  if (!data.access_token) throw new Error('DVSA did not return an access token.');
  // Refresh a minute early; DVSA recommends caching access tokens to avoid throttling.
  tokenCache = { accessToken: data.access_token, expiresAt: Date.now() + Math.max(60, Number(data.expires_in || 3600) - 60) * 1000 };
  return tokenCache.accessToken;
}

export function cleanRegistration(value) {
  const registration = String(value || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
  if (registration.length < 2 || registration.length > 8) throw new Error('Enter a valid UK registration number.');
  return registration;
}

async function readJson(response, provider) {
  if (response.status === 404) throw new Error(`No ${provider} record was found for that registration.`);
  if (!response.ok) throw new Error(`${provider} lookup failed. Please try again.`);
  return response.json();
}

export async function getVehicleData(registration) {
  const dvlaKey = process.env.DVLA_API_KEY, dvsaKey = process.env.DVSA_MOT_API_KEY;
  if (!dvsaKey) throw new Error('Live lookup is not configured. Add DVSA_MOT_API_KEY to .env.local.');
  const reg = cleanRegistration(registration);
  const motToken = await getMotAccessToken();
  const motResponse = await fetch(`${DVSA_URL}${reg}`, { headers: { authorization: `Bearer ${motToken}`, 'x-api-key': dvsaKey, accept: 'application/json' }, cache: 'no-store' });
  const mot = await readJson(motResponse, 'DVSA MOT');
  // MOT history has enough basic attributes for this screening tool. DVLA enrichment
  // is optional, so a user can begin with only their approved DVSA credentials.
  const motVehicle = Array.isArray(mot) ? mot[0] : mot;
  const fallbackVehicle = {
    make: motVehicle?.make,
    model: motVehicle?.model,
    fuelType: motVehicle?.fuelType,
    colour: motVehicle?.primaryColour,
    yearOfManufacture: motVehicle?.manufactureDate?.slice(0, 4)
  };
  if (!dvlaKey) return [fallbackVehicle, motVehicle];
  const dvlaResponse = await fetch(DVLA_URL, { method: 'POST', headers: { 'x-api-key': dvlaKey, 'content-type': 'application/json' }, body: JSON.stringify({ registrationNumber: reg }), cache: 'no-store' });
  return [await readJson(dvlaResponse, 'DVLA'), motVehicle];
}

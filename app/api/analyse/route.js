import { NextResponse } from 'next/server';
import { createBuyerBriefing } from '../../../lib/briefing';
import { assessVehicle } from '../../../lib/scoring';
import { motorCheckHistoryUrl } from '../../../lib/affiliates';
import { cleanRegistration, getVehicleData } from '../../../lib/vehicle-data';

export async function POST(request) {
  try {
    const { registration } = await request.json();
    const cleanedRegistration = cleanRegistration(registration);
    const [vehicle, mot] = await getVehicleData(cleanedRegistration);
    const report = assessVehicle(mot);
    const aiBriefing = await createBuyerBriefing({ registration: cleanedRegistration, vehicle, report });
    return NextResponse.json({ registration: cleanedRegistration, vehicle, report, aiBriefing, fullHistoryCheckUrl: motorCheckHistoryUrl(cleanedRegistration) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Vehicle-data provider request failed.';
    const status = /valid UK registration/.test(message) ? 422 : /No (DVLA|DVSA)/.test(message) ? 404 : /not configured/.test(message) ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}

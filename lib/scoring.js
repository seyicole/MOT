/**
 * A transparent screening score based on DVSA MOT history.
 *
 * It intentionally separates a current concern from a past failure followed by
 * a later pass. A later pass is evidence that the defect was dealt with for
 * that MOT, but is not proof of a car's present mechanical condition.
 */
function testDate(test) {
  const value = test.completedDate || test.completed_date;
  return value ? new Date(value.replaceAll('.', '-')) : new Date(0);
}

function defects(test) { return test.defects || []; }
function type(defect) { return String(defect.type || '').toUpperCase(); }
function result(test) { return String(test.testResult || test.test_result || '').toUpperCase(); }
function isPass(test) { return ['PASSED', 'PASS'].includes(result(test)); }
function isFailure(test) { return result(test) === 'FAILED'; }
function mileage(test) {
  const parsed = Number(test.odometerValue ?? test.odometer_value);
  return Number.isFinite(parsed) ? parsed : null;
}
function defectText(defect) { return String(defect.text || '').trim() || 'Unspecified defect'; }

export function assessVehicle(motVehicle, advertisedMileage) {
  const tests = motVehicle.motTests || motVehicle.mot_tests || [];
  const ordered = [...tests].sort((a, b) => testDate(b) - testDate(a));
  const latest = ordered[0];
  const passed = ordered.filter(isPass).length;
  const failed = ordered.filter(isFailure).length;
  const passRate = passed + failed ? Math.round((passed / (passed + failed)) * 100) : null;
  let score = 100;
  const concerns = [], repairHistory = [];

  // Only failures on the latest test are active MOT concerns. An older failure
  // with a later pass is presented as historic repair evidence instead.
  if (latest && isFailure(latest)) {
    score -= 20;
    concerns.push({ severity: 'high', message: 'The latest recorded MOT test failed. Ask the seller for proof that the defects were repaired and the car retested.' });
    for (const defect of defects(latest)) {
      const severity = type(defect) === 'DANGEROUS' ? 'high' : 'medium';
      score -= type(defect) === 'DANGEROUS' ? 15 : type(defect) === 'MAJOR' ? 8 : 2;
      concerns.push({ severity, message: `${type(defect).toLowerCase() || 'Recorded'} defect on the latest MOT: ${defectText(defect)}` });
    }
  } else if (latest && isPass(latest)) {
    for (const advisory of defects(latest).filter(defect => type(defect) === 'ADVISORY')) {
      score -= 3;
      concerns.push({ severity: 'medium', message: `Current MOT advisory: ${defectText(advisory)}` });
    }
  }

  const advisoryCounts = new Map();
  for (const test of ordered) for (const defect of defects(test)) {
    if (type(defect) === 'ADVISORY') {
      const text = defectText(defect).toLowerCase();
      advisoryCounts.set(text, (advisoryCounts.get(text) || 0) + 1);
    }
  }
  // A repeated advisory is relevant only when it is still on the latest test.
  for (const defect of defects(latest || {})) {
    if (type(defect) !== 'ADVISORY') continue;
    const text = defectText(defect).toLowerCase(), count = advisoryCounts.get(text) || 0;
    if (count >= 2) {
      score -= 5;
      concerns.push({ severity: 'medium', message: `Recurring current advisory (${count} times in the record): ${text}` });
    }
  }

  for (let index = 0; index < ordered.length; index += 1) {
    if (!isFailure(ordered[index])) continue;
    const laterPassExists = ordered.slice(0, index).some(isPass);
    if (laterPassExists) for (const defect of defects(ordered[index])) {
      const defectType = type(defect);
      if (['DANGEROUS', 'MAJOR'].includes(defectType)) repairHistory.push(`${defectType[0]}${defectType.slice(1).toLowerCase()} defect later followed by a pass: ${defectText(defect)}`);
    }
  }

  const readings = ordered.map(test => ({ miles: mileage(test) })).filter(reading => reading.miles !== null);
  const latestMotMileage = readings[0]?.miles ?? null;
  for (let index = 0; index < readings.length - 1; index += 1) {
    if (readings[index].miles < readings[index + 1].miles) {
      score -= 25;
      concerns.push({ severity: 'high', message: 'Recorded MOT mileage decreases between tests — verify the mileage history before buying.' });
      break;
    }
  }
  if (Number.isFinite(advertisedMileage) && latestMotMileage !== null && advertisedMileage + 500 < latestMotMileage) {
    score -= 25;
    concerns.push({ severity: 'high', message: `Advertised mileage (${advertisedMileage.toLocaleString()}) is below the latest MOT reading (${latestMotMileage.toLocaleString()}).` });
  }

  const finalScore = Math.max(0, Math.min(100, score));
  const band = latest && isFailure(latest) ? 'High risk' : finalScore >= 80 ? 'Good' : finalScore >= 55 ? 'Needs checks' : 'High risk';
  concerns.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] - { high: 0, medium: 1, low: 2 }[b.severity]));
  return {
    score: finalScore, band, concerns: concerns.slice(0, 12), repairHistory: [...new Set(repairHistory)].slice(0, 12),
    summary: { tests: tests.length, passed, failed, passRate, latestResult: latest ? result(latest) : 'Not available', latestMotMileage },
    limitations: [
      'This is an MOT-history screening score, not a condition report or a purchase recommendation.',
      'A later MOT pass suggests earlier defects were addressed for that test, but it does not guarantee ongoing condition.',
      'It does not check outstanding finance, theft, insurance write-offs, service history, recall completion, or market value.',
      'Arrange an independent inspection and verify the V5C, VIN and seller claims before buying.'
    ]
  };
}

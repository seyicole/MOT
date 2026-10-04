import test from 'node:test';
import assert from 'node:assert/strict';
import { assessVehicle } from '../lib/scoring.js';

test('does not score an old failure as current when a later MOT passed', () => {
  const report = assessVehicle({ motTests: [
    { completedDate: '2025.06.01', testResult: 'PASSED', odometerValue: '50000', defects: [{ type: 'ADVISORY', text: 'Tyres worn' }] },
    { completedDate: '2024.06.01', testResult: 'FAILED', odometerValue: '55000', defects: [{ type: 'MAJOR', text: 'Brake issue' }, { type: 'ADVISORY', text: 'Tyres worn' }] }
  ] }, 49000);
  // The latest advisory and the two mileage inconsistencies are current signals;
  // the older brake failure is not deducted because it was followed by a pass.
  assert.equal(report.score, 42);
  assert.ok(report.concerns.some(concern => concern.message.toLowerCase().includes('mileage')));
  assert.ok(report.repairHistory.some(item => item.toLowerCase().includes('brake')));
});

test('scores a latest failed MOT as a current concern', () => {
  const report = assessVehicle({ motTests: [{ completedDate: '2025.06.01', testResult: 'FAILED', odometerValue: '30000', defects: [{ type: 'MAJOR', text: 'Brake issue' }] }] });
  assert.equal(report.band, 'High risk');
  assert.ok(report.concerns.some(concern => concern.message.includes('latest recorded MOT test failed')));
});

test('a clean history begins at a score of 100', () => {
  const report = assessVehicle({ motTests: [{ completedDate: '2025.06.01', testResult: 'PASSED', odometerValue: '30000', defects: [] }] });
  assert.equal(report.score, 100);
  assert.equal(report.band, 'Good');
});

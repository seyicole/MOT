import test from 'node:test';
import assert from 'node:assert/strict';
import { motorCheckHistoryUrl } from '../lib/affiliates.js';

test('hides the affiliate link until an approved ID is configured', () => {
  const original = process.env.MOTORCHECK_AFFILIATE_ID;
  delete process.env.MOTORCHECK_AFFILIATE_ID;
  assert.equal(motorCheckHistoryUrl('AB12 CDE'), null);
  if (original === undefined) delete process.env.MOTORCHECK_AFFILIATE_ID;
  else process.env.MOTORCHECK_AFFILIATE_ID = original;
});

test('builds a registration-prefilled MotorCheck affiliate URL', () => {
  const original = process.env.MOTORCHECK_AFFILIATE_ID;
  process.env.MOTORCHECK_AFFILIATE_ID = 'my-id';
  assert.equal(motorCheckHistoryUrl('AB12 CDE'), 'https://www.motorcheck.co.uk/free-car-check?vrm=AB12%20CDE#my-id');
  if (original === undefined) delete process.env.MOTORCHECK_AFFILIATE_ID;
  else process.env.MOTORCHECK_AFFILIATE_ID = original;
});

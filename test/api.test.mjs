import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

test('same payload yields same SHA-256 fingerprint', () => {
  const sale = { lines: [{ product: 'PG-001', quantity: 1, unitPaise: 32000 }] };
  const first = createHash('sha256').update(JSON.stringify(sale)).digest('hex');
  const replay = createHash('sha256').update(JSON.stringify(sale)).digest('hex');
  assert.equal(first, replay);
});

test('changed payload changes fingerprint', () => {
  const a = createHash('sha256').update(JSON.stringify({ lines: [{ quantity: 1 }] })).digest('hex');
  const b = createHash('sha256').update(JSON.stringify({ lines: [{ quantity: 2 }] })).digest('hex');
  assert.notEqual(a, b);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { SESSION_KEY, clearSession, readSession, saveSession } from '../src/auth.js';

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key), values };
}

test('only non-secret session metadata is saved in browser storage', () => {
  const mock = storage();
  saveSession(mock, { email: 'admin@example.test', role: 'ADMIN', branch_id: 1, access_token: 'must-not-store-this' });
  assert.deepEqual(readSession(mock), { email: 'admin@example.test', role: 'ADMIN', branchId: 1 });
  assert.doesNotMatch(mock.values.get(SESSION_KEY), /access_token/);
});

test('session clear removes browser metadata', () => {
  const mock = storage();
  saveSession(mock, { email: 'admin@example.test', role: 'ADMIN', branch_id: 1 });
  clearSession(mock);
  assert.equal(readSession(mock), null);
});

test('readSession gracefully handles invalid, missing, or malformed data', () => {
  const mock = storage();
  assert.equal(readSession(mock), null);

  mock.setItem(SESSION_KEY, 'invalid-json{{{');
  assert.equal(readSession(mock), null);

  mock.setItem(SESSION_KEY, JSON.stringify({ email: 'user@example.com' })); // missing role
  assert.equal(readSession(mock), null);

  mock.setItem(SESSION_KEY, JSON.stringify({ role: 'ADMIN' })); // missing email
  assert.equal(readSession(mock), null);
});


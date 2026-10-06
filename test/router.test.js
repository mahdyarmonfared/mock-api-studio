const test = require('node:test');
const assert = require('node:assert/strict');
const { MockDatabase } = require('../src/core/db');
const { handleMockRoute } = require('../src/core/router');

test('handleMockRoute dispatches REST CRUD methods', () => {
  const db = new MockDatabase();

  // GET /api/users
  const getRes = handleMockRoute(db, 'GET', '/api/users', {}, null);
  assert.equal(getRes.status, 200);
  assert.ok(Array.isArray(getRes.data));

  // POST /api/users
  const postRes = handleMockRoute(db, 'POST', '/api/users', {}, { name: 'Eve', role: 'dev' });
  assert.equal(postRes.status, 201);
  assert.equal(postRes.data.name, 'Eve');

  // GET /api/users/:id
  const getOneRes = handleMockRoute(db, 'GET', `/api/users/${postRes.data.id}`, {}, null);
  assert.equal(getOneRes.status, 200);
  assert.equal(getOneRes.data.name, 'Eve');

  // DELETE /api/users/:id
  const delRes = handleMockRoute(db, 'DELETE', `/api/users/${postRes.data.id}`, {}, null);
  assert.equal(delRes.status, 200);
  assert.equal(delRes.data.success, true);
});

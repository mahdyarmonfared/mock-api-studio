const test = require('node:test');
const assert = require('node:assert/strict');
const { MockDatabase } = require('../src/core/db');

test('MockDatabase performs CRUD operations correctly', () => {
  const db = new MockDatabase();

  // 1. Get collection
  const users = db.getCollection('users');
  assert.ok(users.length >= 3);

  // 2. Add item
  const added = db.addItem('users', { name: 'Dave', role: 'tester' });
  assert.equal(added.name, 'Dave');
  assert.ok(typeof added.id === 'number');

  // 3. Get item by ID
  const item = db.getItemById('users', added.id);
  assert.equal(item.name, 'Dave');

  // 4. Update item
  const updated = db.updateItem('users', added.id, { role: 'lead-tester' });
  assert.equal(updated.role, 'lead-tester');

  // 5. Delete item
  const deleted = db.deleteItem('users', added.id);
  assert.equal(deleted, true);
  assert.equal(db.getItemById('users', added.id), null);
});

test('MockDatabase supports filtering, sorting, and pagination', () => {
  const db = new MockDatabase();

  // Search filter
  const searchResults = db.getCollection('users', { q: 'alice' });
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].name, 'Alice Smith');

  // Sorting
  const sorted = db.getCollection('users', { _sort: 'id', _order: 'desc' });
  assert.ok(sorted[0].id > sorted[sorted.length - 1].id);

  // Pagination
  const page1 = db.getCollection('users', { _page: 1, _limit: 2 });
  assert.equal(page1.length, 2);
});

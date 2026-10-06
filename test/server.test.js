const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const { createServer, isPathSafe } = require('../src/server/server');

test('isPathSafe correctly detects directory traversal attempts', () => {
  const base = '/var/www/ui';
  assert.equal(isPathSafe(base, '/var/www/ui/index.html'), true);
  assert.equal(isPathSafe(base, '/var/www/ui/../etc/passwd'), false);
});

test('HTTP server serves mock REST endpoint /api/users and studio endpoints', async () => {
  const { server } = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  try {
    // 1. GET /api/users
    const usersRes = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${port}/api/users`, (response) => {
        let body = '';
        response.on('data', chunk => body += chunk);
        response.on('end', () => resolve({ statusCode: response.statusCode, data: JSON.parse(body) }));
      }).on('error', reject);
    });

    assert.equal(usersRes.statusCode, 200);
    assert.ok(Array.isArray(usersRes.data));

    // 2. GET /_studio/collections
    const collectionsRes = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${port}/_studio/collections`, (response) => {
        let body = '';
        response.on('data', chunk => body += chunk);
        response.on('end', () => resolve({ statusCode: response.statusCode, data: JSON.parse(body) }));
      }).on('error', reject);
    });

    assert.equal(collectionsRes.statusCode, 200);
    assert.ok(Array.isArray(collectionsRes.data.collections));
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

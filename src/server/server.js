/**
 * HTTP Server and REST API Engine for MockAPI-Studio.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { MockDatabase, handleMockRoute, parseQueryParams } = require('../core');
const { chalk } = require('../cli/ansi');

const UI_DIR = path.join(__dirname, '../ui');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function isPathSafe(baseDir, targetPath) {
  const resolved = path.resolve(targetPath);
  return resolved === baseDir || resolved.startsWith(baseDir + path.sep);
}

function handleStaticFile(req, res) {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') {
    reqPath = '/index.html';
  }

  const filePath = path.join(UI_DIR, reqPath);

  if (!isPathSafe(UI_DIR, filePath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden: Directory traversal blocked');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 2 * 1024 * 1024) { // 2MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve(body);
      }
    });
    req.on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createServer(options = {}) {
  const db = new MockDatabase(options.dbFile || null);
  let globalDelay = options.delay || 0;

  const server = http.createServer(async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const urlPath = req.url.split('?')[0];
    const queryOpts = parseQueryParams(req.url);

    // Artificial Latency Delay calculation
    const delayMs = parseInt(queryOpts._delay || globalDelay, 10);
    if (delayMs > 0) {
      await sleep(Math.min(delayMs, 10000));
    }

    // Health Check Endpoint
    if (urlPath === '/api/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', name: 'mock-api-studio', version: '1.0.0' }));
      return;
    }

    // Studio Management Endpoints
    if (urlPath === '/_studio/collections' && req.method === 'GET') {
      const summary = db.getCollectionNames().map(name => ({
        name,
        count: (db.getCollection(name) || []).length
      }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ collections: summary, globalDelay }));
      return;
    }

    if (urlPath === '/_studio/reset' && req.method === 'POST') {
      db.resetToDefaults();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Database reset to default schemas' }));
      return;
    }

    if (urlPath === '/_studio/delay' && req.method === 'POST') {
      const bodyData = await parseJsonBody(req);
      if (bodyData && bodyData.delay !== undefined) {
        globalDelay = parseInt(bodyData.delay, 10);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, globalDelay }));
      return;
    }

    // Dynamic Mock API Routes: /api/* or non-static routes
    if (urlPath.startsWith('/api/') || (req.method !== 'GET' && !urlPath.startsWith('/_studio'))) {
      const bodyData = await parseJsonBody(req);
      const result = handleMockRoute(db, req.method, urlPath, queryOpts, bodyData);

      // Terminal Request Log
      const statusColor = result.status < 400 ? chalk.green : chalk.red;
      console.log(`🚀 [${req.method}] ${urlPath} -> ${statusColor(result.status)} (${delayMs}ms delay)`);

      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.data));
      return;
    }

    // Static Web Studio UI Delivery
    if (req.method === 'GET') {
      // If root or static asset, serve UI
      if (urlPath === '/' || urlPath.endsWith('.html') || urlPath.endsWith('.css') || urlPath.endsWith('.js') || urlPath.endsWith('.ico') || urlPath.endsWith('.svg')) {
        handleStaticFile(req, res);
        return;
      }

      // Otherwise attempt mock route for GET requests without /api prefix
      const result = handleMockRoute(db, req.method, urlPath, queryOpts, null);
      if (result.status !== 404) {
        res.writeHead(result.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.data));
        return;
      }

      // Fallback to UI static host
      handleStaticFile(req, res);
      return;
    }

    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  });

  return { server, db };
}

function startServer(port = 3017, options = {}) {
  const { server } = createServer(options);
  server.listen(port, () => {
    console.log(`\n🚀 MockAPI-Studio running at: http://localhost:${port}`);
    console.log(`  - Web Studio: http://localhost:${port}`);
    console.log(`  - Mock Endpoint Example: http://localhost:${port}/api/users\n`);
    console.log(`Ready for REST API mock requests...\n`);
  });
  return server;
}

module.exports = {
  createServer,
  startServer,
  isPathSafe
};

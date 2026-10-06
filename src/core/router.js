/**
 * Dynamic REST Router Engine for MockAPI-Studio.
 */

const { URL } = require('url');

function parseQueryParams(urlStr) {
  try {
    const parsedUrl = new URL(urlStr, 'http://localhost');
    const query = {};
    parsedUrl.searchParams.forEach((val, key) => {
      query[key] = val;
    });
    return query;
  } catch (err) {
    return {};
  }
}

function handleMockRoute(db, method, urlPath, queryOpts, bodyData) {
  // Strip prefix /api if present
  let cleanPath = urlPath;
  if (cleanPath.startsWith('/api')) {
    cleanPath = cleanPath.slice(4);
  }
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1);
  }

  const parts = cleanPath.split('/').filter(Boolean);

  if (parts.length === 0) {
    return {
      status: 200,
      data: {
        message: 'MockAPI-Studio Engine Operational',
        collections: db.getCollectionNames()
      }
    };
  }

  const resource = parts[0];
  const resourceId = parts[1] || null;

  // GET /api/:resource or GET /api/:resource/:id
  if (method === 'GET') {
    if (resourceId) {
      const item = db.getItemById(resource, resourceId);
      if (!item) return { status: 404, data: { error: `Item ${resourceId} not found in ${resource}` } };
      return { status: 200, data: item };
    } else {
      const items = db.getCollection(resource, queryOpts);
      if (items === null) return { status: 404, data: { error: `Collection '${resource}' not found` } };
      return { status: 200, data: items };
    }
  }

  // POST /api/:resource
  if (method === 'POST') {
    if (!bodyData || typeof bodyData !== 'object') {
      return { status: 400, data: { error: 'Request body must be a valid JSON object' } };
    }
    const created = db.addItem(resource, bodyData);
    return { status: 201, data: created };
  }

  // PUT / PATCH /api/:resource/:id
  if (method === 'PUT' || method === 'PATCH') {
    if (!resourceId) return { status: 400, data: { error: 'Resource ID is required for update' } };
    const updated = db.updateItem(resource, resourceId, bodyData || {});
    if (!updated) return { status: 404, data: { error: `Item ${resourceId} not found in ${resource}` } };
    return { status: 200, data: updated };
  }

  // DELETE /api/:resource/:id
  if (method === 'DELETE') {
    if (!resourceId) return { status: 400, data: { error: 'Resource ID is required for deletion' } };
    const deleted = db.deleteItem(resource, resourceId);
    if (!deleted) return { status: 404, data: { error: `Item ${resourceId} not found in ${resource}` } };
    return { status: 200, data: { success: true, deletedId: resourceId } };
  }

  return { status: 405, data: { error: 'Method Not Allowed' } };
}

module.exports = {
  parseQueryParams,
  handleMockRoute
};

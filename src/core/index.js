/**
 * Core Exports for MockAPI-Studio.
 */

const db = require('./db');
const router = require('./router');
const templates = require('./templates');

module.exports = {
  ...db,
  ...router,
  ...templates
};

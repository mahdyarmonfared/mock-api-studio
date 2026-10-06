/**
 * In-Memory & File-Backed JSON Database Engine for MockAPI-Studio.
 */

const fs = require('fs');
const path = require('path');
const { DEFAULT_TEMPLATES } = require('./templates');

class MockDatabase {
  constructor(filePath = null) {
    this.filePath = filePath;
    this.collections = JSON.parse(JSON.stringify(DEFAULT_TEMPLATES));

    if (this.filePath) {
      this.loadFromFile();
    }
  }

  loadFromFile() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) {
          this.collections = parsed;
        }
      }
    } catch (err) {
      // Use defaults if file read fails
    }
  }

  saveToFile() {
    if (!this.filePath) return;
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.collections, null, 2), 'utf8');
    } catch (err) {
      // Ignore save error in read-only environments
    }
  }

  getCollectionNames() {
    return Object.keys(this.collections);
  }

  getCollection(name, queryOpts = {}) {
    let items = this.collections[name];
    if (!items || !Array.isArray(items)) return null;

    let result = [...items];

    // Search query (?q=keyword)
    if (queryOpts.q) {
      const q = String(queryOpts.q).toLowerCase();
      result = result.filter(item => {
        return Object.values(item).some(val =>
          String(val).toLowerCase().includes(q)
        );
      });
    }

    // Exact property filtering (?role=admin)
    Object.keys(queryOpts).forEach(key => {
      if (!['_sort', '_order', '_page', '_limit', '_delay', 'q'].includes(key)) {
        const targetVal = String(queryOpts[key]).toLowerCase();
        result = result.filter(item => String(item[key]).toLowerCase() === targetVal);
      }
    });

    // Sorting (?_sort=id&_order=desc)
    if (queryOpts._sort) {
      const sortKey = queryOpts._sort;
      const isDesc = String(queryOpts._order || 'asc').toLowerCase() === 'desc';
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    }

    // Pagination (?_page=1&_limit=10)
    const page = parseInt(queryOpts._page, 10);
    const limit = parseInt(queryOpts._limit, 10);

    if (page && limit) {
      const start = (page - 1) * limit;
      result = result.slice(start, start + limit);
    } else if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }

  getItemById(name, id) {
    const items = this.collections[name];
    if (!items || !Array.isArray(items)) return null;
    const numericId = Number(id);
    return items.find(item => item.id === id || item.id === numericId) || null;
  }

  addItem(name, data) {
    if (!this.collections[name]) {
      this.collections[name] = [];
    }

    const items = this.collections[name];
    const maxId = items.reduce((max, item) => (typeof item.id === 'number' && item.id > max ? item.id : max), 0);
    const newItem = {
      id: maxId + 1,
      ...data,
      createdAt: new Date().toISOString()
    };

    items.push(newItem);
    this.saveToFile();
    return newItem;
  }

  updateItem(name, id, patchData) {
    const items = this.collections[name];
    if (!items || !Array.isArray(items)) return null;

    const numericId = Number(id);
    const idx = items.findIndex(item => item.id === id || item.id === numericId);
    if (idx === -1) return null;

    const updated = {
      ...items[idx],
      ...patchData,
      id: items[idx].id, // Protect ID
      updatedAt: new Date().toISOString()
    };

    items[idx] = updated;
    this.saveToFile();
    return updated;
  }

  deleteItem(name, id) {
    const items = this.collections[name];
    if (!items || !Array.isArray(items)) return false;

    const numericId = Number(id);
    const idx = items.findIndex(item => item.id === id || item.id === numericId);
    if (idx === -1) return false;

    items.splice(idx, 1);
    this.saveToFile();
    return true;
  }

  createCollection(name, initialData = []) {
    this.collections[name] = Array.isArray(initialData) ? initialData : [];
    this.saveToFile();
    return this.collections[name];
  }

  resetToDefaults() {
    this.collections = JSON.parse(JSON.stringify(DEFAULT_TEMPLATES));
    this.saveToFile();
    return this.collections;
  }
}

module.exports = {
  MockDatabase
};

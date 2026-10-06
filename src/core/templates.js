/**
 * Sample Pre-populated Database Schemas & Templates for MockAPI-Studio.
 */

const DEFAULT_TEMPLATES = {
  users: [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'admin', status: 'active' },
    { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'developer', status: 'active' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'designer', status: 'inactive' }
  ],
  products: [
    { id: 1, title: 'Wireless Ergonomic Mouse', price: 49.99, category: 'Electronics', stock: 120 },
    { id: 2, title: 'Mechanical RGB Keyboard', price: 99.50, category: 'Electronics', stock: 45 },
    { id: 3, title: 'Noise Cancelling Headphones', price: 199.00, category: 'Audio', stock: 18 }
  ],
  posts: [
    { id: 1, title: 'Getting Started with Zero-Dependency Node.js', author: 'Alice Smith', likes: 42 },
    { id: 2, title: 'Modern Frontend Architecture Patterns', author: 'Bob Jones', likes: 89 }
  ],
  tasks: [
    { id: 1, title: 'Setup Mock API Endpoints', completed: true, priority: 'high' },
    { id: 2, title: 'Integrate Web Studio Dashboard', completed: false, priority: 'medium' }
  ]
};

module.exports = {
  DEFAULT_TEMPLATES
};

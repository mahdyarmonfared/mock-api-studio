# 🚀 MockAPI-Studio

> Lightweight, zero-dependency instant REST API mock server, schema manager & interactive Web Studio for frontend developers.

![MockAPI-Studio Web Studio](https://raw.githubusercontent.com/mahdyarmonfared/mock-api-studio/main/docs/preview.png)

## ⚡ Features

- 🛠️ **Full RESTful CRUD Endpoints**: Automatically maps `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` routes for any dynamic resource collection.
- 🔍 **Filtering, Sorting & Pagination**: Query support for global keyword search (`?q=`), property filters (`?role=admin`), sorting (`?_sort=id&_order=desc`), and pagination (`?_page=1&_limit=10`).
- ⏱️ **Simulated Network Latency**: Artificial response delay controller (`--delay 500` or `?_delay=500`) to test frontend spinners and loading states.
- 🌐 **Interactive Web Studio**: Built-in web GUI dashboard hosted on `http://localhost:3017`.
- 📁 **In-Memory & Persistent Storage**: Save data state to JSON disk files or work completely in memory.
- 📦 **Zero External Dependencies**: Built with 100% native Node.js standard modules (`http`, `url`, `fs`, `node:test`).

---

## 🛠️ Installation

```bash
git clone https://github.com/mahdyarmonfared/mock-api-studio.git
cd mock-api-studio
npm link
```

---

## 🚀 Quick Start

### 1. Launch Mock API Server

```bash
mock-api-studio --port 3017
```

### 2. Test Simulated Endpoints

```bash
# Get all users
curl http://localhost:3017/api/users

# Search users
curl http://localhost:3017/api/users?q=alice

# Create new record
curl -X POST http://localhost:3017/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "David Dev", "role": "engineer"}'
```

### 3. Open Interactive Web Studio

Open `http://localhost:3017` in your browser to inspect collections, modify JSON data visually, and test endpoints.

---

## 📖 CLI Usage

```text
USAGE:
  mock-api-studio [options]

OPTIONS:
  -p, --port <number>     Port for MockAPI-Studio server (default: 3017)
  -f, --db <path>         JSON file path to load/save database (optional)
  -d, --delay <ms>        Global artificial response delay in ms (default: 0)
  -h, --help              Display help guide
  -v, --version           Display version
```

---

## 💻 Programmatic Usage

```javascript
const { createServer } = require('mock-api-studio');

const { server, db } = createServer({ delay: 100 });
server.listen(3017, () => {
  console.log('MockAPI-Studio running on port 3017');
});
```

---

## 🧪 Testing

Run native test suite:

```bash
npm test
```

---

## 📄 License

[MIT](LICENSE) © Mahdyar Monfared

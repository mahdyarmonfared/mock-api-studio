document.addEventListener('DOMContentLoaded', () => {
  const collectionsList = document.getElementById('collectionsList');
  const currentCollectionTitle = document.getElementById('currentCollectionTitle');
  const currentEndpointUrl = document.getElementById('currentEndpointUrl');
  const jsonViewer = document.getElementById('jsonViewer');

  const testMethod = document.getElementById('testMethod');
  const testUrl = document.getElementById('testUrl');
  const testQuery = document.getElementById('testQuery');
  const sendTestBtn = document.getElementById('sendTestBtn');

  const delayInput = document.getElementById('delayInput');
  const resetDbBtn = document.getElementById('resetDbBtn');
  const addCollectionBtn = document.getElementById('addCollectionBtn');
  const addItemBtn = document.getElementById('addItemBtn');

  let activeCollection = null;
  let collectionsData = [];

  async function fetchCollections() {
    try {
      const res = await fetch('/_studio/collections');
      const data = await res.json();
      collectionsData = data.collections || [];
      if (data.globalDelay !== undefined) {
        delayInput.value = data.globalDelay;
      }
      renderCollections();

      if (collectionsData.length > 0 && !activeCollection) {
        selectCollection(collectionsData[0].name);
      } else if (activeCollection) {
        selectCollection(activeCollection);
      }
    } catch (err) {
      collectionsList.innerHTML = `<div class="text-error" style="color: var(--accent-red)">Error: ${err.message}</div>`;
    }
  }

  function renderCollections() {
    collectionsList.innerHTML = '';
    collectionsData.forEach(item => {
      const el = document.createElement('div');
      el.className = `collection-item ${item.name === activeCollection ? 'active' : ''}`;
      el.onclick = () => selectCollection(item.name);

      el.innerHTML = `
        <span>/${escapeHtml(item.name)}</span>
        <span class="item-count">${item.count} items</span>
      `;
      collectionsList.appendChild(el);
    });
  }

  async function selectCollection(name) {
    activeCollection = name;
    renderCollections();

    currentCollectionTitle.textContent = `/${name}`;
    currentEndpointUrl.textContent = `http://localhost:3017/api/${name}`;
    testUrl.value = `/api/${name}`;

    try {
      const res = await fetch(`/api/${name}`);
      const data = await res.json();
      jsonViewer.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      jsonViewer.textContent = `Error fetching data: ${err.message}`;
    }
  }

  // Send Test Request
  sendTestBtn.onclick = async () => {
    const method = testMethod.value;
    let url = testUrl.value.trim();
    const query = testQuery.value.trim();

    if (query) {
      url += (url.includes('?') ? '&' : '?') + (query.startsWith('?') ? query.slice(1) : query);
    }

    jsonViewer.textContent = `Sending ${method} ${url}...`;

    try {
      const opts = { method, headers: { 'Content-Type': 'application/json' } };
      if (method === 'POST' || method === 'PUT') {
        opts.body = JSON.stringify({ name: 'Sample Item', timestamp: Date.now() });
      }

      const res = await fetch(url, opts);
      const data = await res.json();
      jsonViewer.textContent = `// Status: ${res.status} ${res.statusText}\n` + JSON.stringify(data, null, 2);
      fetchCollections();
    } catch (err) {
      jsonViewer.textContent = `Error: ${err.message}`;
    }
  };

  // Delay slider update
  delayInput.onchange = async () => {
    const delay = parseInt(delayInput.value, 10) || 0;
    await fetch('/_studio/delay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delay })
    });
  };

  // Reset database
  resetDbBtn.onclick = async () => {
    if (confirm('Reset database to default sample schemas?')) {
      await fetch('/_studio/reset', { method: 'POST' });
      activeCollection = null;
      fetchCollections();
    }
  };

  // Add new collection
  addCollectionBtn.onclick = async () => {
    const name = prompt('Enter new collection name (e.g. orders, comments):');
    if (name) {
      const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (cleanName) {
        await fetch(`/api/${cleanName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Sample Entry' })
        });
        activeCollection = cleanName;
        fetchCollections();
      }
    }
  };

  // Add record
  addItemBtn.onclick = async () => {
    if (!activeCollection) return;
    const raw = prompt('Enter JSON data for new record:', '{"title": "New Record"}');
    if (raw) {
      try {
        const body = JSON.parse(raw);
        await fetch(`/api/${activeCollection}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        selectCollection(activeCollection);
        fetchCollections();
      } catch (err) {
        alert('Invalid JSON input: ' + err.message);
      }
    }
  };

  function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  fetchCollections();
});

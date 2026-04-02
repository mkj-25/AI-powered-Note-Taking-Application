import http from 'http';

async function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost', port: 5000,
      path: `/api${path}`, method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
    const req = http.request(opts, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve({ status: res.statusCode, body: raw }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// Login
const loginRes = await request('POST', '/auth/login', { email: 'testfix@notra.com', password: 'password123' });
console.log('Login status:', loginRes.status);
const login = JSON.parse(loginRes.body);
const token = login.token;
const wsId = login.user?.workspaces?.[0]?._id;
console.log('Token OK:', !!token, ' WorkspaceId:', wsId);

// Create note
const createRes = await request('POST', '/notes', { workspaceId: wsId, title: 'Test', content: [] }, token);
console.log('Create status:', createRes.status);
const created = JSON.parse(createRes.body);
const noteId = created.note?._id;
console.log('Note ID:', noteId);

// Update note  
const updateRes = await request('PUT', `/notes/${noteId}`, {
  title: 'Updated Note',
  content: [
    { id: 'a', type: 'text', content: 'Hello' },
    { id: 'b', type: 'bullet', content: 'Item' },
  ],
}, token);
console.log('Update status:', updateRes.status);
console.log('Update body:', updateRes.body.substring(0, 300));

// AI chat
const aiRes = await request('POST', '/ai/chat', { message: 'Say hello briefly.', history: [] }, token);
console.log('AI chat status:', aiRes.status);
const ai = JSON.parse(aiRes.body);
console.log('AI reply:', (ai.reply || ai.message || '').substring(0, 100));

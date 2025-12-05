// Simple integration smoke tests for /api/reports
// Run manually with: `node server/tests/integration/reports-smoke.test.mjs`
// Requires the backend server to be running on http://localhost:3001

import http from 'node:http';

function request(path, { method = 'GET', body } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3001,
        path,
        method,
        headers: body
          ? {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(body),
            }
          : {},
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({ status: res.statusCode, body: data });
        });
      },
    );

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function run() {
  console.log('GET /api/reports should return 200');
  const res1 = await request('/api/reports');
  console.log('Status:', res1.status);

  console.log('POST /api/reports with invalid body should return 400-ish');
  const res2 = await request('/api/reports', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  console.log('Status:', res2.status);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

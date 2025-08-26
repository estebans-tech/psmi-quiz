import http from 'node:http';

const urls = [
  'http://localhost:3000/api/questions?lang=en',
  'http://localhost:3000/api/questions?lang=en&filter=theory',
  'http://localhost:3000/api/questions?lang=en&filter=theory,events'
];

function hit(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      const { statusCode, headers } = res;
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        const ok = statusCode === 200 && /json/i.test(headers['content-type'] || '');
        if (!ok) return reject(new Error(`Bad response: ${statusCode} ${headers['content-type']}`));
        try {
          const parsed = JSON.parse(data);
          if (!Array.isArray(parsed)) throw new Error('Not an array');
          resolve({ url, count: parsed.length });
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

(async () => {
  try {
    for (const u of urls) {
      const r = await hit(u);
      console.log('✓', r.url, 'items:', r.count);
    }
    process.exit(0);
  } catch (e) {
    console.error('✗ Smoke failed:', e.message || e);
    process.exit(1);
  }
})();

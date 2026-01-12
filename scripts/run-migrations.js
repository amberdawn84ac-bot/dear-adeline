const fs = require('fs');
const https = require('https');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL);

    const options = {
      hostname: url.hostname,
      path: '/rest/v1/rpc/exec',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ query: sql }));
    req.end();
  });
}

async function runMigrations() {
  const migrations = [
    'supabase/migrations/20260111_spaced_repetition_system.sql',
    'supabase/migrations/20260111_adaptive_difficulty_engine.sql'
  ];

  for (const migration of migrations) {
    console.log(`\n📄 Running: ${migration}`);
    const sql = fs.readFileSync(migration, 'utf8');

    try {
      await executeSql(sql);
      console.log(`✅ Success: ${migration}`);
    } catch (error) {
      console.error(`❌ Failed: ${migration}`);
      console.error(error.message);
    }
  }
}

runMigrations().catch(console.error);

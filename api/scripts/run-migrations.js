/**
 * run-migrations.js
 * Applies missing columns to the live Supabase DB via raw SQL through the REST API.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function supabaseQuery(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);
    // Use the pg query endpoint directly
    const opts = {
      hostname: url.hostname,
      path: `/rest/v1/rpc/exec_sql`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      }
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Use direct Supabase SQL API (management API)
function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ query: sql });
    const ref = SUPABASE_URL.replace('https://', '').split('.')[0];
    const opts = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${ref}/database/query`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Length': Buffer.byteLength(payload),
      }
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

const MIGRATIONS = [
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS inventory INTEGER DEFAULT 0`,
  `ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0`,
  `ALTER TABLE categories ADD COLUMN IF NOT EXISTS image TEXT`,
  `ALTER TABLE categories ADD COLUMN IF NOT EXISTS swatch JSONB DEFAULT '["#ccc","#aaa"]'::jsonb`,
  `ALTER TABLE categories ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS look_id INTEGER REFERENCES looks(id)`,
  `ALTER TABLE looks ADD COLUMN IF NOT EXISTS tagline TEXT`,
  `ALTER TABLE looks ADD COLUMN IF NOT EXISTS keywords TEXT[]`,
  `ALTER TABLE looks ADD COLUMN IF NOT EXISTS feature_title TEXT`,
  `ALTER TABLE looks ADD COLUMN IF NOT EXISTS feature_body TEXT`,
  `ALTER TABLE looks ADD COLUMN IF NOT EXISTS feature_cta TEXT`,
  `ALTER TABLE looks ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0`,
  `ALTER TABLE merchants ADD COLUMN IF NOT EXISTS facebook TEXT`,
  `ALTER TABLE merchants ADD COLUMN IF NOT EXISTS instagram TEXT`,
  `ALTER TABLE merchants ADD COLUMN IF NOT EXISTS best_contact_method TEXT`,
  `ALTER TABLE merchants ADD COLUMN IF NOT EXISTS look_id INTEGER REFERENCES looks(id)`,
  `ALTER TABLE merchants ADD COLUMN IF NOT EXISTS suburb TEXT`,
  `ALTER TABLE merchants ADD COLUMN IF NOT EXISTS street_address TEXT`,
  `ALTER TABLE merchants ADD COLUMN IF NOT EXISTS logo_image TEXT`,
  `ALTER TABLE merchants ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`,
];

async function main() {
  console.log('Running migrations via Supabase management API…');
  const ref = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '').split('.')[0];
  console.log(`Project ref: ${ref}`);

  for (const sql of MIGRATIONS) {
    const result = await runSQL(sql);
    if (result.status === 200 || result.status === 201) {
      console.log(`  ✓ ${sql.slice(0, 60)}…`);
    } else {
      console.log(`  ⚠ [${result.status}] ${sql.slice(0, 60)}… → ${JSON.stringify(result.body).slice(0, 120)}`);
    }
  }
  console.log('\nDone.');
}

main().catch(console.error);

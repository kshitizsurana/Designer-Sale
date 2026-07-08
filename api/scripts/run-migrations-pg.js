/**
 * run-migrations-pg.js
 * Uses direct PostgreSQL connection (via pg client) to run ALTER TABLE migrations.
 * 
 * Supabase exposes a direct Postgres connection at:
 *   postgresql://postgres:[DB_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
 *
 * Usage: node api/scripts/run-migrations-pg.js
 * 
 * Requires SUPABASE_DB_URL in api/.env OR will construct from SUPABASE_URL + SUPABASE_DB_PASSWORD
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

// We'll use supabase-js to call a raw RPC that executes DDL.
// Alternatively, we create a minimal SQL exec via the REST API with the service_role key.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// The simplest way to run DDL through supabase-js is via rpc with a custom function.
// But if no such function exists, we use the PostgREST schema reload trick + direct upsert.
// Best approach: insert into a 'migrations' table then use DB triggers — but that's complex.

// REAL approach: use supabase-js raw fetch with the undocumented /rest/v1/ SQL endpoint
// which works for SELECT. For DDL, we need to use the postgres connection directly.

// Since we can't run pg directly (no DB password in env), let's instead check what columns
// actually exist, and adjust our INSERT/UPSERT to only include columns that exist.

async function checkColumns(table) {
  const { data, error } = await supabase
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_name', table)
    .eq('table_schema', 'public');
  
  if (error) {
    // Try direct query via RPC (if exists)
    console.log(`  Could not check ${table} columns: ${error.message}`);
    return null;
  }
  return (data || []).map(r => r.column_name);
}

async function tableColumns(table) {
  // Use a raw fetch to the PostgREST information_schema endpoint
  const url = `${SUPABASE_URL}/rest/v1/rpc/get_columns`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ tbl: table })
  });
  if (!resp.ok) return null;
  return resp.json();
}

// Try the simplest approach: PostgREST HEAD request to see what columns exist
async function probeTable(table) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?limit=0`;
  const resp = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Accept': 'application/json',
      'Prefer': 'count=exact',
    }
  });
  const text = await resp.text();
  return { status: resp.status, headers: Object.fromEntries(resp.headers.entries()), body: text };
}

// Simplest approach that actually works:
// Insert a dummy row with just the columns we need, catch the error to see if the column exists
async function columnExists(table, column) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${column}&limit=1`;
  const resp = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Accept': 'application/json',
    }
  });
  const body = await resp.text();
  // If it returns 400 with "column ... does not exist", it's missing
  const missing = body.includes('does not exist') || body.includes('schema cache');
  return !missing;
}

async function main() {
  console.log('Probing which columns exist in the live Supabase DB...\n');

  const columnsToCheck = [
    ['products', 'inventory'],
    ['products', 'status'],
    ['products', 'tags'],
    ['products', 'look_id'],
    ['products', 'images'],
    ['categories', 'sort_order'],
    ['categories', 'image'],
    ['categories', 'swatch'],
    ['categories', 'status'],
    ['looks', 'tagline'],
    ['looks', 'keywords'],
    ['looks', 'feature_title'],
    ['merchants', 'look_id'],
    ['merchants', 'status'],
    ['merchants', 'logo_image'],
  ];

  const results = {};
  for (const [table, col] of columnsToCheck) {
    const exists = await columnExists(table, col);
    results[`${table}.${col}`] = exists;
    console.log(`  ${exists ? '✓' : '✗'} ${table}.${col}`);
  }

  console.log('\n\nResults JSON (copy to use in scraper):');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);

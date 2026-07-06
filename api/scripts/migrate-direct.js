/**
 * migrate-direct.js
 * Uses Supabase's pg connection via @supabase/supabase-js raw PostgreSQL queries
 * or falls back to the Management API.
 */

// We'll use a direct HTTP approach to the Supabase SQL API (Management API)
// Project ref is extracted from the SUPABASE_URL
const SUPABASE_URL = 'https://jxssdhqdbitdomvawcrs.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4c3NkaHFkYml0ZG9tdmF3Y3JzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA4NTcxNCwiZXhwIjoyMDk2NjYxNzE0fQ.gc12dYfQzQ4-Qvyfu0PfZgyR9bWW0iz2we99SyafquU';

// Extract project ref from URL
const projectRef = SUPABASE_URL.split('//')[1].split('.')[0];

async function runSQL(sql) {
  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql })
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, body: text };
}

const migrations = [
  `ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published'`,
  `ALTER TABLE looks ADD COLUMN IF NOT EXISTS tagline TEXT`,
  `ALTER TABLE looks ADD COLUMN IF NOT EXISTS keywords TEXT[]`,
  `ALTER TABLE looks ADD COLUMN IF NOT EXISTS feature_title TEXT`,
  `ALTER TABLE looks ADD COLUMN IF NOT EXISTS feature_body TEXT`,
  `ALTER TABLE looks ADD COLUMN IF NOT EXISTS feature_cta TEXT`,
  `CREATE TABLE IF NOT EXISTS blogs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    image TEXT,
    author TEXT,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
];

async function main() {
  console.log(`Running migrations for project: ${projectRef}\n`);
  let ok = 0, fail = 0;

  for (const sql of migrations) {
    const preview = sql.trim().replace(/\s+/g, ' ').slice(0, 80);
    const result = await runSQL(sql);
    if (result.ok || result.body.includes('already exists') || result.body.includes('42701') || result.body.includes('42P07')) {
      console.log(`✅ ${preview}`);
      ok++;
    } else {
      console.error(`❌ ${preview}`);
      console.error(`   HTTP ${result.status}: ${result.body.slice(0, 300)}`);
      fail++;
    }
  }

  console.log(`\n${ok} succeeded, ${fail} failed.`);
}

main();

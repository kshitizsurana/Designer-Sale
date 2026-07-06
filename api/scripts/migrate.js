const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  console.log('Running migrations...\n');
  const migrations = [
    // Add status to landing_pages
    `ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published'`,
    // Add new look editorial fields
    `ALTER TABLE looks ADD COLUMN IF NOT EXISTS tagline TEXT`,
    `ALTER TABLE looks ADD COLUMN IF NOT EXISTS keywords TEXT[]`,
    `ALTER TABLE looks ADD COLUMN IF NOT EXISTS feature_title TEXT`,
    `ALTER TABLE looks ADD COLUMN IF NOT EXISTS feature_body TEXT`,
    `ALTER TABLE looks ADD COLUMN IF NOT EXISTS feature_cta TEXT`,
    // Create blogs table
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

  for (const sql of migrations) {
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      // Try direct REST as fallback
      console.log(`⚠️  rpc failed, trying REST: ${error.message}`);
      // For simple ALTER TABLE, we can use raw query
    } else {
      const preview = sql.trim().slice(0, 60);
      console.log(`✅ OK: ${preview}...`);
    }
  }
  console.log('\nMigration complete!');
}

// Alternative: use Supabase's REST API for raw SQL execution
async function migrateWithRPC() {
  const url = `${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  };

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

  console.log('Running database migrations via Supabase RPC...\n');
  let successCount = 0;
  let failCount = 0;

  for (const sql of migrations) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sql })
      });
      
      const text = await res.text();
      const preview = sql.trim().replace(/\s+/g, ' ').slice(0, 70);
      
      if (res.ok) {
        console.log(`✅ OK: ${preview}`);
        successCount++;
      } else {
        const errBody = text.slice(0, 200);
        // "42701" = column already exists — safe to ignore
        // "42P07" = table already exists — safe to ignore
        if (errBody.includes('42701') || errBody.includes('42P07') || errBody.includes('already exists')) {
          console.log(`⏭️  Skip (already exists): ${preview}`);
          successCount++;
        } else {
          console.error(`❌ FAILED: ${preview}\n   Error: ${errBody}`);
          failCount++;
        }
      }
    } catch(e) {
      console.error(`❌ Network error on: ${sql.slice(0, 60)}\n   ${e.message}`);
      failCount++;
    }
  }

  console.log(`\n✅ ${successCount} migrations succeeded, ❌ ${failCount} failed.`);
}

migrateWithRPC();

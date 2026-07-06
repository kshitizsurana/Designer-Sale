/**
 * seed-sales-landing-pages.js
 * Seeds "Sales in Formal Wear", "Sales in Bohemian", "Sales in Casuals" 
 * landing pages linked to each respective look.
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  console.log('Fetching looks...');
  const { data: looks, error: lookErr } = await supabase.from('looks').select('id, name, slug');
  if (lookErr) { console.error('Cannot fetch looks:', lookErr.message); return; }
  if (!looks.length) { console.error('No looks found. Seed looks first.'); return; }

  console.log('Found looks:', looks.map(l => `${l.name} (id=${l.id})`).join(', '));

  const pages = looks.flatMap(look => {
    const base = look.name; // e.g. "Formal"
    return [
      {
        id: `lp_sales_${look.slug}_${Date.now().toString(36)}`,
        title: `Sales in ${base}`,
        short_description: `Discover the best discounted ${base.toLowerCase()} pieces from Australia's top boutiques — all on sale now.`,
        image: look.hero_image || null,
        look_id: look.id,
        products: [],
      },
    ];
  });

  console.log(`\nUpserting ${pages.length} landing pages...`);

  for (const page of pages) {
    // Check if it already exists
    const { data: existing } = await supabase
      .from('landing_pages')
      .select('id')
      .eq('title', page.title)
      .maybeSingle();

    if (existing) {
      console.log(`⏭️  Skip (already exists): "${page.title}"`);
      continue;
    }

    const { error } = await supabase.from('landing_pages').insert(page);
    if (error) {
      console.error(`❌ Failed to insert "${page.title}":`, error.message);
    } else {
      console.log(`✅ Created: "${page.title}"`);
    }
  }

  console.log('\nDone!');
}

seed();

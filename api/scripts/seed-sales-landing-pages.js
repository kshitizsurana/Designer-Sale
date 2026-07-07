/**
 * seed-sales-landing-pages.js
 * Seeds stable "Sales in {Look}" landing pages with product assignments per style.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  console.log('Seeding sales landing pages...');

  const { data: looks, error: lookErr } = await supabase.from('looks').select('id, name, slug, hero_image');
  if (lookErr) { console.error('Cannot fetch looks:', lookErr.message); return; }

  const { data: products } = await supabase.from('products').select('id, look_id');

  for (const look of looks) {
    const stableId = `lp_sales_${look.slug}`;
    const lookProducts = (products || []).filter(p => p.look_id === look.id).map(p => p.id).slice(0, 12);

    const page = {
      id: stableId,
      title: `Sales in ${look.name}`,
      short_description: `Discover the best discounted ${look.name.toLowerCase()} pieces from Australia's top boutiques — all on sale now.`,
      image: look.hero_image || null,
      look_id: look.id,
      products: lookProducts,
      status: 'published',
    };

    const { error } = await supabase.from('landing_pages').upsert(page);
    if (error) console.error(`❌ "${page.title}":`, error.message);
    else console.log(`✅ ${page.title} (${lookProducts.length} products tagged)`);
  }

  console.log('Done.');
}

seed();

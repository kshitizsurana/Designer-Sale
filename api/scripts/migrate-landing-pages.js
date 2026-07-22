const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Fetching landing pages...');
  const { data: landingPages, error: lpError } = await supabase.from('landing_pages').select('*');
  if (lpError) { console.error('Error fetching landing pages:', lpError); return; }
  console.log(`Found ${landingPages.length} landing pages.`);

  for (const lp of landingPages) {
    console.log(`Migrating: ${lp.title}...`);
    const slug = lp.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { data: existing } = await supabase.from('collections').select('id').eq('slug', slug).maybeSingle();
    if (existing) {
        console.log(`- Skipping ${lp.title}, already exists as collection.`);
        continue;
    }

    const { data: newCollection, error: insertError } = await supabase.from('collections').insert([{
        look_id: lp.look_id,
        title: lp.title,
        slug: slug,
        hero_image: lp.image,
        description: lp.short_description,
        display_order: lp.sort_order,
        status: lp.status || 'published'
    }]).select().single();

    if (insertError) { console.error('Error inserting collection:', insertError); continue; }

    const products = Array.isArray(lp.products) ? lp.products : [];
    if (products.length > 0) {
        const cpRecords = products.map((pid, idx) => ({
            collection_id: newCollection.id,
            product_id: pid,
            display_order: idx
        }));
        
        const { data: validProducts } = await supabase.from('products').select('id').in('id', products);
        const validIds = new Set(validProducts.map(p => p.id));
        const validCpRecords = cpRecords.filter(r => validIds.has(r.product_id));
        
        if (validCpRecords.length > 0) {
            const { error: cpError } = await supabase.from('collection_products').insert(validCpRecords);
            if (cpError) console.error('Error linking products:', cpError);
        }
    }
  }
  console.log('Done migrating.');
}

run();

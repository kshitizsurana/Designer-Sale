require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ────────────────────────────────────────────────────────────
//  Boutique configs from DesignerSale.xlsx
// ────────────────────────────────────────────────────────────
const BOUTIQUES = [
  {
    name: 'Calexico',
    website: 'calexico.com.au',
    saleCollection: 'sale',
    allCollection: 'all',
    city: 'Brisbane', suburb: 'Fortitude Valley', state: 'QLD',
    instagram: '@calexicofusion',
    description: 'International luxury fashion, effortless styling, and premium multi-brand curation.',
    style: 'formal-wear',
  },
  {
    name: 'Hansen & Gretel',
    website: 'hansenandgretel.com',
    saleCollection: 'sale',
    allCollection: 'all',
    city: 'Sydney', suburb: 'Paddington', state: 'NSW',
    instagram: '@hansenandgretel',
    description: 'Chic contemporary styling, unique prints, and feminine everyday staples.',
    style: 'casuals',
  },
  {
    name: 'Flannel',
    website: 'flannel.com.au',
    saleCollection: 'sale',
    allCollection: 'all',
    city: 'Sydney', suburb: 'Paddington', state: 'NSW',
    instagram: '@flannelluxe',
    description: 'Effortless bohemian-luxe essentials focusing on flowing silks, fine knits, and romantic slips.',
    style: 'bohemian',
  },
  {
    name: 'Viktoria & Woods',
    website: 'viktoriaandwoods.com.au',
    saleCollection: 'sale',
    allCollection: 'all',
    city: 'Sydney', suburb: 'Paddington', state: 'NSW',
    instagram: '@viktoriaandwoods',
    description: 'Premium, tailored, smart casual.',
    style: 'formal-wear',
  },
  {
    name: 'St. Agni',
    website: 'st-agni.com',
    saleCollection: 'sale',
    allCollection: 'all',
    city: 'Sydney', suburb: 'Paddington', state: 'NSW',
    instagram: '@stagnistudio',
    description: 'Formal, minimalistic.',
    style: 'formal-wear',
  },
  {
    name: 'Elysian Collective',
    website: 'elysiancollective.com.au',
    saleCollection: 'sale',
    allCollection: 'collections/new-arrivals',
    city: 'Sydney', suburb: 'Narrabeen', state: 'NSW',
    instagram: '@elysiancollective_',
    description: 'Casual, colorful.',
    style: 'casuals',
  },
  {
    name: 'Mode Sportif',
    website: 'modesportif.com',
    saleCollection: 'sale',
    allCollection: 'all',
    city: 'Sydney', suburb: 'Paddington', state: 'NSW',
    instagram: '@modesportif',
    description: 'Elegant contemporary designer outfits, resort wear, and relaxed luxury tailoring.',
    style: 'bohemian',
  },
];

// Category guessing from product_type / tags
function guessCategory(product) {
  const t = ((product.product_type || '') + ' ' + (product.tags || []).join(' ')).toLowerCase();
  if (t.includes('dress') || t.includes('gown')) return 'dresses';
  if (t.includes('top') || t.includes('blouse') || t.includes('shirt')) return 'tops';
  if (t.includes('trouser') || t.includes('pant') || t.includes('jean')) return 'pants';
  if (t.includes('skirt')) return 'skirts';
  if (t.includes('jacket') || t.includes('coat') || t.includes('blazer') || t.includes('outerwear')) return 'jackets';
  if (t.includes('shoe') || t.includes('heel') || t.includes('boot') || t.includes('sandal')) return 'shoes';
  if (t.includes('bag') || t.includes('handbag') || t.includes('purse')) return 'bags';
  if (t.includes('jewel') || t.includes('necklace') || t.includes('earring') || t.includes('bracelet')) return 'accessories';
  if (t.includes('swimwear') || t.includes('bikini')) return 'swimwear';
  return 'tops';
}

// Style guess from look_id
function lookStyle(style) {
  const map = { 'formal-wear': 'formal', 'bohemian': 'bohemian', 'casuals': 'casual' };
  return map[style] || 'casual';
}

function fetchJson(url) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DesignerSaleScraper/1.0)',
        'Accept': 'application/json',
      },
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

async function fetchBoutiqueProducts(boutique) {
  const urls = [
    `https://${boutique.website}/collections/${boutique.saleCollection}/products.json?limit=20`,
    `https://www.${boutique.website}/collections/${boutique.saleCollection}/products.json?limit=20`,
    `https://${boutique.website}/collections/${boutique.allCollection}/products.json?limit=20`,
    `https://www.${boutique.website}/collections/${boutique.allCollection}/products.json?limit=20`,
  ];

  for (const url of urls) {
    console.log(`  Trying: ${url}`);
    const json = await fetchJson(url);
    if (json && json.products && json.products.length > 0) {
      console.log(`  ✓ Got ${json.products.length} products`);
      return json.products;
    }
  }
  console.log(`  ✗ No products found`);
  return [];
}

function transformProduct(shopifyProduct, boutique, merchantId) {
  const variant = shopifyProduct.variants?.[0];
  if (!variant) return null;

  const salePrice = parseFloat(variant.price);
  if (!salePrice || salePrice <= 0) return null;

  const compareAtPrice = parseFloat(variant.compare_at_price || 0);
  const hasCompare = compareAtPrice > salePrice;
  const rrp = hasCompare ? compareAtPrice : Math.round(salePrice * (1 + (Math.random() * 0.35 + 0.15)));
  const discountpct = Math.max(0, Math.round((1 - salePrice / rrp) * 100));

  const image = shopifyProduct.images?.[0]?.src || null;
  if (!image) return null;

  const sizes = shopifyProduct.variants
    .map(v => v.option1)
    .filter(s => ['XS','S','M','L','XL','XXL','6','8','10','12','14','16','18'].includes(s))
    .slice(0, 6);

  const safeId = `${boutique.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${shopifyProduct.id}`;

  return {
    id: safeId,
    title: shopifyProduct.title,
    category: guessCategory(shopifyProduct),
    merchantid: merchantId || null,
    rrp: Math.round(rrp),
    sale: Math.round(salePrice),
    discountpct,
    newin: false,
    sizes: sizes.length ? sizes : ['S', 'M', 'L'],
    image,
    added: Date.now(),
    description: (shopifyProduct.body_html || '').replace(/<[^>]*>/g, '').slice(0, 300) || null,
    // Store style on object for collection assignment (not persisted to DB)
    _style: boutique.style,
  };
}

async function run() {
  console.log('=== DesignerSale Product Seeder ===\n');

  // 1. Load looks
  const { data: looks } = await supabase.from('looks').select('*');
  if (!looks?.length) { console.error('No looks found'); process.exit(1); }
  const lookMap = {};
  looks.forEach(l => { lookMap[l.slug] = l.id; });
  console.log('Looks:', Object.keys(lookMap));

  // 2. Load merchants
  const { data: merchants } = await supabase.from('merchants').select('id, name');
  const merchantMap = {};
  (merchants || []).forEach(m => { merchantMap[m.name.toLowerCase()] = m.id; });

  // 3. DELETE all existing products
  console.log('\nDeleting all existing products...');
  // First clear collection_products since they FK reference products
  await supabase.from('collection_products').delete().neq('collection_id', -1);
  const { data: existingProds } = await supabase.from('products').select('id');
  if (existingProds?.length) {
    const ids = existingProds.map(p => p.id);
    // Delete in batches of 100
    for (let i = 0; i < ids.length; i += 100) {
      await supabase.from('products').delete().in('id', ids.slice(i, i + 100));
    }
  }
  console.log('✓ Existing products removed\n');

  // 4. Scrape and insert
  let totalInserted = 0;
  // Track inserted product IDs per style for collection assignment
  const insertedByStyle = { 'formal-wear': [], 'bohemian': [], 'casuals': [] };

  for (const boutique of BOUTIQUES) {
    console.log(`\n── ${boutique.name} (${boutique.website}) ──`);
    const merchantId = merchantMap[boutique.name.toLowerCase()] || null;

    const shopifyProducts = await fetchBoutiqueProducts(boutique);
    if (!shopifyProducts.length) continue;

    const transformed = shopifyProducts
      .map(p => transformProduct(p, boutique, merchantId))
      .filter(Boolean);

    if (!transformed.length) {
      console.log('  No valid products after transform');
      continue;
    }

    // Strip _style before inserting
    const toInsert = transformed.map(({ _style, ...p }) => p);

    const { error: insertErr } = await supabase.from('products').upsert(toInsert, { onConflict: 'id' });
    if (insertErr) {
      console.error(`  Insert error: ${insertErr.message}`);
    } else {
      console.log(`  ✓ Inserted ${toInsert.length} products`);
      totalInserted += toInsert.length;
      // Track IDs per style
      const style = boutique.style;
      if (insertedByStyle[style]) {
        insertedByStyle[style].push(...toInsert.map(p => p.id));
      }
    }
  }

  console.log(`\n=== Done! Total products inserted: ${totalInserted} ===`);

  // 5. Populate collections with the new real products
  console.log('\nAssigning products to collections...');
  const { data: collections } = await supabase.from('collections').select('id, slug, look_id');
  const { data: looks2 } = await supabase.from('looks').select('id, slug');
  const lookSlugById = {};
  (looks2 || []).forEach(l => { lookSlugById[l.id] = l.slug; });

  for (const col of (collections || [])) {
    const lookSlug = lookSlugById[col.look_id];
    const availableIds = insertedByStyle[lookSlug] || [];
    if (!availableIds.length) continue;

    // Pick up to 12 random products for this collection
    const shuffled = availableIds.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(12, shuffled.length));

    await supabase.from('collection_products').delete().eq('collection_id', col.id);
    const inserts = selected.map((pid, idx) => ({ collection_id: col.id, product_id: pid, display_order: idx }));
    const { error: cpErr } = await supabase.from('collection_products').insert(inserts);
    if (cpErr) console.error(`  Collection ${col.slug} error: ${cpErr.message}`);
    else console.log(`  ✓ Assigned ${inserts.length} products to collection ${col.slug}`);
  }

  console.log('\nAll done!');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });

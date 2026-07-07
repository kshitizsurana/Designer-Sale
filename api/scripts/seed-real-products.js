require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MAX_PRODUCTS_PER_BOUTIQUE = 6;

// All 17 boutiques — ~5-6 products each, distributed across styles
const BOUTIQUES = [
  { id: 'calexico', name: 'Calexico', website: 'calexico.com.au', style: 'formal-wear', saleCollection: 'sale', allCollection: 'all' },
  { id: 'parlour-x', name: 'Parlour X', website: 'parlourx.com.au', style: 'formal-wear', saleCollection: 'sale', allCollection: 'all' },
  { id: 'byfreer', name: 'byfreer', website: 'byfreer.com', style: 'formal-wear', saleCollection: 'sale', allCollection: 'all' },
  { id: 'grace-melbourne', name: 'GRACE Melbourne', website: 'gracemelbourne.com.au', style: 'formal-wear', saleCollection: 'sale', allCollection: 'all' },
  { id: 'duchess-boutique', name: 'Duchess Boutique', website: 'duchessboutique.com.au', style: 'formal-wear', saleCollection: 'sale', allCollection: 'all' },
  { id: 'riada-concept', name: 'Riada Concept', website: 'riadaconcept.com', style: 'formal-wear', saleCollection: 'sale', allCollection: 'all' },
  { id: 'aquel-boutique', name: 'Aquel Boutique', website: 'aquel.com.au', style: 'formal-wear', saleCollection: 'sale', allCollection: 'all' },
  { id: 'st-agni', name: 'St. Agni', website: 'st-agni.com', style: 'formal-wear', saleCollection: 'sale', allCollection: 'all' },
  { id: 'viktoria-and-woods', name: 'Viktoria & Woods', website: 'viktoriaandwoods.com.au', style: 'formal-wear', saleCollection: 'sale', allCollection: 'all' },
  { id: 'qurated', name: 'qurated', website: 'qurated.com.au', style: 'bohemian', saleCollection: 'sale', allCollection: 'all' },
  { id: 'mode-sportif', name: 'Mode Sportif', website: 'modesportif.com', style: 'bohemian', saleCollection: 'sale', allCollection: 'all' },
  { id: 'flannel', name: 'Flannel', website: 'flannel.com.au', style: 'bohemian', saleCollection: 'sale', allCollection: 'all' },
  { id: 'the-standard-store', name: 'The Standard Store', website: 'thestandardstore.com.au', style: 'casuals', saleCollection: 'sale', allCollection: 'all' },
  { id: 'hansen-and-gretel', name: 'Hansen & Gretel', website: 'hansenandgretel.com', style: 'casuals', saleCollection: 'sale', allCollection: 'all' },
  { id: 'koriah', name: 'Koriah', website: 'koriah.com.au', style: 'casuals', saleCollection: 'sale', allCollection: 'all' },
  { id: 'elysian-collective', name: 'Elysian Collective', website: 'elysiancollective.com.au', style: 'casuals', saleCollection: 'collections/new-arrivals', allCollection: 'collections/new-arrivals' },
  { id: 'store-moss', name: 'Store Moss', website: 'storemoss.com.au', style: 'casuals', saleCollection: 'sale', allCollection: 'all' },
];

function slugifyBrand(name) {
  return String(name || 'unknown').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown';
}

function guessCategory(product) {
  const t = ((product.product_type || '') + ' ' + (product.tags || []).join(' ')).toLowerCase();
  if (t.includes('kaftan') || t.includes('caftan')) return 'kaftans';
  if (t.includes('dress') || t.includes('gown')) return 'maxi-dresses';
  if (t.includes('jewel') || t.includes('necklace') || t.includes('earring')) return 'jewellery';
  if (t.includes('bag') || t.includes('handbag')) return 'bags-accessories';
  if (t.includes('jacket') || t.includes('coat') || t.includes('blazer')) return 'coats-jackets';
  if (t.includes('top') || t.includes('blouse') || t.includes('shirt')) return 'tops-blouses';
  return 'tops-blouses';
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
    `https://${boutique.website}/collections/${boutique.saleCollection}/products.json?limit=${MAX_PRODUCTS_PER_BOUTIQUE}`,
    `https://www.${boutique.website}/collections/${boutique.saleCollection}/products.json?limit=${MAX_PRODUCTS_PER_BOUTIQUE}`,
    `https://${boutique.website}/collections/${boutique.allCollection}/products.json?limit=${MAX_PRODUCTS_PER_BOUTIQUE}`,
    `https://www.${boutique.website}/collections/${boutique.allCollection}/products.json?limit=${MAX_PRODUCTS_PER_BOUTIQUE}`,
  ];

  for (const url of urls) {
    console.log(`  Trying: ${url}`);
    const json = await fetchJson(url);
    if (json && json.products && json.products.length > 0) {
      console.log(`  ✓ Got ${json.products.length} products`);
      return json.products.slice(0, MAX_PRODUCTS_PER_BOUTIQUE);
    }
  }
  console.log('  ✗ No products found');
  return [];
}

function transformProduct(shopifyProduct, boutique, merchantId, lookId, brandId) {
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

  const handle = shopifyProduct.handle || shopifyProduct.id;
  const safeId = `${merchantId}__${handle}`;

  return {
    id: safeId,
    title: shopifyProduct.title,
    category: guessCategory(shopifyProduct),
    brandid: brandId,
    merchantid: merchantId,
    look_id: lookId,
    rrp: Math.round(rrp),
    sale: Math.round(salePrice),
    discountpct,
    newin: false,
    sizes: sizes.length ? sizes : ['S', 'M', 'L'],
    image,
    added: Date.now(),
    description: (shopifyProduct.body_html || '').replace(/<[^>]*>/g, '').slice(0, 300) || null,
    _style: boutique.style,
  };
}

async function ensureBrand(vendorName) {
  const id = 'b_' + slugifyBrand(vendorName);
  const { data: existing } = await supabase.from('brands').select('id').eq('id', id).maybeSingle();
  if (existing) return id;
  const { error } = await supabase.from('brands').upsert([{ id, name: vendorName || 'Unknown', country: 'AU' }]);
  if (error) console.warn(`  Brand upsert warning for ${vendorName}:`, error.message);
  return id;
}

async function run() {
  console.log('=== DesignerSale Product Seeder (17 boutiques, max 6 each) ===\n');

  const { data: looks } = await supabase.from('looks').select('*');
  if (!looks?.length) { console.error('No looks found'); process.exit(1); }
  const lookMap = {};
  looks.forEach(l => { lookMap[l.slug] = l.id; });

  const { data: merchants } = await supabase.from('merchants').select('id, name, look_id');
  const merchantMap = {};
  (merchants || []).forEach(m => { merchantMap[m.name.toLowerCase()] = m; merchantMap[m.id] = m; });

  console.log('\nClearing existing products...');
  await supabase.from('collection_products').delete().neq('collection_id', -1);
  const { data: existingProds } = await supabase.from('products').select('id');
  if (existingProds?.length) {
    for (let i = 0; i < existingProds.length; i += 100) {
      await supabase.from('products').delete().in('id', existingProds.slice(i, i + 100).map(p => p.id));
    }
  }
  console.log('✓ Cleared\n');

  let totalInserted = 0;
  const insertedByStyle = { 'formal-wear': [], 'bohemian': [], 'casuals': [] };
  const perMerchantCount = {};

  for (const boutique of BOUTIQUES) {
    console.log(`\n── ${boutique.name} (${boutique.website}) ──`);
    const merchant = merchantMap[boutique.name.toLowerCase()] || merchantMap[boutique.id];
    const merchantId = merchant?.id || boutique.id;
    const lookId = merchant?.look_id || lookMap[boutique.style] || null;

    const shopifyProducts = await fetchBoutiqueProducts(boutique);
    if (!shopifyProducts.length) continue;

    const transformed = [];
    for (const p of shopifyProducts) {
      const vendor = p.vendor || boutique.name;
      const brandId = await ensureBrand(vendor);
      const row = transformProduct(p, boutique, merchantId, lookId, brandId);
      if (row) transformed.push(row);
    }

    if (!transformed.length) {
      console.log('  No valid products after transform');
      continue;
    }

    const toInsert = transformed.map(({ _style, ...p }) => p);
    const { error: insertErr } = await supabase.from('products').upsert(toInsert, { onConflict: 'id' });
    if (insertErr) {
      console.error(`  Insert error: ${insertErr.message}`);
    } else {
      console.log(`  ✓ Inserted ${toInsert.length} products`);
      totalInserted += toInsert.length;
      perMerchantCount[boutique.name] = toInsert.length;
      const style = boutique.style;
      if (insertedByStyle[style]) {
        insertedByStyle[style].push(...toInsert.map(p => p.id));
      }
    }
  }

  console.log(`\n=== Done! Total products inserted: ${totalInserted} ===`);
  console.log('\nPer boutique:');
  Object.entries(perMerchantCount).forEach(([name, count]) => console.log(`  ${name}: ${count}`));

  // Assign products to collections by style
  console.log('\nAssigning products to collections...');
  const { data: collections } = await supabase.from('collections').select('id, slug, look_id, title');
  const lookSlugById = {};
  looks.forEach(l => { lookSlugById[l.id] = l.slug; });

  for (const col of (collections || [])) {
    const lookSlug = lookSlugById[col.look_id];
    const availableIds = insertedByStyle[lookSlug] || [];
    if (!availableIds.length) continue;

    const shuffled = [...availableIds].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(8, shuffled.length));

    await supabase.from('collection_products').delete().eq('collection_id', col.id);
    const inserts = selected.map((pid, idx) => ({ collection_id: col.id, product_id: pid, display_order: idx }));
    const { error: cpErr } = await supabase.from('collection_products').insert(inserts);
    if (cpErr) console.error(`  Collection ${col.slug} error: ${cpErr.message}`);
    else console.log(`  ✓ Assigned ${inserts.length} products to ${col.title}`);
  }

  console.log('\nAll done!');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });

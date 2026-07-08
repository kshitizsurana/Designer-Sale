/**
 * scrape-real-products.js
 *
 * Scrapes REAL product data from boutique Shopify stores via their
 * public /collections/<handle>/products.json endpoint.
 *
 * Usage:
 *   node api/scripts/scrape-real-products.js
 *
 * Requires api/.env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const https = require('https');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ─── CONFIG ────────────────────────────────────────────────────────────
const PRODUCTS_PER_BOUTIQUE = 6;
const DELAY_MS = 1800; // be polite

// Look IDs as they exist in the DB (1=Formal, 2=Casual, 3=Bohemian, 4=Resort)
const LOOK_MAP = {
  formal: 1,
  casual: 2,
  bohemian: 3,
  resort: 4,
};

// Boutiques with their Shopify handles to try for sale collections
const BOUTIQUES = [
  // ── FORMAL ──
  {
    id: 'parlour-x',
    name: 'Parlour X',
    domain: 'parlourx.com.au',
    look: 'formal',
    saleHandles: ['sale', 'outlet', 'clearance', 'sale-clothing', 'final-sale'],
  },
  {
    id: 'byfreer',
    name: 'byfreer',
    domain: 'byfreer.com',
    look: 'formal',
    saleHandles: ['sale', 'outlet', 'clearance', 'sample-sale'],
  },
  {
    id: 'grace-melbourne',
    name: 'GRACE Melbourne',
    domain: 'gracemelbourne.com.au',
    look: 'formal',
    saleHandles: ['sale', 'outlet', 'clearance', 'on-sale'],
  },
  {
    id: 'qurated',
    name: 'Qurated',
    domain: 'qurated.com.au',
    look: 'formal',
    saleHandles: ['sale', 'outlet', 'clearance'],
  },
  {
    id: 'duchess-boutique',
    name: 'Duchess Boutique',
    domain: 'duchessboutique.com.au',
    look: 'formal',
    saleHandles: ['sale', 'outlet', 'clearance', 'sale-items'],
  },
  {
    id: 'riada-concept',
    name: 'Riada Concept',
    domain: 'riadaconcept.com',
    look: 'formal',
    saleHandles: ['sale', 'outlet', 'clearance', 'sale-items'],
  },
  {
    id: 'koriah',
    name: 'Koriah',
    domain: 'koriah.com.au',
    look: 'formal',
    saleHandles: ['sale', 'outlet', 'clearance'],
  },
  {
    id: 'aquel-boutique',
    name: 'Aquel Boutique',
    domain: 'aquel.com.au',
    look: 'formal',
    saleHandles: ['sale', 'outlet', 'clearance', 'sale-items'],
  },
  {
    id: 'st-agni',
    name: 'St. Agni',
    domain: 'st-agni.com',
    look: 'formal',
    saleHandles: ['sale', 'outlet', 'clearance', 'sample-sale'],
  },
  {
    id: 'viktoria-woods',
    name: 'Viktoria & Woods',
    domain: 'viktoriaandwoods.com.au',
    look: 'formal',
    saleHandles: ['sale', 'outlet', 'clearance', 'sale-items'],
  },

  // ── CASUAL ──
  {
    id: 'calexico',
    name: 'Calexico',
    domain: 'calexico.com.au',
    look: 'casual',
    saleHandles: ['sale', 'outlet', 'clearance', 'sale-clothing'],
  },
  {
    id: 'the-standard-store',
    name: 'The Standard Store',
    domain: 'thestandardstore.com.au',
    look: 'casual',
    saleHandles: ['sale', 'outlet', 'clearance'],
  },
  {
    id: 'mode-sportif',
    name: 'Mode Sportif',
    domain: 'modesportif.com',
    look: 'casual',
    saleHandles: ['sale', 'outlet', 'clearance', 'sale-items'],
  },
  {
    id: 'elysian-collective',
    name: 'Elysian Collective',
    domain: 'elysiancollective.com.au',
    look: 'casual',
    saleHandles: ['sale', 'outlet', 'clearance'],
  },
  {
    id: 'store-moss',
    name: 'Store Moss',
    domain: 'storemoss.com.au',
    look: 'casual',
    saleHandles: ['sale', 'outlet', 'clearance'],
  },

  // ── BOHEMIAN ──
  {
    id: 'hansen-gretel',
    name: 'Hansen & Gretel',
    domain: 'hansenandgretel.com',
    look: 'bohemian',
    saleHandles: ['sale', 'outlet', 'clearance', 'sale-items'],
  },
  {
    id: 'flannel',
    name: 'Flannel',
    domain: 'flannel.com.au',
    look: 'bohemian',
    saleHandles: ['sale', 'outlet', 'clearance'],
  },
  {
    id: 'tree-of-life',
    name: 'Tree of Life',
    domain: 'treeoflife.com.au',
    look: 'bohemian',
    saleHandles: ['sale', 'outlet', 'clearance', 'all-clothing'],
  },
  {
    id: 'bella-boheme',
    name: 'Bella Boheme',
    domain: 'bellaboheme.com.au',
    look: 'bohemian',
    saleHandles: ['all-clothing', 'sale', 'outlet', 'clearance'],
  },

  // ── RESORT ──
  {
    id: 'camilla',
    name: 'Camilla',
    domain: 'camilla.com',
    look: 'resort',
    saleHandles: ['sale', 'outlet', 'clearance', 'sample-sale'],
  },
  {
    id: 'blue-bungalow',
    name: 'Blue Bungalow',
    domain: 'bluebungalow.com.au',
    look: 'resort',
    saleHandles: ['sale', 'outlet', 'clearance'],
  },
  {
    id: 'bondi-resortwear',
    name: 'Bondi Resortwear',
    domain: 'bondiresortwear.com.au',
    look: 'resort',
    saleHandles: ['all-items', 'sale', 'outlet', 'clearance'],
  },
];

// ─── HELPERS ────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function httpGet(url, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DesignerSaleBot/1.0; +https://designer-sale.vercel.app)',
        'Accept': 'application/json',
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect once
        return httpGet(res.headers.location, timeoutMs).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return resolve(null); // Not found/blocked — signal caller to try next handle
      }
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve(null); }
      });
    });
    req.setTimeout(timeoutMs, () => { req.destroy(); resolve(null); });
    req.on('error', () => resolve(null));
  });
}

function slugify(str) {
  return String(str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function guessCategory(productType, title, tags) {
  const s = `${productType || ''} ${title || ''} ${(tags || []).join(' ')}`.toLowerCase();
  if (/kaftan|kaftan/.test(s)) return 'kaftans';
  if (/maxi|floor.length|gown/.test(s)) return 'maxi-dresses';
  if (/midi|mini|shift|wrap.dress|dress/.test(s)) return 'dresses';
  if (/top|blouse|shirt|cami|tank/.test(s)) return 'tops-blouses';
  if (/pant|trouser|short|skirt/.test(s)) return 'bottoms';
  if (/jacket|coat|blazer|cardigan|knit/.test(s)) return 'coats-jackets';
  if (/bag|clutch|tote|purse|wallet/.test(s)) return 'bags-accessories';
  if (/jewel|necklace|earring|ring|bracelet/.test(s)) return 'jewellery';
  if (/swim|bikini|one.piece/.test(s)) return 'swimwear';
  if (/jumpsuit|playsuit|romper/.test(s)) return 'jumpsuits';
  if (/shoe|heel|sandal|boot|flat/.test(s)) return 'shoes';
  return 'dresses'; // fallback
}

async function fetchSaleProducts(boutique) {
  const baseUrl = `https://${boutique.domain}`;

  // Try each sale collection handle
  for (const handle of boutique.saleHandles) {
    const url = `${baseUrl}/collections/${handle}/products.json?limit=250`;
    console.log(`  → trying ${url}`);
    const json = await httpGet(url);
    await sleep(500);

    if (!json || !json.products || json.products.length === 0) continue;

    // Filter for genuinely discounted items (compare_at_price > price)
    const discounted = json.products.filter(p => {
      const v = p.variants?.[0];
      if (!v) return false;
      const price = parseFloat(v.price || 0);
      const compare = parseFloat(v.compare_at_price || 0);
      return compare > 0 && compare > price;
    });

    if (discounted.length === 0) {
      console.log(`    ↳ ${json.products.length} products but none discounted in "${handle}"`);
      continue;
    }

    console.log(`    ✓ Found ${discounted.length} discounted products in "${handle}"`);
    return { products: discounted, handle };
  }

  return null;
}

function mapShopifyProduct(shopifyProduct, boutique, lookId) {
  const variant = shopifyProduct.variants?.[0] || {};
  const allVariants = shopifyProduct.variants || [];
  const price = parseFloat(variant.price || 0);
  const compare = parseFloat(variant.compare_at_price || price);
  const discountPct = compare > 0 ? Math.round(((compare - price) / compare) * 100) : 0;

  // Get best image
  const imageUrl = shopifyProduct.images?.[0]?.src || '';

  // Sizes from variants
  const sizes = allVariants
    .filter(v => v.available !== false && v.option1 && v.option1 !== 'Default Title')
    .map(v => v.option1)
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .slice(0, 10);

  const category = guessCategory(shopifyProduct.product_type, shopifyProduct.title, shopifyProduct.tags);
  const vendor = shopifyProduct.vendor || boutique.name;

  // Build product URL
  const productUrl = `https://${boutique.domain}/products/${shopifyProduct.handle}`;

  // Clean description (strip HTML)
  const rawDesc = shopifyProduct.body_html || '';
  const cleanDesc = rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500);

  const productId = `${boutique.id}__${shopifyProduct.handle}`;

  return {
    id: productId,
    title: shopifyProduct.title,
    category,
    brandId: slugify(vendor),
    brandName: vendor,
    merchantId: boutique.id,
    rrp: compare,
    sale: price,
    discountPct,
    image: imageUrl,
    url: productUrl,
    description: cleanDesc,
    sizes,
    look_id: lookId,
    newIn: false,
    status: 'active',
    tags: (shopifyProduct.tags || []).slice(0, 8),
    added: Date.now(),
  };
}

// ─── SUPABASE UPSERT HELPERS ──────────────────────────────────────────

async function ensureBrand(brandId, brandName) {
  const { data: existing } = await supabase.from('brands').select('id').eq('id', brandId).single();
  if (existing) return;
  const { error } = await supabase.from('brands').insert([{
    id: brandId,
    name: brandName,
    country: 'AU',
  }]);
  if (error && !error.message.includes('duplicate')) {
    console.warn(`  ⚠ Could not create brand ${brandId}: ${error.message}`);
  }
}

async function ensureCategory(categoryId) {
  const CATEGORY_LABELS = {
    'maxi-dresses': 'Maxi Dresses',
    'dresses': 'Dresses',
    'kaftans': 'Kaftans',
    'tops-blouses': 'Tops & Blouses',
    'bottoms': 'Bottoms',
    'coats-jackets': 'Coats & Jackets',
    'bags-accessories': 'Bags & Accessories',
    'jewellery': 'Jewellery',
    'swimwear': 'Swimwear',
    'jumpsuits': 'Jumpsuits & Playsuits',
    'shoes': 'Shoes',
  };
  const { data: existing } = await supabase.from('categories').select('id').eq('id', categoryId).single();
  if (existing) return;
  const { error } = await supabase.from('categories').insert([{
    id: categoryId,
    label: CATEGORY_LABELS[categoryId] || categoryId,
    status: 'active',
  }]);
  if (error && !error.message.includes('duplicate')) {
    console.warn(`  ⚠ Could not create category ${categoryId}: ${error.message}`);
  }
}

async function upsertProduct(product) {
  // Store url in description JSON field (per existing API pattern)
  const finalDesc = product.url
    ? JSON.stringify({ desc: product.description || '', url: product.url })
    : (product.description || '');

  const row = {
    id: product.id,
    title: product.title,
    category: product.category,
    brandid: product.brandId,
    merchantid: product.merchantId,
    rrp: product.rrp,
    sale: product.sale,
    discountpct: product.discountPct,
    newin: false,
    sizes: product.sizes,
    image: product.image,
    description: finalDesc,
    look_id: product.look_id,
    status: 'active',
    tags: product.tags,
    added: product.added,
  };

  const { error } = await supabase.from('products').upsert([row], { onConflict: 'id' });
  if (error) {
    console.warn(`  ⚠ upsert failed for ${product.id}: ${error.message}`);
    return false;
  }
  return true;
}

// ─── MAIN ─────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  DesignerSale — Real Product Scraper                 ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // Step 1: Clear all existing products, brands (not merchants/looks)
  console.log('► Step 1: Clearing existing dummy products & brands…');
  const { error: delProdErr } = await supabase.from('products').delete().neq('id', '__keep__');
  if (delProdErr) { console.error('Failed to clear products:', delProdErr.message); process.exit(1); }
  const { error: delBrandErr } = await supabase.from('brands').delete().neq('id', '__keep__');
  if (delBrandErr) console.warn('Could not clear brands:', delBrandErr.message);
  // Clear collection_products too (stale references)
  await supabase.from('collection_products').delete().neq('collection_id', -1);
  console.log('  ✓ Cleared\n');

  const report = {
    success: [],
    failed: [],
  };

  // Step 2: Scrape each boutique
  for (const boutique of BOUTIQUES) {
    const lookId = LOOK_MAP[boutique.look];
    console.log(`\n━━━ ${boutique.name} (${boutique.look.toUpperCase()}, look_id=${lookId}) ━━━`);

    const result = await fetchSaleProducts(boutique);
    await sleep(DELAY_MS);

    if (!result) {
      console.log(`  ✗ No discounted products found — skipping`);
      report.failed.push({ boutique: boutique.name, reason: 'No Shopify sale collection found or no discounted items' });
      continue;
    }

    const { products: discounted } = result;
    // Take top N by discount %, then by image availability
    const candidates = discounted
      .filter(p => p.images?.length > 0)
      .sort((a, b) => {
        const discA = parseFloat(a.variants?.[0]?.compare_at_price || 0) - parseFloat(a.variants?.[0]?.price || 0);
        const discB = parseFloat(b.variants?.[0]?.compare_at_price || 0) - parseFloat(b.variants?.[0]?.price || 0);
        return discB - discA;
      })
      .slice(0, PRODUCTS_PER_BOUTIQUE);

    let imported = 0;
    for (const shopifyP of candidates) {
      const mapped = mapShopifyProduct(shopifyP, boutique, lookId);
      // Ensure brand + category exist
      await ensureBrand(mapped.brandId, mapped.brandName);
      await ensureCategory(mapped.category);
      // Upsert product
      const ok = await upsertProduct(mapped);
      if (ok) {
        imported++;
        console.log(`  ✓ [${mapped.category}] ${mapped.title} — $${mapped.sale} (was $${mapped.rrp}, ${mapped.discountPct}% off)`);
      }
    }

    report.success.push({ boutique: boutique.name, look: boutique.look, count: imported });
    console.log(`  → Imported ${imported} products`);
  }

  // ─── REPORT ──────────────────────────────────────────────────────────
  console.log('\n\n╔══════════════════════════════════════════════════════╗');
  console.log('║  IMPORT REPORT                                       ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const byLook = {};
  report.success.forEach(r => {
    if (!byLook[r.look]) byLook[r.look] = { boutiques: 0, products: 0 };
    byLook[r.look].boutiques++;
    byLook[r.look].products += r.count;
  });

  console.log('✅ Successful imports by Look:');
  Object.entries(byLook).forEach(([look, stats]) => {
    console.log(`   ${look.padEnd(12)} — ${stats.boutiques} boutiques, ${stats.products} products`);
  });

  if (report.failed.length > 0) {
    console.log('\n⚠️  Could not get real data from:');
    report.failed.forEach(f => console.log(`   • ${f.boutique}: ${f.reason}`));
  }

  const total = report.success.reduce((s, r) => s + r.count, 0);
  console.log(`\nTotal products imported: ${total}`);
  console.log('\nDone! ✓');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

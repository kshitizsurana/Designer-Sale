/**
 * scrape-missing.js — Re-scrapes boutiques that failed due to missing merchant FK.
 * Runs after merchants are seeded.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const https = require('https');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const DELAY_MS = 1500;
const PRODUCTS_PER_BOUTIQUE = 6;

const MISSING_BOUTIQUES = [
  { id: 'hansen-gretel', name: 'Hansen & Gretel', domain: 'hansenandgretel.com', look_id: 3, saleHandles: ['sale'] },
  // Also try Calexico with more handles
  { id: 'calexico', name: 'Calexico', domain: 'calexico.com.au', look_id: 2, saleHandles: ['new-arrivals', 'all', 'all-products', 'all-clothing'] },
  // St Agni — try more handles
  { id: 'st-agni', name: 'St. Agni', domain: 'st-agni.com', look_id: 1, saleHandles: ['sample-sale', 'archive', 'end-of-season', 'outlet-sale', 'all'] },
  // Duchess Boutique already worked; try Riada with more handles
  { id: 'riada-concept', name: 'Riada Concept', domain: 'riadaconcept.com', look_id: 1, saleHandles: ['sale', 'on-sale', 'final-sale', 'all'] },
  // Blue Bungalow — try different endpoints
  { id: 'blue-bungalow', name: 'Blue Bungalow', domain: 'bluebungalow.com.au', look_id: 4, saleHandles: ['on-sale', 'sale-items', 'markdowns', 'all', 'all-clothing'] },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function httpGet(url, timeoutMs = 12000) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : require('http');
    const req = lib.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DesignerSaleBot/1.0)', 'Accept': 'application/json' }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) return httpGet(res.headers.location, timeoutMs).then(resolve);
      if (res.statusCode !== 200) { res.resume(); return resolve(null); }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve(null); } });
    });
    req.setTimeout(timeoutMs, () => { req.destroy(); resolve(null); });
    req.on('error', () => resolve(null));
  });
}

function slugify(str) { return String(str||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }

function guessCategory(t, title) {
  const s = `${t||''} ${title||''}`.toLowerCase();
  if (/kaftan/.test(s)) return 'kaftans';
  if (/maxi|gown|floor/.test(s)) return 'maxi-dresses';
  if (/midi|mini|dress/.test(s)) return 'dresses';
  if (/top|blouse|shirt|cami|tank/.test(s)) return 'tops-blouses';
  if (/pant|trouser|short|skirt/.test(s)) return 'bottoms';
  if (/jacket|coat|blazer|cardigan/.test(s)) return 'coats-jackets';
  if (/bag|clutch|tote/.test(s)) return 'bags-accessories';
  if (/jewel|necklace|earring/.test(s)) return 'jewellery';
  if (/swim|bikini/.test(s)) return 'swimwear';
  if (/jumpsuit|playsuit|romper/.test(s)) return 'jumpsuits';
  return 'dresses';
}

async function ensureBrand(id, name) {
  const { data } = await supabase.from('brands').select('id').eq('id', id).single();
  if (data) return;
  await supabase.from('brands').insert([{ id, name, country: 'AU' }]);
}

async function ensureCategory(id) {
  const LABELS = { 'maxi-dresses':'Maxi Dresses','dresses':'Dresses','kaftans':'Kaftans','tops-blouses':'Tops & Blouses','bottoms':'Bottoms','coats-jackets':'Coats & Jackets','bags-accessories':'Bags & Accessories','jewellery':'Jewellery','swimwear':'Swimwear','jumpsuits':'Jumpsuits','shoes':'Shoes' };
  const { data } = await supabase.from('categories').select('id').eq('id', id).single();
  if (data) return;
  await supabase.from('categories').insert([{ id, label: LABELS[id] || id }]);
}

async function upsert(product) {
  const finalDesc = product.url ? JSON.stringify({ desc: product.description || '', url: product.url }) : (product.description || '');
  const row = { id: product.id, title: product.title, category: product.category, brandid: product.brandId, merchantid: product.merchantId, rrp: product.rrp, sale: product.sale, discountpct: product.discountPct, newin: false, sizes: product.sizes, image: product.image, description: finalDesc, added: product.added };
  // Try with look_id first
  const { error } = await supabase.from('products').upsert([{ ...row, look_id: product.look_id }], { onConflict: 'id' });
  if (error && error.message.includes('look_id')) {
    const { error: e2 } = await supabase.from('products').upsert([row], { onConflict: 'id' });
    if (e2) { console.warn(`  ⚠ ${product.id}: ${e2.message}`); return false; }
    return true;
  }
  if (error) { console.warn(`  ⚠ ${product.id}: ${error.message}`); return false; }
  return true;
}

async function main() {
  for (const boutique of MISSING_BOUTIQUES) {
    console.log(`\n━━━ ${boutique.name} (look_id=${boutique.look_id}) ━━━`);
    let found = null;
    for (const handle of boutique.saleHandles) {
      const url = `https://${boutique.domain}/collections/${handle}/products.json?limit=250`;
      console.log(`  → ${url}`);
      const json = await httpGet(url);
      await sleep(600);
      if (!json || !json.products?.length) continue;
      const discounted = json.products.filter(p => {
        const v = p.variants?.[0]; if (!v) return false;
        return parseFloat(v.compare_at_price||0) > parseFloat(v.price||0);
      });
      if (discounted.length > 0) { found = { discounted, handle }; break; }
      console.log(`    ↳ ${json.products.length} products, none discounted`);
    }
    if (!found) { console.log('  ✗ No discounted products found'); continue; }
    console.log(`  ✓ ${found.discounted.length} discounted in "${found.handle}"`);
    const candidates = found.discounted.filter(p => p.images?.length > 0)
      .sort((a,b) => (parseFloat(b.variants?.[0]?.compare_at_price||0)-parseFloat(b.variants?.[0]?.price||0)) - (parseFloat(a.variants?.[0]?.compare_at_price||0)-parseFloat(a.variants?.[0]?.price||0)))
      .slice(0, PRODUCTS_PER_BOUTIQUE);
    let imported = 0;
    for (const p of candidates) {
      const v = p.variants?.[0]||{};
      const price = parseFloat(v.price||0), compare = parseFloat(v.compare_at_price||price);
      const vendor = p.vendor || boutique.name;
      const brandId = slugify(vendor);
      await ensureBrand(brandId, vendor);
      const category = guessCategory(p.product_type, p.title);
      await ensureCategory(category);
      const ok = await upsert({ id: `${boutique.id}__${p.handle}`, title: p.title, category, brandId, brandName: vendor, merchantId: boutique.id, rrp: compare, sale: price, discountPct: Math.round(((compare-price)/compare)*100), image: p.images?.[0]?.src||'', url: `https://${boutique.domain}/products/${p.handle}`, description: (p.body_html||'').replace(/<[^>]+>/g,' ').trim().slice(0,400), sizes: (p.variants||[]).filter(v=>v.option1&&v.option1!=='Default Title').map(v=>v.option1).filter((s,i,a)=>a.indexOf(s)===i).slice(0,10), look_id: boutique.look_id, added: Date.now() });
      if (ok) { imported++; console.log(`  ✓ [${category}] ${p.title} — $${price} (was $${compare}, ${Math.round(((compare-price)/compare)*100)}% off)`); }
    }
    console.log(`  → Imported ${imported}`);
    await sleep(DELAY_MS);
  }
  console.log('\nDone!');
}
main().catch(console.error);

/**
 * seed-all-boutiques.js
 * 
 * Seeds all 17 real boutiques with their correct Look assignment per the product brief.
 * Then generates ~5-6 realistic products per boutique, category-distributed.
 * 
 * Look taxonomy:
 *   1 = Formal Wear (parlour-x, byfreer, grace-melbourne, qurated, duchess-boutique,
 *                    riada-concept, koriah, aquel-boutique, st-agni, viktoria-and-woods)
 *   2 = Bohemian    (hansen-and-gretel, flannel, tree-of-life, bella-boheme)
 *   3 = Casuals     (calexico, the-standard-store, mode-sportif, elysian-collective, store-moss)
 *   4 = Resort Wear (camilla, blue-bungalow, bondi-resortwear)
 * 
 * Usage:
 *   cd api && node scripts/seed-all-boutiques.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ============================================================
// BOUTIQUE DATA — 17 real boutiques, correct Look assignment
// ============================================================
const ALL_MERCHANTS = [
  // ---- FORMAL WEAR (look_id: 1) ----
  {
    id: 'parlour-x', name: 'Parlour X', state: 'NSW', city: 'Paddington', online: true, instore: true,
    focus: 'High-end international luxury fashion', email: 'shop@parlourx.com.au', website: 'https://parlourx.com.au',
    description: 'High-end international luxury fashion, avant-garde curation.', instagram: 'https://www.instagram.com/parlourx/', look_id: 1,
  },
  {
    id: 'byfreer', name: 'byfreer', state: 'NSW', city: 'Paddington', online: true, instore: true,
    focus: 'Everyday luxury & European fabrics', email: 'info@byfreer.com', website: 'https://byfreer.com',
    description: 'Effortless everyday luxury with fine European fabrics and silks.', instagram: 'https://www.instagram.com/byfreer/', look_id: 1,
  },
  {
    id: 'grace-melbourne', name: 'GRACE Melbourne', state: 'VIC', city: 'Toorak', online: true, instore: true,
    focus: 'Luxury classics & tailoring', email: 'info@gracemelbourne.com.au', website: 'https://gracemelbourne.com.au',
    description: 'High-end luxury classics and premium closet staples.', instagram: 'https://www.instagram.com/gracemelbourne/', look_id: 1,
  },
  {
    id: 'qurated', name: 'qurated', state: 'NSW', city: 'Surry Hills', online: true, instore: true,
    focus: 'Niche European designer labels', email: 'info@qurated.com.au', website: 'https://qurated.com.au',
    description: 'Premium niche designer labels sourced from Europe and Asia.', instagram: 'https://www.instagram.com/quratedfashion/', look_id: 1,
  },
  {
    id: 'duchess-boutique', name: 'Duchess Boutique', state: 'NSW', city: 'Paddington', online: true, instore: true,
    focus: 'Evening gowns & occasion wear', email: 'info@duchessboutique.com.au', website: 'https://duchessboutique.com.au',
    description: 'Australian boutique stocking luxury labels for evening and occasion wear.', look_id: 1,
  },
  {
    id: 'riada-concept', name: 'Riada Concept', state: 'NSW', city: 'Woollahra', online: true, instore: true,
    focus: 'Curated luxury & European design', email: 'hello@riadaconcept.com', website: 'https://riadaconcept.com',
    description: 'Curated selection of luxury European designers.', look_id: 1,
  },
  {
    id: 'koriah', name: 'Koriah', state: 'NSW', city: 'Sydney CBD', online: true, instore: false,
    focus: 'Contemporary Asian & global designers', email: 'hello@koriah.com.au', website: 'https://koriah.com.au',
    description: 'Contemporary designers from Asia and beyond.', look_id: 1,
  },
  {
    id: 'aquel-boutique', name: 'Aquel Boutique', state: 'NSW', city: 'Woollahra', online: true, instore: true,
    focus: 'Hand-selected ready-to-wear', email: 'info@aquel.com.au', website: 'https://aquel.com.au',
    description: 'Hand-selected international ready-to-wear labels.', look_id: 1,
  },
  {
    id: 'st-agni', name: 'St. Agni', state: 'NSW', city: 'Paddington', online: true, instore: true,
    focus: 'Minimalist luxury fashion', email: 'hello@st-agni.com', website: 'https://st-agni.com',
    description: 'Minimalist luxury fashion and accessories.', instagram: 'https://www.instagram.com/st_agni/', look_id: 1,
  },
  {
    id: 'viktoria-and-woods', name: 'Viktoria & Woods', state: 'NSW', city: 'Paddington', online: true, instore: true,
    focus: 'Premium tailored smart casual', email: 'info@viktoriaandwoods.com.au', website: 'https://viktoriaandwoods.com.au',
    description: 'Premium tailored fashion elevated for everyday and occasions.', look_id: 1,
  },
  // ---- CASUAL (look_id: 3) ----
  {
    id: 'calexico', name: 'Calexico', state: 'QLD', city: 'Fortitude Valley', online: true, instore: true,
    focus: 'International luxury & styling', email: 'shop@calexico.com.au', website: 'https://calexico.com.au',
    description: 'International fashion and effortless everyday styling.', instagram: 'https://www.instagram.com/calexicofusion/', look_id: 3,
  },
  {
    id: 'the-standard-store', name: 'The Standard Store', state: 'NSW', city: 'Surry Hills', online: true, instore: true,
    focus: 'Independent streetwear & lifestyle', email: 'hello@thestandardstore.com.au', website: 'https://thestandardstore.com.au',
    description: 'Curated independent international streetwear and lifestyle fashion.', look_id: 3,
  },
  {
    id: 'mode-sportif', name: 'Mode Sportif', state: 'NSW', city: 'Paddington', online: true, instore: true,
    focus: 'Relaxed luxury & resort', email: 'hello@modesportif.com', website: 'https://modesportif.com',
    description: 'Relaxed luxury sportswear and contemporary fashion.', look_id: 3,
  },
  {
    id: 'elysian-collective', name: 'Elysian Collective', state: 'NSW', city: 'Narrabeen', online: true, instore: true,
    focus: 'Casual & colourful fashion', email: 'hello@elysiancollective.com.au', website: 'https://elysiancollective.com.au',
    description: 'Colourful everyday casual fashion for a vibrant lifestyle.', look_id: 3,
  },
  {
    id: 'store-moss', name: 'Store Moss', state: 'NSW', city: 'Sydney', online: true, instore: false,
    focus: 'Streetwear & tailored casual', email: 'hello@storemoss.com.au', website: 'https://storemoss.com.au',
    description: 'Streetwear meets tailored casual in a curated Sydney store.', look_id: 3,
  },
  // ---- BOHEMIAN (look_id: 2) ----
  {
    id: 'hansen-and-gretel', name: 'Hansen & Gretel', state: 'NSW', city: 'Paddington', online: true, instore: true,
    focus: 'Contemporary prints & styling', email: 'customerservice@hansenandgretel.com', website: 'https://hansenandgretel.com',
    description: 'Chic prints and feminine everyday staples.', instagram: 'https://www.instagram.com/hansenandgretel/', look_id: 2,
  },
  {
    id: 'flannel', name: 'Flannel', state: 'NSW', city: 'Paddington', online: true, instore: true,
    focus: 'Bohemian-luxe essentials', email: 'online@flannel.com.au', website: 'https://flannel.com.au',
    description: 'Bohemian-luxe fashion with a laid-back Australian sensibility.', look_id: 2,
  },
  {
    id: 'tree-of-life', name: 'Tree of Life', state: 'Online', city: 'Online', online: true, instore: false,
    focus: 'Boho, yoga & spiritual lifestyle', email: 'support@treeoflife.com.au', website: 'https://treeoflife.com.au',
    description: 'Boho, yoga-inspired and spiritual lifestyle clothing.', look_id: 2,
  },
  {
    id: 'bella-boheme', name: 'Bella Boheme', state: 'Online', city: 'Online', online: true, instore: false,
    focus: 'Floral bohemian dresses & clothing', email: 'hello@bellaboheme.com.au', website: 'https://bellaboheme.com.au/collections/all-clothing',
    description: 'Floral and boho-inspired clothing for free spirits.', look_id: 2,
  },
  // ---- RESORT WEAR (look_id: 4) ----
  {
    id: 'camilla', name: 'Camilla', state: 'NSW', city: 'Bondi Beach', online: true, instore: true,
    focus: 'Luxury print resort & resort wear', email: 'info@camilla.com', website: 'https://camilla.com',
    description: 'Iconic luxury resort wear with vibrant Australian prints.', instagram: 'https://www.instagram.com/camillalabel/', look_id: 4,
  },
  {
    id: 'blue-bungalow', name: 'Blue Bungalow', state: 'Online', city: 'Online', online: true, instore: false,
    focus: 'Relaxed resort & vacation wear', email: 'hello@bluebungalow.com.au', website: 'https://bluebungalow.com.au',
    description: 'Relaxed resort wear and vacation essentials.', look_id: 4,
  },
  {
    id: 'bondi-resortwear', name: 'Bondi Resortwear', state: 'NSW', city: 'Bondi Beach', online: true, instore: false,
    focus: 'Poolside & cruise fashion', email: 'info@bondiresortwear.com.au', website: 'https://bondiresortwear.com.au/collections/all-items',
    description: 'Bondi-inspired cruise wear, swimwear and resort fashion.', look_id: 4,
  },
];

// ============================================================
// REALISTIC PRODUCT TEMPLATES — categorized + look-matched
// ============================================================
const PRODUCT_TEMPLATES = {
  1: [ // Formal Wear
    { category: 'maxi-dresses',   titles: ['Silk Bias-Cut Evening Gown', 'Crepe Column Dress in Midnight', 'Structured Wrap Maxi in Onyx', 'Satin Deep V Gown in Ivory'] },
    { category: 'tops-blouses',   titles: ['Silk Georgette Blouse', 'Satin Cowl Top', 'Pintuck Organza Blouse', 'Tailored Poplin Button-Down'] },
    { category: 'coats-jackets',  titles: ['Double-Breasted Wool Blazer', 'Cashmere Wrap Coat', 'Structured Longline Coat', 'Velvet Blazer in Noir'] },
    { category: 'bags-accessories', titles: ['Structured Leather Tote', 'Satin Evening Clutch', 'Croc-Effect Crossbody', 'Suede Mini Bag'] },
    { category: 'jewellery',      titles: ['Pearl Drop Earrings', 'Gold Chain Necklace', 'Diamond Tennis Bracelet', 'Bar Stud Earrings'] },
  ],
  2: [ // Bohemian
    { category: 'maxi-dresses',   titles: ['Floral Print Tiered Maxi', 'Embroidered Cotton Boho Dress', 'Linen Blend Flowy Maxi', 'Wrap-Front Botanical Print Dress'] },
    { category: 'kaftans',        titles: ['Embroidered Silk Kaftan', 'Hand-Block Print Resort Kaftan', 'Cotton Voile Beach Cover-Up', 'Tassel-Trim Boho Kaftan'] },
    { category: 'tops-blouses',   titles: ['Peasant Sleeve Lace Top', 'Smocked Cotton Blouse', 'Patchwork Print Tee', 'Crochet Trim Tunic'] },
    { category: 'bags-accessories', titles: ['Woven Raffia Basket Bag', 'Fringe Trim Suede Hobo', 'Macramé Crossbody', 'Hand-Beaded Clutch'] },
    { category: 'jewellery',      titles: ['Turquoise Drop Earrings', 'Beaded Layering Necklace', 'Hammered Brass Cuffs', 'Shell & Pearl Anklet'] },
  ],
  3: [ // Casuals
    { category: 'tops-blouses',   titles: ['Oversized Graphic Tee', 'Ribbed Muscle Tank', 'Classic Linen Shirt in White', 'Boxy Cotton Crop Tee'] },
    { category: 'coats-jackets',  titles: ['Oversized Denim Jacket', 'Vintage Wash Bomber', 'Textured Fleece Jacket', 'Utility Overshirt'] },
    { category: 'maxi-dresses',   titles: ['Ribbed Jersey Slip Dress', 'Denim Shirt Dress', 'Relaxed Smocked Midi', 'T-shirt Maxi Dress'] },
    { category: 'bags-accessories', titles: ['Nylon Crossbody Bag', 'Canvas Shopper Tote', 'Mini Backpack in Black', 'Zip-Top Bum Bag'] },
    { category: 'jewellery',      titles: ['Chunky Silver Hoop Earrings', 'Resin Stacking Rings', 'Minimalist Bar Necklace', 'Twisted Gold Hoops'] },
  ],
  4: [ // Resort Wear
    { category: 'kaftans',        titles: ['Vibrant Print Silk Kaftan', 'Hand-Beaded Chiffon Cover-Up', 'Tie-Dye Linen Beach Kaftan', 'Sequin-Trim Resort Dress'] },
    { category: 'maxi-dresses',   titles: ['Tropical Print Halter Maxi', 'Bandeau Ruffle Maxi', 'Shirred Poplin Sundress', 'Smocked Resort Maxi in Coral'] },
    { category: 'tops-blouses',   titles: ['Linen Off-Shoulder Top', 'Crochet Bikini Cover-Up Top', 'Printed Wrap Blouse', 'Broderie Anglaise Blouse'] },
    { category: 'bags-accessories', titles: ['Woven Straw Beach Tote', 'Shell Drop Earrings', 'Beaded Anklet', 'Rattan Mini Clutch'] },
  ],
};

// High-quality images by category
const CAT_IMAGES = {
  'maxi-dresses':     ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80', 'https://images.unsplash.com/photo-1594938298605-c8c884d58744?w=800&q=80', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80'],
  'kaftans':          ['https://images.unsplash.com/photo-1485518882345-15568b007407?w=800&q=80', 'https://images.unsplash.com/photo-1568251688392-5e13d16e8ea4?w=800&q=80'],
  'tops-blouses':     ['https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=80', 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=800&q=80'],
  'coats-jackets':    ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80', 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80'],
  'bags-accessories': ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'],
  'jewellery':        ['https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'],
};

// Brands per Look
const BRANDS_BY_LOOK = {
  1: ['Zimmermann', 'Scanlan Theodore', 'Acler', 'Bianca Spender', 'Manning Cartell'],
  2: ['Spell & the Gypsy', 'Tigerlily', 'Tree of Life', 'Arnhem', 'Cleobella'],
  3: ['Bassike', 'Camilla and Marc', 'Assembly Label', 'Nude Lucy', 'The Fifth Label'],
  4: ['Camilla', 'Zimmermann', 'Seafolly', 'We Are Handsome', 'Jets'],
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uid() {
  return 'p_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

async function run() {
  console.log('\n🚀 Starting comprehensive boutique seeding...\n');

  // 1. Upsert all merchants
  console.log('📦 Upserting merchants...');
  for (const m of ALL_MERCHANTS) {
    const { error } = await supabase.from('merchants').upsert({
      id: m.id, name: m.name, state: m.state, city: m.city,
      online: m.online, instore: m.instore, focus: m.focus,
      email: m.email, website: m.website, description: m.description,
      instagram: m.instagram || null, look_id: m.look_id,
    }, { onConflict: 'id' });
    if (error) console.error(`  ❌ ${m.name}:`, error.message);
    else console.log(`  ✅ ${m.name} → Look ${m.look_id}`);
  }

  // 2. Ensure brands exist
  console.log('\n🏷  Upserting brands...');
  const allBrands = [...new Set([...BRANDS_BY_LOOK[1], ...BRANDS_BY_LOOK[2], ...BRANDS_BY_LOOK[3], ...BRANDS_BY_LOOK[4]])];
  const brandMap = {};
  for (const bName of allBrands) {
    const bId = 'b_' + bName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const { error } = await supabase.from('brands').upsert({ id: bId, name: bName }, { onConflict: 'id' });
    if (error) console.error(`  ❌ ${bName}:`, error.message);
    else brandMap[bName] = bId;
  }
  console.log(`  ✅ ${allBrands.length} brands ready.`);

  // 3. Clear old seeded products
  console.log('\n🧹 Clearing old products...');
  const { error: delErr } = await supabase.from('products').delete().neq('id', 'KEEPME');
  if (delErr) console.error('  ❌ Delete failed:', delErr.message);
  else console.log('  ✅ Old products cleared.');

  // 4. Generate 5–6 products per merchant
  console.log('\n🎯 Generating products...');
  const products = [];
  for (const merchant of ALL_MERCHANTS) {
    const tpls = PRODUCT_TEMPLATES[merchant.look_id] || PRODUCT_TEMPLATES[1];
    const count = Math.floor(Math.random() * 2) + 5; // 5–6
    const used = new Set();
    for (let i = 0; i < count; i++) {
      let tpl;
      // Cycle through templates to ensure category diversity
      tpl = tpls[i % tpls.length];
      const titleArr = tpl.titles;
      const title = titleArr[Math.floor(Math.random() * titleArr.length)];
      const bName = pick(BRANDS_BY_LOOK[merchant.look_id]);
      const catImages = CAT_IMAGES[tpl.category] || ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'];
      const rrp = (Math.floor(Math.random() * 32) + 8) * 25; // $200–$1000
      const discPct = Math.floor(Math.random() * 45) + 20; // 20–65%
      const sale = Math.round(rrp * (1 - discPct / 100) / 5) * 5;

      products.push({
        id: uid(),
        title,
        category: tpl.category,
        brandid: brandMap[bName],
        merchantid: merchant.id,
        rrp,
        sale,
        discountpct: discPct,
        newin: Math.random() > 0.6,
        sizes: ['XS', 'S', 'M', 'L', 'XL'].slice(0, Math.floor(Math.random() * 3) + 2),
        image: pick(catImages),
        added: Date.now() - Math.floor(Math.random() * 86400000 * 30),
        description: `${title} from ${merchant.name}. Sale price reflects a ${discPct}% saving from the original RRP.`,
      });
    }
  }

  // 5. Insert products in batches of 50
  let inserted = 0;
  for (let i = 0; i < products.length; i += 50) {
    const batch = products.slice(i, i + 50);
    const { error } = await supabase.from('products').insert(batch);
    if (error) console.error(`  ❌ Batch ${i / 50}:`, error.message);
    else inserted += batch.length;
  }
  console.log(`  ✅ ${inserted} products seeded across ${ALL_MERCHANTS.length} boutiques.`);

  // 6. Create curated landing pages per Look
  console.log('\n📄 Creating landing pages...');
  await supabase.from('landing_pages').delete().neq('id', 'KEEPME');

  const allInsertedPids = products.map(p => ({ id: p.id, look_id: ALL_MERCHANTS.find(m => m.id === p.merchantid)?.look_id, category: p.category }));

  const landingPages = [
    { id: 'lp_formal_winter', title: 'The Winter Workwear Edit', short_description: 'Tailored coats and structured pieces for the office and beyond.', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1600&q=80', look_id: 1, status: 'published', products: allInsertedPids.filter(p => p.look_id === 1 && p.category === 'coats-jackets').slice(0, 8).map(p => p.id) },
    { id: 'lp_formal_eve', title: 'Evening Edit', short_description: 'Gowns, satin and eveningwear for every occasion.', image: 'https://images.unsplash.com/photo-1594938298605-c8c884d58744?w=1600&q=80', look_id: 1, status: 'published', products: allInsertedPids.filter(p => p.look_id === 1 && p.category === 'maxi-dresses').slice(0, 8).map(p => p.id) },
    { id: 'lp_boho_print', title: 'Print & Pattern', short_description: 'Bold prints and earthy florals from Australia\'s best boho boutiques.', image: 'https://images.unsplash.com/photo-1550614000-4b95d466f28b?w=1600&q=80', look_id: 2, status: 'published', products: allInsertedPids.filter(p => p.look_id === 2).slice(0, 10).map(p => p.id) },
    { id: 'lp_resort_summer', title: 'Summer Getaway', short_description: 'Kaftans, maxi dresses and resort essentials for your next escape.', image: 'https://images.unsplash.com/photo-1574621100236-d25b64dcce0d?w=1600&q=80', look_id: 4, status: 'published', products: allInsertedPids.filter(p => p.look_id === 4).slice(0, 10).map(p => p.id) },
    { id: 'lp_casual_basics', title: 'The Basics Edit', short_description: 'Elevated basics and everyday staples you\'ll actually wear.', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1600&q=80', look_id: 3, status: 'published', products: allInsertedPids.filter(p => p.look_id === 3).slice(0, 10).map(p => p.id) },
  ];
  for (const lp of landingPages) {
    const { error } = await supabase.from('landing_pages').insert([lp]);
    if (error) console.error(`  ❌ LP ${lp.title}:`, error.message);
    else console.log(`  ✅ Landing page: "${lp.title}"`);
  }

  // 7. Create collections per Look
  console.log('\n🗂  Creating collections...');
  await supabase.from('collection_products').delete().neq('collection_id', 0);
  await supabase.from('collections').delete().neq('id', 0);

  const collections = [
    { look_id: 1, title: 'Office to Evening', slug: 'office-to-evening', status: 'active', hero_image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=1200&q=80', pids: allInsertedPids.filter(p => p.look_id === 1).slice(0, 6) },
    { look_id: 2, title: 'Boho Bloom', slug: 'boho-bloom', status: 'active', hero_image: 'https://images.unsplash.com/photo-1550614000-4b95d466f28b?w=1200&q=80', pids: allInsertedPids.filter(p => p.look_id === 2).slice(0, 6) },
    { look_id: 3, title: 'Weekend Essentials', slug: 'weekend-essentials', status: 'active', hero_image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=80', pids: allInsertedPids.filter(p => p.look_id === 3).slice(0, 6) },
    { look_id: 4, title: 'Holiday Wardrobe', slug: 'holiday-wardrobe', status: 'active', hero_image: 'https://images.unsplash.com/photo-1574621100236-d25b64dcce0d?w=1200&q=80', pids: allInsertedPids.filter(p => p.look_id === 4).slice(0, 6) },
  ];
  for (const col of collections) {
    const { data: inserted, error } = await supabase.from('collections').insert([{ look_id: col.look_id, title: col.title, slug: col.slug, status: col.status, hero_image: col.hero_image }]).select();
    if (error) { console.error(`  ❌ Collection ${col.title}:`, error.message); continue; }
    const cId = inserted[0].id;
    await supabase.from('collection_products').insert(col.pids.map((p, idx) => ({ collection_id: cId, product_id: p.id, display_order: idx })));
    console.log(`  ✅ Collection: "${col.title}" (${col.pids.length} products)`);
  }

  console.log('\n🎉 All done! Summary:');
  console.log(`  • ${ALL_MERCHANTS.length} boutiques upserted`);
  console.log(`  • ${products.length} products created`);
  console.log(`  • ${landingPages.length} landing pages created`);
  console.log(`  • ${collections.length} collections created`);
  console.log('\n✅ Run tests to verify: node scripts/test-crud.js\n');
}

run().catch(e => { console.error('❌ Fatal error:', e); process.exit(1); });

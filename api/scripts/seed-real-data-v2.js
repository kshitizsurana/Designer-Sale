/**
 * seed-real-data-v2.js
 * 
 * Fetches the 17 boutiques from Supabase.
 * Generates ~5-6 realistic products per boutique, spreading them across the 6 main categories.
 * Auto-assigns products to looks, landing pages, and collections.
 * 
 * Usage:
 *   cd api && node scripts/seed-real-data-v2.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in api/.env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const productTemplates = [
  { category: 'maxi-dresses', look_id: 1, titles: ['Silk Bias Cut Gown', 'Tailored Wool Wrap Dress', 'Crepe Evening Dress'] },
  { category: 'maxi-dresses', look_id: 2, titles: ['Floral Print Tiered Dress', 'Linen Blend Flowy Dress', 'Bohemian Gauze Gown'] },
  { category: 'maxi-dresses', look_id: 3, titles: ['Ribbed Cotton Tank Dress', 'Oversized Jersey Dress', 'Denim Shirt Dress'] },

  { category: 'kaftans', look_id: 2, titles: ['Embroidered Silk Kaftan', 'Printed Resort Kaftan', 'Cotton Voile Cover Up'] },
  
  { category: 'tops-blouses', look_id: 1, titles: ['Silk Georgette Blouse', 'Satin Camisole', 'Tailored Button Down'] },
  { category: 'tops-blouses', look_id: 2, titles: ['Peasant Lace Top', 'Printed Tunic', 'Crochet Crop Top'] },
  { category: 'tops-blouses', look_id: 3, titles: ['Oversized Graphic Tee', 'Ribbed Muscle Tank', 'Classic Linen Shirt'] },

  { category: 'coats-jackets', look_id: 1, titles: ['Double Breasted Wool Blazer', 'Cashmere Wrap Coat', 'Structured Trench'] },
  { category: 'coats-jackets', look_id: 2, titles: ['Suede Fringe Jacket', 'Embroidered Duster', 'Relaxed Shacket'] },
  { category: 'coats-jackets', look_id: 3, titles: ['Oversized Denim Jacket', 'Vintage Wash Bomber', 'Puffer Vest'] },

  { category: 'bags-accessories', look_id: 1, titles: ['Structured Leather Tote', 'Satin Evening Clutch', 'Classic Crossbody'] },
  { category: 'bags-accessories', look_id: 2, titles: ['Woven Raffia Basket', 'Slouchy Suede Hobo', 'Fringe Trim Bag'] },
  { category: 'bags-accessories', look_id: 3, titles: ['Nylon Crossbody', 'Canvas Shopper Tote', 'Mini Backpack'] },

  { category: 'jewellery', look_id: 1, titles: ['Pearl Drop Earrings', 'Gold Chain Necklace', 'Diamond Tennis Bracelet'] },
  { category: 'jewellery', look_id: 2, titles: ['Turquoise Ring', 'Beaded Layering Necklace', 'Brass Hammered Cuffs'] },
  { category: 'jewellery', look_id: 3, titles: ['Chunky Silver Chain', 'Minimalist Hoop Earrings', 'Resin Bangles'] },
];

const images = [
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
  'https://images.unsplash.com/photo-1485518882345-15568b007407?w=800&q=80',
  'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=80',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
  'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
  'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
];

function randomBrand() {
  const brands = ['Zimmermann', 'Scanlan Theodore', 'Aje', 'Camilla', 'Bec + Bridge', 'Acne Studios', 'Ganni', 'Isabel Marant', 'Jacquemus', 'Loewe'];
  return brands[Math.floor(Math.random() * brands.length)];
}

async function run() {
  console.log('🔄 Starting Data Seeding v2...');

  // 1. Fetch Merchants
  const { data: merchants } = await supabase.from('merchants').select('id, name, look_id');
  if (!merchants || merchants.length === 0) {
    console.error('❌ No merchants found! Please run seed-real-merchants.js first.');
    process.exit(1);
  }
  console.log(`✅ Found ${merchants.length} merchants.`);

  // 2. Fetch/Create Brands
  const { data: existingBrands } = await supabase.from('brands').select('id, name');
  const brandMap = {};
  existingBrands.forEach(b => brandMap[b.name] = b.id);
  const brandNames = ['Zimmermann', 'Scanlan Theodore', 'Aje', 'Camilla', 'Bec + Bridge', 'Acne Studios', 'Ganni', 'Isabel Marant', 'Jacquemus', 'Loewe'];
  for (const bName of brandNames) {
    if (!brandMap[bName]) {
      const bId = 'b_' + bName.toLowerCase().replace(/[^a-z]/g, '');
      await supabase.from('brands').insert([{ id: bId, name: bName }]);
      brandMap[bName] = bId;
    }
  }

  // 3. Clear existing products, landing pages, collections (optional but good for a fresh seed)
  await supabase.from('products').delete().neq('id', 'dummy');
  await supabase.from('landing_pages').delete().neq('id', 'dummy');
  await supabase.from('collections').delete().neq('id', 'dummy');
  console.log('✅ Cleared old products, LPs, and Collections.');

  // 4. Generate Products (5-6 per merchant)
  let allProductIds = [];
  let productsToInsert = [];
  
  for (const merchant of merchants) {
    const numProducts = Math.floor(Math.random() * 2) + 5; // 5 to 6
    const mLookId = merchant.look_id || (Math.floor(Math.random() * 3) + 1); // fallback look_id

    for (let i = 0; i < numProducts; i++) {
      // Pick a template matching the merchant's look, or random if not found
      let validTemplates = productTemplates.filter(t => t.look_id === mLookId);
      if (validTemplates.length === 0) validTemplates = productTemplates;
      const tpl = validTemplates[Math.floor(Math.random() * validTemplates.length)];
      
      const title = tpl.titles[Math.floor(Math.random() * tpl.titles.length)];
      const bName = randomBrand();
      const brandId = brandMap[bName];
      const pId = 'p_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      
      const rrp = Math.floor(Math.random() * 800) + 200;
      const sale = Math.floor(rrp * (Math.random() * 0.4 + 0.3)); // 30-70% off
      
      productsToInsert.push({
        id: pId,
        category: tpl.category,
        title: title,
        brandid: brandId,
        merchantid: merchant.id,
        rrp: rrp,
        sale: sale,
        discountpct: Math.round(((rrp - sale) / rrp) * 100),
        newin: Math.random() > 0.7,
        sizes: ['S', 'M', 'L'],
        image: images[Math.floor(Math.random() * images.length)],
        added: Date.now() - Math.floor(Math.random() * 1000000000)
      });
      allProductIds.push({ id: pId, look_id: mLookId, category: tpl.category });
    }
  }

  // Insert in batches of 50
  for (let i = 0; i < productsToInsert.length; i += 50) {
    const batch = productsToInsert.slice(i, i + 50);
    const { error } = await supabase.from('products').insert(batch);
    if (error) console.error('Error inserting products:', error.message);
  }
  console.log(`✅ Seeded ${productsToInsert.length} products across all boutiques.`);

  // 5. Create Landing Pages
  const lp1Id = 'lp_winter_edit';
  await supabase.from('landing_pages').insert([{
    id: lp1Id,
    title: 'The Winter Edit',
    short_description: 'Coats, jackets and layering essentials curated from top boutiques.',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1600&q=80',
    status: 'published',
    look_id: 1,
    products: allProductIds.filter(p => p.category === 'coats-jackets').slice(0, 8).map(p => p.id)
  }]);

  const lp2Id = 'lp_resort';
  await supabase.from('landing_pages').insert([{
    id: lp2Id,
    title: 'Resort Wear 2026',
    short_description: 'Kaftans, maxi dresses and warm weather pieces.',
    image: 'https://images.unsplash.com/photo-1485518882345-15568b007407?w=1600&q=80',
    status: 'published',
    look_id: 2,
    products: allProductIds.filter(p => p.look_id === 2 || p.category === 'kaftans').slice(0, 10).map(p => p.id)
  }]);

  console.log('✅ Seeded Landing Pages.');

  // 6. Create Collections
  const col1 = await supabase.from('collections').insert([{
    look_id: 1, title: 'Office to Evening', slug: 'office-to-evening', status: 'active',
    hero_image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=1200&q=80'
  }]).select();

  const col2 = await supabase.from('collections').insert([{
    look_id: 3, title: 'Weekend Essentials', slug: 'weekend-essentials', status: 'active',
    hero_image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=80'
  }]).select();

  // Link products to collections
  if (col1.data && col1.data[0]) {
    const cId = col1.data[0].id;
    const pIds = allProductIds.filter(p => p.look_id === 1).slice(0, 6);
    await supabase.from('collection_products').insert(
      pIds.map((p, idx) => ({ collection_id: cId, product_id: p.id, display_order: idx }))
    );
  }
  if (col2.data && col2.data[0]) {
    const cId = col2.data[0].id;
    const pIds = allProductIds.filter(p => p.look_id === 3).slice(0, 6);
    await supabase.from('collection_products').insert(
      pIds.map((p, idx) => ({ collection_id: cId, product_id: p.id, display_order: idx }))
    );
  }
  console.log('✅ Seeded Collections.');
  
  console.log('🎉 Done! All boutiques now have products distributed across categories, looks, collections, and landing pages.');
}

run().catch(console.error);

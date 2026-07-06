/**
 * remap-categories.js
 * 
 * Maps the current raw DB categories (dresses, tops, jackets, accessories, etc.)
 * to the proper site category IDs (maxi-dresses, tops-blouses, coats-jackets, etc.)
 * 
 * Also fetches product titles to intelligently categorize items.
 * 
 * Usage: cd api && node scripts/remap-categories.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Map from DB raw category → site category ID
// We'll also use title keywords to get finer-grained classification
const CATEGORY_MAP = {
  'dresses':      'maxi-dresses',
  'tops':         'tops-blouses',
  'jackets':      'coats-jackets',
  'accessories':  'bags-accessories',
  'pants':        'tops-blouses',   // pants/skirts go into tops-blouses as separates
  'skirts':       'tops-blouses',
  'shoes':        'bags-accessories',
  // already correct:
  'maxi-dresses':    'maxi-dresses',
  'kaftans':         'kaftans',
  'tops-blouses':    'tops-blouses',
  'coats-jackets':   'coats-jackets',
  'bags-accessories':'bags-accessories',
  'jewellery':       'jewellery',
};

// Title keyword overrides — order matters! First match wins.
// More specific / dominant categories first.
const TITLE_KEYWORD_MAP = [
  // Jewellery — very specific terms
  { keywords: ['necklace', 'bracelet', 'ring', 'earring', 'pendant', 'hoops', 'bangle', 'choker', 'diamond hoop', 'gold chain', 'pearl', 'locket', 'anklet', 'cuff'], cat: 'jewellery' },
  // Bags — specific terms
  { keywords: [' bag', 'tote', 'clutch', 'handbag', 'purse', 'wallet', 'crossbody', 'backpack', 'satchel', 'pouch', 'shopper'], cat: 'bags-accessories' },
  // Kaftans
  { keywords: ['kaftan', 'caftan'], cat: 'kaftans' },
  // Coats & Jackets — must come before tops/blouses since "coat" can appear in blouse names
  { keywords: ['coat', 'trench coat', 'blazer', 'jacket', 'bomber', 'parka', 'anorak', 'overcoat', 'windbreaker', 'peacoat', 'wrap coat', 'tailored coat', 'longline coat'], cat: 'coats-jackets' },
  // Maxi/Long dresses — must come before generic "dress"
  { keywords: ['maxi dress', 'maxi gown', 'floor-length', 'floor length', 'kaftan dress', 'kaftan maxi'], cat: 'maxi-dresses' },
  // All dresses and gowns
  { keywords: ['dress', 'gown', 'frock', 'midi dress', 'mini dress', 'slip dress', 'cocktail dress', 'evening gown', 'occasion wear', 'ball gown', 'romper', 'jumpsuit'], cat: 'maxi-dresses' },
  // Cardigans/knitwear — tops category
  { keywords: ['cardigan', 'knit', 'knitwear', 'sweater', 'pullover', 'jumper'], cat: 'tops-blouses' },
  // Tops & blouses
  { keywords: ['blouse', 'shirt', 'top', ' tee ', 't-shirt', 'tank', 'bodysuit', 'crop', 'cami', 'tunic'], cat: 'tops-blouses' },
];


function inferCategory(title, rawCategory) {
  const lower = title.toLowerCase();
  
  // Keyword overrides first
  for (const rule of TITLE_KEYWORD_MAP) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return rule.cat;
    }
  }
  
  // Fallback to raw category mapping
  return CATEGORY_MAP[rawCategory] || rawCategory;
}

async function main() {
  console.log('Fetching all products...\n');
  const { data: products, error } = await supabase.from('products').select('id, title, category');
  if (error) { console.error('Error fetching products:', error.message); return; }
  
  console.log(`Found ${products.length} products. Re-categorizing...\n`);
  
  // Group by new category for reporting
  const changes = {};
  const updates = [];
  
  for (const p of products) {
    const newCat = inferCategory(p.title, p.category);
    if (newCat !== p.category) {
      updates.push({ id: p.id, newCat, oldCat: p.category, title: p.title });
      changes[`${p.category} → ${newCat}`] = (changes[`${p.category} → ${newCat}`] || 0) + 1;
    }
  }

  console.log(`Changes summary:`);
  Object.entries(changes).forEach(([k, v]) => console.log(`  ${k}: ${v} products`));
  console.log(`\nTotal to update: ${updates.length} / ${products.length}`);
  
  if (updates.length === 0) {
    console.log('\n✅ All categories already correct!');
    return;
  }
  
  // Batch updates by new category
  const byNewCat = {};
  updates.forEach(u => {
    if (!byNewCat[u.newCat]) byNewCat[u.newCat] = [];
    byNewCat[u.newCat].push(u.id);
  });
  
  console.log('\nApplying updates...');
  let successCount = 0;
  for (const [newCat, ids] of Object.entries(byNewCat)) {
    const { error: updateError } = await supabase
      .from('products')
      .update({ category: newCat })
      .in('id', ids);
    
    if (updateError) {
      console.error(`❌ Failed to update ${newCat}:`, updateError.message);
    } else {
      console.log(`✅ Updated ${ids.length} products → ${newCat}`);
      successCount += ids.length;
    }
  }
  
  console.log(`\n✅ Done! Updated ${successCount} products.`);
  
  // Verify
  const { data: final } = await supabase.from('products').select('category').limit(1000);
  const catCounts = {};
  final.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
  console.log('\nFinal category distribution:');
  Object.entries(catCounts).sort().forEach(([k, v]) => console.log(`  ${k}: ${v}`));
}

main().catch(e => { console.error(e); process.exit(1); });

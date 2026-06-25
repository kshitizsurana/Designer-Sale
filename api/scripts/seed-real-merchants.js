/**
 * seed-real-merchants.js
 * 
 * Replaces all existing dummy/placeholder merchants in Supabase with
 * the 17 real boutiques sourced from DesignerSale.xlsx.
 * 
 * Usage:
 *   cd api && node scripts/seed-real-merchants.js
 * 
 * Requires .env file in /api with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
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

// ---- Real boutique data from DesignerSale.xlsx ----

const REAL_MERCHANTS = [
  {
    id: 'calexico',
    name: 'Calexico',
    state: 'QLD',
    city: 'Fortitude Valley',
    online: true,
    instore: true,
    focus: 'International luxury & styling',
    email: 'shop@calexico.com.au',
    phone: '',
    website: 'https://calexico.com.au',
    description: 'International luxury fashion, effortless styling, and premium multi-brand curation.',
    facebook: 'https://www.facebook.com/CalexicoBoutique',
    instagram: 'https://www.instagram.com/calexicofusion/',
    best_contact_method: 'email',
    look_id: 1,
  },
  {
    id: 'parlour-x',
    name: 'Parlour X',
    state: 'NSW',
    city: 'Paddington',
    online: true,
    instore: true,
    focus: 'High-end luxury & avant-garde',
    email: 'shop@parlourx.com.au',
    phone: '',
    website: 'https://parlourx.com.au',
    description: 'High-end international luxury fashion, avant-garde and curated designer selection.',
    facebook: 'https://www.facebook.com/ParlourX',
    instagram: 'https://www.instagram.com/parlourx/',
    best_contact_method: 'email',
    look_id: 1,
  },
  {
    id: 'byfreer',
    name: 'byfreer',
    state: 'NSW',
    city: 'Paddington',
    online: true,
    instore: true,
    focus: 'Everyday luxury & European fabrics',
    email: 'info@byfreer.com',
    phone: '',
    website: 'https://byfreer.com',
    description: 'Effortless, everyday luxury clothing focusing on fine European fabrics and silks.',
    facebook: 'https://www.facebook.com/byfreer',
    instagram: 'https://www.instagram.com/byfreer/',
    best_contact_method: 'email',
    look_id: 1,
  },
  {
    id: 'grace-melbourne',
    name: 'GRACE Melbourne',
    state: 'VIC',
    city: 'Toorak',
    online: true,
    instore: true,
    focus: 'Luxury classics & tailoring',
    email: 'info@gracemelbourne.com.au',
    phone: '',
    website: 'https://gracemelbourne.com.au',
    description: 'High-end luxury fashion classics, luxury designer tailoring, and premium closet staples.',
    facebook: 'https://www.facebook.com/GraceMelbourne',
    instagram: 'https://www.instagram.com/gracemelbourne/',
    best_contact_method: 'email',
    look_id: 1,
  },
  {
    id: 'the-standard-store',
    name: 'The Standard Store',
    state: 'NSW',
    city: 'Surry Hills',
    online: true,
    instore: true,
    focus: 'Independent streetwear & lifestyle',
    email: 'hello@thestandardstore.com.au',
    phone: '',
    website: 'https://thestandardstore.com.au',
    description: 'Curated independent international streetwear and lifestyle fashion with a playful edge.',
    facebook: 'https://www.facebook.com/TheStandardStore',
    instagram: 'https://www.instagram.com/thestandardstore/',
    best_contact_method: 'email',
    look_id: 3,
  },
  {
    id: 'qurated',
    name: 'qurated',
    state: 'NSW',
    city: 'Surry Hills',
    online: true,
    instore: true,
    focus: 'Niche designer labels',
    email: 'info@qurated.com.au',
    phone: '',
    website: 'https://qurated.com.au',
    description: 'Premium, niche designer labels sourced directly from Europe, Japan, Korea, and beyond.',
    facebook: 'https://www.facebook.com/Qurated',
    instagram: 'https://www.instagram.com/quratedfashion/',
    best_contact_method: 'email',
    look_id: 2,
  },
  {
    id: 'hansen-and-gretel',
    name: 'Hansen & Gretel',
    state: 'NSW',
    city: 'Paddington',
    online: true,
    instore: true,
    focus: 'Contemporary prints & styling',
    email: 'customerservice@hansenandgretel.com',
    phone: '',
    website: 'https://hansenandgretel.com',
    description: 'Chic contemporary styling, unique prints, and feminine everyday staples.',
    facebook: 'https://www.facebook.com/HansenandGretel',
    instagram: 'https://www.instagram.com/hansenandgretel/',
    best_contact_method: 'email',
    look_id: 3,
  },
  {
    id: 'duchess-boutique',
    name: 'Duchess Boutique',
    state: 'NSW',
    city: 'Paddington',
    online: true,
    instore: true,
    focus: 'Evening gowns & occasion wear',
    email: 'info@duchessboutique.com.au',
    phone: '',
    website: 'https://duchessboutique.com.au',
    description: 'Formal evening gowns, cocktail dresses, and premium special occasion wear.',
    facebook: 'https://www.facebook.com/DuchessBoutique',
    instagram: 'https://www.instagram.com/duchessboutique/',
    best_contact_method: 'email',
    look_id: 1,
  },
  {
    id: 'riada-concept',
    name: 'Riada Concept',
    state: 'NSW',
    city: 'Woollahra',
    online: true,
    instore: true,
    focus: 'Curated luxury & European design',
    email: 'info@riadaconcept.com',
    phone: '',
    website: 'https://riadaconcept.com',
    description: 'Multi-brand curated luxury styling focusing on modern European and premium global designs.',
    facebook: 'https://www.facebook.com/RiadaConcept',
    instagram: 'https://www.instagram.com/riadaconcept/',
    best_contact_method: 'email',
    look_id: 1,
  },
  {
    id: 'koriah',
    name: 'Koriah',
    state: 'NSW',
    city: 'Sydney CBD',
    online: true,
    instore: false,
    focus: 'Emerging Asian designers',
    email: 'info@koriah.com.au',
    phone: '',
    website: 'https://koriah.com.au',
    description: 'Avant-garde, structured styling showcasing emerging independent Asian designers.',
    facebook: 'https://www.facebook.com/Koriah',
    instagram: 'https://www.instagram.com/koriah_official/',
    best_contact_method: 'email',
    look_id: 3,
  },
  {
    id: 'mode-sportif',
    name: 'Mode Sportif',
    state: 'NSW',
    city: 'Paddington',
    online: true,
    instore: true,
    focus: 'Resort wear & relaxed luxury',
    email: 'orders@modesportif.com',
    phone: '',
    website: 'https://modesportif.com',
    description: 'Elegant contemporary designer outfits, resort wear, and relaxed luxury tailoring.',
    facebook: 'https://www.facebook.com/ModeSportif',
    instagram: 'https://www.instagram.com/modesportif/',
    best_contact_method: 'email',
    look_id: 2,
  },
  {
    id: 'flannel',
    name: 'Flannel',
    state: 'NSW',
    city: 'Paddington',
    online: true,
    instore: true,
    focus: 'Bohemian-luxe essentials',
    email: 'orders@flannel.com.au',
    phone: '',
    website: 'https://flannel.com.au',
    description: 'Effortless bohemian-luxe essentials focusing on flowing silks, fine knits, and romantic slips.',
    facebook: 'https://www.facebook.com/Flannel',
    instagram: 'https://www.instagram.com/flannelluxe/',
    best_contact_method: 'email',
    look_id: 2,
  },
  {
    id: 'aquel-boutique',
    name: 'Aquel Boutique',
    state: 'NSW',
    city: 'Woollahra',
    online: true,
    instore: true,
    focus: 'Hand-selected ready-to-wear',
    email: 'shop@aquel.com.au',
    phone: '',
    website: 'https://aquel.com.au',
    description: 'Personalized boutique service presenting hand-selected ready-to-wear labels for discerning tastes.',
    facebook: 'https://www.facebook.com/AquelBoutique',
    instagram: 'https://www.instagram.com/aquelboutique/',
    best_contact_method: 'email',
    look_id: 1,
  },
  {
    id: 'elysian-collective',
    name: 'Elysian Collective',
    state: 'NSW',
    city: 'Narrabeen',
    online: true,
    instore: true,
    focus: 'Casual & colourful fashion',
    email: 'hello@elysiancollective.com.au',
    phone: '',
    website: 'https://elysiancollective.com.au',
    description: 'Casual, colourful fashion with a curated selection of vibrant everyday pieces.',
    facebook: 'https://www.facebook.com/ElysianCollective',
    instagram: 'https://www.instagram.com/elysiancollective_/',
    best_contact_method: 'email',
    look_id: 3,
  },
  {
    id: 'st-agni',
    name: 'St. Agni',
    state: 'NSW',
    city: 'Paddington',
    online: true,
    instore: true,
    focus: 'Minimalist formal wear',
    email: 'hello@st-agni.com',
    phone: '',
    website: 'https://st-agni.com',
    description: 'Formal, minimalistic design with a focus on clean silhouettes and premium fabrications.',
    facebook: 'https://www.facebook.com/StAgni',
    instagram: 'https://www.instagram.com/stagnistudio/',
    best_contact_method: 'email',
    look_id: 1,
  },
  {
    id: 'viktoria-and-woods',
    name: 'Viktoria & Woods',
    state: 'NSW',
    city: 'Paddington',
    online: true,
    instore: true,
    focus: 'Premium tailored smart casual',
    email: 'customercare@viktoriaandwoods.com.au',
    phone: '',
    website: 'https://viktoriaandwoods.com.au',
    description: 'Premium, tailored, smart casual pieces designed for the modern Australian woman.',
    facebook: 'https://www.facebook.com/ViktoriaandWoods',
    instagram: 'https://www.instagram.com/viktoriaandwoods/',
    best_contact_method: 'email',
    look_id: 1,
  },
  {
    id: 'store-moss',
    name: 'Store Moss',
    state: 'NSW',
    city: 'Sydney',
    online: true,
    instore: false,
    focus: 'Streetwear & tailored fit',
    email: 'info@storemoss.com.au',
    phone: '',
    website: 'https://storemoss.com.au',
    description: 'Streetwear and tailored fit fashion for teens and young adults.',
    facebook: 'https://www.facebook.com/StoreMoss',
    instagram: 'https://www.instagram.com/storemoss/',
    best_contact_method: 'email',
    look_id: 3,
  },
];

async function main() {
  console.log('🔄 Starting real merchant seed...\n');

  // The live database does not currently have these columns, so we strip them
  const merchantsToInsert = REAL_MERCHANTS.map(m => {
    const { facebook, instagram, best_contact_method, look_id, ...rest } = m;
    return rest;
  });

  // 1. Insert real merchants first (so foreign key constraints pass)
  console.log(`📦 Inserting ${merchantsToInsert.length} real boutiques...`);
  const { data: inserted, error: insertErr } = await supabase.from('merchants').upsert(merchantsToInsert).select();
  if (insertErr) {
    console.error('❌ Insert failed:', insertErr.message);
    process.exit(1);
  }
  console.log(`✅ Successfully inserted/upserted ${inserted.length} merchants.`);

  // 2. Map old dummy merchant IDs to new ones in the products table
  const oldToNew = {
    'blue-bungalow': 'calexico',
    'pizazz': 'parlour-x',
    'the-edit-paddo': 'byfreer',
    'silk-and-stone': 'grace-melbourne',
    'driftwood': 'the-standard-store',
    'hayman-edit-co': 'qurated',
    'south-yarra': 'hansen-and-gretel',
    'cottesloe': 'duchess-boutique',
    'kingston-lane': 'riada-concept',
    'north-adelaide': 'koriah',
    'hobart-house': 'mode-sportif',
    'darwin-trader': 'flannel'
  };

  console.log('\n🔗 Re-linking existing products to new boutiques...');
  for (const [oldId, newId] of Object.entries(oldToNew)) {
    const { error: updateErr } = await supabase.from('products').update({ merchantid: newId }).eq('merchantid', oldId);
    if (updateErr) {
      console.error(`❌ Failed to update products for ${oldId}:`, updateErr.message);
    }
  }
  console.log('✅ Products re-linked.');

  // 3. Delete old dummy merchants
  console.log('\n🗑️  Deleting old dummy merchants...');
  const oldIds = Object.keys(oldToNew);
  const { error: delErr } = await supabase.from('merchants').delete().in('id', oldIds);
  if (delErr) {
    console.error('❌ Failed to delete old merchants:', delErr.message);
    process.exit(1);
  }
  console.log('✅ Existing dummy merchants deleted.\n');

  console.log('\n🎉 Seed complete!');
}

main().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});

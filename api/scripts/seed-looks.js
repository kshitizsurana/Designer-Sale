/**
 * seed-looks.js — Updates the three style looks with hero images and editorial content.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const LOOKS = [
  {
    id: 1,
    name: 'Formal Wear',
    slug: 'formal-wear',
    description: 'Tailored fits, office wear, and sophisticated styles for young professionals.',
    hero_image: 'https://images.unsplash.com/photo-1594938298605-c8c884d58744?auto=format&fit=crop&q=80&w=1200',
    tagline: 'Boardroom to dinner. Sharply done.',
    keywords: ['Tailored', 'Office Wear', 'Young Professionals', 'Luxury', 'Evening'],
    feature_title: 'The Power Wardrobe',
    feature_body: "Structured silhouettes and elevated fabrics from Australia's most discerning boutiques. From the boardroom to dinner — every piece earns its place.",
    feature_cta: 'Shop Tailored',
    status: 'active',
  },
  {
    id: 2,
    name: 'Bohemian',
    slug: 'bohemian',
    description: 'Boho chic, floral patterns, and earthy relaxed styles for an effortless look.',
    hero_image: 'https://images.unsplash.com/photo-1550614000-4b95d466f28b?auto=format&fit=crop&q=80&w=1200',
    tagline: 'Earth, print & effortless ease.',
    keywords: ['Boho Chic', 'Floral', 'Earthy', 'Flowing', 'Artisan'],
    feature_title: 'Free-Spirit Fashion',
    feature_body: 'Flowing silhouettes, botanical prints, and artisan-crafted pieces that travel from beach to table with effortless confidence.',
    feature_cta: 'Shop Bohemian',
    status: 'active',
  },
  {
    id: 3,
    name: 'Casuals',
    slug: 'casuals',
    description: 'Baggy fits, everyday casual wear, and structured basics for teens and young adults.',
    hero_image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=1200',
    tagline: 'Everyday looks, zero effort required.',
    keywords: ['Baggy Fits', 'Streetwear', 'Basics', 'Teens', 'Relaxed'],
    feature_title: 'Effortless Every Day',
    feature_body: "Laid-back cuts and contemporary basics from Australia's coolest independent boutiques. Dress down without looking like it.",
    feature_cta: 'Shop Casuals',
    status: 'active',
  },
];

async function main() {
  console.log('Updating looks with hero images and editorial content...');
  for (const look of LOOKS) {
    const { error } = await supabase.from('looks').upsert({ ...look, updated_at: new Date().toISOString() });
    if (error) console.error(`❌ ${look.slug}:`, error.message);
    else console.log(`✅ ${look.name}`);
  }
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });

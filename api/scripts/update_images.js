require('dotenv').config({ path: 'api/.env' });
const { createClient } = require('@supabase/supabase-js');

const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const categoryImages = {
  'maxi-dresses': 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=80',
  'kaftans': 'https://images.unsplash.com/photo-1596755490792-fb211f5e8fc4?w=800&q=80',
  'tops-blouses': 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&q=80',
  'coats-jackets': 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800&q=80',
  'bags-accessories': 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80',
  'jewellery': 'https://images.unsplash.com/photo-1599643478514-4a410f060896?w=800&q=80',
  'bottoms': 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&q=80',
  'dresses': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
  'shoes': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
  'jumpsuits': 'https://images.unsplash.com/photo-1485230895905-ef40ba8de6d0?w=800&q=80'
};

const lookImages = {
  'Formal Wear': 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=1200&q=85',
  'Bohemian': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=85',
  'Casuals': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=85',
  'Resort Wear': 'https://images.unsplash.com/photo-1550614000-4b95d466f28b?w=1200&q=85'
};

const landingPageImages = {
  'The Winter Workwear Edit': 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=1600&q=80',
  'Evening Edit': 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1600&q=80',
  'Print & Pattern': 'https://images.unsplash.com/photo-1601646761273-df3e04c27fc8?w=1600&q=80',
  'Summer Getaway': 'https://images.unsplash.com/photo-1523359346063-d87ceba28c64?w=1600&q=80',
  'The Basics Edit': 'https://images.unsplash.com/photo-1550639525-c97d455acf70?w=1600&q=80'
};

const collectionImages = {
  'Office to Evening': 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?w=1200&q=80',
  'Boho Bloom': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80',
  'Weekend Essentials': 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1200&q=80',
  'Holiday Wardrobe': 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=1200&q=80',
  'july sales ': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80',
  'july sales': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80'
};

async function update() {
  console.log('Updating Categories...');
  for (const [id, image] of Object.entries(categoryImages)) {
    const { error } = await s.from('categories').update({ image }).eq('id', id);
    if (error) console.error(`Error updating category ${id}:`, error);
  }

  console.log('Updating Looks...');
  for (const [name, hero_image] of Object.entries(lookImages)) {
    const { error } = await s.from('looks').update({ hero_image }).eq('name', name);
    if (error) console.error(`Error updating look ${name}:`, error);
  }

  console.log('Updating Landing Pages...');
  for (const [title, image] of Object.entries(landingPageImages)) {
    const { error } = await s.from('landing_pages').update({ image }).eq('title', title);
    if (error) console.error(`Error updating landing page ${title}:`, error);
  }

  console.log('Updating Collections...');
  for (const [title, hero_image] of Object.entries(collectionImages)) {
    const { error } = await s.from('collections').update({ hero_image }).eq('title', title);
    if (error) console.error(`Error updating collection ${title}:`, error);
  }
  
  console.log('Done!');
}

update();

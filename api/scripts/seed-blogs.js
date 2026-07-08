require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const blogs = [
  {
    id: 'blog-1',
    title: 'The Ultimate Guide to Resort Wear',
    slug: 'ultimate-guide-resort-wear',
    content: 'Discover the best pieces for your next holiday. From flowy maxi dresses to stylish swimwear, we have curated the perfect resort wardrobe...',
    image: 'https://images.unsplash.com/photo-1523480717984-24cba35ae1ef?w=900&q=85&auto=format&fit=crop',
    author: 'Designer Sale Editors',
    status: 'published',
  },
  {
    id: 'blog-2',
    title: 'How to Build a Bohemian Capsule Wardrobe',
    slug: 'bohemian-capsule-wardrobe',
    content: 'Embrace the free-spirited style with our guide to creating a bohemian capsule wardrobe. Think earthy tones, relaxed fits, and artisanal details...',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=85&auto=format&fit=crop',
    author: 'Style Team',
    status: 'published',
  },
  {
    id: 'blog-3',
    title: '5 Must-Have Coats for Winter',
    slug: 'must-have-coats-winter',
    content: 'Stay warm and stylish this winter with our top 5 coat recommendations. From classic trench coats to cozy puffers, find your perfect match...',
    image: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=900&q=85&auto=format&fit=crop',
    author: 'Fashion Desk',
    status: 'published',
  }
];

async function seedBlogs() {
  console.log('Seeding blogs...');
  const { error } = await supabase.from('blogs').upsert(blogs, { onConflict: 'id' });
  if (error) {
    console.error('Error seeding blogs:', error.message);
  } else {
    console.log('Blogs seeded successfully.');
  }
}

seedBlogs();

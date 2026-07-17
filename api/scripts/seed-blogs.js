require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const blogs = [
  {
    id: 'blog-1',
    title: 'The Ultimate Guide to Resort Wear',
    slug: 'ultimate-guide-resort-wear',
    content: `There's an art to packing for a holiday. The pieces that make it into your suitcase shouldn't just look good poolside — they need to transition effortlessly from sunrise yoga to sunset cocktails without a wardrobe change in sight.\n\nResort wear has evolved far beyond the clichéd kaftan and sarong. Today's holiday wardrobe is a considered capsule: fluid silk co-ordinates that pack flat, linen trousers that don't crease, and a single statement dress that works for every occasion after 5pm.\n\nOur editors have scoured boutiques from Byron Bay to Bali to bring you the definitive resort edit. The rules? Everything must be breathable, everything must be beautiful, and nothing should require ironing.`,
    image: 'https://images.unsplash.com/photo-1523480717984-24cba35ae1ef?w=1200&q=85&auto=format&fit=crop',
    author: 'Designer Sale Editors',
    status: 'published',
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'blog-2',
    title: 'How to Build a Bohemian Capsule Wardrobe',
    slug: 'bohemian-capsule-wardrobe',
    content: `The bohemian aesthetic is one of the most misunderstood in fashion. It is not a tangle of fringe and crystals — it is a sensibility. A belief that clothing should feel as free as the spirit wearing it.\n\nA considered boho capsule starts with texture: raw linen, washed cotton, crinkled silk. Then comes print — but not just any print. Look for hand-block patterns, painterly florals, and artisanal embroidery that tells a story.\n\nThe key pieces: a tiered maxi in a warm earth tone, a breezy blouse you can knot at the waist, wide-leg trousers that move when you walk, and a single statement kaftan that does the heavy lifting on holiday. Invest in these four pieces and you'll have an endless wardrobe.`,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=85&auto=format&fit=crop',
    author: 'Style Team',
    status: 'published',
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'blog-3',
    title: '5 Coats Worth the Investment This Winter',
    slug: 'investment-coats-winter',
    content: `A great coat is not an expense — it is an investment. A single exceptional coat will see you through five winters, photographing beautifully each time. The mistake most women make is buying cheaply and replacing annually. The maths never works in their favour.\n\nHere are five coats that our style editors have identified as worth every dollar:\n\n1. The Oversized Wool Blend — a boxy silhouette in camel or ivory that layers over everything.\n2. The Belted Trench — a heritage style that has not dated since Burberry introduced it.\n3. The Long Line Coat — floor-grazing drama that transforms even jeans into an occasion.\n4. The Leather Blazer — technically a jacket, but it does the work of a coat.\n5. The Cocoon Coat — sculptural and warm, the statement piece your wardrobe needs.`,
    image: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=1200&q=85&auto=format&fit=crop',
    author: 'Fashion Desk',
    status: 'published',
    published_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'blog-4',
    title: 'The Return of the Maxi Dress — and Why We\'re Grateful',
    slug: 'return-of-the-maxi-dress',
    content: `It was pronounced dead at least three times in the last decade. Fashion critics called it dated. Fast fashion dropped it. And yet, every summer, the maxi dress returns — more beautiful, more considered, and more present than ever.\n\nThe current iteration is nothing like its predecessors. Gone are the shapeless cotton tubes of the 2000s. Today's maxis are engineered with intention: darted bodices that create silhouette, draped skirts that move cinematically, and fabrications — silk charmeuse, crinkle georgette, fluid viscose — that feel genuinely luxurious.\n\nAustralia's boutiques have understood this shift before anyone else. Our edit of the season's finest maxi dresses proves that the longest hemline in fashion is also its most elegant.`,
    image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=1200&q=85&auto=format&fit=crop',
    author: 'Designer Sale Editors',
    status: 'published',
    published_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'blog-5',
    title: 'How to Shop End-of-Season Sales Like a Professional',
    slug: 'shop-end-of-season-sales-like-a-pro',
    content: `Sales are chaotic by design. The rush, the crowds, the sheer volume of product — it is deliberately engineered to cloud your judgement and push you toward impulse decisions. Shopping a sale well requires the opposite of impulse: it requires a list, a budget, and a clear-eyed sense of what your wardrobe actually needs.\n\nRule one: before you open a sale tab, audit your wardrobe. What is missing? What do you reach for and not find? That gap is what you are shopping for.\n\nRule two: assess price-per-wear, not the discount percentage. A 70% off blouse you'll wear twice is a worse investment than a 20% off coat you'll wear a hundred times.\n\nRule three: buy quality over quantity. One beautiful piece at a sale price is worth more than three mediocre ones.`,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=85&auto=format&fit=crop',
    author: 'Editorial Team',
    status: 'published',
    published_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'blog-6',
    title: 'Boutique Spotlight: The Brands Redefining Australian Fashion',
    slug: 'boutique-spotlight-australian-fashion',
    content: `Something remarkable has been happening in Australian fashion over the past decade. While the global industry consolidates into a handful of conglomerates, Australia's boutique scene has quietly flourished — producing designers of genuine global calibre who choose to remain fiercely independent.\n\nThese boutiques share certain qualities: they source ethically, they design with longevity in mind, and they maintain a personal relationship with their customers that the big houses lost somewhere around 2005.\n\nFrom the linen specialists of the Northern Beaches to the silk artisans of Melbourne's inner suburbs, we have profiled the designers worth knowing — and the sales worth watching.`,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=85&auto=format&fit=crop',
    author: 'Style Team',
    status: 'published',
    published_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

async function seed() {
  console.log('Seeding blogs...');
  for (const blog of blogs) {
    // Upsert to avoid duplicates
    const { error } = await supabase.from('blogs').upsert(blog, { onConflict: 'id' });
    if (error) {
      console.error(`Error seeding blog ${blog.id}:`, error.message);
    } else {
      console.log(`✓ ${blog.title}`);
    }
  }
  // Clean up stale 'july blog' placeholder
  await supabase.from('blogs').delete().eq('id', 'b_mrbxrekiv1rpp');
  console.log('Done!');
}

seed();

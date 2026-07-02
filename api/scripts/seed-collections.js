require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    console.log('Seeding curated collections for all styles...');
    
    // 1. Fetch looks
    const { data: looks } = await supabase.from('looks').select('*');
    if (!looks || looks.length === 0) {
        console.error('No looks found in database');
        return;
    }

    // 2. Fetch products
    let { data: products } = await supabase.from('products').select('id, title');
    products = products || [];
    
    // Find the looks
    const formal = looks.find(l => l.slug === 'formal-wear') || looks[0];
    const bohemian = looks.find(l => l.slug === 'bohemian') || looks[1] || looks[0];
    const casuals = looks.find(l => l.slug === 'casuals') || looks[2] || looks[0];
    
    const collectionsToCreate = [
        {
            look: formal,
            title: 'Wedding Guest Edit',
            slug: 'wedding-guest-edit',
            hero_image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80',
            description: 'Stand out this wedding season with our curated selection of elegant dresses and accessories.',
            display_order: 1
        },
        {
            look: formal,
            title: 'Black Tie Essentials',
            slug: 'black-tie-essentials',
            hero_image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80',
            description: 'Sophisticated pieces for your most formal occasions.',
            display_order: 2
        },
        {
            look: bohemian,
            title: 'July Discounts',
            slug: 'july-discounts',
            hero_image: 'https://images.unsplash.com/photo-1550614000-4b95d466f28b?auto=format&fit=crop&w=1200&q=80',
            description: 'Our top picks on sale this July. Curated by the editorial team.',
            display_order: 1
        },
        {
            look: bohemian,
            title: 'Festival Picks',
            slug: 'festival-picks',
            hero_image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
            description: 'Get ready for the season with free-spirited styles.',
            display_order: 2
        },
        {
            look: casuals,
            title: 'Everyday Basics',
            slug: 'everyday-basics',
            hero_image: 'https://images.unsplash.com/photo-1583846783214-7229a91b20ed?auto=format&fit=crop&w=1200&q=80',
            description: 'Your wardrobe foundations. High rotation pieces for effortless style.',
            display_order: 1
        },
        {
            look: casuals,
            title: 'Weekend Getaway',
            slug: 'weekend-getaway',
            hero_image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80',
            description: 'Pack light, look great. Versatile pieces for your next trip.',
            display_order: 2
        }
    ];

    for (const conf of collectionsToCreate) {
        const { data: col, error: err } = await supabase.from('collections').insert([{
            look_id: conf.look.id,
            title: conf.title,
            slug: conf.slug,
            hero_image: conf.hero_image,
            description: conf.description,
            display_order: conf.display_order,
            status: 'published'
        }]).select().single();

        let colId = null;
        if (err) {
            if (err.code === '23505') {
                console.log(`${conf.title} already exists. Fetching its ID...`);
                const { data: existing } = await supabase.from('collections').select('id').eq('slug', conf.slug).single();
                if (existing) colId = existing.id;
            } else {
                console.error(err);
            }
        } else {
            console.log(`Created collection: ${col.title}`);
            colId = col.id;
        }

        if (colId) {
            // Pick a random subset of 6-12 products for this collection
            let lookProducts = products.sort(() => 0.5 - Math.random()).slice(0, 15);
            
            // Pick a random subset of 6-12 products for this collection
            const shuffled = lookProducts.sort(() => 0.5 - Math.random());
            const numProducts = Math.floor(Math.random() * 6) + 6;
            const selected = shuffled.slice(0, numProducts);

            // Clear existing assignments for this collection first
            await supabase.from('collection_products').delete().eq('collection_id', colId);

            const inserts = selected.map((p, idx) => ({
                collection_id: colId,
                product_id: p.id,
                display_order: idx
            }));
            await supabase.from('collection_products').insert(inserts);
            console.log(`Assigned ${inserts.length} products to ${conf.title}`);
        }
    }

    console.log('Seeding complete!');
    process.exit(0);
}

run();

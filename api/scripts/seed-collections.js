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
    console.log('Seeding curated collections...');
    
    // 1. Fetch looks
    const { data: looks } = await supabase.from('looks').select('*');
    if (!looks || looks.length === 0) {
        console.error('No looks found in database');
        return;
    }

    // 2. Fetch some products
    const { data: products } = await supabase.from('products').select('id, title').limit(50);
    
    // Bohemian Look (id: 2 usually, let's find it)
    const bohemian = looks.find(l => l.slug === 'bohemian') || looks[0];
    const casuals = looks.find(l => l.slug === 'casuals') || looks[1];
    
    // 3. Create 'July Discounts' collection for Bohemian
    const { data: col1, error: err1 } = await supabase.from('collections').insert([{
        look_id: bohemian.id,
        title: 'July Discounts',
        slug: 'july-discounts',
        hero_image: 'https://images.unsplash.com/photo-1550614000-4b95d466f28b?auto=format&fit=crop&w=1200&q=80',
        description: 'Our top picks on sale this July. Curated by the editorial team.',
        display_order: 1,
        status: 'published'
    }]).select().single();

    if (err1) {
        if (err1.code === '23505') console.log('July Discounts already exists');
        else console.error(err1);
    } else {
        console.log(`Created collection: ${col1.title}`);
        // Assign first 8 products
        const inserts = products.slice(0, 8).map((p, idx) => ({
            collection_id: col1.id,
            product_id: p.id,
            display_order: idx
        }));
        await supabase.from('collection_products').insert(inserts);
        console.log('Assigned 8 products to July Discounts');
    }

    // 4. Create 'Everyday Basics' collection for Casuals
    const { data: col2, error: err2 } = await supabase.from('collections').insert([{
        look_id: casuals.id,
        title: 'Everyday Basics',
        slug: 'everyday-basics',
        hero_image: 'https://images.unsplash.com/photo-1583846783214-7229a91b20ed?auto=format&fit=crop&w=1200&q=80',
        description: 'Your wardrobe foundations. High rotation pieces for effortless style.',
        display_order: 1,
        status: 'published'
    }]).select().single();

    if (err2) {
        if (err2.code === '23505') console.log('Everyday Basics already exists');
        else console.error(err2);
    } else {
        console.log(`Created collection: ${col2.title}`);
        // Assign next 8 products
        const inserts = products.slice(8, 16).map((p, idx) => ({
            collection_id: col2.id,
            product_id: p.id,
            display_order: idx
        }));
        await supabase.from('collection_products').insert(inserts);
        console.log('Assigned 8 products to Everyday Basics');
    }

    console.log('Seeding complete!');
    process.exit(0);
}

run();

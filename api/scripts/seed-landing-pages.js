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
    console.log('Seeding landing pages...');
    
    // Fetch looks to associate
    const { data: looks } = await supabase.from('looks').select('*');
    const bohemian = looks?.find(l => l.slug === 'bohemian') || { id: null };

    const pages = [
        {
            title: 'Fresh from the boutique floors.',
            short_description: 'Just added in the last 48 hours.',
            image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=1200&q=80',
            look_id: null
        },
        {
            title: 'Sales in Bohemian',
            short_description: 'Effortless boho chic styles curated for you.',
            image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
            look_id: bohemian.id
        }
    ];

    for (const page of pages) {
        // Check if exists
        const { data: existing } = await supabase.from('landing_pages').select('id').eq('title', page.title).single();
        if (!existing) {
            const { error } = await supabase.from('landing_pages').insert([{
                ...page,
                id: 'lp_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
            }]);
            if (error) {
                console.error(`Error inserting ${page.title}:`, error.message);
            } else {
                console.log(`Inserted landing page: ${page.title}`);
            }
        } else {
            console.log(`Landing page already exists: ${page.title}`);
        }
    }
    
    console.log('Done!');
}

run();

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log('Seeding curated collections for all styles (category-wise)...');

    const { data: looks } = await supabase.from('looks').select('*');
    if (!looks?.length) { console.error('No looks found'); return; }

    const { data: products } = await supabase.from('products').select('id, title, category, look_id, merchantid');
    if (!products?.length) { console.error('No products found — run seed-real-products first'); return; }

    const formal = looks.find(l => l.slug === 'formal-wear') || looks[0];
    const bohemian = looks.find(l => l.slug === 'bohemian') || looks[1] || looks[0];
    const casuals = looks.find(l => l.slug === 'casuals') || looks[2] || looks[0];

    const collectionsToCreate = [
        { look: formal, title: 'Wedding Guest Edit', slug: 'wedding-guest-edit', categories: ['maxi-dresses', 'jewellery'], hero_image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=80', description: 'Stand out this wedding season with our curated selection of elegant dresses and accessories.', display_order: 1 },
        { look: formal, title: 'Black Tie Essentials', slug: 'black-tie-essentials', categories: ['coats-jackets', 'maxi-dresses'], hero_image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=80', description: 'Sophisticated pieces for your most formal occasions.', display_order: 2 },
        { look: bohemian, title: 'July Discounts', slug: 'july-discounts', categories: ['kaftans', 'maxi-dresses'], hero_image: 'https://images.unsplash.com/photo-1550614000-4b95d466f28b?auto=format&fit=crop&w=1200&q=80', description: 'Our top picks on sale this July. Curated by the editorial team.', display_order: 1 },
        { look: bohemian, title: 'Festival Picks', slug: 'festival-picks', categories: ['tops-blouses', 'bags-accessories'], hero_image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80', description: 'Get ready for the season with free-spirited styles.', display_order: 2 },
        { look: casuals, title: 'Everyday Basics', slug: 'everyday-basics', categories: ['tops-blouses', 'coats-jackets'], hero_image: 'https://images.unsplash.com/photo-1583846783214-7229a91b20ed?auto=format&fit=crop&w=1200&q=80', description: 'Your wardrobe foundations. High rotation pieces for effortless style.', display_order: 1 },
        { look: casuals, title: 'Weekend Getaway', slug: 'weekend-getaway', categories: ['bags-accessories', 'tops-blouses'], hero_image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80', description: 'Pack light, look great. Versatile pieces for your next trip.', display_order: 2 },
    ];

    for (const conf of collectionsToCreate) {
        const { data: col, error: err } = await supabase.from('collections').upsert({
            look_id: conf.look.id,
            title: conf.title,
            slug: conf.slug,
            hero_image: conf.hero_image,
            description: conf.description,
            display_order: conf.display_order,
            status: 'published',
        }, { onConflict: 'slug' }).select().single();

        let colId = col?.id;
        if (err && err.code !== '23505') {
            console.error(err);
            continue;
        }
        if (!colId) {
            const { data: existing } = await supabase.from('collections').select('id').eq('slug', conf.slug).single();
            colId = existing?.id;
        }
        if (!colId) continue;

        // Pick products from this look, spread across merchants, matching collection categories
        const lookProducts = products.filter(p => p.look_id === conf.look.id);
        const byMerchant = new Map();
        lookProducts.forEach(p => {
            if (!byMerchant.has(p.merchantid)) byMerchant.set(p.merchantid, []);
            byMerchant.get(p.merchantid).push(p);
        });

        const selected = [];
        const merchantsUsed = [...byMerchant.keys()].sort(() => 0.5 - Math.random());

        for (const merchantId of merchantsUsed) {
            if (selected.length >= 8) break;
            const pool = byMerchant.get(merchantId).filter(p =>
                conf.categories.includes(p.category) && !selected.find(s => s.id === p.id)
            );
            if (pool.length) {
                selected.push(pool[Math.floor(Math.random() * pool.length)]);
            } else {
                const fallback = byMerchant.get(merchantId).filter(p => !selected.find(s => s.id === p.id));
                if (fallback.length) selected.push(fallback[0]);
            }
        }

        await supabase.from('collection_products').delete().eq('collection_id', colId);
        if (selected.length) {
            const inserts = selected.map((p, idx) => ({ collection_id: colId, product_id: p.id, display_order: idx }));
            await supabase.from('collection_products').insert(inserts);
            console.log(`✅ ${conf.title}: ${inserts.length} products from ${new Set(selected.map(p => p.merchantid)).size} boutiques`);
        }
    }

    console.log('Seeding complete!');
    process.exit(0);
}

run();

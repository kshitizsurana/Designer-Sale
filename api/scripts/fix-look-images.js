require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const updates = [
    { id: 1, hero_image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=85&auto=format&fit=crop' }, // Formal
    { id: 2, hero_image: 'https://images.unsplash.com/photo-1485518882345-15568b007407?w=1200&q=85&auto=format&fit=crop' }, // Bohemian
    { id: 3, hero_image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200&q=85&auto=format&fit=crop' }, // Casuals
    { id: 4, hero_image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=1200&q=85&auto=format&fit=crop' }  // Resort
  ];

  for (const update of updates) {
    const { error } = await supabase.from('looks').update({ hero_image: update.hero_image }).eq('id', update.id);
    if (error) console.error('Error updating look', update.id, error.message);
    else console.log('Updated look', update.id);
  }
}

main();

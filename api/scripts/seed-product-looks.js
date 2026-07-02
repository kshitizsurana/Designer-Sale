require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in api/.env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('🔄 Fetching merchants and products to sync look_ids...');

  const { data: merchants, error: mErr } = await supabase.from('merchants').select('id, look_id');
  if (mErr) throw mErr;

  const merchantLookMap = {};
  merchants.forEach(m => {
    if (m.look_id) merchantLookMap[m.id] = m.look_id;
  });

  const { data: products, error: pErr } = await supabase.from('products').select('id, merchantid, look_id');
  if (pErr) throw pErr;

  let updatedCount = 0;
  for (const product of products) {
    const targetLook = merchantLookMap[product.merchantid];
    if (targetLook && product.look_id !== targetLook) {
      const { error: updateErr } = await supabase
        .from('products')
        .update({ look_id: targetLook })
        .eq('id', product.id);
      
      if (updateErr) {
        console.error(`❌ Failed to update product ${product.id}:`, updateErr.message);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`✅ Successfully synced look_id for ${updatedCount} products.`);
}

main().catch(console.error);

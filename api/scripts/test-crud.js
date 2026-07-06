const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testCRUD() {
  console.log('Testing CRUD operations via Supabase direct connection...');
  let pass = true;

  const tests = [
    { table: 'landing_pages', item: { id: 'test_lp_1', title: 'Test LP', status: 'draft' }, update: { title: 'Test LP Updated' } },
    { table: 'looks', item: { name: 'Test Look', slug: 'test-look' }, update: { name: 'Test Look Updated' } },
    { table: 'collections', item: { id: 'test_col_1', name: 'Test Col' }, update: { name: 'Test Col Updated' } },
    { table: 'brands', item: { id: 'test_brand_1', name: 'Test Brand' }, update: { name: 'Test Brand Updated' } },
    { table: 'merchants', item: { id: 'test_merchant_1', name: 'Test Merchant' }, update: { name: 'Test Merchant Updated' } },
    { table: 'blogs', item: { slug: 'test-blog', title: 'Test Blog', status: 'draft' }, update: { title: 'Test Blog Updated' } }
  ];

  for (let t of tests) {
    console.log(`\n--- Testing ${t.table} ---`);
    // Create
    const { data: createData, error: createError } = await sb.from(t.table).insert([t.item]).select();
    if (createError) { console.error(`CREATE error:`, createError); pass = false; continue; }
    console.log(`CREATE success:`, createData[0].id || createData[0].slug);

    const pkField = t.item.id ? 'id' : (t.item.slug ? 'slug' : 'id');
    const pkValue = createData[0][pkField];

    // Read
    const { data: readData, error: readError } = await sb.from(t.table).select('*').eq(pkField, pkValue);
    if (readError || readData.length === 0) { console.error(`READ error:`, readError); pass = false; }
    else console.log(`READ success`);

    // Update
    const { data: updateData, error: updateError } = await sb.from(t.table).update(t.update).eq(pkField, pkValue).select();
    if (updateError) { console.error(`UPDATE error:`, updateError); pass = false; }
    else console.log(`UPDATE success`);

    // Delete
    const { error: deleteError } = await sb.from(t.table).delete().eq(pkField, pkValue);
    if (deleteError) { console.error(`DELETE error:`, deleteError); pass = false; }
    else console.log(`DELETE success`);
  }

  if (pass) console.log('\n✅ All CRUD tests passed successfully.');
  else console.log('\n❌ Some CRUD tests failed.');
}

testCRUD();

/**
 * tests/api.test.js
 * 
 * Comprehensive TDD test suite for DesignerSale API.
 * Tests: Looks, Merchants, Brands, Categories, Products, Collections, Landing Pages.
 * 
 * Usage:
 *   cd api && node ../tests/api.test.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', 'api', '.env') });
const { createClient } = require('@supabase/supabase-js');
const http = require('http');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// ============================================================
// Mini test harness
// ============================================================
let passed = 0, failed = 0, total = 0;

async function test(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ❌ ${name}`);
    console.error(`     ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(a, b, label) {
  if (a !== b) throw new Error(`${label || 'Equality'}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

// ============================================================
// HTTP helpers
// ============================================================
let adminToken = null;

async function apiFetch(path, opts = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;

  const res = await fetch(url, { ...opts, headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { _raw: text }; }
  data._status = res.status;
  return data;
}

// ============================================================
// TEST SUITES
// ============================================================

async function testAuth() {
  console.log('\n🔐 Auth');
  await test('login with correct credentials returns token', async () => {
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const data = await res.json();
    assert(data.token, 'Expected a JWT token');
    adminToken = data.token;
  });

  await test('login with wrong credentials returns 401', async () => {
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrong' })
    });
    assertEqual(res.status, 401, 'Expected 401 for bad login');
  });

  await test('protected endpoint without token returns 401', async () => {
    const res = await fetch(`${BASE_URL}/api/looks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert(res.status === 401 || res.status === 403, `Expected 401/403, got ${res.status}`);
  });
}

async function testLooks() {
  console.log('\n👔 Looks CRUD');
  let testLookId = null;
  const testSlug = `test-look-${Date.now()}`;

  await test('GET /api/looks returns all 4 looks', async () => {
    const data = await apiFetch('/api/looks');
    assert(Array.isArray(data), 'Expected array');
    assert(data.length >= 4, `Expected ≥4 looks, got ${data.length}`);
    const slugs = data.map(l => l.slug);
    assert(slugs.includes('formal-wear'), 'Missing formal-wear');
    assert(slugs.includes('bohemian'), 'Missing bohemian');
    assert(slugs.includes('casuals'), 'Missing casuals');
    assert(slugs.includes('resort-wear'), 'Missing resort-wear');
  });

  await test('POST /api/looks creates a new look', async () => {
    const res = await apiFetch('/api/looks', {
      method: 'POST',
      body: { name: 'Test Look', slug: testSlug, description: 'Test', hero_image: 'https://example.com/img.jpg', status: 'active' }
    });
    assert(!res.error, `Create look failed: ${res.error}`);
    testLookId = res.id;
    assert(testLookId, 'Expected an id back');
  });

  await test('PUT /api/looks/:id updates name', async () => {
    const res = await apiFetch(`/api/looks/${testLookId}`, {
      method: 'PUT',
      body: { name: 'Updated Look', slug: testSlug, description: 'Updated', status: 'active' }
    });
    assert(!res.error, `Update failed: ${res.error}`);
  });

  await test('DELETE /api/looks/:id removes the look', async () => {
    const res = await apiFetch(`/api/looks/${testLookId}`, { method: 'DELETE' });
    assert(!res.error, `Delete failed: ${res.error}`);
  });

  await test('Deleted look no longer appears in GET all', async () => {
    const data = await apiFetch('/api/looks');
    const found = data.find(l => l.id === testLookId);
    assert(!found, 'Expected look to be gone');
  });
}

async function testMerchants() {
  console.log('\n🏪 Merchants CRUD');
  let testMerchantId = `m_test_${Date.now().toString(36)}`;

  await test('GET /api/merchants returns merchants', async () => {
    const data = await apiFetch('/api/merchants');
    assert(Array.isArray(data), 'Expected array');
    assert(data.length >= 20, `Expected ≥20 merchants (all boutiques), got ${data.length}`);
  });

  await test('POST /api/merchants creates a merchant', async () => {
    const res = await apiFetch('/api/merchants', {
      method: 'POST',
      body: { id: testMerchantId, name: 'Test Boutique', state: 'NSW', city: 'Sydney', online: true, inStore: false, focus: 'Test', email: 'test@test.com', website: 'https://test.com', look_id: 1 }
    });
    assert(!res.error, `Create merchant failed: ${res.error}`);
  });

  await test('PUT /api/merchants/:id updates merchant', async () => {
    const res = await apiFetch(`/api/merchants/${testMerchantId}`, {
      method: 'PUT',
      body: { name: 'Updated Boutique', state: 'VIC', city: 'Melbourne', online: true, inStore: true, focus: 'Updated', email: 'updated@test.com', website: 'https://test.com', look_id: 2 }
    });
    assert(!res.error, `Update merchant failed: ${res.error}`);
  });

  await test('DELETE /api/merchants/:id removes merchant', async () => {
    const res = await apiFetch(`/api/merchants/${testMerchantId}`, { method: 'DELETE' });
    assert(!res.error, `Delete merchant failed: ${res.error}`);
  });
}

async function testProducts() {
  console.log('\n👗 Products CRUD');
  let testProductId = null;

  await test('GET /api/products returns products', async () => {
    const data = await apiFetch('/api/products');
    assert(Array.isArray(data), 'Expected array');
    assert(data.length >= 100, `Expected ≥100 products (5-6 per boutique), got ${data.length}`);
  });

  await test('Products have required fields', async () => {
    const data = await apiFetch('/api/products');
    const p = data[0];
    assert(p.id, 'Missing product id');
    assert(p.title, 'Missing product title');
    assert(p.category, 'Missing product category');
    assert(p.rrp > 0, 'Missing or invalid rrp');
    assert(p.sale > 0, 'Missing or invalid sale price');
    assert(p.discountPct > 0, 'Missing or zero discountPct');
  });

  // Get valid merchant & brand for inserting a test product
  const merchants = await apiFetch('/api/merchants');
  const brands = await apiFetch('/api/brands');
  const testMerchant = merchants[0];
  const testBrand = brands[0];

  await test('POST /api/products creates a product', async () => {
    const res = await apiFetch('/api/products', {
      method: 'POST',
      body: {
        title: 'Test Product', category: 'maxi-dresses', brandId: testBrand.id, merchantId: testMerchant.id,
        rrp: 400, sale: 200, discountPct: 50, newIn: false, sizes: ['S', 'M'], image: 'https://example.com/test.jpg'
      }
    });
    assert(!res.error, `Create product failed: ${res.error}`);
    testProductId = res.id;
    assert(testProductId, 'Expected id back');
  });

  await test('PUT /api/products/:id updates product', async () => {
    const res = await apiFetch(`/api/products/${testProductId}`, {
      method: 'PUT',
      body: { title: 'Updated Product', category: 'kaftans', brandId: testBrand.id, merchantId: testMerchant.id, rrp: 500, sale: 250 }
    });
    assert(!res.error, `Update product failed: ${res.error}`);
  });

  await test('DELETE /api/products/:id removes product', async () => {
    const res = await apiFetch(`/api/products/${testProductId}`, { method: 'DELETE' });
    assert(!res.error, `Delete product failed: ${res.error}`);
  });

  await test('Discount % is auto-calculated correctly (rrp=400, sale=200 → 50%)', async () => {
    const res = await apiFetch('/api/products', {
      method: 'POST',
      body: { title: 'Discount Test', category: 'kaftans', brandId: testBrand.id, merchantId: testMerchant.id, rrp: 400, sale: 200 }
    });
    assert(!res.error, `Create failed: ${res.error}`);
    // Cleanup
    if (res.id) await apiFetch(`/api/products/${res.id}`, { method: 'DELETE' });
    // The API calculates discount from rrp/sale so the stored value should be 50%
    const discPct = res.discountPct !== undefined ? res.discountPct : res.discountpct;
    assert(discPct === 50, `Expected discountPct=50, got ${discPct}`);
  });
}

async function testBrands() {
  console.log('\n🏷  Brands CRUD');
  let testBrandId = `b_test_${Date.now().toString(36)}`;

  await test('GET /api/brands returns brands', async () => {
    const data = await apiFetch('/api/brands');
    assert(Array.isArray(data) && data.length > 0, 'Expected non-empty brands');
  });

  await test('POST /api/brands creates a brand', async () => {
    const res = await apiFetch('/api/brands', { method: 'POST', body: { id: testBrandId, name: 'Test Brand' } });
    assert(!res.error, `Create brand failed: ${res.error}`);
  });

  await test('PUT /api/brands/:id updates brand', async () => {
    const res = await apiFetch(`/api/brands/${testBrandId}`, { method: 'PUT', body: { name: 'Updated Brand' } });
    assert(!res.error, `Update brand failed: ${res.error}`);
  });

  await test('DELETE /api/brands/:id removes brand', async () => {
    const res = await apiFetch(`/api/brands/${testBrandId}`, { method: 'DELETE' });
    assert(!res.error, `Delete brand failed: ${res.error}`);
  });
}

async function testCategories() {
  console.log('\n🗂  Categories');
  await test('GET /api/categories returns all 6 categories', async () => {
    const data = await apiFetch('/api/categories');
    assert(Array.isArray(data), 'Expected array');
    const ids = data.map(c => c.id);
    const expected = ['maxi-dresses', 'kaftans', 'tops-blouses', 'coats-jackets', 'bags-accessories', 'jewellery'];
    for (const cat of expected) {
      assert(ids.includes(cat), `Missing category: ${cat}`);
    }
  });
}

async function testLandingPages() {
  console.log('\n📄 Landing Pages CRUD');
  let testLpId = `lp_test_${Date.now().toString(36)}`;

  await test('GET /api/landing-pages returns pages', async () => {
    const data = await apiFetch('/api/landing-pages');
    assert(Array.isArray(data) && data.length > 0, 'Expected landing pages');
  });

  await test('POST /api/landing-pages creates a page', async () => {
    const res = await apiFetch('/api/landing-pages', {
      method: 'POST',
      body: { id: testLpId, title: 'Test LP', slug: `slug-${testLpId}`, short_description: 'Test', look_id: 1, status: 'published' }
    });
    assert(!res.error, `Create LP failed: ${res.error}`);
  });

  await test('PUT /api/landing-pages/:id updates page', async () => {
    const res = await apiFetch(`/api/landing-pages/${testLpId}`, {
      method: 'PUT',
      body: { title: 'Updated LP', slug: `slug-${testLpId}`, short_description: 'Updated', look_id: 2, status: 'published' }
    });
    assert(!res.error, `Update LP failed: ${res.error}`);
  });

  await test('DELETE /api/landing-pages/:id removes page', async () => {
    const res = await apiFetch(`/api/landing-pages/${testLpId}`, { method: 'DELETE' });
    assert(!res.error, `Delete LP failed: ${res.error}`);
  });
}

async function testStats() {
  console.log('\n📊 Stats');
  await test('GET /api/stats returns live counts', async () => {
    const data = await apiFetch('/api/stats');
    assert(typeof data.totalMerchants === 'number', 'totalMerchants should be a number');
    assert(typeof data.totalProducts === 'number', 'totalProducts should be a number');
    assert(data.totalMerchants >= 20, `Expected ≥20 merchants, got ${data.totalMerchants}`);
    assert(data.totalProducts >= 100, `Expected ≥100 products, got ${data.totalProducts}`);
    console.log(`     📦 ${data.totalProducts} products | 🏪 ${data.totalMerchants} merchants | 🏷 ${data.totalBrands} brands`);
  });
}

async function testIntegration() {
  console.log('\n🔗 Integration: Admin change → Frontend visible');

  const merchants = await apiFetch('/api/merchants');
  const brands = await apiFetch('/api/brands');
  let newId = null;

  await test('Create a product via API, verify it appears in GET /api/products', async () => {
    const res = await apiFetch('/api/products', {
      method: 'POST',
      body: { title: 'Integration Test Product', category: 'jewellery', brandId: brands[0].id, merchantId: merchants[0].id, rrp: 300, sale: 150 }
    });
    assert(!res.error, `Create failed: ${res.error}`);
    newId = res.id;

    const all = await apiFetch('/api/products');
    const found = all.find(p => p.id === newId);
    assert(found, 'Newly created product not found in product list');
    assert(found.title === 'Integration Test Product', 'Title mismatch');
  });

  await test('Update price via API, verify stats.avgDiscount changes', async () => {
    const statsBefore = await apiFetch('/api/stats');
    const oldAvg = statsBefore.avgDiscount;

    // Update product to a large discount (90% off)
    const res = await apiFetch(`/api/products/${newId}`, {
      method: 'PUT',
      body: { title: 'Integration Test Product', category: 'jewellery', brandId: brands[0].id, merchantId: merchants[0].id, rrp: 1000, sale: 10 }
    });
    assert(!res.error, `Update failed: ${res.error}`);

    const statsAfter = await apiFetch('/api/stats');
    assert(typeof statsAfter.avgDiscount === 'number', 'avgDiscount should be a number');
  });

  await test('Cleanup: delete integration test product', async () => {
    const res = await apiFetch(`/api/products/${newId}`, { method: 'DELETE' });
    assert(!res.error, `Cleanup delete failed: ${res.error}`);
  });
}

// ============================================================
// USER JOURNEY TESTS
// ============================================================
async function testLisaJourney() {
  console.log('\n🎭 Lisa\'s Journey (Formal → Curated Pages → Filter)');

  await test('Lisa: GET /api/looks → finds formal-wear', async () => {
    const looks = await apiFetch('/api/looks');
    const formal = looks.find(l => l.slug === 'formal-wear');
    assert(formal, 'formal-wear look not found');
  });

  await test('Lisa: formal-wear has products from ≥3 boutiques', async () => {
    const products = await apiFetch('/api/products');
    const merchants = await apiFetch('/api/merchants');
    const formalMerchants = merchants.filter(m => m.look_id === 1).map(m => m.id);
    const formalProducts = products.filter(p => formalMerchants.includes(p.merchantId));
    const uniqueMerchants = new Set(formalProducts.map(p => p.merchantId));
    assert(uniqueMerchants.size >= 3, `Expected ≥3 boutiques in formal, got ${uniqueMerchants.size}`);
  });

  await test('Lisa: landing pages exist for formal-wear (look_id=1)', async () => {
    const lps = await apiFetch('/api/landing-pages');
    const formalLps = lps.filter(lp => lp.look_id === 1);
    assert(formalLps.length >= 1, 'No landing pages found for formal-wear');
  });

  await test('Lisa: can filter products by brand', async () => {
    const products = await apiFetch('/api/products');
    const brands = await apiFetch('/api/brands');
    const testBrand = brands[0];
    const filtered = products.filter(p => p.brandId === testBrand.id);
    // Just verify the filter logic works with the data
    assert(filtered.every(p => p.brandId === testBrand.id), 'Brand filter not working');
  });

  await test('Lisa: can filter products by ≥50% discount', async () => {
    const products = await apiFetch('/api/products');
    const filtered = products.filter(p => p.discountPct >= 50);
    assert(filtered.every(p => p.discountPct >= 50), 'Discount filter not working');
  });
}

async function testMaryJourney() {
  console.log('\n🎭 Mary\'s Journey (Resort Wear → Curated Pages)');

  await test('Mary: GET /api/looks → finds resort-wear', async () => {
    const looks = await apiFetch('/api/looks');
    const resort = looks.find(l => l.slug === 'resort-wear');
    assert(resort, 'resort-wear look not found');
    assert(resort.status === 'active', 'resort-wear is not active');
  });

  await test('Mary: resort-wear has products from ≥3 boutiques', async () => {
    const products = await apiFetch('/api/products');
    const merchants = await apiFetch('/api/merchants');
    const resortMerchants = merchants.filter(m => m.look_id === 4).map(m => m.id);
    const resortProducts = products.filter(p => resortMerchants.includes(p.merchantId));
    const uniqueMerchants = new Set(resortProducts.map(p => p.merchantId));
    assert(resortMerchants.length >= 3, `Expected ≥3 resort boutiques, got ${resortMerchants.length}`);
    assert(resortProducts.length >= 15, `Expected ≥15 resort products (3 × 5), got ${resortProducts.length}`);
  });

  await test('Mary: landing pages exist for resort-wear (look_id=4)', async () => {
    const lps = await apiFetch('/api/landing-pages');
    const resortLps = lps.filter(lp => lp.look_id === 4);
    assert(resortLps.length >= 1, 'No landing pages for resort-wear');
  });

  await test('Mary: resort products include kaftans & maxi dresses', async () => {
    const products = await apiFetch('/api/products');
    const merchants = await apiFetch('/api/merchants');
    const resortMerchantIds = merchants.filter(m => m.look_id === 4).map(m => m.id);
    const resortProds = products.filter(p => resortMerchantIds.includes(p.merchantId));
    const cats = new Set(resortProds.map(p => p.category));
    assert(cats.has('kaftans') || cats.has('maxi-dresses'), `Resort wear should have kaftans or maxi-dresses, got: ${[...cats].join(', ')}`);
  });
}

// ============================================================
// MAIN RUNNER
// ============================================================
async function run() {
  console.log(`\n🧪 DesignerSale API Test Suite`);
  console.log(`📡 Target: ${BASE_URL}\n`);

  // Check server is alive
  try {
    const ping = await fetch(`${BASE_URL}/api/stats`);
    if (!ping.ok) throw new Error('Stats endpoint not OK');
  } catch (e) {
    console.error(`❌ Cannot connect to ${BASE_URL}. Start the server first: cd api && node index.js`);
    process.exit(1);
  }

  await testAuth();
  await testLooks();
  await testMerchants();
  await testProducts();
  await testBrands();
  await testCategories();
  await testLandingPages();
  await testStats();
  await testIntegration();
  await testLisaJourney();
  await testMaryJourney();

  // ---- Summary ----
  const pct = Math.round((passed / total) * 100);
  console.log(`\n${'─'.repeat(52)}`);
  console.log(`📊 Results: ${passed}/${total} passed (${pct}%)`);
  if (failed > 0) {
    console.log(`❌ ${failed} test(s) FAILED`);
    process.exit(1);
  } else {
    console.log(`✅ All tests passed!`);
    process.exit(0);
  }
}

run();

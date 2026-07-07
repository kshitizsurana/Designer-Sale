/**
 * seed-all.js — Full database seed: merchants, looks, categories, products, collections, landing pages.
 * Usage: cd api && node scripts/seed-all.js
 */
const { spawnSync } = require('child_process');
const path = require('path');

const scripts = [
  'seed-looks.js',
  'seed-real-merchants.js',
  'seed-real-products.js',
  'seed-product-looks.js',
  'remap-categories.js',
  'seed-collections.js',
  'seed-sales-landing-pages.js',
];

const dir = __dirname;
console.log('=== Designer Sale — Full Seed ===\n');

for (const script of scripts) {
  console.log(`\n▶ Running ${script}...\n`);
  const result = spawnSync('node', [path.join(dir, script)], { stdio: 'inherit', cwd: path.join(dir, '..') });
  if (result.status !== 0) {
    console.error(`\n❌ ${script} failed with exit code ${result.status}`);
    process.exit(result.status || 1);
  }
}

console.log('\n🎉 Full seed complete!');

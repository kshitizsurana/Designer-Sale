const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { slugifyTitle, resolveLandingPage } = require('../src/utils.js');

describe('slugifyTitle', () => {
  it('converts titles to URL-safe slugs', () => {
    assert.equal(slugifyTitle('Sales in Formal Wear'), 'sales-in-formal-wear');
    assert.equal(slugifyTitle('July Discounts!'), 'july-discounts');
  });
});

describe('resolveLandingPage', () => {
  const pages = [
    { id: 'lp_formal_1', title: 'Sales in Formal Wear', status: 'published' },
    { id: 'lp_boho_2', title: 'Sales in Bohemian', status: 'published' },
  ];

  it('finds by id', () => {
    assert.equal(resolveLandingPage(pages, 'lp_formal_1').title, 'Sales in Formal Wear');
  });

  it('finds by slugified title', () => {
    assert.equal(resolveLandingPage(pages, 'sales-in-formal-wear').id, 'lp_formal_1');
  });

  it('returns null for unknown identifier', () => {
    assert.equal(resolveLandingPage(pages, 'missing-sale'), null);
  });
});

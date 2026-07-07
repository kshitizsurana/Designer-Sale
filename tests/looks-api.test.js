const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

function pickLookFields(body) {
  const {
    name, slug, description, hero_image, status,
    tagline, keywords, feature_title, feature_body, feature_cta,
  } = body;
  return {
    name, slug, description, hero_image, status,
    tagline, keywords, feature_title, feature_body, feature_cta,
  };
}

describe('looks API field mapping', () => {
  it('includes editorial fields for admin persistence', () => {
    const payload = {
      name: 'Formal Wear',
      slug: 'formal-wear',
      description: 'Tailored styles',
      hero_image: 'https://example.com/formal.jpg',
      status: 'active',
      tagline: 'Boardroom to dinner.',
      keywords: ['Tailored', 'Luxury'],
      feature_title: 'The Power Wardrobe',
      feature_body: 'Structured silhouettes.',
      feature_cta: 'Shop Tailored',
    };
    const row = pickLookFields(payload);
    assert.equal(row.tagline, 'Boardroom to dinner.');
    assert.deepEqual(row.keywords, ['Tailored', 'Luxury']);
    assert.equal(row.feature_cta, 'Shop Tailored');
  });
});

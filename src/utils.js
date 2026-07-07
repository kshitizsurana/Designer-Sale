// Shared utilities (browser + testable in Node)

function slugifyTitle(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function resolveLandingPage(landingPages, identifier) {
  if (!identifier || !Array.isArray(landingPages)) return null;
  const byId = landingPages.find(lp => lp.id === identifier);
  if (byId) return byId;
  const slug = slugifyTitle(identifier);
  return landingPages.find(lp => slugifyTitle(lp.title) === slug) || null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { slugifyTitle, resolveLandingPage };
}
if (typeof window !== 'undefined') {
  window.DSUtils = { slugifyTitle, resolveLandingPage };
}

/* global React, ReactDOM,
   Header, Footer,
   HomePage, CategoryPage, BoutiquesPage, AboutPage, WishlistPage,
   ProductDetailPage, BrandPage, MerchantPage, LandingPage, LookPage, CollectionPage,
   TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakSelect, TweakColor, TweakToggle, API */

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "logoVariant": "editorial",
  "cardVariant": "editorial",
  "accent": "#A8854A",
  "density": "comfortable",
  "showPromoBar": true
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  
  // ---- Global Data State ----
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        let bootstrap;
        try {
          bootstrap = await API.bootstrap.get();
        } catch (bootstrapError) {
          const [categories, merchants, brands, products, looks, collections, landing_pages, blogs] = await Promise.all([
            API.categories.getAll(),
            API.merchants.getAll(),
            API.brands.getAll(),
            API.products.getAll(),
            API.looks.getAll(),
            API.collections.getAll().catch(() => []),
            API.landingPages.getAll().catch(() => []),
            API.blogs.getAll().catch(() => [])
          ]);
          bootstrap = { categories, merchants, brands, products, looks, collections, landing_pages, blogs };
        }

        const categories = (Array.isArray(bootstrap.categories) ? bootstrap.categories : []).filter(c => (c.status || 'active') === 'active');
        const merchants = (Array.isArray(bootstrap.merchants) ? bootstrap.merchants : []).filter(m => (m.status || 'active') === 'active');
        const brands = Array.isArray(bootstrap.brands) ? bootstrap.brands : [];
        const products = (Array.isArray(bootstrap.products) ? bootstrap.products : []).filter(p => (p.status || 'active') === 'active');
        const looks = (Array.isArray(bootstrap.looks) ? bootstrap.looks : [])
          .filter(l => (l.status || 'active') === 'active')
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.id - b.id);
        const collections = (Array.isArray(bootstrap.collections) ? bootstrap.collections : []).filter(c => (c.status || 'active') !== 'archived' && c.status !== 'hidden');
        const landing_pages = (Array.isArray(bootstrap.landing_pages) ? bootstrap.landing_pages : []).filter(lp => (lp.status || 'published') !== 'archived');

        const categoryExtras = {
          'maxi-dresses': { swatch: ['#C9B8A8', '#A8854A'], image: window.IMG?.catMaxi },
          'kaftans':      { swatch: ['#E8D9C4', '#7A6450'], image: window.IMG?.catKaftan },
          'tops-blouses': { swatch: ['#D8C8B8', '#8E7558'], image: window.IMG?.catTops },
          'coats-jackets':    { swatch: ['#6B5B4A', '#2A2520'], image: window.IMG?.catCoats },
          'bags-accessories': { swatch: ['#A8854A', '#5C4632'], image: window.IMG?.catBags },
          'jewellery':        { swatch: ['#C9A84C', '#E8D4B8'], image: window.IMG?.catJewel },
        };

        const enrichedCategories = categories.map(c => {
          const dbSwatch = Array.isArray(c.swatch) ? c.swatch : safeJsonArray(c.swatch);
          const ext = categoryExtras[c.id] || { swatch: ['#ccc', '#aaa'] };
          return {
            ...c,
            image: c.image || ext.image || '',
            swatch: dbSwatch || ext.swatch,
            count: products.filter(p => p.category === c.id).length,
          };
        });

        const enrichedMerchants = merchants.map(m => ({
          ...m,
          look_id: m.look_id || null
        }));

        const brandMap = Object.fromEntries(brands.map(b => [b.id, b]));
        const merchantMap = Object.fromEntries(enrichedMerchants.map(m => [m.id, m]));

        const enrichedProducts = products.map((p, i) => {
          const merchant = merchantMap[p.merchantId] || { name: p.merchant || p.merchantId || 'Unknown', id: p.merchantId, look_id: null, website: '' };
          const hue = 18 + ((i * 37) % 40);
          const lightness = 78 + ((i * 11) % 14);
          
          let url = p.url || (merchant.website ? (merchant.website.startsWith('http') ? merchant.website : `https://${merchant.website}`) : '');
          const handle = p.id.includes('__') ? p.id.split('__')[1] : null;
          if (!p.url && url && handle) {
            url = `${url.replace(/\/$/, '')}/products/${handle}`;
          }

          return {
            ...p,
            url,
            brandSlug: p.brandId,
            merchantData: merchant,
            look_id: p.look_id || merchant.look_id, // Inherit look from merchant
            placeholder: p.placeholder || { hue, lightness },
            sizes: Array.isArray(p.sizes) ? p.sizes : safeJsonArray(p.sizes),
          };
        });

        const blogs = (Array.isArray(bootstrap.blogs) ? bootstrap.blogs : []).filter(b => b.status === 'published');

        setData({
          categories: enrichedCategories,
          merchants: enrichedMerchants,
          brands,
          blogs,
          looks: looks || [],
          collections: collections || [],
          landing_pages: landing_pages || [],
          products: enrichedProducts,
          justAdded: enrichedProducts
            .slice()
            .sort((a, b) => {
              // newIn products always first, then by natural order (id string)
              if (b.newIn !== a.newIn) return (b.newIn ? 1 : 0) - (a.newIn ? 1 : 0);
              return 0;
            }),
          boutiques: merchants,
        });
      } catch (e) {
        setError(e.message || 'The site data could not be loaded.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--gold', tweaks.accent);
    root.style.setProperty('--gold-deep', shade(tweaks.accent, -0.18));
    root.style.setProperty('--gold-soft', shade(tweaks.accent, 0.32));
    const d = tweaks.density === 'compact' ? 0.78 : tweaks.density === 'spacious' ? 1.18 : 1.0;
    root.style.setProperty('--density', String(d));
  }, [tweaks.accent, tweaks.density]);

  // ---- Routing (hash-based) ----
  const [route, setRoute] = useState(() => parseHash());
  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  function navigate(page, categoryId = null, action = null, entityId = null) {
    let hash = '#/';
    if      (page === 'category')     hash = `#/c/${categoryId || 'maxi-dresses'}`;
    else if (page === 'boutiques')    hash = '#/boutiques';
    else if (page === 'about')        hash = '#/about';
    else if (page === 'wishlist')     hash = '#/wishlist';
    else if (page === 'blog')         hash = '#/blog';
    else if (page === 'blog-post')    hash = `#/blog/${entityId}`;
    else if (page === 'product')      hash = `#/product/${entityId}`;
    else if (page === 'brand')        hash = `#/brand/${entityId}`;
    else if (page === 'merchant')     hash = `#/merchant/${entityId}`;
    else if (page === 'look-all')     hash = `#/look/${entityId}/all`;
    else if (page === 'look')         hash = `#/look/${entityId}`;
    else if (page === 'landing-page') hash = `#/landing-page/${entityId}`;
    else if (page === 'collection')   hash = `#/collection/${categoryId}/${entityId}`;
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (window.location.hash !== hash) window.location.hash = hash;
    else setRoute(parseHash());
    if (action === 'email') {
      setTimeout(() => { if (window.dsScrollEmail) window.dsScrollEmail(); }, 100);
    }
  }
  window.dsNav = navigate;

  // ---- Wishlist (localStorage) ----
  const [wishlist, setWishlist] = useState(() => {
    try {
      const raw = localStorage.getItem('ds_wishlist');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch (e) { return new Set(); }
  });

  function toggleWishlist(id) {
    setWishlist(prev => {
      const next = new Set(prev);
      const wasIn = next.has(id);
      if (wasIn) next.delete(id); else next.add(id);
      try { localStorage.setItem('ds_wishlist', JSON.stringify([...next])); } catch (e) {}
      pushToast(wasIn ? 'Removed from wishlist' : 'Saved to wishlist');
      return next;
    });
  }

  // ---- Toasts ----
  const [toast, setToast] = useState(null);
  function pushToast(msg) {
    setToast(msg);
    clearTimeout(window.__dsToastTo);
    window.__dsToastTo = setTimeout(() => setToast(null), 2200);
  }

  function handleShop(p) {
    // Navigate to the internal product page instead of directly to merchant
    navigate('product', null, null, p.id);
  }

  function handleEmail(email) {
    if (email) pushToast(`Subscribed: ${email}`);
  }

  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', zIndex: 9999, color: 'var(--ink)'
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 36px)', letterSpacing: '-0.02em', marginBottom: 24, animation: 'pulse 2s infinite ease-in-out' }}>
          Designer Sale
        </div>
        <div style={{ width: 140, height: 1, background: 'var(--line-strong)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, background: 'var(--gold)', animation: 'progress 1.5s infinite ease-in-out', width: '40%' }} />
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginTop: 24 }}>
          Curating Collections
        </div>
        <style>{`
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
          @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
        `}</style>
      </div>
    );
  }
  if (error) return <div style={{ padding: '100px', textAlign: 'center', color: 'red' }}>Error loading data: {error}</div>;

  const commonProps = {
    data,
    cardVariant: tweaks.cardVariant,
    wishlist,
    onToggleWishlist: toggleWishlist,
    onShop: handleShop,
    onNav: navigate,
  };

  return (
    <>
      <Header
        currentPage={route.page}
        currentCategory={route.categoryId}
        wishlistCount={wishlist.size}
        onNav={navigate}
        categories={data.categories}
      />

      {route.page === 'home'      && <HomePage {...commonProps} onEmailSubmit={handleEmail} />}
      {route.page === 'category'  && <CategoryPage {...commonProps} categoryId={route.categoryId} />}
      {route.page === 'wishlist'  && <WishlistPage {...commonProps} />}
      {route.page === 'boutiques' && <BoutiquesPage {...commonProps} />}
      {route.page === 'about'     && <AboutPage {...commonProps} />}
      {route.page === 'product'   && <ProductDetailPage {...commonProps} productId={route.entityId} />}
      {route.page === 'brand'     && <BrandPage {...commonProps} brandId={route.entityId} />}
      {route.page === 'merchant'  && <MerchantPage {...commonProps} merchantId={route.entityId} />}
      {route.page === 'look'      && <LookPage {...commonProps} lookSlug={route.entityId} />}
      {route.page === 'look-all'  && <LookAllPage {...commonProps} lookSlug={route.entityId} />}
      {route.page === 'landing-page' && <LandingPage {...commonProps} landingPageId={route.entityId} />}
      {route.page === 'collection' && <CollectionPage {...commonProps} collectionSlug={route.entityId} lookSlug={route.categoryId} />}
      {route.page === 'blog'      && <BlogList onNav={navigate} />}
      {route.page === 'blog-post' && <BlogPost slug={route.entityId} onNav={navigate} />}

      <Footer onNav={navigate} categories={data.categories} />

      {/* Toast */}
      {toast && (
        <div className="toast">
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--gold)' }} />
          {toast}
        </div>
      )}

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Brand">
          <TweakSelect
            label="Logo treatment"
            value={tweaks.logoVariant}
            onChange={(v) => setTweak('logoVariant', v)}
            options={[
              { value: 'editorial', label: 'Editorial masthead (default)' },
              { value: 'stacked',   label: 'Stacked with .COM.AU rule' },
              { value: 'caps',      label: 'All-caps refined sans' },
            ]}
          />
          <TweakColor
            label="Accent colour"
            value={tweaks.accent}
            onChange={(v) => setTweak('accent', v)}
            options={['#A8854A','#C9A84C','#B08D57','#8B6B36','#9C4A56','#3D5A6C']}
          />
        </TweakSection>

        <TweakSection label="Layout">
          <TweakRadio
            label="Product card"
            value={tweaks.cardVariant}
            onChange={(v) => setTweak('cardVariant', v)}
            options={[
              { value: 'editorial', label: 'Editorial' },
              { value: 'boxed', label: 'Boxed' },
            ]}
          />
          <TweakRadio
            label="Density"
            value={tweaks.density}
            onChange={(v) => setTweak('density', v)}
            options={[
              { value: 'compact', label: 'Compact' },
              { value: 'comfortable', label: 'Comfy' },
              { value: 'spacious', label: 'Spacious' },
            ]}
          />
          <TweakToggle
            label="Show promo bar"
            value={tweaks.showPromoBar}
            onChange={(v) => setTweak('showPromoBar', v)}
          />
        </TweakSection>
      </TweaksPanel>

      <style>{`
        ${!tweaks.showPromoBar ? '.header-promo { display: none; }' : ''}
      `}</style>

      <LogoStyleInjector variant={tweaks.logoVariant} />
    </>
  );
}

function safeJsonArray(value) {
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function LogoStyleInjector({ variant }) {
  useEffect(() => {
    window.__ds_logo_variant = variant;
    document.dispatchEvent(new CustomEvent('ds-logo-variant-change', { detail: variant }));
  }, [variant]);
  return null;
}

// ---- Hash parser ----
function parseHash() {
  const hash = window.location.hash || '#/';
  if (hash === '' || hash === '#/') return { page: 'home' };
  if (hash === '#/wishlist') return { page: 'wishlist' };
  if (hash === '#/boutiques') return { page: 'boutiques' };
  if (hash === '#/about') return { page: 'about' };
  if (hash === '#/blog') return { page: 'blog' };
  if (hash.startsWith('#/blog/')) return { page: 'blog-post', entityId: hash.split('/')[2] };
  if (hash.startsWith('#/product/')) return { page: 'product', entityId: hash.split('/')[2] };
  if (hash.startsWith('#/brand/')) return { page: 'brand', entityId: hash.split('/')[2] };
  if (hash.startsWith('#/merchant/')) return { page: 'merchant', entityId: hash.split('/')[2] };
  if (hash.startsWith('#/landing-page/')) return { page: 'landing-page', entityId: hash.split('/')[2] };
  if (hash.startsWith('#/look/')) {
    const parts = hash.split('/');
    if (parts[3] === 'all') return { page: 'look-all', entityId: parts[2] };
    return { page: 'look', entityId: parts[2] };
  }
  if (hash.startsWith('#/c/')) return { page: 'category', categoryId: hash.split('/')[2] };
  if (hash.startsWith('#/collection/')) {
    const parts = hash.split('/');
    return { page: 'collection', categoryId: parts[2] || null, entityId: parts[3] || null };
  }
  return { page: 'home', categoryId: null, entityId: null };
}

function shade(hex, amt) {
  const m = hex.replace('#','');
  if (m.length !== 6) return hex;
  let r = parseInt(m.slice(0,2), 16);
  let g = parseInt(m.slice(2,4), 16);
  let b = parseInt(m.slice(4,6), 16);
  if (amt >= 0) {
    r = Math.round(r + (255 - r) * amt);
    g = Math.round(g + (255 - g) * amt);
    b = Math.round(b + (255 - b) * amt);
  } else {
    r = Math.round(r * (1 + amt));
    g = Math.round(g * (1 + amt));
    b = Math.round(b * (1 + amt));
  }
  return '#' + [r,g,b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

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
        const [categories, merchants, brands, products, looks, collections, landing_pages] = await Promise.all([
          API.categories.getAll(),
          API.merchants.getAll(),
          API.brands.getAll(),
          API.products.getAll(),
          API.looks.getAll(),
          API.collections.getAll().catch(() => []), // Fallback in case of error/unmigrated DB
          API.landingPages.getAll().catch(() => [])
        ]);

        const categoryExtras = {
          'maxi-dresses': { image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=85&auto=format&fit=crop', swatch: ['#C9B8A8', '#A8854A'] },
          'kaftans':      { image: 'https://images.unsplash.com/photo-1485518882345-15568b007407?w=900&q=85&auto=format&fit=crop', swatch: ['#E8D9C4', '#7A6450'] },
          'tops-blouses': { image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=900&q=85&auto=format&fit=crop', swatch: ['#D8C8B8', '#8E7558'] },
          'coats-jackets':    { image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=85&auto=format&fit=crop', swatch: ['#6B5B4A', '#2A2520'] },
          'bags-accessories': { image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&q=85&auto=format&fit=crop', swatch: ['#A8854A', '#5C4632'] },
          'jewellery':        { image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=900&q=85&auto=format&fit=crop', swatch: ['#C9A84C', '#E8D4B8'] },
        };

        const enrichedCategories = categories.map(c => {
          const ext = categoryExtras[c.id] || { image: '', swatch: ['#ccc', '#aaa'] };
          return { ...c, ...ext, count: products.filter(p => p.category === c.id).length };
        });

        // Hardcode look_ids for merchants since the column isn't in Supabase yet
        const merchantLookMapping = {
          'calexico': 1, 'parlour-x': 1, 'byfreer': 1, 'grace-melbourne': 1, 'duchess-boutique': 1, 'riada-concept': 1, 'aquel-boutique': 1, 'st-agni': 1, 'viktoria-and-woods': 1,
          'qurated': 2, 'mode-sportif': 2, 'flannel': 2,
          'the-standard-store': 3, 'hansen-and-gretel': 3, 'koriah': 3, 'elysian-collective': 3, 'store-moss': 3
        };

        const enrichedMerchants = merchants.map(m => ({
          ...m,
          look_id: merchantLookMapping[m.id] || null
        }));

        const brandMap = Object.fromEntries(brands.map(b => [b.id, b]));
        const merchantMap = Object.fromEntries(enrichedMerchants.map(m => [m.id, m]));

        const enrichedProducts = products.map((p, i) => {
          const merchant = merchantMap[p.merchantId] || { name: p.merchant || p.merchantId || 'Unknown', id: p.merchantId, look_id: null };
          const hue = 18 + ((i * 37) % 40);
          const lightness = 78 + ((i * 11) % 14);
          return {
            ...p,
            brandSlug: p.brandId,
            merchantData: merchant,
            look_id: p.look_id || merchant.look_id, // Inherit look from merchant
            placeholder: p.placeholder || { hue, lightness },
            sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes) : (p.sizes || []),
          };
        });

        setData({
          categories: enrichedCategories,
          merchants: enrichedMerchants,
          brands,
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
        setError(e.message);
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
    if (page === 'category')  hash = `#/c/${categoryId || 'maxi-dresses'}`;
    else if (page === 'boutiques') hash = '#/boutiques';
    else if (page === 'about')     hash = '#/about';
    else if (page === 'wishlist')  hash = '#/wishlist';
    else if (page === 'product')   hash = `#/product/${entityId}`;
    else if (page === 'brand')     hash = `#/brand/${entityId}`;
    else if (page === 'merchant')  hash = `#/merchant/${entityId}`;
    else if (page === 'look')      hash = `#/looks/${entityId}`;
    else if (page === 'landing-page') hash = `#/landing-page/${entityId}`;
    else if (page === 'collection') hash = `#/looks/${categoryId}/${entityId}`;
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
      {route.page === 'boutiques' && <BoutiquesPage data={data} onNav={navigate} />}
      {route.page === 'about'     && <AboutPage onNav={navigate} />}
      {route.page === 'wishlist'  && <WishlistPage {...commonProps} />}
      {route.page === 'product'   && <ProductDetailPage {...commonProps} productId={route.entityId} />}
      {route.page === 'brand'     && <BrandPage {...commonProps} brandId={route.entityId} />}
      {route.page === 'merchant'  && <MerchantPage {...commonProps} merchantId={route.entityId} />}
      {route.page === 'look'      && <LookPage {...commonProps} lookSlug={route.entityId} />}
      {route.page === 'landing-page' && <LandingPage />}
      {route.page === 'collection' && <CollectionPage {...commonProps} collectionSlug={route.entityId} lookSlug={route.categoryId} />}

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

function LogoStyleInjector({ variant }) {
  useEffect(() => {
    window.__ds_logo_variant = variant;
    document.dispatchEvent(new CustomEvent('ds-logo-variant-change', { detail: variant }));
  }, [variant]);
  return null;
}

// ---- Hash parser ----
function parseHash() {
  const h = window.location.hash || '#/';
  const path = h.replace(/^#/, '');
  if (path.startsWith('/c/'))        return { page: 'category',  categoryId: path.slice(3) || 'maxi-dresses', entityId: null };
  if (path.startsWith('/product/'))  return { page: 'product',   categoryId: null, entityId: path.slice(9) };
  if (path.startsWith('/brand/'))    return { page: 'brand',     categoryId: null, entityId: path.slice(7) };
  if (path.startsWith('/merchant/')) return { page: 'merchant',  categoryId: null, entityId: path.slice(10) };
  if (path.startsWith('/looks/')) {
    const parts = path.split('/');
    if (parts.length > 3 && parts[3]) {
      return { page: 'collection', categoryId: parts[2], entityId: parts[3] };
    }
    return { page: 'look', categoryId: null, entityId: parts[2] };
  }
  if (path.startsWith('/landing-page/')) return { page: 'landing-page', categoryId: null, entityId: path.slice(14) };
  if (path === '/boutiques')         return { page: 'boutiques', categoryId: null, entityId: null };
  if (path === '/about')             return { page: 'about',     categoryId: null, entityId: null };
  if (path === '/wishlist')          return { page: 'wishlist',  categoryId: null, entityId: null };
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

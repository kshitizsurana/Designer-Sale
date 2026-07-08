/* global React, Icon, ProductCard */
// LookPage — complete database-driven page for each fashion look.

const { useState: useLookState, useEffect: useLookEffect, useMemo: useLookMemo } = React;

const LOOK_PALETTES = [
  { hero: 'linear-gradient(135deg,#1a1814 0%,#2e2820 50%,#3d3328 100%)', accent: '#C9A84C' },
  { hero: 'linear-gradient(135deg,#2d1f0e 0%,#4a3020 50%,#6b4a28 100%)', accent: '#D4956A' },
  { hero: 'linear-gradient(135deg,#0e1219 0%,#1a2030 50%,#263040 100%)', accent: '#7EB8D4' },
  { hero: 'linear-gradient(135deg,#0a1f2e 0%,#0d3349 50%,#1a5070 100%)', accent: '#5BBFE8' },
];

function paletteForLook(look) {
  return LOOK_PALETTES[Math.abs(Number(look?.id || 1) - 1) % LOOK_PALETTES.length];
}

const SORT_OPTIONS = [
  { value: 'discount', label: 'Biggest Discount' },
  { value: 'new', label: 'New In First' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
];

function LookPage({ lookSlug, data, cardVariant, wishlist, onToggleWishlist, onShop, onNav }) {
  const look = data.looks.find(l => l.slug === lookSlug);
  const [sort, setSort] = useLookState('discount');
  const [brandFilter, setBrandFilter] = useLookState('all');
  const [showAll, setShowAll] = useLookState(false);
  const [boutiquePage, setBoutiquePage] = useLookState(0);
  const BOUTIQUES_PER_PAGE = 4;
  const INITIAL_PRODUCTS = 12;

  useLookEffect(() => {
    if (look) {
      document.title = `${look.name} | Shop by Style — Designer Sale`;
      const setMeta = (name, content) => {
        let el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
        if (!el) { el = document.createElement('meta'); if (name.startsWith('og:')) el.setAttribute('property', name); else el.setAttribute('name', name); document.head.appendChild(el); }
        el.setAttribute('content', content);
      };
      setMeta('description', look.description || `Shop the latest ${look.name} fashion sales from Australia's best boutiques.`);
      setMeta('og:title', `${look.name} | Designer Sale`);
      setMeta('og:description', look.description);
      if (look.hero_image) setMeta('og:image', look.hero_image);
    }
  }, [look]);

  // Reset filters when slug changes
  useLookEffect(() => { setSort('discount'); setBrandFilter('all'); setShowAll(false); setBoutiquePage(0); }, [lookSlug]);

  if (!look) {
    return (
      <main>
        <div className="container-wide" style={{ padding: 'var(--pad-2xl) 0', textAlign: 'center' }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Not found</div>
          <h1 className="cat-title">Look not found.</h1>
          <button className="btn btn-outline" style={{ marginTop: 24 }} onClick={() => onNav('home')}>Return Home</button>
        </div>
      </main>
    );
  }

  const palette = paletteForLook(look);
  const allLookProducts = data.products.filter(p => p.look_id === look.id || (data.merchants.find(m => m.id === p.merchantId)?.look_id === look.id));
  const lookMerchants = data.merchants.filter(m => m.look_id === look.id);

  // Curated Sales for this look (Landing pages + Collections)
  const lookLandingPages = (data.landing_pages || []).filter(lp => lp.look_id === look.id && lp.status !== 'archived').map(lp => ({ ...lp, type: 'landing-page', sort: lp.sort_order || 0 }));
  const lookCollections = (data.collections || []).filter(c => c.look_id === look.id && c.status !== 'archived').map(c => ({ ...c, type: 'collection', image: c.hero_image, short_description: c.description, sort: c.display_order || 0 }));
  const curatedSales = [...lookLandingPages, ...lookCollections].sort((a, b) => a.sort - b.sort);

  const keywords = Array.isArray(look.keywords) ? look.keywords.filter(Boolean) : [];
  const featureTitle = look.feature_title || look.name;
  const featureBody = look.feature_body || look.description || `Explore ${look.name} pieces from Australian boutiques.`;
  const featureCta = look.feature_cta || `Shop ${look.name}`;

  const otherLooks = data.looks.filter(l => l.id !== look.id);

  // Brand list for filter
  const lookBrands = useLookMemo(() => {
    const seen = new Set();
    const brands = [];
    allLookProducts.forEach(p => {
      const brandName = p.brand || (data.brands?.find(b => b.id === p.brandId)?.name) || p.brandId;
      if (brandName && !seen.has(p.brandId)) {
        seen.add(p.brandId);
        brands.push({ id: p.brandId, name: brandName });
      }
    });
    return brands.sort((a, b) => a.name.localeCompare(b.name));
  }, [allLookProducts]);

  // Filtered + sorted products (all in one grid, no category subdivisions)
  const filteredProducts = useLookMemo(() => {
    let prods = allLookProducts;
    return [...prods].sort((a, b) => (b.discountPct || 0) - (a.discountPct || 0));
  }, [allLookProducts]);

  const visibleProducts = filteredProducts.slice(0, 8);

  const avgSaving = allLookProducts.length > 0
    ? Math.round(allLookProducts.reduce((sum, p) => sum + (p.discountPct || 0), 0) / allLookProducts.length)
    : 0;

  const dynamicStats = [
    { label: 'Boutiques', value: `${lookMerchants.length || 5}+` },
    { label: 'Avg Saving', value: `${avgSaving || 35}%` },
    { label: 'Pieces', value: `${allLookProducts.length || 100}+` }
  ];

  return (
    <main>
      {/* ════════════════════════════════
          HERO BANNER
      ════════════════════════════════ */}
      <section style={{ position: 'relative', overflow: 'hidden', background: palette.hero, minHeight: 520 }}>
        {look.hero_image && (
          <img
            src={look.hero_image}
            alt={look.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%', opacity: 0.45 }}
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.0) 100%)' }} />

        <div className="container-wide" style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 520, gap: 28, padding: 'var(--pad-2xl) var(--pad-lg)' }}>
          {/* Breadcrumb */}
          <div className="breadcrumb" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <button onClick={() => onNav('home')} style={{ background: 'none', border: 0, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', padding: 0 }}>Home</button>
            <span style={{ opacity: 0.4 }}>›</span>
            <span style={{ color: 'rgba(255,255,255,0.9)' }}>Shop by Style</span>
            <span style={{ opacity: 0.4 }}>›</span>
            <span style={{ color: '#fff' }}>{look.name}</span>
          </div>

          <div style={{ maxWidth: 640 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: palette.accent, marginBottom: 14 }}>
              Shop by Style · {look.name}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 6vw, 86px)', lineHeight: 1.0, letterSpacing: '-0.018em', color: '#fff', margin: '0 0 18px' }}>
              {look.name}
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, marginBottom: 24, maxWidth: 520 }}>
              {look.description}
            </p>

            {/* Keyword pills */}
            {keywords.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
              {keywords.map(k => (
                <span key={k} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '5px 12px', border: '1px solid rgba(255,255,255,0.28)', color: 'rgba(255,255,255,0.7)', borderRadius: 2 }}>{k}</span>
              ))}
            </div>}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href={`#look-products`} className="btn btn-gold" onClick={e => { e.preventDefault(); document.getElementById('look-products')?.scrollIntoView({ behavior: 'smooth' }); }}>
                Shop {look.name} <Icon.ArrowRight />
              </a>
              <button className="btn" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.28)' }} onClick={() => onNav('boutiques')}>
                Browse Boutiques
              </button>
            </div>
          </div>

          {/* Stats chips */}
          <div style={{ display: 'flex', gap: 0, border: '1px solid rgba(255,255,255,0.14)', maxWidth: 420, overflow: 'hidden', borderRadius: 2 }}>
            {dynamicStats.map((s, i) => (
              <div key={i} style={{ flex: 1, padding: '14px 20px', borderRight: i < dynamicStats.length - 1 ? '1px solid rgba(255,255,255,0.14)' : 'none', background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: palette.accent, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          CURATED SALES — landing pages tied to this look
          (matches how home page shows Featured Sales)
      ════════════════════════════════ */}
      {curatedSales.length > 0 && (
        <>
          <hr className="divider-rule" />
          <section className="section container-wide">
            <div className="section-head" style={{ textAlign: 'center', display: 'block', marginBottom: 40 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Curated Sales</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 42px)' }}>{look.name} Featured Sales.</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {curatedSales.map((item, i) => (
                <button
                  key={item.id}
                  className="fade-in"
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: 360,
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1px solid var(--line)',
                    animationDelay: `${i * 60}ms`,
                    display: 'flex',
                    alignItems: 'flex-end',
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: palette.hero,
                  }}
                  onClick={() => {
                    if (item.type === 'collection') onNav('collection', null, null, item.slug || item.id);
                    else onNav('landing-page', null, null, item.id);
                  }}
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 600ms ease' }}
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
                  <div style={{ position: 'relative', zIndex: 1, padding: '36px 40px', color: '#fff' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 2.5vw, 36px)', marginBottom: 10 }}>{item.title}</h3>
                    <p style={{ fontSize: 15, opacity: 0.85, marginBottom: 18, maxWidth: 560 }}>{item.short_description}</p>
                    <span className="btn btn-ghost" style={{ border: '1px solid rgba(255,255,255,0.4)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                      Shop Sale <Icon.ArrowRight style={{ marginLeft: 8 }} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ════════════════════════════════
          ALL PRODUCTS — single filterable grid (no category subdivisions)
      ════════════════════════════════ */}
      <div id="look-products">
        <hr className="divider-rule" />
        <section className="section container-wide">
          <div className="section-head" style={{ marginBottom: 28 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>{allLookProducts.length} pieces on sale</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 38px)', lineHeight: 1.1 }}>
                Shop {look.name}
              </h2>
            </div>
          </div>


          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--ink-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🛍️</div>
              <p>No products added for this style yet.</p>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {visibleProducts.map(p => (
                  <ProductCard key={p.id} product={p} variant={cardVariant} isWishlisted={wishlist.has(p.id)} onToggleWishlist={onToggleWishlist} onShop={onShop} onNav={onNav} />
                ))}
              </div>
              {filteredProducts.length > 8 && (
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                  <button className="btn btn-outline" onClick={() => onNav('look-all', null, null, look.slug)}>
                    Show all {filteredProducts.length} pieces <Icon.ArrowRight />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* ════════════════════════════════
          EDITORIAL SPLIT — look feature
      ════════════════════════════════ */}
      <section style={{ background: 'var(--ink)', padding: 'var(--pad-2xl) 0' }}>
        <div className="container-wide" style={{ padding: '0 var(--pad-lg)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pad-xl)', alignItems: 'center' }}>
            {/* Image panel */}
            <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: palette.hero }}>
              {look.hero_image && (
                <img
                  src={look.hero_image}
                  alt={look.name}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: palette.accent }}>{look.name}</span>
              </div>
            </div>
            {/* Copy panel */}
            <div style={{ padding: '0 var(--pad-md)' }}>
              <div className="eyebrow" style={{ color: palette.accent, marginBottom: 18 }}>The Look</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 3.6vw, 56px)', lineHeight: 1.04, letterSpacing: '-0.015em', color: '#fff', marginBottom: 22 }}>
                {featureTitle}
              </h2>
              <p style={{ color: 'rgba(245,240,234,0.72)', fontSize: 16, lineHeight: 1.7, maxWidth: 460, marginBottom: 32 }}>
                {featureBody}
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn btn-gold" onClick={() => document.getElementById('look-products')?.scrollIntoView({ behavior: 'smooth' })}>
                  {featureCta} <Icon.ArrowRight />
                </button>
                <button className="btn" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => onNav('boutiques')}>
                  Browse Boutiques
                </button>
              </div>
              {/* Keyword tags */}
              {keywords.length > 0 && <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {keywords.map(k => (
                  <span key={k} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '4px 10px', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', borderRadius: 2 }}>{k}</span>
                ))}
              </div>}
            </div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════
          BOUTIQUES (Paginated)
      ════════════════════════════════ */}
      {lookMerchants.length > 0 && (
        <>
          <hr className="divider-rule" />
          <section className="section container-wide">
            <div className="section-head" style={{ marginBottom: 28 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Shop {look.name} at</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 38px)', lineHeight: 1.1 }}>
                  Boutiques
                </h2>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => onNav('boutiques')}>All boutiques</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {lookMerchants.slice(boutiquePage * BOUTIQUES_PER_PAGE, (boutiquePage + 1) * BOUTIQUES_PER_PAGE).map(b => (
                <button
                  key={b.id}
                  onClick={() => onNav('merchant', null, null, b.id)}
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--line)', padding: '20px 24px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 180ms ease, box-shadow 180ms ease', borderRadius: 2 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(168,133,74,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {b.logo_image && (
                    <img src={b.logo_image} alt={b.name} style={{ width: '100%', height: 80, objectFit: 'contain', marginBottom: 12, borderRadius: 4 }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                  )}
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink)', marginBottom: 6, letterSpacing: '-0.01em' }}>{b.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>{b.city} · {b.state}</div>
                  {b.focus && <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 8, lineHeight: 1.4 }}>{b.focus}</div>}
                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-deep)' }}>
                    View Boutique <Icon.ArrowRight />
                  </div>
                </button>
              ))}
            </div>
            {lookMerchants.length > BOUTIQUES_PER_PAGE && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={boutiquePage === 0}
                  onClick={() => setBoutiquePage(p => Math.max(0, p - 1))}
                  style={{ opacity: boutiquePage === 0 ? 0.4 : 1 }}
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.ceil(lookMerchants.length / BOUTIQUES_PER_PAGE) }, (_, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm ${boutiquePage === i ? 'btn-gold' : 'btn-ghost'}`}
                    onClick={() => setBoutiquePage(i)}
                    style={{ minWidth: 36 }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={boutiquePage >= Math.ceil(lookMerchants.length / BOUTIQUES_PER_PAGE) - 1}
                  onClick={() => setBoutiquePage(p => Math.min(Math.ceil(lookMerchants.length / BOUTIQUES_PER_PAGE) - 1, p + 1))}
                  style={{ opacity: boutiquePage >= Math.ceil(lookMerchants.length / BOUTIQUES_PER_PAGE) - 1 ? 0.4 : 1 }}
                >
                  Next →
                </button>
              </div>
            )}
          </section>
        </>
      )}

      {/* ════════════════════════════════
          EXPLORE OTHER LOOKS — premium editorial grid
      ════════════════════════════════ */}
      {otherLooks.length > 0 && (
        <>
          <hr className="divider-rule" />
          <section className="section container-wide">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Discover more styles</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-0.015em' }}>
                Explore Other <em style={{ color: 'var(--gold-deep)', fontStyle: 'italic' }}>Looks</em>
              </h2>
              <p style={{ color: 'var(--ink-muted)', fontSize: 15, marginTop: 12, maxWidth: 480, margin: '12px auto 0' }}>
                Four distinct styles. One destination for Australian designer sales.
              </p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}>
              {otherLooks.map((l, idx) => {
                const otherPalette = paletteForLook(l);
                const lCount = data.products.filter(p => p.look_id === l.id).length;
                const lMerchants = data.merchants.filter(m => m.look_id === l.id).length;
                return (
                  <button
                    key={l.id}
                    onClick={() => onNav('look', null, null, l.slug)}
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 12,
                      border: '1px solid var(--line)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: 0,
                      height: 340,
                      gridColumn: 'span 1',
                      background: otherPalette.hero,
                      transition: 'transform 220ms ease, box-shadow 220ms ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.015)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.22)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {l.hero_image && (
                      <img
                        src={l.hero_image}
                        alt={l.name}
                        loading="lazy"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 600ms ease' }}
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    {/* Gradient overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />

                    {/* Content */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 28px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: otherPalette.accent, marginBottom: 8 }}>
                        Shop by Style
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 32, lineHeight: 1.05, color: '#fff', marginBottom: 10, letterSpacing: '-0.012em' }}>
                        {l.name}
                      </h3>
                      {l.description && (
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', lineHeight: 1.5, marginBottom: 18, maxWidth: 420 }}>
                          {l.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: otherPalette.accent, display: 'flex', alignItems: 'center', gap: 6 }}>
                          View {l.name} <Icon.ArrowRight />
                        </span>
                        {lCount > 0 && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 20, backdropFilter: 'blur(4px)' }}>
                            {lCount} on sale · {lMerchants} boutiques
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* ════════════════════════════════
          EMAIL CAPTURE
      ════════════════════════════════ */}
      <section className="email-capture">
        <div className="eyebrow" style={{ color: 'var(--gold-soft)', marginBottom: 18 }}>The DesignerSale list</div>
        <h2>Never miss a {look.name} sale.</h2>
        <p>New drops from Australia's best {look.name.toLowerCase()} boutiques — delivered Tuesday and Friday.</p>
        <form className="email-form" onSubmit={e => { e.preventDefault(); }}>
          <input type="email" placeholder="your@email.com.au" required />
          <button type="submit">Subscribe →</button>
        </form>
        <div style={{ marginTop: 18, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.45)' }}>
          We never share. Unsubscribe in one click.
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { LookPage });

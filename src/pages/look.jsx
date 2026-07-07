/* global React, Icon, ProductCard */
// LookPage — Complete "Shop by Style" page for each fashion look (Formal, Bohemian, Casuals)

const { useState: useLookState, useEffect: useLookEffect, useMemo: useLookMemo } = React;

// ---- Per-look editorial config ---- //
const LOOK_CONFIG = {
  'formal-wear': {
    palette: { hero: 'linear-gradient(135deg,#1a1814 0%,#2e2820 50%,#3d3328 100%)', accent: '#C9A84C', badge: '#2A2520' },
    icon: '👔',
    tagline: 'Boardroom to dinner. Sharply done.',
    keywords: ['Tailored', 'Office Wear', 'Young Professionals', 'Luxury', 'Evening'],
    stats: [{ label: 'Boutiques', value: '10+' }, { label: 'Avg Saving', value: '42%' }, { label: 'Styles', value: '180+' }],
    feature: { title: 'The Power Wardrobe', body: 'Structured silhouettes and elevated fabrics from Australia\'s most discerning boutiques. From the boardroom to dinner — every piece earns its place.', cta: 'Shop Tailored' },
  },
  'bohemian': {
    palette: { hero: 'linear-gradient(135deg,#2d1f0e 0%,#4a3020 50%,#6b4a28 100%)', accent: '#D4956A', badge: '#5C3418' },
    icon: '🌿',
    tagline: 'Earth, print & effortless ease.',
    keywords: ['Boho Chic', 'Floral', 'Earthy', 'Flowing', 'Artisan'],
    stats: [{ label: 'Boutiques', value: '4+' }, { label: 'Avg Saving', value: '38%' }, { label: 'Styles', value: '120+' }],
    feature: { title: 'Free-Spirit Fashion', body: 'Flowing silhouettes, botanical prints, and artisan-crafted pieces that travel from beach to table with effortless confidence.', cta: 'Shop Bohemian' },
  },
  'casuals': {
    palette: { hero: 'linear-gradient(135deg,#0e1219 0%,#1a2030 50%,#263040 100%)', accent: '#7EB8D4', badge: '#1a2030' },
    icon: '👟',
    tagline: 'Everyday looks, zero effort required.',
    keywords: ['Baggy Fits', 'Streetwear', 'Basics', 'Teens', 'Relaxed'],
    stats: [{ label: 'Boutiques', value: '5+' }, { label: 'Avg Saving', value: '45%' }, { label: 'Styles', value: '150+' }],
    feature: { title: 'Effortless Every Day', body: 'Laid-back cuts and contemporary basics from Australia\'s coolest independent boutiques. Dress down without looking like it.', cta: 'Shop Casuals' },
  },
  'resort-wear': {
    palette: { hero: 'linear-gradient(135deg,#0a1f2e 0%,#0d3349 50%,#1a5070 100%)', accent: '#5BBFE8', badge: '#0a1f2e' },
    icon: '🌴',
    tagline: 'Vacation mode, always.',
    keywords: ['Vacation', 'Poolside', 'Cruise', 'Summer', 'Escape'],
    stats: [{ label: 'Boutiques', value: '3+' }, { label: 'Avg Saving', value: '40%' }, { label: 'Styles', value: '100+' }],
    feature: { title: 'The Great Escape', body: 'Breezy fabrics and sunset-ready silhouettes from Australia\'s best boutiques. The ultimate collection for when the out-of-office is on.', cta: 'Shop Resort' },
  },
};

const SORT_OPTIONS = [
  { value: 'discount', label: 'Biggest Discount' },
  { value: 'new', label: 'New In First' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
];

function LookPage({ lookSlug, data, cardVariant, wishlist, onToggleWishlist, onShop, onNav }) {
  const look = data.looks.find(l => l.slug === lookSlug);
  const [sort, setSort] = useLookState('discount');
  const [activeCategory, setActiveCategory] = useLookState('all');
  const [showAll, setShowAll] = useLookState(false);
  const [boutiquePage, setBoutiquePage] = useLookState(0);
  const BOUTIQUES_PER_PAGE = 4;

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
  useLookEffect(() => { setSort('discount'); setActiveCategory('all'); setShowAll(false); setBoutiquePage(0); }, [lookSlug]);

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

  const cfg = LOOK_CONFIG[look.slug] || LOOK_CONFIG['formal-wear'];
  const allLookProducts = data.products.filter(p => p.look_id === look.id || (data.merchants.find(m => m.id === p.merchantId)?.look_id === look.id));
  const lookMerchants = data.merchants.filter(m => m.look_id === look.id);

  // Derive active collections for this look
  const lookCollections = useLookMemo(() => {
    return (data.collections || [])
      .filter(c => c.look_id === look.id && c.status !== 'hidden')
      .sort((a, b) => a.display_order - b.display_order);
  }, [data.collections, look.id]);

  const lookLandingPages = (data.landing_pages || []).filter(lp => lp.look_id === look.id && lp.status !== 'archived');

  const keywords = look.keywords && look.keywords.length > 0 ? look.keywords : cfg.keywords;
  const tagline = look.tagline || cfg.tagline;
  const featureTitle = look.feature_title || cfg.feature.title;
  const featureBody = look.feature_body || cfg.feature.body;
  const featureCta = look.feature_cta || cfg.feature.cta;

  const otherLooks = data.looks.filter(l => l.id !== look.id);

  const categoryGroups = useLookMemo(() => {
    const groups = new Map();
    allLookProducts.forEach(p => {
      const cat = data.categories.find(c => c.id === p.category);
      if (!cat) return;
      if (!groups.has(cat.id)) groups.set(cat.id, { category: cat, products: [] });
      groups.get(cat.id).products.push(p);
    });
    return Array.from(groups.values())
      .filter(g => g.products.length > 0)
      .sort((a, b) => b.products.length - a.products.length);
  }, [allLookProducts, data.categories]);

  const avgSaving = allLookProducts.length > 0 
    ? Math.round(allLookProducts.reduce((sum, p) => sum + (p.discountPct || 0), 0) / allLookProducts.length) 
    : 0;

  const dynamicStats = [
    { label: 'Boutiques', value: `${lookMerchants.length || 5}+` },
    { label: 'Avg Saving', value: `${avgSaving || 35}%` },
    { label: 'Styles', value: `${allLookProducts.length || 100}+` }
  ];

  return (
    <main>
      {/* ════════════════════════════════
          HERO BANNER
      ════════════════════════════════ */}
      <section style={{ position: 'relative', overflow: 'hidden', background: cfg.palette.hero, minHeight: 520 }}>
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
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: cfg.palette.accent, marginBottom: 14 }}>
              Shop by Style · {look.name}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 6vw, 86px)', lineHeight: 1.0, letterSpacing: '-0.018em', color: '#fff', margin: '0 0 18px' }}>
              {look.name}
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, marginBottom: 24, maxWidth: 520 }}>
              {look.description || tagline}
            </p>

            {/* Keyword pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
              {keywords.map(k => (
                <span key={k} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '5px 12px', border: '1px solid rgba(255,255,255,0.28)', color: 'rgba(255,255,255,0.7)', borderRadius: 2 }}>{k}</span>
              ))}
            </div>

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
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: cfg.palette.accent, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ════════════════════════════════
          CURATED COLLECTIONS & LANDING PAGES
      ════════════════════════════════ */}
      <div id="look-products">
        {lookLandingPages.map((lp, idx) => (
          <React.Fragment key={lp.id}>
            {idx > 0 && <hr className="divider-rule" />}
            <section className="section container-wide">
              <div className="section-head">
                <div>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Special Feature</div>
                  <h2>{lp.title}</h2>
                  {lp.short_description && <p style={{ marginTop: 8, color: 'var(--ink-muted)', fontSize: 14, maxWidth: 600 }}>{lp.short_description}</p>}
                </div>
                <button className="section-head-link" onClick={() => onNav('landing-page', null, null, lp.id)}>
                  View Campaign <Icon.ArrowRight />
                </button>
              </div>
              {lp.image && (
                <div style={{ width: '100%', height: 320, background: '#eee', marginBottom: 32, borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                  <img src={lp.image} alt={lp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)' }} />
                </div>
              )}
            </section>
          </React.Fragment>
        ))}

        {lookCollections.length === 0 && lookLandingPages.length === 0 ? (
          <section className="section container-wide" style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--ink-muted)' }}>
            <p>No collections have been curated for this style yet.</p>
          </section>
        ) : (
          lookCollections.map((collection, idx) => {
            // Resolve products for this collection
            const pids = collection.product_ids || [];
            const pMap = new Map(data.products.map(p => [p.id, p]));
            const prods = pids.map(id => pMap.get(id)).filter(Boolean);
    
            if (prods.length === 0) return null;
    
            return (
              <React.Fragment key={collection.id}>
                {(idx > 0 || lookLandingPages.length > 0) && <hr className="divider-rule" />}
                <section className="section container-wide">
                  <div className="section-head">
                    <div>
                      <div className="eyebrow" style={{ marginBottom: 10 }}>Curated Collection</div>
                      <h2>{collection.title}</h2>
                      {collection.description && (
                        <p style={{ marginTop: 8, color: 'var(--ink-muted)', fontSize: 14, maxWidth: 600 }}>{collection.description}</p>
                      )}
                    </div>
                    <button className="section-head-link" onClick={() => onNav('collection', look.slug, null, collection.slug)}>
                      View All {prods.length} <Icon.ArrowRight />
                    </button>
                  </div>
                  <div className="product-grid">
                    {prods.slice(0, 8).map(p => (
                      <ProductCard key={p.id} product={p} variant={cardVariant} isWishlisted={wishlist.has(p.id)} onToggleWishlist={onToggleWishlist} onShop={onShop} onNav={onNav} />
                    ))}
                  </div>
                </section>
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Category-wise product sections */}
      {categoryGroups.map((group, idx) => (
        <React.Fragment key={group.category.id}>
          <hr className="divider-rule" />
          <section className="section container-wide">
            <div className="section-head">
              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>{look.name}</div>
                <h2>{group.category.label}</h2>
              </div>
              <button className="section-head-link" onClick={() => onNav('category', group.category.id)}>
                View all {group.products.length} <Icon.ArrowRight />
              </button>
            </div>
            <div className="product-grid">
              {group.products.slice(0, 8).map(p => (
                <ProductCard key={p.id} product={p} variant={cardVariant} isWishlisted={wishlist.has(p.id)} onToggleWishlist={onToggleWishlist} onShop={onShop} onNav={onNav} />
              ))}
            </div>
          </section>
        </React.Fragment>
      ))}

      {/* ════════════════════════════════
          EDITORIAL SPLIT — look feature
      ════════════════════════════════ */}
      <section style={{ background: 'var(--ink)', padding: 'var(--pad-2xl) 0' }}>
        <div className="container-wide" style={{ padding: '0 var(--pad-lg)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pad-xl)', alignItems: 'center' }}>
            {/* Image panel */}
            <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: cfg.palette.hero }}>
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
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: cfg.palette.accent }}>{look.name}</span>
              </div>
            </div>
            {/* Copy panel */}
            <div style={{ padding: '0 var(--pad-md)' }}>
              <div className="eyebrow" style={{ color: cfg.palette.accent, marginBottom: 18 }}>The Look</div>
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
              <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {keywords.map(k => (
                  <span key={k} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '4px 10px', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', borderRadius: 2 }}>{k}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════
          BOUTIQUES (Paginated) — before Explore Other Looks
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
          EXPLORE OTHER LOOKS (compact tiles)
      ════════════════════════════════ */}
      {otherLooks.length > 0 && (
        <>
          <hr className="divider-rule" />
          <section className="section container-wide">
            <div className="section-head" style={{ marginBottom: 24 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Discover more styles</div>
                <h2>Explore Other <em className="serif-it" style={{ color: 'var(--gold-deep)' }}>Looks</em></h2>
              </div>
            </div>
            <div className="look-explore-grid">
              {otherLooks.map(l => {
                const oCfg = LOOK_CONFIG[l.slug] || {};
                const lCount = data.products.filter(p => p.look_id === l.id).length;
                return (
                  <button
                    key={l.id}
                    className="tile fade-in look-explore-tile"
                    onClick={() => onNav('look', null, null, l.slug)}
                  >
                    {l.hero_image && (
                      <img
                        src={l.hero_image}
                        alt={l.name}
                        loading="lazy"
                        className="look-explore-img"
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <div className="look-explore-overlay" style={{ background: oCfg.palette ? oCfg.palette.hero : '#000', opacity: l.hero_image ? 0.45 : 0.9 }} />
                    <div className="look-explore-content">
                      <div className="look-explore-eyebrow" style={{ color: oCfg.palette ? oCfg.palette.accent : 'var(--gold-soft)' }}>Shop by Style</div>
                      <h3 className="look-explore-title">{l.name}</h3>
                      <p className="look-explore-tagline">{l.tagline || oCfg.tagline || l.description}</p>
                      <span className="look-explore-cta" style={{ color: oCfg.palette ? oCfg.palette.accent : '#fff' }}>
                        View {l.name} <Icon.ArrowRight />
                      </span>
                      {lCount > 0 && <div className="look-explore-count">{lCount} items on sale</div>}
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

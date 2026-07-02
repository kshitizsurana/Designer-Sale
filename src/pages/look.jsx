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
    stats: [{ label: 'Boutiques', value: '6+' }, { label: 'Avg Saving', value: '42%' }, { label: 'Styles', value: '180+' }],
    feature: { title: 'The Power Wardrobe', body: 'Structured silhouettes and elevated fabrics from Australia\'s most discerning boutiques. From the boardroom to dinner — every piece earns its place.', cta: 'Shop Tailored' },
  },
  'bohemian': {
    palette: { hero: 'linear-gradient(135deg,#2d1f0e 0%,#4a3020 50%,#6b4a28 100%)', accent: '#D4956A', badge: '#5C3418' },
    icon: '🌿',
    tagline: 'Earth, print & effortless ease.',
    keywords: ['Boho Chic', 'Floral', 'Earthy', 'Flowing', 'Artisan'],
    stats: [{ label: 'Boutiques', value: '5+' }, { label: 'Avg Saving', value: '38%' }, { label: 'Styles', value: '120+' }],
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
  useLookEffect(() => { setSort('discount'); setActiveCategory('all'); setShowAll(false); }, [lookSlug]);

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
  const allLookProducts = data.products.filter(p => p.look_id === look.id);
  const lookMerchants = data.merchants.filter(m => m.look_id === look.id);

  // Derive unique categories within this look
  const categories = useLookMemo(() => {
    const cats = {};
    allLookProducts.forEach(p => { if (p.category) cats[p.category] = (cats[p.category] || 0) + 1; });
    return Object.entries(cats).map(([id, count]) => {
      const cat = data.categories.find(c => c.id === id);
      return { id, label: cat ? cat.label : id, count };
    }).sort((a, b) => b.count - a.count);
  }, [allLookProducts, data.categories]);

  // Filter by category then sort
  const filteredProducts = useLookMemo(() => {
    let prods = activeCategory === 'all' ? [...allLookProducts] : allLookProducts.filter(p => p.category === activeCategory);
    if (sort === 'discount') prods.sort((a, b) => (b.discountPct || 0) - (a.discountPct || 0));
    else if (sort === 'new') prods.sort((a, b) => (b.newIn ? 1 : 0) - (a.newIn ? 1 : 0) || (b.added || 0) - (a.added || 0));
    else if (sort === 'price-asc') prods.sort((a, b) => (a.sale || 0) - (b.sale || 0));
    else if (sort === 'price-desc') prods.sort((a, b) => (b.sale || 0) - (a.sale || 0));
    return prods;
  }, [allLookProducts, activeCategory, sort]);

  const visibleProducts = showAll ? filteredProducts : filteredProducts.slice(0, 12);
  const topDeals = [...allLookProducts].sort((a, b) => (b.discountPct || 0) - (a.discountPct || 0)).slice(0, 4);
  const newIn = [...allLookProducts].filter(p => p.newIn).slice(0, 4);
  const hasMore = filteredProducts.length > 12;

  const otherLooks = data.looks.filter(l => l.id !== look.id);

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
              {look.description || cfg.tagline}
            </p>

            {/* Keyword pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
              {cfg.keywords.map(k => (
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
            {cfg.stats.map((s, i) => (
              <div key={i} style={{ flex: 1, padding: '14px 20px', borderRight: i < cfg.stats.length - 1 ? '1px solid rgba(255,255,255,0.14)' : 'none', background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: cfg.palette.accent, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          FEATURED BOUTIQUES
      ════════════════════════════════ */}
      {lookMerchants.length > 0 && (
        <section style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--line)' }}>
          <div className="container-wide" style={{ padding: 'var(--pad-xl) var(--pad-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Curated boutiques</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 38px)', lineHeight: 1.1 }}>
                  Shop <em className="serif-it" style={{ color: 'var(--gold-deep)' }}>{look.name}</em> at
                </h2>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => onNav('boutiques')}>All boutiques</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(lookMerchants.length, 4)}, 1fr)`, gap: 16 }}>
              {lookMerchants.map(b => (
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
          </div>
        </section>
      )}

      {/* ════════════════════════════════
          TOP DEALS — up to 4 highest-discount items
      ════════════════════════════════ */}
      {topDeals.length > 0 && (
        <section className="section container-wide">
          <div className="section-head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Best deals right now</div>
              <h2>Top Discounts in <em className="serif-it" style={{ color: 'var(--gold-deep)' }}>{look.name}</em></h2>
            </div>
            <button className="section-head-link" onClick={() => { setActiveCategory('all'); setSort('discount'); document.getElementById('look-products')?.scrollIntoView({ behavior: 'smooth' }); }}>
              View all deals
            </button>
          </div>
          <div className="product-grid">
            {topDeals.map(p => (
              <ProductCard key={p.id} product={p} variant={cardVariant} isWishlisted={wishlist.has(p.id)} onToggleWishlist={onToggleWishlist} onShop={onShop} onNav={onNav} />
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════
          NEW IN — if any flagged as new
      ════════════════════════════════ */}
      {newIn.length > 0 && (
        <>
          <hr className="divider-rule" />
          <section className="section container-wide">
            <div className="section-head">
              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Just dropped · last 48 hours</div>
                <h2>New In <em className="serif-it" style={{ color: 'var(--gold-deep)' }}>{look.name}</em></h2>
              </div>
              <button className="section-head-link" onClick={() => { setActiveCategory('all'); setSort('new'); document.getElementById('look-products')?.scrollIntoView({ behavior: 'smooth' }); }}>
                All new arrivals
              </button>
            </div>
            <div className="product-grid">
              {newIn.map(p => (
                <ProductCard key={p.id} product={p} variant={cardVariant} isWishlisted={wishlist.has(p.id)} onToggleWishlist={onToggleWishlist} onShop={onShop} onNav={onNav} />
              ))}
            </div>
          </section>
        </>
      )}

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
                {cfg.feature.title}
              </h2>
              <p style={{ color: 'rgba(245,240,234,0.72)', fontSize: 16, lineHeight: 1.7, maxWidth: 460, marginBottom: 32 }}>
                {cfg.feature.body}
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn btn-gold" onClick={() => document.getElementById('look-products')?.scrollIntoView({ behavior: 'smooth' })}>
                  {cfg.feature.cta} <Icon.ArrowRight />
                </button>
                <button className="btn" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => onNav('boutiques')}>
                  Browse Boutiques
                </button>
              </div>
              {/* Keyword tags */}
              <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {cfg.keywords.map(k => (
                  <span key={k} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '4px 10px', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', borderRadius: 2 }}>{k}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          FULL PRODUCT GRID — filterable / sortable
      ════════════════════════════════ */}
      <section id="look-products" className="section container-wide">
        <div className="section-head">
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Complete Collection</div>
            <h2>All <em className="serif-it" style={{ color: 'var(--gold-deep)' }}>{look.name}</em> Sales</h2>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Filter + Sort toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--line)' }}>
          {/* Category tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              onClick={() => setActiveCategory('all')}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '6px 14px', cursor: 'pointer', border: '1px solid', borderRadius: 2, borderColor: activeCategory === 'all' ? 'var(--ink)' : 'var(--line)', background: activeCategory === 'all' ? 'var(--ink)' : 'transparent', color: activeCategory === 'all' ? 'var(--bg)' : 'var(--ink-soft)', transition: 'all 150ms ease' }}
            >
              All ({allLookProducts.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '6px 14px', cursor: 'pointer', border: '1px solid', borderRadius: 2, borderColor: activeCategory === cat.id ? 'var(--ink)' : 'var(--line)', background: activeCategory === cat.id ? 'var(--ink)' : 'transparent', color: activeCategory === cat.id ? 'var(--bg)' : 'var(--ink-soft)', transition: 'all 150ms ease' }}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>Sort:</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 12px', border: '1px solid var(--line)', background: 'var(--bg-elevated)', color: 'var(--ink)', cursor: 'pointer', outline: 'none', borderRadius: 2 }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--pad-2xl) 0' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--ink-soft)', marginBottom: 12 }}>No products found</div>
            <p style={{ color: 'var(--ink-muted)', marginBottom: 24 }}>Try a different category or check back soon for new arrivals.</p>
            <button className="btn btn-outline btn-sm" onClick={() => setActiveCategory('all')}>Show all categories</button>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {visibleProducts.map(p => (
                <ProductCard key={p.id} product={p} variant={cardVariant} isWishlisted={wishlist.has(p.id)} onToggleWishlist={onToggleWishlist} onShop={onShop} onNav={onNav} />
              ))}
            </div>
            {hasMore && !showAll && (
              <div style={{ textAlign: 'center', marginTop: 48 }}>
                <button className="btn btn-outline" onClick={() => setShowAll(true)}>
                  Show all {filteredProducts.length} items
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ════════════════════════════════
          EXPLORE OTHER LOOKS
      ════════════════════════════════ */}
      {otherLooks.length > 0 && (
        <>
          <hr className="divider-rule" />
          <section className="section container-wide">
            <div className="section-head" style={{ marginBottom: 32 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Discover more styles</div>
                <h2>Explore Other <em className="serif-it" style={{ color: 'var(--gold-deep)' }}>Looks</em></h2>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${otherLooks.length}, 1fr)`, gap: 20 }}>
              {otherLooks.map(l => {
                const oCfg = LOOK_CONFIG[l.slug] || {};
                const lCount = data.products.filter(p => p.look_id === l.id).length;
                return (
                  <button
                    key={l.id}
                    className="tile fade-in"
                    style={{ minHeight: 340, border: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}
                    onClick={() => onNav('look', null, null, l.slug)}
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
                    <div style={{ position: 'absolute', inset: 0, background: oCfg.palette ? oCfg.palette.hero : '#000', opacity: l.hero_image ? 0.45 : 0.9, mixBlendMode: 'multiply' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, textAlign: 'left', color: '#fff' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: oCfg.palette ? oCfg.palette.accent : 'var(--gold-soft)', marginBottom: 8 }}>Shop by Style</div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8, lineHeight: 1.1 }}>{l.name}</h3>
                      <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 16, lineHeight: 1.4 }}>{oCfg.tagline || l.description}</p>
                      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6, color: oCfg.palette ? oCfg.palette.accent : '#fff' }}>
                        View {l.name} <Icon.ArrowRight />
                      </span>
                      {lCount > 0 && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>{lCount} items on sale</div>}
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

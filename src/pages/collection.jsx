/* global React, ProductCard, Icon */
// CollectionPage — Renders a single curated collection with full filter/sort sidebar

const { useState: useColState, useMemo: useColMemo, useEffect: useColEffect } = React;

function CollectionPage({ data, collectionSlug, lookSlug, cardVariant, wishlist, onToggleWishlist, onShop, onNav }) {
  const { collections, looks, products } = data;

  useColEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [collectionSlug]);

  // ---- Filters ----
  const [minDiscount, setMinDiscount]     = useColState(0);
  const [selectedSizes, setSelectedSizes] = useColState(new Set());
  const [selectedBrands, setSelectedBrands] = useColState(new Set());
  const [newInOnly, setNewInOnly]         = useColState(false);
  const [priceMax, setPriceMax]           = useColState(1000);
  const [sort, setSort]                   = useColState('curated');
  const [collapsed, setCollapsed]         = useColState(new Set());
  const [visibleCount, setVisibleCount]   = useColState(12);

  // reset filters when slug changes
  useColEffect(() => {
    setMinDiscount(0);
    setSelectedSizes(new Set());
    setSelectedBrands(new Set());
    setNewInOnly(false);
    setPriceMax(1000);
    setSort('curated');
    setVisibleCount(12);
  }, [collectionSlug]);

  const toggleSet = (set, val, fn) => {
    const next = new Set(set);
    if (next.has(val)) next.delete(val); else next.add(val);
    fn(next);
  };

  const collection = useColMemo(() => {
    if (!collections || collections.length === 0) return null;
    const target = collectionSlug || lookSlug;
    if (!target) return collections[0] || null;
    return collections.find(c => c.slug === target || String(c.id) === String(target)) ||
           collections.find(c => (c.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') === target) || null;
  }, [collections, collectionSlug, lookSlug]);

  const look = useColMemo(() => {
    if (lookSlug && lookSlug !== 'all' && lookSlug !== 'null') {
      const found = looks.find(l => l.slug === lookSlug);
      if (found) return found;
    }
    if (collection && collection.look_id) {
      const found = looks.find(l => l.id === collection.look_id);
      if (found) return found;
    }
    return looks[0] || { name: 'Style', slug: 'all' };
  }, [looks, lookSlug, collection]);

  // Resolve base products for this collection in curated order
  const baseProducts = useColMemo(() => {
    if (!collection) return [];
    const pids = collection.product_ids || [];
    const pMap = new Map(products.map(p => [p.id, p]));
    return pids.map(id => pMap.get(id)).filter(Boolean);
  }, [collection, products]);

  // Derive brand counts
  const brandCounts = useColMemo(() => {
    const m = new Map();
    baseProducts.forEach(p => m.set(p.brand, (m.get(p.brand) || 0) + 1));
    return m;
  }, [baseProducts]);

  // Apply filters + sort
  const filtered = useColMemo(() => {
    let out = baseProducts.slice();
    if (minDiscount > 0) out = out.filter(p => (p.discountPct || 0) >= minDiscount);
    if (newInOnly)       out = out.filter(p => p.newIn);
    if (selectedSizes.size) out = out.filter(p => (p.sizes || []).some(s => selectedSizes.has(s)));
    if (selectedBrands.size) out = out.filter(p => selectedBrands.has(p.brand));
    out = out.filter(p => (p.sale || 0) <= priceMax);

    if (sort === 'price-low')  out.sort((a, b) => (a.sale || 0) - (b.sale || 0));
    else if (sort === 'price-high') out.sort((a, b) => (b.sale || 0) - (a.sale || 0));
    else if (sort === 'discount') out.sort((a, b) => (b.discountPct || 0) - (a.discountPct || 0));
    // 'curated' = leave in original order
    return out;
  }, [baseProducts, minDiscount, newInOnly, selectedSizes, selectedBrands, priceMax, sort]);

  // Active filter chips
  const activeChips = [];
  if (newInOnly) activeChips.push({ label: 'New In', clear: () => setNewInOnly(false) });
  if (minDiscount > 0) activeChips.push({ label: `${minDiscount}%+ Off`, clear: () => setMinDiscount(0) });
  selectedSizes.forEach(s => activeChips.push({ label: `Size ${s}`, clear: () => toggleSet(selectedSizes, s, setSelectedSizes) }));
  selectedBrands.forEach(b => activeChips.push({ label: b, clear: () => toggleSet(selectedBrands, b, setSelectedBrands) }));
  if (priceMax < 1000) activeChips.push({ label: `Under $${priceMax}`, clear: () => setPriceMax(1000) });

  function toggleCollapsed(name) {
    const next = new Set(collapsed);
    if (next.has(name)) next.delete(name); else next.add(name);
    setCollapsed(next);
  }
  const isOpen = name => !collapsed.has(name);

  function clearAll() {
    setMinDiscount(0);
    setSelectedSizes(new Set());
    setSelectedBrands(new Set());
    setNewInOnly(false);
    setPriceMax(1000);
  }

  const allSizes = ['XS', 'S', 'M', 'L', 'XL'];
  const discountTiers = [
    { v: 30, label: '30% off or more' },
    { v: 50, label: '50% off or more' },
    { v: 70, label: '70% off or more' },
  ];

  // Look accent config
  const LOOK_CONFIG = {
    'formal-wear': { accent: '#C9A84C' },
    'bohemian':    { accent: '#D4956A' },
    'casuals':     { accent: '#7EB8D4' },
  };

  if (!collection) {
    return (
      <div style={{ padding: '120px 20px', textAlign: 'center' }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Not Found</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 24 }}>Collection not found</h1>
        <button className="btn btn-gold" onClick={() => onNav('look', null, null, lookSlug || 'formal-wear')}>
          Back to Styles
        </button>
      </div>
    );
  }

  const accentColor = LOOK_CONFIG[look.slug]?.accent || 'var(--gold)';

  return (
    <main className="page fade-in">
      {/* ════════════════════════════════
          HERO BANNER
      ════════════════════════════════ */}
      <section style={{
        position: 'relative',
        height: '52vh',
        minHeight: 380,
        background: '#111',
        display: 'flex',
        alignItems: 'flex-end',
        color: '#fff',
        overflow: 'hidden'
      }}>
        {collection.hero_image && (
          <img
            src={collection.hero_image}
            alt={collection.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }}
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />

        <div className="container-wide" style={{ position: 'relative', zIndex: 1, paddingBottom: 48 }}>
          {/* Breadcrumb */}
          <div className="breadcrumb" style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 16 }}>
            <button
              onClick={() => onNav('home')}
              style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', padding: 0 }}
            >Home</button>
            <span style={{ opacity: 0.4 }}>›</span>
            <button
              onClick={() => onNav('look', null, null, look.slug)}
              style={{ background: 'none', border: 0, color: 'rgba(255,255,255,0.65)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', padding: 0 }}
            >{look.name}</button>
            <span style={{ opacity: 0.4 }}>›</span>
            <span style={{ color: '#fff' }}>{collection.title}</span>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: accentColor, marginBottom: 12 }}>
            Curated Collection · {look.name}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 5vw, 68px)', lineHeight: 1.04, letterSpacing: '-0.018em', margin: '0 0 16px' }}>
            {collection.title}
          </h1>
          {collection.description && (
            <p style={{ maxWidth: 520, fontSize: 15, lineHeight: 1.65, color: 'rgba(255,255,255,0.72)', margin: 0 }}>
              {collection.description}
            </p>
          )}
        </div>
      </section>

      {/* ════════════════════════════════
          SIDEBAR FILTER + GRID LAYOUT
          (same as CategoryPage / Maxi Dresses)
      ════════════════════════════════ */}
      <div className="container-wide">
        {/* Header row */}
        <div className="cat-header">
          <div className="cat-title-row">
            <h2 className="cat-title">{collection.title} <em className="serif-it" style={{ color: 'var(--gold-deep)' }}>edit</em></h2>
            <div className="cat-meta">
              <span className="mono">{filtered.length} of {baseProducts.length} items</span>
              {baseProducts.length > 0 && (
                <>
                  <span style={{ color: 'var(--ink-muted)' }}>·</span>
                  <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                    Avg discount {Math.round(baseProducts.reduce((s, p) => s + (p.discountPct || 0), 0) / baseProducts.length)}%
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="cat-layout">
          {/* ---- Sidebar Filters ---- */}
          <aside className="filter-side">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span className="mono" style={{ color: 'var(--ink)' }}>Filter</span>
              {activeChips.length > 0 && (
                <button onClick={clearAll} className="mono" style={{ color: 'var(--ink-soft)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  Clear all
                </button>
              )}
            </div>

            {/* Discount */}
            <div className="filter-group">
              <div className={`filter-head ${!isOpen('discount') ? 'collapsed' : ''}`} onClick={() => toggleCollapsed('discount')}>
                Discount <Icon.Chevron />
              </div>
              <div className={`filter-body ${!isOpen('discount') ? 'collapsed' : ''}`}>
                {discountTiers.map(t => (
                  <label
                    key={t.v}
                    className={`filter-row ${minDiscount === t.v ? 'active' : ''}`}
                    onClick={() => setMinDiscount(minDiscount === t.v ? 0 : t.v)}
                  >
                    <input type="checkbox" checked={minDiscount === t.v} readOnly />
                    <span>{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="filter-group">
              <div className={`filter-head ${!isOpen('price') ? 'collapsed' : ''}`} onClick={() => toggleCollapsed('price')}>
                Price <Icon.Chevron />
              </div>
              <div className={`filter-body ${!isOpen('price') ? 'collapsed' : ''}`}>
                <div className="price-slider">
                  <input
                    type="range" min={50} max={1000} step={25} value={priceMax}
                    onChange={e => setPriceMax(parseInt(e.target.value, 10))}
                    style={{ width: '100%', accentColor: 'var(--ink)' }}
                  />
                  <div className="price-vals">
                    <span>$50</span>
                    <span style={{ color: 'var(--ink)' }}>up to ${priceMax}{priceMax === 1000 ? '+' : ''}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Size */}
            <div className="filter-group">
              <div className={`filter-head ${!isOpen('size') ? 'collapsed' : ''}`} onClick={() => toggleCollapsed('size')}>
                Size <Icon.Chevron />
              </div>
              <div className={`filter-body ${!isOpen('size') ? 'collapsed' : ''}`}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {allSizes.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleSet(selectedSizes, s, setSelectedSizes)}
                      style={{
                        width: 40, height: 40,
                        border: selectedSizes.has(s) ? '1px solid var(--ink)' : '1px solid var(--line-strong)',
                        background: selectedSizes.has(s) ? 'var(--ink)' : 'transparent',
                        color: selectedSizes.has(s) ? 'var(--bg)' : 'var(--ink)',
                        fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
                        transition: 'all 180ms ease', cursor: 'pointer',
                      }}
                    >{s}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Brand */}
            <div className="filter-group">
              <div className={`filter-head ${!isOpen('brand') ? 'collapsed' : ''}`} onClick={() => toggleCollapsed('brand')}>
                Brand <Icon.Chevron />
              </div>
              <div className={`filter-body ${!isOpen('brand') ? 'collapsed' : ''}`} style={{ maxHeight: 220, overflow: 'auto' }}>
                {[...brandCounts.entries()].map(([brand, count]) => (
                  <label
                    key={brand}
                    className={`filter-row ${selectedBrands.has(brand) ? 'active' : ''}`}
                    onClick={() => toggleSet(selectedBrands, brand, setSelectedBrands)}
                  >
                    <input type="checkbox" checked={selectedBrands.has(brand)} readOnly />
                    <span>{brand}</span>
                    <span className="count">{count}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* New In */}
            <div className="filter-group">
              <label
                className={`filter-row ${newInOnly ? 'active' : ''}`}
                onClick={() => setNewInOnly(!newInOnly)}
                style={{ fontSize: 13, fontWeight: 600 }}
              >
                <input type="checkbox" checked={newInOnly} readOnly />
                <span>New In (last 48 hrs)</span>
              </label>
            </div>
          </aside>

          {/* ---- Results Grid ---- */}
          <section>
            <div className="cat-toolbar">
              <div className="cat-active-chips">
                {activeChips.length === 0 ? (
                  <span className="mono" style={{ color: 'var(--ink-muted)' }}>No filters applied</span>
                ) : (
                  activeChips.map((c, i) => (
                    <button key={i} className="chip" onClick={c.clear}>
                      {c.label} <span className="x">×</span>
                    </button>
                  ))
                )}
              </div>
              <div className="sort-select">
                <span>Sort by</span>
                <select value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="curated">Curated Order</option>
                  <option value="discount">Biggest Discount</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <Icon.Chevron />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: 'var(--pad-2xl) 0', textAlign: 'center' }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>No matches</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 16, letterSpacing: '-0.015em' }}>
                  Nothing fits those filters right now.
                </h3>
                <p style={{ color: 'var(--ink-soft)', marginBottom: 24 }}>Try loosening up a touch.</p>
                <button className="btn btn-outline" onClick={clearAll}>Clear all filters</button>
              </div>
            ) : (
              <div className="product-grid cols-3">
                {filtered.slice(0, visibleCount).map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    variant={cardVariant}
                    isWishlisted={wishlist.has(p.id)}
                    onToggleWishlist={onToggleWishlist}
                    onShop={onShop}
                    onNav={onNav}
                  />
                ))}
              </div>
            )}

            {filtered.length > visibleCount && (
              <div style={{ textAlign: 'center', marginTop: 'var(--pad-xl)' }}>
                <button className="btn btn-outline" onClick={() => setVisibleCount(c => c + 12)}>Load more</button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

Object.assign(window, { CollectionPage });

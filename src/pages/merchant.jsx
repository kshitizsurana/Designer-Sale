/* global React, Icon, ProductCard */
// Merchant / Boutique Landing Page — full sidebar filter layout matching CategoryPage

const { useState: useStateMerch, useMemo: useMemeMerch } = React;

function MerchantPage({ merchantId, data, cardVariant, wishlist, onToggleWishlist, onShop, onNav }) {
  const merchant = data.merchants.find(m => m.id === merchantId);
  const rawProducts = data.products.filter(p => p.merchantId === merchantId);

  // ---- Filters ----
  const [selectedCat, setSelectedCat]       = useStateMerch('all');
  const [minDiscount, setMinDiscount]       = useStateMerch(0);
  const [selectedSizes, setSelectedSizes]   = useStateMerch(new Set());
  const [selectedBrands, setSelectedBrands] = useStateMerch(new Set());
  const [priceMax, setPriceMax]             = useStateMerch(1000);
  const [sort, setSort]                     = useStateMerch('latest');
  const [collapsed, setCollapsed]           = useStateMerch(new Set());
  const [visibleCount, setVisibleCount]     = useStateMerch(12);

  if (!merchant) {
    return (
      <main>
        <div className="container-wide" style={{ padding: 'var(--pad-2xl) 0', textAlign: 'center' }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Not found</div>
          <h1 className="cat-title">Boutique not found.</h1>
          <button className="btn btn-outline" style={{ marginTop: 24 }} onClick={() => onNav('boutiques')}>View all boutiques</button>
        </div>
      </main>
    );
  }

  const toggleSet = (set, val, fn) => {
    const next = new Set(set);
    if (next.has(val)) next.delete(val); else next.add(val);
    fn(next);
  };

  const toggleCollapsed = (name) => {
    const next = new Set(collapsed);
    if (next.has(name)) next.delete(name); else next.add(name);
    setCollapsed(next);
  };
  const isOpen = name => !collapsed.has(name);

  // ---- Derived filter data from boutique products ----
  const catIds = [...new Set(rawProducts.map(p => p.category))];
  const catObjects = data.categories.filter(c => catIds.includes(c.id));

  const brandCounts = useMemeMerch(() => {
    const m = new Map();
    rawProducts.forEach(p => { if (p.brand) m.set(p.brand, (m.get(p.brand) || 0) + 1); });
    return m;
  }, [rawProducts]);

  const allSizes = ['XS', 'S', 'M', 'L', 'XL'];
  const discountTiers = [
    { v: 30, label: '30% off or more' },
    { v: 50, label: '50% off or more' },
    { v: 70, label: '70% off or more' },
  ];

  // ---- Apply filters ----
  const filtered = useMemeMerch(() => {
    let out = rawProducts.slice();
    if (selectedCat !== 'all')    out = out.filter(p => p.category === selectedCat);
    if (minDiscount > 0)          out = out.filter(p => (p.discountPct || 0) >= minDiscount);
    if (selectedSizes.size)       out = out.filter(p => (p.sizes || []).some(s => selectedSizes.has(s)));
    if (selectedBrands.size)      out = out.filter(p => selectedBrands.has(p.brand));
    if (priceMax < 5000)          out = out.filter(p => p.sale <= priceMax);

    if (sort === 'price-low')      out.sort((a, b) => a.sale - b.sale);
    else if (sort === 'price-high') out.sort((a, b) => b.sale - a.sale);
    else if (sort === 'discount')   out.sort((a, b) => b.discountPct - a.discountPct);
    else                            out.sort((a, b) => (b.added || 0) - (a.added || 0));
    return out;
  }, [rawProducts, selectedCat, minDiscount, selectedSizes, selectedBrands, priceMax, sort]);

  // ---- Active filter chips ----
  const activeChips = [];
  if (selectedCat !== 'all') {
    const cat = catObjects.find(c => c.id === selectedCat);
    activeChips.push({ label: cat?.label || selectedCat, clear: () => setSelectedCat('all') });
  }
  if (minDiscount > 0) activeChips.push({ label: `${minDiscount}%+ Off`, clear: () => setMinDiscount(0) });
  selectedSizes.forEach(s => activeChips.push({ label: `Size ${s}`, clear: () => toggleSet(selectedSizes, s, setSelectedSizes) }));
  selectedBrands.forEach(b => activeChips.push({ label: b, clear: () => toggleSet(selectedBrands, b, setSelectedBrands) }));
  if (priceMax < 1000) activeChips.push({ label: `Under $${priceMax}`, clear: () => setPriceMax(1000) });

  function clearAll() {
    setSelectedCat('all');
    setMinDiscount(0);
    setSelectedSizes(new Set());
    setSelectedBrands(new Set());
    setPriceMax(1000);
  }

  const avgDiscount = rawProducts.length
    ? Math.round(rawProducts.reduce((s, p) => s + (p.discountPct || 0), 0) / rawProducts.length)
    : 0;

  return (
    <main>
      {/* ── Boutique Hero ── */}
      <section style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--line)', padding: 'var(--pad-xl) 0' }}>
        <div className="container-wide">
          {/* Breadcrumb */}
          <div className="breadcrumb" style={{ marginBottom: 20 }}>
            <a href="#/" onClick={e => { e.preventDefault(); onNav('home'); }}>Home</a>
            <span className="sep">/</span>
            <a href="#/boutiques" onClick={e => { e.preventDefault(); onNav('boutiques'); }}>Boutiques</a>
            <span className="sep">/</span>
            <span style={{ color: 'var(--ink)' }}>{merchant.name}</span>
          </div>

          <div style={{ display: 'flex', gap: 'var(--pad-xl)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Left: boutique info */}
            <div style={{ flex: '1 1 420px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                {/* Monogram logo */}
                <div style={{
                  width: 72, height: 72, background: 'var(--ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--gold-soft)',
                  fontStyle: 'italic', flexShrink: 0,
                }}>
                  {merchant.name.split(' ').slice(0, 3).map(w => w[0]).join('')}
                </div>
                <div>
                  <h1 style={{
                    fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.5vw, 44px)',
                    lineHeight: 1.05, letterSpacing: '-0.015em', marginBottom: 8,
                  }}>
                    {merchant.name}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span className="mono" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ink-soft)', fontSize: 12 }}>
                      <Icon.Pin /> {merchant.city}{merchant.state ? `, ${merchant.state}` : ''}
                    </span>
                    {merchant.online && <span className="pill pill-ink" style={{ fontSize: 9 }}>● Online</span>}
                    {merchant.inStore && <span className="pill pill-cream" style={{ fontSize: 9 }}>● In-store</span>}
                  </div>
                </div>
              </div>

              <p style={{ color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.65, maxWidth: 560, marginBottom: 20 }}>
                {merchant.description || `${merchant.name} is a premium Australian boutique${merchant.focus ? ` specialising in ${merchant.focus.toLowerCase()}` : ''}.`}
              </p>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: 28, marginBottom: 20, flexWrap: 'wrap' }}>
                {merchant.focus && (
                  <span className="pill pill-gold" style={{ fontSize: 11 }}>{merchant.focus}</span>
                )}
                <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <strong style={{ color: 'var(--gold-deep)', fontFamily: 'var(--font-body)', fontSize: 18 }}>{rawProducts.length}</strong> items on sale
                </span>
                {avgDiscount > 0 && (
                  <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <strong style={{ color: 'var(--gold-deep)', fontFamily: 'var(--font-body)', fontSize: 18 }}>{avgDiscount}%</strong> avg discount
                  </span>
                )}
              </div>

              {/* Links */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {merchant.website && (
                  <a href={merchant.website} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                    Visit website <Icon.ExternalLink />
                  </a>
                )}
                {merchant.email && (
                  <a href={`mailto:${merchant.email}`} className="btn btn-ghost btn-sm">
                    <Icon.Mail /> Contact boutique
                  </a>
                )}
              </div>
            </div>

            {/* Right: categories carried */}
            {catObjects.length > 0 && (
              <div style={{ minWidth: 200 }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Categories</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {catObjects.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCat(c.id); document.querySelector('.cat-layout')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                      style={{
                        fontFamily: 'var(--font-body)', fontSize: 13, padding: '8px 14px',
                        textAlign: 'left', background: selectedCat === c.id ? 'var(--ink)' : 'transparent',
                        color: selectedCat === c.id ? 'var(--bg)' : 'var(--ink)',
                        border: '1px solid var(--line)', borderRadius: 4, cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        transition: 'all 180ms ease',
                      }}
                    >
                      <span>{c.label}</span>
                      <span style={{ fontSize: 11, opacity: 0.6 }}>{rawProducts.filter(p => p.category === c.id).length}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Filter + Product Grid (same layout as CategoryPage) ── */}
      <div className="container-wide">
        {/* Results header */}
        <div className="cat-header" style={{ paddingTop: 'var(--pad-lg)' }}>
          <div className="cat-title-row">
            <h2 className="cat-title">
              {selectedCat === 'all'
                ? <>{merchant.name} <em className="serif-it" style={{ color: 'var(--gold-deep)' }}>on sale</em></>
                : <>{catObjects.find(c => c.id === selectedCat)?.label || selectedCat} <em className="serif-it" style={{ color: 'var(--gold-deep)' }}>from {merchant.name}</em></>
              }
            </h2>
            <div className="cat-meta">
              <span className="mono">{filtered.length} of {rawProducts.length} items</span>
              {avgDiscount > 0 && <>
                <span style={{ color: 'var(--ink-muted)' }}>·</span>
                <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Avg {avgDiscount}% off</span>
              </>}
            </div>
          </div>
        </div>

        <div className="cat-layout">
          {/* ── Sidebar Filters ── */}
          <aside className="filter-side">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span className="mono" style={{ color: 'var(--ink)' }}>Filter</span>
              {activeChips.length > 0 && (
                <button onClick={clearAll} className="mono" style={{ color: 'var(--ink-soft)', textDecoration: 'underline', textUnderlineOffset: 3, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Clear all
                </button>
              )}
            </div>

            {/* Category filter */}
            {catObjects.length > 1 && (
              <div className="filter-group">
                <div className={`filter-head ${!isOpen('category') ? 'collapsed' : ''}`} onClick={() => toggleCollapsed('category')}>
                  Category <Icon.Chevron />
                </div>
                <div className={`filter-body ${!isOpen('category') ? 'collapsed' : ''}`}>
                  <label
                    className={`filter-row ${selectedCat === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCat('all')}
                  >
                    <input type="checkbox" checked={selectedCat === 'all'} readOnly />
                    <span>All categories</span>
                    <span className="count">{rawProducts.length}</span>
                  </label>
                  {catObjects.map(c => (
                    <label
                      key={c.id}
                      className={`filter-row ${selectedCat === c.id ? 'active' : ''}`}
                      onClick={() => setSelectedCat(c.id)}
                    >
                      <input type="checkbox" checked={selectedCat === c.id} readOnly />
                      <span>{c.label}</span>
                      <span className="count">{rawProducts.filter(p => p.category === c.id).length}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Discount filter */}
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

            {/* Price filter */}
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

            {/* Size filter */}
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

            {/* Brand filter */}
            {brandCounts.size > 0 && (
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
            )}
          </aside>

          {/* ── Results ── */}
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
                  <option value="latest">Latest</option>
                  <option value="discount">Biggest discount</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                </select>
                <Icon.Chevron />
              </div>
            </div>

            {rawProducts.length === 0 ? (
              <div style={{ padding: 'var(--pad-2xl) 0', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🛍️</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 12 }}>
                  No products on sale right now.
                </h3>
                <p style={{ color: 'var(--ink-soft)', marginBottom: 24 }}>
                  Check back soon — new drops from {merchant.name} land every week.
                </p>
                <button className="btn btn-outline" onClick={() => onNav('boutiques')}>Browse all boutiques</button>
              </div>
            ) : filtered.length === 0 ? (
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
                <button className="btn btn-outline" onClick={() => setVisibleCount(c => c + 12)}>
                  Load more ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

Object.assign(window, { MerchantPage });

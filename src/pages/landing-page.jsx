/* global React, ProductCard, Icon */

const { useState, useEffect, useMemo } = React;

function LandingPage({ landingPageId, data, wishlist, onToggleWishlist, onShop, onNav, cardVariant }) {
  const pageData = useMemo(() => {
    if (!data?.landing_pages) return null;
    if (window.DSUtils && window.DSUtils.resolveLandingPage) {
      return window.DSUtils.resolveLandingPage(data.landing_pages, landingPageId);
    }
    return data.landing_pages.find(lp => lp.id === landingPageId) || null;
  }, [data, landingPageId]);

  const baseProducts = useMemo(() => {
    if (!pageData || !data?.products) return [];
    const rules = pageData.filter_rules || {};
    return data.products.filter(p => {
      if (pageData.products && pageData.products.includes(p.id)) return true;
      if (rules.minDiscount && (p.discountPct || 0) < Number(rules.minDiscount)) return false;
      if (Array.isArray(rules.brandIds) && rules.brandIds.length > 0 && !rules.brandIds.includes(p.brandId)) return false;
      if (Array.isArray(rules.categoryIds) && rules.categoryIds.length > 0 && !rules.categoryIds.includes(p.category)) return false;
      if (pageData.look_id) {
        if (p.look_id === pageData.look_id) return true;
        const pMerchant = data.merchants?.find(m => m.id === p.merchantId);
        if (pMerchant && pMerchant.look_id === pageData.look_id) return true;
      }
      return Boolean(rules.minDiscount || rules.brandIds?.length || rules.categoryIds?.length);
    });
  }, [pageData, data]);

  // ---- Filters ----
  const [minDiscount, setMinDiscount]   = useState(0);       // 0 / 30 / 50 / 70
  const [selectedSizes, setSelectedSizes] = useState(new Set());
  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [newInOnly, setNewInOnly]       = useState(false);
  const [priceMax, setPriceMax]         = useState(800);     // cap
  const [sort, setSort]                 = useState('latest');
  const [collapsed, setCollapsed]       = useState(new Set());

  const toggleSet = (set, val, fn) => {
    const next = new Set(set);
    if (next.has(val)) next.delete(val); else next.add(val);
    fn(next);
  };

  // ---- Apply filters ----
  const filteredProducts = useMemo(() => {
    let out = baseProducts.slice();
    if (minDiscount > 0) out = out.filter(p => p.discountPct >= minDiscount);
    if (newInOnly)       out = out.filter(p => p.newIn);
    if (selectedSizes.size) out = out.filter(p => p.sizes.some(s => selectedSizes.has(s)));
    if (selectedBrands.size) out = out.filter(p => selectedBrands.has(p.brand));
    out = out.filter(p => p.sale <= priceMax);

    if (sort === 'price-low') out.sort((a,b) => a.sale - b.sale);
    else if (sort === 'price-high') out.sort((a,b) => b.sale - a.sale);
    else if (sort === 'discount') out.sort((a,b) => b.discountPct - a.discountPct);
    else out.sort((a,b) => (b.added || 0) - (a.added || 0));
    return out;
  }, [baseProducts, minDiscount, newInOnly, selectedSizes, selectedBrands, priceMax, sort]);

  // ---- Active chips ----
  const activeChips = [];
  if (newInOnly) activeChips.push({ label: 'New In', clear: () => setNewInOnly(false) });
  if (minDiscount > 0) activeChips.push({ label: `${minDiscount}%+ Off`, clear: () => setMinDiscount(0) });
  selectedSizes.forEach(s => activeChips.push({ label: `Size ${s}`, clear: () => toggleSet(selectedSizes, s, setSelectedSizes) }));
  selectedBrands.forEach(b => activeChips.push({ label: b, clear: () => toggleSet(selectedBrands, b, setSelectedBrands) }));
  if (priceMax < 800) activeChips.push({ label: `Under $${priceMax}`, clear: () => setPriceMax(800) });

  function toggleCollapsed(name) {
    const next = new Set(collapsed);
    if (next.has(name)) next.delete(name); else next.add(name);
    setCollapsed(next);
  }
  const isOpen = (name) => !collapsed.has(name);

  // Brand counts (from full page set)
  const brandCounts = useMemo(() => {
    const m = new Map();
    baseProducts.forEach(p => {
      if (p.brand) m.set(p.brand, (m.get(p.brand) || 0) + 1);
    });
    return m;
  }, [baseProducts]);

  const allSizes = ['XS','S','M','L','XL'];
  const discountTiers = [
    { v: 30, label: '30% off or more' },
    { v: 50, label: '50% off or more' },
    { v: 70, label: '70% off or more' },
  ];

  function clearAll() {
    setMinDiscount(0);
    setSelectedSizes(new Set());
    setSelectedBrands(new Set());
    setNewInOnly(false);
    setPriceMax(800);
  }

  if (!data) {
    return <div className="page" style={{ display: 'flex', justifyContent: 'center', padding: 100, color: 'var(--ink-soft)' }}>Loading...</div>;
  }

  if (!pageData) {
    return (
      <div className="page" style={{ padding: 100, textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 16 }}>Page not found.</h2>
        <p style={{ color: 'var(--ink-soft)', marginBottom: 32 }}>This page may have moved or is no longer available.</p>
        <button className="btn btn-ink" onClick={() => onNav('home')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="page landing-page">
      {/* Hero Banner */}
      <section style={{
        position: 'relative',
        minHeight: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'var(--ink)'
      }}>
        {pageData.image && (
          <img
            src={pageData.image}
            alt={pageData.title}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', opacity: 0.5
            }}
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: '#fff', padding: '60px 24px', maxWidth: 800 }}>
          <div className="eyebrow" style={{ color: 'var(--gold-soft)', marginBottom: 16 }}>Curated Sale</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 72px)', marginBottom: 20, lineHeight: 1.05 }}>
            {pageData.title}
          </h1>
          {pageData.short_description && (
            <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', opacity: 0.9, maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.6 }}>
              {pageData.short_description}
            </p>
          )}
          <div style={{ display: 'inline-flex', gap: 8, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(6px)', borderRadius: 999, padding: '8px 20px', fontSize: 14, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {baseProducts.length} {baseProducts.length === 1 ? 'piece' : 'pieces'} on sale
          </div>
        </div>
      </section>

      {/* Products with Sidebar */}
      <div className="container-wide" style={{ padding: 'var(--pad-2xl) 0' }}>
        <div className="cat-layout">
          {/* ---- Sidebar filters ---- */}
          <aside className="filter-side">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span className="mono" style={{ color: 'var(--ink)' }}>Filter</span>
              {activeChips.length > 0 && (
                <button onClick={clearAll} className="mono" style={{ color: 'var(--ink-soft)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  Clear all
                </button>
              )}
            </div>

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

            <div className="filter-group">
              <div className={`filter-head ${!isOpen('price') ? 'collapsed' : ''}`} onClick={() => toggleCollapsed('price')}>
                Price <Icon.Chevron />
              </div>
              <div className={`filter-body ${!isOpen('price') ? 'collapsed' : ''}`}>
                <div className="price-slider">
                  <input
                    type="range" min={50} max={1000} step={25} value={priceMax}
                    onChange={(e) => setPriceMax(parseInt(e.target.value, 10))}
                    style={{ width: '100%', accentColor: 'var(--ink)' }}
                  />
                  <div className="price-vals">
                    <span>$50</span>
                    <span style={{ color: 'var(--ink)' }}>up to ${priceMax}{priceMax === 1000 ? '+' : ''}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="filter-group">
              <div className={`filter-head ${!isOpen('size') ? 'collapsed' : ''}`} onClick={() => toggleCollapsed('size')}>
                Size <Icon.Chevron />
              </div>
              <div className={`filter-body ${!isOpen('size') ? 'collapsed' : ''}`}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {allSizes.map(s => (
                    <button
                      key={s}
                      className={`btn-size ${selectedSizes.has(s) ? 'active' : ''}`}
                      onClick={() => toggleSet(selectedSizes, s, setSelectedSizes)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="filter-group">
              <div className={`filter-head ${!isOpen('brand') ? 'collapsed' : ''}`} onClick={() => toggleCollapsed('brand')}>
                Brand <Icon.Chevron />
              </div>
              <div className={`filter-body ${!isOpen('brand') ? 'collapsed' : ''}`}>
                {Array.from(brandCounts.entries()).sort((a,b) => a[0].localeCompare(b[0])).map(([b, count]) => (
                  <label key={b} className={`filter-row ${selectedBrands.has(b) ? 'active' : ''}`} onClick={() => toggleSet(selectedBrands, b, setSelectedBrands)}>
                    <input type="checkbox" checked={selectedBrands.has(b)} readOnly />
                    <span>{b}</span>
                    <span className="count">{count}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* ---- Main content ---- */}
          <div className="cat-main">
            <div className="cat-toolbar">
              <div className="active-chips" style={{ minHeight: 32 }}>
                {activeChips.length > 0 ? (
                  activeChips.map((c, i) => (
                    <div key={i} className="chip">
                      {c.label} <button onClick={c.clear}><Icon.Close /></button>
                    </div>
                  ))
                ) : (
                  <span className="mono" style={{ color: 'var(--ink-muted)' }}>NO FILTERS APPLIED</span>
                )}
              </div>
              <div className="cat-sort">
                <span className="mono" style={{ color: 'var(--ink-muted)', marginRight: 12 }}>SORT BY</span>
                <select value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="latest">LATEST</option>
                  <option value="price-low">PRICE: LOW TO HIGH</option>
                  <option value="price-high">PRICE: HIGH TO LOW</option>
                  <option value="discount">BIGGEST DISCOUNT</option>
                </select>
                <Icon.Chevron style={{ position: 'absolute', right: 12, top: 12, pointerEvents: 'none' }} />
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="product-grid">
                {filteredProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    variant={cardVariant}
                    isWishlisted={wishlist?.has(p.id)}
                    onToggleWishlist={onToggleWishlist}
                    onShop={onShop}
                    onNav={onNav}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '100px 20px', border: '1px dashed var(--line)' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>🔍</div>
                <p style={{ fontSize: 16, color: 'var(--ink)' }}>No items match your filters.</p>
                <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={clearAll}>Clear filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

window.LandingPage = LandingPage;

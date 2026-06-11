/* global React, Icon, ProductCard */

const { useState: useStateCat, useMemo: useMemoCat } = React;

function CategoryPage({ data, categoryId, cardVariant, wishlist, onToggleWishlist, onShop, onNav }) {
  const category = data.categories.find(c => c.id === categoryId);
  if (!category) return <div style={{ padding: '100px', textAlign: 'center' }}>Category not found</div>;

  const baseProducts = data.products.filter(p => p.category === category.id);

  // ---- Filters ----
  const [minDiscount, setMinDiscount]   = useStateCat(0);       // 0 / 30 / 50 / 70
  const [selectedSizes, setSelectedSizes] = useStateCat(new Set());
  const [selectedBrands, setSelectedBrands] = useStateCat(new Set());
  const [newInOnly, setNewInOnly]       = useStateCat(false);
  const [priceMax, setPriceMax]         = useStateCat(800);     // cap
  const [sort, setSort]                 = useStateCat('latest');
  const [collapsed, setCollapsed]       = useStateCat(new Set());
  const [visibleCount, setVisibleCount] = useStateCat(12);

  const toggleSet = (set, val, fn) => {
    const next = new Set(set);
    if (next.has(val)) next.delete(val); else next.add(val);
    fn(next);
  };

  // ---- Apply ----
  const filtered = useMemoCat(() => {
    let out = baseProducts.slice();
    if (minDiscount > 0) out = out.filter(p => p.discountPct >= minDiscount);
    if (newInOnly)       out = out.filter(p => p.newIn);
    if (selectedSizes.size) out = out.filter(p => p.sizes.some(s => selectedSizes.has(s)));
    if (selectedBrands.size) out = out.filter(p => selectedBrands.has(p.brand));
    out = out.filter(p => p.sale <= priceMax);

    if (sort === 'price-low') out.sort((a,b) => a.sale - b.sale);
    else if (sort === 'price-high') out.sort((a,b) => b.sale - a.sale);
    else if (sort === 'discount') out.sort((a,b) => b.discountPct - a.discountPct);
    else out.sort((a,b) => a.added - b.added);
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

  // Brand counts (from full category set)
  const brandCounts = useMemoCat(() => {
    const m = new Map();
    baseProducts.forEach(p => m.set(p.brand, (m.get(p.brand) || 0) + 1));
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

  return (
    <main>
      <div className="container-wide">
        <div className="cat-header">
          <div className="breadcrumb">
            <a href="#/" onClick={(e)=>{e.preventDefault(); onNav('home');}}>Home</a>
            <span className="sep">/</span>
            <span>Sale</span>
            <span className="sep">/</span>
            <span style={{ color: 'var(--ink)' }}>{category.label}</span>
          </div>
          <div className="cat-title-row">
            <h1 className="cat-title">{category.label} <em className="serif-it" style={{ color: 'var(--gold-deep)' }}>on sale</em></h1>
            <div className="cat-meta">
              <span className="mono">{filtered.length} of {baseProducts.length} items</span>
              <span style={{ color: 'var(--ink-muted)' }}>·</span>
              <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Avg discount {Math.round(baseProducts.reduce((s,p)=>s+p.discountPct,0)/Math.max(1,baseProducts.length))}%</span>
            </div>
          </div>
        </div>

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
                        transition: 'all 180ms ease',
                      }}
                    >{s}</button>
                  ))}
                </div>
              </div>
            </div>

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

          {/* ---- Results ---- */}
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
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="latest">Latest</option>
                  <option value="discount">Biggest discount</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
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

Object.assign(window, { CategoryPage });

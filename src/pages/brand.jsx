/* global React, Icon, ProductCard */
// Brand Landing Page — all products from a specific brand

const { useState: useStateBrand, useMemo: useMemoBrand } = React;

function BrandPage({ brandId, data, cardVariant, wishlist, onToggleWishlist, onShop, onNav }) {
  const [sortBy, setSortBy] = useStateBrand('latest');
  const [selectedCat, setSelectedCat] = useStateBrand('all');

  const brand = data.brands.find(b => b.id === brandId);
  const rawProducts = data.products.filter(p => p.brandId === brandId);

  if (!brand) {
    return (
      <main>
        <div className="container-wide" style={{ padding: 'var(--pad-2xl) 0', textAlign: 'center' }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Not found</div>
          <h1 className="cat-title">Brand not found.</h1>
          <button className="btn btn-outline" style={{ marginTop: 24 }} onClick={() => onNav('home')}>Back to home</button>
        </div>
      </main>
    );
  }

  // Find which merchants carry this brand
  const merchantIds = [...new Set(rawProducts.map(p => p.merchantId))];
  const merchants = merchantIds.map(id => window.DB.merchants.get(id)).filter(Boolean).slice(0, 6);

  // Categories this brand appears in
  const catIds = [...new Set(rawProducts.map(p => p.category))];
  const catObjects = data.categories.filter(c => catIds.includes(c.id));

  const filtered = useMemoBrand(() => {
    let out = rawProducts.slice();
    if (selectedCat !== 'all') out = out.filter(p => p.category === selectedCat);
    if (sortBy === 'price-low') out.sort((a, b) => a.sale - b.sale);
    else if (sortBy === 'price-high') out.sort((a, b) => b.sale - a.sale);
    else if (sortBy === 'discount') out.sort((a, b) => b.discountPct - a.discountPct);
    else out.sort((a, b) => (b.added || 0) - (a.added || 0));
    return out;
  }, [rawProducts, selectedCat, sortBy]);

  return (
    <main>
      {/* Brand hero */}
      <section style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--line)', padding: 'var(--pad-2xl) 0' }}>
        <div className="container-wide">
          <div className="breadcrumb" style={{ marginBottom: 24 }}>
            <a href="#/" onClick={(e) => { e.preventDefault(); onNav('home'); }}>Home</a>
            <span className="sep">/</span>
            <span style={{ color: 'var(--ink)' }}>Brands</span>
            <span className="sep">/</span>
            <span style={{ color: 'var(--ink)' }}>{brand.name}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pad-2xl)', alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Designer brand</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: 1, letterSpacing: '-0.018em', marginBottom: 20 }}>
                {brand.name}
              </h1>
              <p style={{ color: 'var(--ink-soft)', fontSize: 16, lineHeight: 1.65, maxWidth: 500, marginBottom: 28 }}>
                {brand.description || `Premium Australian fashion label with a focus on quality craftsmanship and timeless design.`}
              </p>
              <div style={{ display: 'flex', gap: 24, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                <span><strong style={{ color: 'var(--gold-deep)', fontSize: 18, fontFamily: 'var(--font-body)' }}>{rawProducts.length}</strong> items on sale</span>
                <span><strong style={{ color: 'var(--gold-deep)', fontSize: 18, fontFamily: 'var(--font-body)' }}>{merchants.length}</strong> boutiques</span>
                {brand.founded && <span>Est. {brand.founded}</span>}
              </div>
            </div>
            {/* Brand initials card */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 220, height: 220, background: 'var(--bg-elevated)',
                border: '1px solid var(--line-strong)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, color: 'var(--gold)', lineHeight: 1, fontStyle: 'italic' }}>
                  {brand.name.split(' ').map(w => w[0]).join('').slice(0, 3)}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                  {brand.country === 'AU' ? 'Australian label' : 'Designer label'}
                </div>
              </div>
            </div>
          </div>

          {/* Stocked by boutiques */}
          {merchants.length > 0 && (
            <div style={{ marginTop: 'var(--pad-xl)', paddingTop: 'var(--pad-lg)', borderTop: '1px solid var(--line)' }}>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Stocked by</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {merchants.map(m => (
                  <button
                    key={m.id}
                    className="pill pill-cream"
                    onClick={() => onNav('merchant', null, null, m.id)}
                    style={{ fontSize: 12, padding: '8px 14px' }}
                  >
                    <Icon.Pin style={{ opacity: 0.6, marginRight: 4 }} />
                    {m.name} · {m.city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Product grid */}
      <div className="container-wide">
        <div style={{ padding: 'var(--pad-lg) 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', flexWrap: 'wrap', gap: 16 }}>
          {/* Category filter chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className="chip"
              style={{ background: selectedCat === 'all' ? 'var(--ink)' : 'transparent', color: selectedCat === 'all' ? 'var(--bg)' : 'var(--ink)', borderColor: selectedCat === 'all' ? 'var(--ink)' : 'var(--line-strong)' }}
              onClick={() => setSelectedCat('all')}
            >All ({rawProducts.length})</button>
            {catObjects.map(c => (
              <button
                key={c.id}
                className="chip"
                style={{ background: selectedCat === c.id ? 'var(--ink)' : 'transparent', color: selectedCat === c.id ? 'var(--bg)' : 'var(--ink)', borderColor: selectedCat === c.id ? 'var(--ink)' : 'var(--line-strong)' }}
                onClick={() => setSelectedCat(c.id)}
              >{c.label}</button>
            ))}
          </div>

          {/* Sort */}
          <div className="sort-select">
            <span>Sort by</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="latest">Latest</option>
              <option value="discount">Biggest discount</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
            <Icon.Chevron />
          </div>
        </div>

        <section style={{ padding: 'var(--pad-lg) 0 var(--pad-2xl)' }}>
          <div className="mono" style={{ color: 'var(--ink-muted)', marginBottom: 24 }}>{filtered.length} {filtered.length === 1 ? 'item' : 'items'} on sale</div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--pad-2xl) 0' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 32 }}>No items in this category.</h3>
              <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={() => setSelectedCat('all')}>View all categories</button>
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map(p => (
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
        </section>
      </div>
    </main>
  );
}

Object.assign(window, { BrandPage });

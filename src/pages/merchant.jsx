/* global React, Icon, ProductCard */
// Merchant / Boutique Landing Page

const { useState: useStateMerch, useMemo: useMemeMerch } = React;

function MerchantPage({ merchantId, data, cardVariant, wishlist, onToggleWishlist, onShop, onNav }) {
  const [selectedCat, setSelectedCat] = useStateMerch('all');
  const [sortBy, setSortBy] = useStateMerch('latest');

  const merchant = data.merchants.find(m => m.id === merchantId);
  const rawProducts = data.products.filter(p => p.merchantId === merchantId);

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

  const catIds = [...new Set(rawProducts.map(p => p.category))];
  const catObjects = data.categories.filter(c => catIds.includes(c.id));
  const brandIds = [...new Set(rawProducts.map(p => p.brandId))];
  const brands = brandIds.map(id => data.brands.find(b => b.id === id)).filter(Boolean).slice(0, 8);

  const filtered = useMemeMerch(() => {
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
      {/* Boutique hero */}
      <section style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--line)', padding: 'var(--pad-xl) 0' }}>
        <div className="container-wide">
          <div className="breadcrumb" style={{ marginBottom: 20 }}>
            <a href="#/" onClick={(e) => { e.preventDefault(); onNav('home'); }}>Home</a>
            <span className="sep">/</span>
            <a href="#/boutiques" onClick={(e) => { e.preventDefault(); onNav('boutiques'); }}>Boutiques</a>
            <span className="sep">/</span>
            <span style={{ color: 'var(--ink)' }}>{merchant.name}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--pad-xl)', alignItems: 'start', flexWrap: 'wrap' }}>
            <div>
              {/* Logo initials */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                <div style={{
                  width: 72, height: 72, background: 'var(--bg-elevated)',
                  border: '1px solid var(--line-strong)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--gold)',
                  fontStyle: 'italic',
                }}>
                  {merchant.name.split(' ').slice(0, 3).map(w => w[0]).join('')}
                </div>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 48px)', lineHeight: 1.05, letterSpacing: '-0.015em', marginBottom: 8 }}>
                    {merchant.name}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span className="mono" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ink-soft)' }}>
                      <Icon.Pin /> {merchant.city}, {merchant.state}
                    </span>
                    {merchant.online && <span className="pill pill-ink" style={{ fontSize: 9 }}>● Online</span>}
                    {merchant.inStore && <span className="pill pill-cream" style={{ fontSize: 9 }}>● In-store</span>}
                  </div>
                </div>
              </div>

              <p style={{ color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.65, maxWidth: 560, marginBottom: 20 }}>
                {merchant.description || `${merchant.name} is a premium Australian boutique specialising in ${merchant.focus.toLowerCase()}.`}
              </p>

              {/* Focus pill + stats */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                <span className="pill pill-gold" style={{ fontSize: 11 }}>{merchant.focus}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                  <strong style={{ color: 'var(--gold-deep)', fontFamily: 'var(--font-body)', fontSize: 16 }}>{rawProducts.length}</strong> items on sale
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                  <strong style={{ color: 'var(--gold-deep)', fontFamily: 'var(--font-body)', fontSize: 16 }}>{brands.length}</strong> brands
                </span>
              </div>

              {/* Contact row */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
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

            {/* Brands carried */}
            {brands.length > 0 && (
              <div style={{ minWidth: 220 }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Brands carried</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {brands.map(b => (
                    <button
                      key={b.id}
                      className="boutique-strip-item"
                      style={{ fontFamily: 'var(--font-display)', fontSize: 15, padding: '10px 14px', textAlign: 'left', justifyContent: 'flex-start', borderRight: 0, border: '1px solid var(--line)' }}
                      onClick={() => onNav('brand', null, null, b.id)}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <div className="container-wide">
        <div style={{ padding: 'var(--pad-lg) 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', flexWrap: 'wrap', gap: 16 }}>
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
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 32 }}>No items currently on sale.</h3>
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

Object.assign(window, { MerchantPage });

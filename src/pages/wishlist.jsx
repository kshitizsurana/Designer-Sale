/* global React, Icon, ProductCard */

function WishlistPage({ data, wishlist, cardVariant, onToggleWishlist, onShop, onNav }) {
  // Find products matching wishlist ids
  const items = data.products.filter(p => wishlist.has(p.id));

  return (
    <main>
      <div className="container-wide">
        <div className="cat-header">
          <div className="breadcrumb">
            <a href="#/" onClick={(e)=>{e.preventDefault(); onNav('home');}}>Home</a>
            <span className="sep">/</span>
            <span style={{ color: 'var(--ink)' }}>Wishlist</span>
          </div>
          <div className="cat-title-row">
            <h1 className="cat-title">Your<br/><em className="serif-it" style={{ color: 'var(--gold-deep)' }}>wishlist.</em></h1>
            <div className="cat-meta">
              <span className="mono">{items.length} saved {items.length === 1 ? 'piece' : 'pieces'}</span>
            </div>
          </div>
        </div>

        <section style={{ padding: 'var(--pad-lg) 0 var(--pad-2xl)' }}>
          {items.length === 0 ? (
            <div className="wishlist-empty">
              <div style={{
                width: 80, height: 80, margin: '0 auto 24px',
                borderRadius: 999,
                background: 'var(--bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--line)',
              }}>
                <Icon.Heart />
              </div>
              <h2>Nothing saved yet.</h2>
              <p>
                Tap the heart on any piece to save it here. Your wishlist stays in this browser — we'll let you know if anything you've saved drops in price.
              </p>
              <button className="btn btn-gold" onClick={() => onNav('category', 'maxi-dresses')}>
                Browse the May Edit
              </button>
            </div>
          ) : (
            <>
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--line)',
                padding: '18px 24px',
                marginBottom: 'var(--pad-lg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
              }}>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>Saved total</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>
                      ${items.reduce((s,p) => s + p.sale, 0).toLocaleString()}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--ink-muted)', textDecoration: 'line-through' }}>
                      ${items.reduce((s,p) => s + p.rrp, 0).toLocaleString()}
                    </span>
                    <span className="pill pill-gold">
                      You'd save ${(items.reduce((s,p) => s + p.rrp, 0) - items.reduce((s,p) => s + p.sale, 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => items.forEach(p => onToggleWishlist(p.id))}>
                    Clear all
                  </button>
                  <button className="btn btn-ink btn-sm" onClick={() => onNav('home', null, 'email')}>
                    Email me when these drop
                  </button>
                </div>
              </div>

              <div className="product-grid">
                {items.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    variant={cardVariant}
                    isWishlisted
                    onToggleWishlist={onToggleWishlist}
                    onShop={onShop}
                    onNav={onNav}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

Object.assign(window, { WishlistPage });

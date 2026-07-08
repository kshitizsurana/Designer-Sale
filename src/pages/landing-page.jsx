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

  const products = useMemo(() => {
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
        minHeight: 480,
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
            {products.length} {products.length === 1 ? 'piece' : 'pieces'} on sale
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section container-wide">
        <div className="section-head" style={{ marginBottom: 40 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>The Selection</div>
            <h2>{pageData.title}</h2>
          </div>
          <button className="btn btn-ghost" onClick={() => onNav('home')}>← Back to Home</button>
        </div>

        {products.length > 0 ? (
          <div className="product-grid">
            {products.map(p => (
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
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--ink-soft)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛍</div>
            <p style={{ fontSize: 18 }}>No products have been added to this sale yet.</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Check back soon or browse our other collections.</p>
            <button className="btn btn-ink" style={{ marginTop: 24 }} onClick={() => onNav('home')}>Browse All Sales</button>
          </div>
        )}
      </section>
    </div>
  );
}

window.LandingPage = LandingPage;

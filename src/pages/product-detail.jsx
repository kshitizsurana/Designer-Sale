/* global React, Icon, ProductCard, ProductImage */
// Product Detail Page — full product view with image, sizes, merchant info, related products

const { useState: useStatePD, useEffect: useEffectPD } = React;

function ProductDetailPage({ productId, data, cardVariant, wishlist, onToggleWishlist, onShop, onNav }) {
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [imgError, setImgError] = useState(false);

  // Find product via data
  const product = data.products.find(p => p.id === productId);

  if (!product) {
    return (
      <main>
        <div className="container-wide" style={{ padding: 'var(--pad-2xl) 0', textAlign: 'center' }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Not found</div>
          <h1 className="cat-title">Product not found.</h1>
          <button className="btn btn-outline" style={{ marginTop: 24 }} onClick={() => onNav('home')}>Back to home</button>
        </div>
      </main>
    );
  }

  const isWishlisted = wishlist.has(product.id);
  const brand = data.brands.find(b => b.id === product.brandId);
  const merchant = data.merchants.find(m => m.id === product.merchantId);

  // Related products (same brand, same category, exclude self)
  const relatedByBrand = data.products
    .filter(p => p.brandId === product.brandId && p.id !== product.id).slice(0, 4);
  const relatedByMerchant = data.products
    .filter(p => p.merchantId === product.merchantId && p.id !== product.id).slice(0, 4);

  // Multiple images simulation (use same image + variants for visual richness)
  const images = [product.image, product.image, product.image].filter(Boolean);

  const ph = product.placeholder || { lightness: 90, hue: 40 };

  return (
    <main>
      <div className="container-wide">
        {/* Breadcrumb */}
        <div className="cat-header" style={{ paddingBottom: 'var(--pad-md)' }}>
          <div className="breadcrumb">
            <a href="#/" onClick={(e) => { e.preventDefault(); onNav('home'); }}>Home</a>
            <span className="sep">/</span>
            <a href={`#/c/${product.category}`} onClick={(e) => { e.preventDefault(); onNav('category', product.category); }}>
              {data.categories.find(c => c.id === product.category)?.label || product.category}
            </a>
            <span className="sep">/</span>
            <span style={{ color: 'var(--ink)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.brand}</span>
          </div>
        </div>

        {/* Product layout */}
        <div className="pd-layout">
          {/* Images */}
          <div className="pd-images">
            <div className="pd-main-img">
              {product.image && !imgError ? (
                <img
                  src={product.image}
                  alt={`${product.brand} — ${product.title}`}
                  onError={() => setImgError(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '60%', aspectRatio: '4/5', background: `linear-gradient(160deg, oklch(${ph.lightness}% 0.04 ${ph.hue}) 0%, oklch(${ph.lightness - 14}% 0.06 ${ph.hue}) 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                    <span className="eyebrow" style={{ fontSize: 10 }}>editorial shot</span>
                  </div>
                </div>
              )}
              {/* Discount badge */}
              <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {product.newIn && <span className="pill pill-ink">New In</span>}
                {product.discountPct > 0 && <span className="pill pill-gold" style={{ fontSize: 12, padding: '6px 12px' }}>{product.discountPct}% Off</span>}
              </div>
            </div>
            {/* Thumbnail strip */}
            <div className="pd-thumbs">
              {[0, 1, 2].map(i => (
                <button
                  key={i}
                  className={`pd-thumb ${activeImg === i ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}
                  style={{ background: `linear-gradient(160deg, oklch(${ph.lightness - i * 3}% 0.04 ${ph.hue + i * 5}) 0%, oklch(${ph.lightness - 14 - i * 3}% 0.06 ${ph.hue + i * 5}) 100%)` }}
                >
                  {product.image && (
                    <img src={product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: activeImg === i ? 1 : 0.7 }} onError={() => {}} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="pd-info">
            {/* Brand link */}
            <button
              className="pd-brand-link"
              onClick={() => brand && onNav('brand', null, null, brand.id)}
            >
              {product.brand}
            </button>

            <h1 className="pd-title">{product.title}</h1>

            {/* Merchant */}
            <button
              className="pd-merchant-link"
              onClick={() => merchant && onNav('merchant', null, null, merchant.id)}
            >
              <Icon.Pin style={{ opacity: 0.6 }} /> {product.merchant}
              {merchant && <span style={{ marginLeft: 4 }}>· {merchant.city}, {merchant.state}</span>}
            </button>

            {/* Prices */}
            <div className="pd-prices">
              <span className="pd-sale">${product.sale}</span>
              <span className="pd-rrp">${product.rrp} RRP</span>
              <span className="pill pill-gold">{product.discountPct}% off</span>
            </div>

            <div className="pd-divider" />

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="pd-sizes">
                <div className="eyebrow" style={{ marginBottom: 6 }}>{product.brand}</div>
                <div className="pd-size-grid">
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      className={`pd-size-btn ${selectedSize === s ? 'active' : ''}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="pd-ctas">
              <button
                className="btn btn-gold"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  if (merchant && merchant.website) {
                    window.open(merchant.website, '_blank');
                  } else {
                    alert(`Redirecting to ${product.merchant} website...`);
                  }
                }}
              >
                Shop at {product.merchant} <Icon.ExternalLink style={{ marginLeft: 4 }} />
              </button>
              <button
                className={`pd-heart-btn ${isWishlisted ? 'active' : ''}`}
                onClick={() => onToggleWishlist(product.id)}
                aria-label="Save to wishlist"
              >
                {isWishlisted ? <Icon.HeartFilled /> : <Icon.Heart />}
              </button>
            </div>

            {/* Trust signals */}
            <div className="pd-trust">
              <div className="pd-trust-item"><span>✓</span> Ships from {merchant ? merchant.city : 'boutique'}</div>
              <div className="pd-trust-item"><span>✓</span> Authentic designer piece</div>
              <div className="pd-trust-item"><span>✓</span> Buy direct from boutique</div>
            </div>

            <div className="pd-divider" />

            {/* Description */}
            <div className="pd-desc">
              <div className="eyebrow" style={{ marginBottom: 10 }}>About this piece</div>
              <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.7 }}>
                {product.description || `An impeccably crafted piece from ${product.brand}. Each garment is made with meticulous attention to detail, using premium materials sourced for longevity and style.`}
              </p>
            </div>

            {/* Brand & Merchant info pills */}
            <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
              {brand && (
                <button className="pill pill-cream" onClick={() => onNav('brand', null, null, brand.id)}>
                  {brand.name} →
                </button>
              )}
              {merchant && (
                <button className="pill pill-cream" onClick={() => onNav('merchant', null, null, merchant.id)}>
                  {merchant.name} →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Related by Brand */}
        {relatedByBrand.length > 0 && (
          <section className="section">
            <div className="section-head">
              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>More from this brand</div>
                <h2>{product.brand}</h2>
              </div>
              {brand && (
                <button className="section-head-link" onClick={() => onNav('brand', null, null, brand.id)}>
                  View all →
                </button>
              )}
            </div>
            <div className="product-grid">
              {relatedByBrand.map(p => (
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
          </section>
        )}

        {/* Related by Merchant */}
        {relatedByMerchant.length > 0 && (
          <section className="section" style={{ borderTop: '1px solid var(--line)', paddingTop: 'var(--pad-xl)' }}>
            <div className="section-head">
              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>More from this boutique</div>
                <h2>{product.merchant}</h2>
              </div>
              {merchant && (
                <button className="section-head-link" onClick={() => onNav('merchant', null, null, merchant.id)}>
                  View boutique →
                </button>
              )}
            </div>
            <div className="product-grid">
              {relatedByMerchant.map(p => (
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
          </section>
        )}
      </div>
    </main>
  );
}

Object.assign(window, { ProductDetailPage });

/* global React, Icon, ProductImage */
// Product card — two variants share the same data shape.
//   'editorial' (default): no chrome, overlay heart, hover reveals 'Shop Now' bar
//   'boxed': card frame, persistent shop arrow, denser

function ProductCard({ product, variant = 'editorial', isWishlisted, onToggleWishlist, onShop, onNav, label }) {
  const v = variant === 'boxed' ? 'boxed' : 'editorial';
  const HeartIcon = isWishlisted ? Icon.HeartFilled : Icon.Heart;

  function clickHeart(e) {
    e.stopPropagation();
    e.preventDefault();
    onToggleWishlist(product.id);
  }
  function clickCard(e) {
    e.stopPropagation();
    e.preventDefault();
    if (onNav) {
      onNav('product', null, null, product.id);
    } else if (onShop) {
      onShop(product);
    }
  }
  function clickShop(e) {
    e.stopPropagation();
    e.preventDefault();
    if (onShop) onShop(product);
  }

  return (
    <article className={`pcard ${v === 'boxed' ? 'variant-boxed' : ''} fade-in`} onClick={clickCard}>
      <div className="pcard-image">
        <ProductImage
          src={product.image}
          alt={`${product.brand} — ${product.title}`}
          hue={product.placeholder ? product.placeholder.hue : 30}
          lightness={product.placeholder ? product.placeholder.lightness : 80}
          label={label || 'product shot'}
        />
        <div className="pcard-badges">
          {product.newIn && <span className="pill pill-ink">New In</span>}
          {product.discountPct > 0 && <span className="pill pill-gold">{product.discountPct}% Off</span>}
        </div>
        <button className={`pcard-heart ${isWishlisted ? 'active' : ''}`} onClick={clickHeart} aria-label="Save to wishlist">
          <HeartIcon />
        </button>
        {v === 'editorial' && (
          <div className="pcard-shop">
            <button className="btn btn-ink btn-sm btn-block" onClick={clickShop}>
              Shop at {product.merchant} <Icon.ArrowRight />
            </button>
          </div>
        )}
      </div>

      <div className="pcard-meta">
        <div className="pcard-brand" onClick={(e) => { e.stopPropagation(); if (onNav && product.brandSlug) onNav('brand', null, null, product.brandSlug); }}>{product.brand}</div>
        <div className="pcard-title">{product.title}</div>
        <div className="pcard-merchant">at {product.merchant}</div>
        <div className="pcard-prices">
          <span className="pcard-rrp">${product.rrp}</span>
          <span className="pcard-sale">${product.sale}</span>
        </div>
        {v === 'boxed' && (
          <button className="btn btn-outline btn-sm" style={{ marginTop: 10, justifyContent: 'space-between' }} onClick={clickShop}>
            Shop at {product.merchant}
            <Icon.ArrowRight />
          </button>
        )}
      </div>
    </article>
  );
}

Object.assign(window, { ProductCard });

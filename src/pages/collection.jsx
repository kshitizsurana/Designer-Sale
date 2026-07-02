/* global React, ProductCard, Icon */
// CollectionPage — Renders a single curated collection within a Look

const { useMemo, useEffect } = React;

function CollectionPage({ data, collectionSlug, lookSlug, cardVariant, wishlist, onToggleWishlist, onShop, onNav }) {
  const { collections, looks, products } = data;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [collectionSlug]);

  const collection = useMemo(() => {
    return collections.find(c => c.slug === collectionSlug) || null;
  }, [collections, collectionSlug]);

  const look = useMemo(() => {
    return looks.find(l => l.slug === lookSlug) || null;
  }, [looks, lookSlug]);

  const collectionProducts = useMemo(() => {
    if (!collection) return [];
    // Ensure product_ids array exists, then map to actual products
    const pids = collection.product_ids || [];
    const pMap = new Map(products.map(p => [p.id, p]));
    return pids.map(id => pMap.get(id)).filter(Boolean);
  }, [collection, products]);

  if (!collection || !look) {
    return (
      <div style={{ padding: '120px 20px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 16 }}>Collection not found</h1>
        <button className="btn btn-gold" onClick={() => onNav('look', null, null, lookSlug || 'formal-wear')}>
          Back to Styles
        </button>
      </div>
    );
  }

  // Use the look's accent color for styling
  const LOOK_CONFIG = {
    'formal-wear': { accent: '#C9A84C' },
    'bohemian': { accent: '#D4956A' },
    'casuals': { accent: '#7EB8D4' }
  };
  const accentColor = LOOK_CONFIG[look.slug]?.accent || 'var(--gold)';

  return (
    <main className="page fade-in" style={{ paddingBottom: 120 }}>
      {/* ════════════════════════════════
          COLLECTION HERO
      ════════════════════════════════ */}
      <section style={{ 
        position: 'relative', 
        height: '50vh', 
        minHeight: 400, 
        background: '#111', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        color: '#fff',
        overflow: 'hidden'
      }}>
        {collection.hero_image && (
          <img 
            src={collection.hero_image} 
            alt={collection.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }} />
        
        <div className="container-wide" style={{ position: 'relative', zIndex: 1, padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: accentColor }}>
            <button style={{ color: 'inherit', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} onClick={() => onNav('look', null, null, look.slug)}>
              {look.name}
            </button>
            <Icon.ArrowRight />
            <span style={{ color: '#fff' }}>Curated Edit</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 6vw, 64px)', lineHeight: 1.1, marginBottom: 20 }}>
            {collection.title}
          </h1>
          {collection.description && (
            <p style={{ maxWidth: 600, margin: '0 auto', fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>
              {collection.description}
            </p>
          )}
        </div>
      </section>

      {/* ════════════════════════════════
          PRODUCT GRID
      ════════════════════════════════ */}
      <section className="section container-wide" style={{ marginTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
            {collectionProducts.length} {collectionProducts.length === 1 ? 'Piece' : 'Pieces'}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <select className="form-input" style={{ width: 'auto', padding: '8px 32px 8px 12px', fontSize: 12 }} defaultValue="curated">
              <option value="curated">Curated Order</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {collectionProducts.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--ink-muted)' }}>
            No products have been assigned to this collection yet.
          </div>
        ) : (
          <div className="product-grid">
            {collectionProducts.map(p => (
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
    </main>
  );
}

Object.assign(window, { CollectionPage });

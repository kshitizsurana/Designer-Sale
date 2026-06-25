/* global React, Icon, ProductCard */

const { useEffect } = React;

function LookPage({ lookSlug, data, cardVariant, wishlist, onToggleWishlist, onShop, onNav }) {
  const look = data.looks.find(l => l.slug === lookSlug);

  useEffect(() => {
    if (look) {
      document.title = `${look.name} Deals | Designer Sale`;
      
      const setMeta = (name, content) => {
        let el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
        if (!el) {
          el = document.createElement('meta');
          if (name.startsWith('og:')) el.setAttribute('property', name);
          else el.setAttribute('name', name);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      setMeta('description', look.description || `Shop the latest ${look.name} fashion sales.`);
      setMeta('og:title', `${look.name} Deals | Designer Sale`);
      setMeta('og:description', look.description || `Shop the latest ${look.name} fashion sales.`);
      if (look.hero_image) setMeta('og:image', look.hero_image);
      
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', `https://designersale.com.au/#/looks/${look.slug}`);
    }
  }, [look]);

  if (!look) {
    return (
      <main>
        <div className="container-wide" style={{ padding: 'var(--pad-2xl) 0', textAlign: 'center' }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Not found</div>
          <h1 className="cat-title">Look not found.</h1>
          <button className="btn btn-outline" style={{ marginTop: 24 }} onClick={() => onNav('home')}>Return Home</button>
        </div>
      </main>
    );
  }

  const lookProducts = data.products.filter(p => p.look_id === look.id);
  const lookMerchants = data.merchants.filter(m => m.look_id === look.id);
  
  const justAdded = lookProducts.slice().sort((a,b) => (b.added || 0) - (a.added || 0)).slice(0, 4);
  const trending = lookProducts.slice().sort((a,b) => b.discountPct - a.discountPct).slice(0, 4);

  return (
    <main>
      <section style={{ position: 'relative', height: '60vh', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', overflow: 'hidden' }}>
        {look.hero_image && (
          <img src={look.hero_image} alt={look.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)' }} />
        <div style={{ position: 'relative', textAlign: 'center', color: '#fff', padding: '0 20px', maxWidth: 800 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1, marginBottom: 16 }}>{look.name}</h1>
          {look.description && <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 600, margin: '0 auto', lineHeight: 1.5 }}>{look.description}</p>}
        </div>
      </section>

      <section className="container-wide" style={{ padding: 'var(--pad-xl) 0' }}>
        {lookMerchants.length > 0 && (
          <div style={{ marginBottom: 'var(--pad-2xl)' }}>
            <div className="section-head">
              <h2>Featured Boutiques</h2>
            </div>
            <div className="boutique-strip">
              {lookMerchants.map(b => (
                <button
                  key={b.id}
                  className="boutique-strip-item"
                  onClick={() => onNav('merchant', null, null, b.id)}
                >
                  <div className="b-wrap">
                    <div style={{ fontStyle: b.name.length > 14 ? 'italic' : 'normal' }}>{b.name}</div>
                    <small>{b.city}, {b.state}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {trending.length > 0 && (
          <div style={{ marginBottom: 'var(--pad-2xl)' }}>
            <div className="section-head">
              <h2>Trending in {look.name}</h2>
            </div>
            <div className="product-grid">
              {trending.map(p => (
                <ProductCard key={p.id} product={p} variant={cardVariant} isWishlisted={wishlist.has(p.id)} onToggleWishlist={onToggleWishlist} onShop={onShop} onNav={onNav} />
              ))}
            </div>
          </div>
        )}

        {justAdded.length > 0 && (
          <div style={{ marginBottom: 'var(--pad-2xl)' }}>
            <div className="section-head">
              <h2>Recently Added</h2>
            </div>
            <div className="product-grid">
              {justAdded.map(p => (
                <ProductCard key={p.id} product={p} variant={cardVariant} isWishlisted={wishlist.has(p.id)} onToggleWishlist={onToggleWishlist} onShop={onShop} onNav={onNav} />
              ))}
            </div>
          </div>
        )}

        {lookProducts.length > 0 && (
          <div>
            <div className="section-head">
              <h2>View All Products</h2>
            </div>
            <div className="product-grid">
              {lookProducts.map(p => (
                <ProductCard key={p.id} product={p} variant={cardVariant} isWishlisted={wishlist.has(p.id)} onToggleWishlist={onToggleWishlist} onShop={onShop} onNav={onNav} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

Object.assign(window, { LookPage });

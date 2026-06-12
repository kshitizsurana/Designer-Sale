/* global React, ProductCard, AIcon */

const { useState, useEffect } = React;

function LandingPage() {
  const [pageData, setPageData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse the slug from the hash URL: #/landing-page/slug
  const slug = window.location.hash.split('/').pop();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [lpRes, pRes] = await Promise.all([
          fetch('https://designer-sale.vercel.app/api/landing-pages'),
          fetch('https://designer-sale.vercel.app/api/products')
        ]);
        
        if (!lpRes.ok || !pRes.ok) throw new Error('Failed to fetch data');
        
        const landingPages = await lpRes.json();
        const allProducts = await pRes.json();

        // Find the page by slug (derive slug from title)
        const match = landingPages.find(lp => lp.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);
        
        if (!match) {
          setError('Page not found');
          return;
        }

        setPageData(match);

        // Filter products that are in the match.products array
        const tagged = allProducts.filter(p => match.products && match.products.includes(p.id));
        setProducts(tagged);
      } catch(e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  if (loading) {
    return <div className="page" style={{ display: 'flex', justifyContent: 'center', padding: 100, color: 'var(--ink-soft)' }}>Loading...</div>;
  }

  if (error) {
    return (
      <div className="page" style={{ padding: 100, textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 16 }}>{error}</h2>
        <a href="#/" className="btn btn-outline">Back to Home</a>
      </div>
    );
  }

  if (!pageData) return null;

  return (
    <div className="page landing-page">
      {/* Hero Banner */}
      <div className="hero" style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--blush)', position: 'relative', overflow: 'hidden' }}>
        {pageData.image && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url(${pageData.image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3 }} />
        )}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 64px)', color: 'var(--ink-deep)', margin: '0 0 16px 0', lineHeight: 1.1 }}>
            {pageData.title}
          </h1>
          {pageData.short_description && (
            <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--ink)', maxWidth: 600, margin: '0 auto', lineHeight: 1.5 }}>
              {pageData.short_description}
            </p>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '60px 20px' }}>
        <div className="section-head">
          <div className="section-title">Curated Selection</div>
          <div className="section-sub">{products.length} {products.length === 1 ? 'item' : 'items'} in this collection</div>
        </div>

        {products.length > 0 ? (
          <div className="grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-soft)' }}>
            No products have been added to this collection yet.
          </div>
        )}
      </div>
    </div>
  );
}

window.LandingPage = LandingPage;

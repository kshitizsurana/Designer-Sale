/* global React, Icon, ProductCard, HeroPlaceholder, FashionPlaceholder */

const { useState: useStateHome, useRef: useRefHome } = React;

function HomePage({ data, cardVariant, wishlist, onToggleWishlist, onShop, onNav, onEmailSubmit }) {
  const [email, setEmail] = useStateHome('');
  const emailRef = useRefHome(null);

  // Expose scroll-to via ref
  React.useEffect(() => {
    window.dsScrollEmail = () => {
      if (emailRef.current) emailRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
  }, []);

  const totalBoutiques = data.merchants ? data.merchants.length : 0;
  const totalItems = data.products ? data.products.length : 0;
  const avgDiscount = data.products && data.products.length > 0 
    ? Math.round(data.products.reduce((acc, p) => acc + (p.discountPct || 0), 0) / data.products.length) 
    : 0;
  const featuredPage = (data.landing_pages || [])[0] || null;
  const topCategories = (data.categories || [])
    .slice()
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 2);
  const heroTitle = featuredPage
    ? featuredPage.title
    : topCategories.length > 0
      ? topCategories.map(c => c.label).join(' & ')
      : 'Designer Sales';
  const heroDiscount = data.products?.length ? Math.max(...data.products.map(p => p.discountPct || 0)) : 0;
  const heroImage = featuredPage?.image || data.products.find(p => p.image)?.image || (window.IMG && window.IMG.heroBanner) || '';

  return (
    <main>
      {/* ---- Hero ---- */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow">MAY EDIT &middot; {totalItems} STYLES ON SALE NOW</div>
            <h1>
              Maxi Dresses<br/>
              &amp; Kaftans<br/>
              <em>up to 70% off.</em>
            </h1>
            <p style={{ color: 'var(--ink-soft)', fontSize: 17, maxWidth: 480, margin: 0 }}>
              The monthly edit from Australia&rsquo;s most-loved boutiques &mdash; curated, never crowded. New styles drop every weekday.
            </p>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 8 }}>
              <button
                className="btn btn-gold"
                onClick={() => featuredPage ? onNav('landing-page', null, null, featuredPage.id) : onNav('category', topCategories[0]?.id || data.categories[0]?.id)}
              >
                SHOP THE MAY EDIT <Icon.ArrowRight />
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => onNav('about')}
                style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                HOW IT WORKS
              </button>
            </div>
            <div style={{
              display: 'flex', gap: 24, marginTop: 32,
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: 'var(--ink-muted)',
            }}>
              <span><span style={{color:'var(--gold-deep)', fontSize:13, fontWeight:700, marginRight:4}}>{totalBoutiques}</span>Boutiques</span>
              <span><span style={{color:'var(--gold-deep)', fontSize:13, fontWeight:700, marginRight:4}}>{totalItems.toLocaleString()}</span>Items live</span>
              <span><span style={{color:'var(--gold-deep)', fontSize:13, fontWeight:700, marginRight:4}}>{avgDiscount}%</span>Avg discount</span>
            </div>
          </div>
          <div className="hero-art">
            <img
              src={heroImage}
              alt={featuredPage?.title || 'Designer boutique sale edit'}
              loading="eager"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 30%',
              }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            {/* subtle warm overlay for legibility of the chip */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(139,107,69,0.10) 0%, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.18) 100%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute',
              top: 32, right: 32,
              background: 'rgba(245,240,234,0.92)',
              padding: '12px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
            }}>
              ISSUE . 05 / 26
            </div>
          </div>
        </div>
      </section>

      {/* ---- Category tiles ---- */}
      <section className="section container-wide">
        <div className="section-head">
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Shop by category</div>
            <h2>Every sale, sorted.</h2>
          </div>
          <a className="section-head-link" href="#/" onClick={(e)=>{e.preventDefault();onNav('category','maxi-dresses');}}>View all categories</a>
        </div>
        <div className="tile-grid">
          {data.categories.map((c, i) => (
            <button
              key={c.id}
              className="tile fade-in"
              style={{ animationDelay: `${i * 60}ms`, background: `linear-gradient(160deg, ${c.swatch[0]} 0%, ${c.swatch[1]} 100%)` }}
              onClick={() => onNav('category', c.id)}
            >
              <img
                src={c.image}
                alt={c.label}
                loading="lazy"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 600ms ease',
                }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="tile-overlay">
                <div className="tile-label">{c.label}</div>
                <div className="tile-count">{c.count} on sale</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <hr className="divider-rule" />

      {/* ---- Shop By Style (Looks) ---- */}
      {data.looks && data.looks.length > 0 && (
        <section className="section container-wide">
          <div className="section-head" style={{ textAlign: 'center', display: 'block', marginBottom: 40 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Curated Collections</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)' }}>Shop By Style.</h2>
          </div>
          <div className="tile-grid" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))` }}>
            {data.looks.map((look, i) => (
              <button
                key={look.id}
                className="tile fade-in"
                style={{ animationDelay: `${i * 60}ms`, minHeight: 400, border: '1px solid var(--line)' }}
                onClick={() => onNav('look', null, null, look.slug)}
              >
                {look.hero_image && (
                  <img
                    src={look.hero_image}
                    alt={look.name}
                    loading="lazy"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 600ms ease',
                    }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, textAlign: 'left', color: '#fff' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 8 }}>{look.name}</h3>
                  <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 16 }}>{look.description}</p>
                  <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    View Collection <Icon.ArrowRight />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <hr className="divider-rule" />

      {/* ---- Featured Sales (Landing Pages) ---- */}
      {data.landing_pages && data.landing_pages.filter(lp => lp.status !== 'archived').length > 0 && (
        <section className="section container-wide">
          <div className="section-head" style={{ textAlign: 'center', display: 'block', marginBottom: 40 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Curated Sales</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)' }}>Shop Featured Sales.</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {data.landing_pages.filter(lp => lp.status !== 'archived').map((lp, i) => (
              <button
                key={lp.id}
                className="fade-in"
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '400px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid var(--line)',
                  animationDelay: `${i * 60}ms`,
                  display: 'flex',
                  alignItems: 'flex-end',
                  textAlign: 'left'
                }}
                onClick={() => onNav('landing-page', null, null, lp.id)}
              >
                {lp.image && (
                  <img
                    src={lp.image}
                    alt={lp.title}
                    loading="lazy"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 600ms ease',
                    }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
                <div style={{ position: 'relative', zIndex: 1, padding: '40px', color: '#fff' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 42px)', marginBottom: 12 }}>{lp.title}</h3>
                  <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 20, maxWidth: 600 }}>{lp.short_description}</p>
                  <span className="btn btn-ghost" style={{ border: '1px solid rgba(255,255,255,0.4)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                    Shop Sale <Icon.ArrowRight style={{ marginLeft: 8 }} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <hr className="divider-rule" />

      {/* ---- Blogs Section ---- */}
      {data.blogs && data.blogs.length > 0 && (
        <section className="section container-wide">
          <div className="section-head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Editor's Desk</div>
              <h2>Style Notes & Guides.</h2>
            </div>
            <a className="section-head-link" href="#/" onClick={(e)=>{e.preventDefault(); /* onNav('blogs') */}}>View all articles</a>
          </div>
          <div className="tile-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            {data.blogs.map((blog, i) => (
              <a
                key={blog.id}
                href={`#/blog/${blog.slug}`}
                onClick={(e)=>{e.preventDefault(); /* onNav('blog', null, null, blog.slug) */}}
                className="fade-in"
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  color: 'inherit',
                  animationDelay: `${i * 60}ms`
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: 280, marginBottom: 16, overflow: 'hidden', borderRadius: 8 }}>
                  {blog.image && (
                    <img
                      src={blog.image}
                      alt={blog.title}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 600ms ease' }}
                    />
                  )}
                </div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>{blog.author}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 8 }}>{blog.title}</h3>
                <p style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {blog.content}
                </p>
              </a>
            ))}
          </div>
        </section>
      )}

      <hr className="divider-rule" />

      {/* ---- Featured boutiques strip ---- */}
      <section className="container-wide" style={{ paddingBottom: 'var(--pad-xl)' }}>
        <div className="eyebrow" style={{ textAlign: 'center', margin: '0 0 24px' }}>
          ── Featured boutiques this month ──
        </div>
        <div className="boutique-strip">
          {data.boutiques.slice(0, 6).map(b => (
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
      </section>

      {/* ---- Dynamic Look Sales Sections ---- */}
      {data.looks && data.looks.map((look) => {
        const lookProducts = data.products.filter(p => p.look_id === look.id);
        if (lookProducts.length === 0) return null;
        const displayProducts = lookProducts.slice(0, 8);

        return (
          <section key={look.id} className="section container-wide">
            <div className="section-head">
              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Curated for you</div>
                <h2>Sales in {look.name}</h2>
              </div>
              <a className="section-head-link" href={`#/look/${look.slug}/all`} onClick={(e)=>{e.preventDefault();onNav('look-all', null, null, look.slug);}}>View All</a>
            </div>
            <div className="product-grid">
              {displayProducts.map(p => (
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
        );
      })}

      {/* ---- Editorial split ---- */}
      <section className="section container-wide">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--pad-xl)', alignItems: 'center' }}>
          <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden' }}>
            <img
              src={(window.IMG && window.IMG.featuredBrand) || ''}
              alt="Fashion Spectrum — hand-beaded silk"
              loading="lazy"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement.style.background = 'linear-gradient(160deg, oklch(72% 0.04 28) 0%, oklch(54% 0.06 28) 100%)';
              }}
            />
          </div>
          <div style={{ padding: '0 var(--pad-lg)' }}>
            <div className="eyebrow" style={{ marginBottom: 18 }}>Featured brand</div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 3.8vw, 56px)',
              lineHeight: 1.04,
              letterSpacing: '-0.015em',
              marginBottom: 24,
            }}>
              Fashion Spectrum<br/>
              <em className="serif-it" style={{ color: 'var(--gold-deep)' }}>100% silk, hand-beaded.</em>
            </h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: 16, lineHeight: 1.6, maxWidth: 460, marginBottom: 28 }}>
              Stocked by 40+ boutiques nationwide. Each piece is hand-finished — sequined, beaded, or pintucked — in workshops outside Jaipur. End-of-season stock now reduced.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ink" onClick={() => onNav('brand', null, null, 'fashion-spectrum')}>Shop the brand</button>
              <button className="btn btn-ghost" onClick={() => onNav('about')}>Read the story</button>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Email capture ---- */}
      <section ref={emailRef} className="email-capture">
        <div className="eyebrow" style={{ color: 'var(--gold-soft)', marginBottom: 18 }}>The DesignerSale list</div>
        <h2>Never miss a sale.</h2>
        <p>Two emails a week, max. The new drops, the deep discounts, and the boutiques worth knowing — landing Tuesday and Friday.</p>
        <form
          className="email-form"
          onSubmit={(e) => { e.preventDefault(); onEmailSubmit(email); setEmail(''); }}
        >
          <input
            type="email"
            placeholder="your@email.com.au"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Subscribe →</button>
        </form>
        <div style={{
          marginTop: 18,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'rgba(245,240,234,0.45)',
        }}>
          We never share. Unsubscribe in one click.
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { HomePage });

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
  const featuredPage = (data.collections || [])[0] || null;
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
                onClick={() => featuredPage ? onNav('collection', null, null, featuredPage.slug || featuredPage.id) : onNav('category', topCategories[0]?.id || data.categories[0]?.id)}
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

      {/* ---- Blogs / Editorial Section ---- */}
      {data.blogs && data.blogs.filter(b => b.status === 'published').length > 0 && (() => {
        const publishedBlogs = data.blogs.filter(b => b.status === 'published');
        const featured = publishedBlogs[0];
        const rest = publishedBlogs.slice(1, 4);
        return (
          <section className="section container-wide" style={{ paddingBottom: 'var(--pad-2xl)' }}>
            <div className="section-head" style={{ marginBottom: 48 }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Editor's Desk</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)' }}>Style Notes &amp; Guides.</h2>
              </div>
              <button
                className="section-head-link"
                onClick={() => onNav('blog')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                View all articles →
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: rest.length > 0 ? '1fr 1fr' : '1fr', gap: 32 }}>
              {/* Featured large post */}
              <button
                onClick={() => onNav('blog-post', null, null, featured.slug)}
                style={{
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                  textAlign: 'left', display: 'flex', flexDirection: 'column',
                  gridRow: rest.length > 1 ? 'span 2' : 'auto',
                }}
              >
                <div style={{
                  position: 'relative', width: '100%',
                  height: rest.length > 1 ? '100%' : 420,
                  minHeight: 360, overflow: 'hidden', borderRadius: 12,
                  background: 'var(--linen)',
                }}>
                  {featured.image ? (
                    <img
                      src={featured.image}
                      alt={featured.title}
                      loading="lazy"
                      style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                        objectFit: 'cover', transition: 'transform 700ms ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--linen) 0%, var(--gold-soft) 100%)', opacity: 0.3 }} />
                  )}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)',
                  }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 28px', color: '#fff' }}>
                    <div style={{
                      display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 10,
                      textTransform: 'uppercase', letterSpacing: '0.18em',
                      color: 'var(--gold-soft)', marginBottom: 12,
                    }}>
                      {featured.author || 'Editorial Team'}
                      {featured.published_at && <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}>
                        · {new Date(featured.published_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>}
                    </div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3vw, 32px)',
                      lineHeight: 1.15, marginBottom: 12,
                    }}>{featured.title}</h3>
                    <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 20 }}>
                      {featured.content?.replace(/<[^>]+>/g, '')}
                    </p>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                      color: 'var(--gold-soft)',
                    }}>
                      Read Article →
                    </span>
                  </div>
                </div>
              </button>

              {/* Smaller post cards */}
              {rest.map((blog, i) => (
                <button
                  key={blog.id}
                  onClick={() => onNav('blog-post', null, null, blog.slug)}
                  className="fade-in"
                  style={{
                    background: 'none', border: '1px solid var(--line)', borderRadius: 12, padding: 0,
                    cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'row',
                    overflow: 'hidden', animationDelay: `${i * 80}ms`, transition: 'box-shadow 300ms ease, transform 300ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{
                    width: 160, minWidth: 160, height: 160, overflow: 'hidden',
                    background: 'var(--linen)', position: 'relative', flexShrink: 0,
                  }}>
                    {blog.image ? (
                      <img
                        src={blog.image}
                        alt={blog.title}
                        loading="lazy"
                        style={{
                          position: 'absolute', inset: 0, width: '100%', height: '100%',
                          objectFit: 'cover', transition: 'transform 600ms ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--linen), var(--gold-soft))', opacity: 0.4 }} />
                    )}
                  </div>
                  <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, flex: 1 }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
                      letterSpacing: '0.15em', color: 'var(--gold-deep)',
                    }}>
                      {blog.author || 'Editorial Team'}
                    </div>
                    <h4 style={{
                      fontFamily: 'var(--font-display)', fontSize: 18, lineHeight: 1.25,
                      color: 'var(--ink)', margin: 0,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>{blog.title}</h4>
                    <p style={{
                      fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.55, margin: 0,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {blog.content?.replace(/<[^>]+>/g, '')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      })()}

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

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

  return (
    <main>
      {/* ---- Hero ---- */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow">May Edit · 412 styles on sale now</div>
            <h1>
              Maxi Dresses<br />
              & Kaftans<br />
              <em>up to 70% off.</em>
            </h1>
            <p style={{ color: 'var(--ink-soft)', fontSize: 17, maxWidth: 480, margin: 0 }}>
              The monthly edit from Australia's most-loved boutiques — curated, never crowded. New styles drop every weekday.
            </p>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 8 }}>
              <button
                className="btn btn-gold"
                onClick={() => onNav('category', 'maxi-dresses')}
              >
                Shop the May Edit <Icon.ArrowRight />
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => onNav('about')}
              >
                How it works
              </button>
            </div>
            <div style={{
              display: 'flex', gap: 24, marginTop: 32,
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: 'var(--ink-muted)',
            }}>
              <span><span style={{color:'var(--gold-deep)', fontSize:13, fontWeight:700, marginRight:4}}>140+</span>Boutiques</span>
              <span><span style={{color:'var(--gold-deep)', fontSize:13, fontWeight:700, marginRight:4}}>1,876</span>Items live</span>
              <span><span style={{color:'var(--gold-deep)', fontSize:13, fontWeight:700, marginRight:4}}>62%</span>Avg discount</span>
            </div>
          </div>
          <div className="hero-art">
            <img
              src={(window.IMG && window.IMG.heroBanner) || ''}
              alt="Editorial fashion — woman in silk maxi, golden hour"
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
              Issue · 05 / 26
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

      {/* ---- Just added ---- */}
      <section className="section container-wide">
        <div className="section-head">
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Just added · last 48 hours</div>
            <h2>Fresh from the<br/><em className="serif-it">boutique floors.</em></h2>
          </div>
          <a className="section-head-link" href="#/" onClick={(e)=>{e.preventDefault();onNav('category','maxi-dresses');}}>See everything new</a>
        </div>
        <div className="product-grid">
          {data.justAdded.slice(0, 8).map(p => (
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

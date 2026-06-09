/* global React, Icon, Logo */
// Site chrome — Header (with category nav, mobile drawer) and Footer.

const { useState: useStateChrome } = React;

function Header({ currentPage, currentCategory, wishlistCount, onNav, categories }) {
  const [searchOpen, setSearchOpen] = useStateChrome(false);
  const [searchVal, setSearchVal] = useStateChrome('');
  const [mobileNavOpen, setMobileNavOpen] = useStateChrome(false);

  function handleSearch(e) {
    e.preventDefault();
    if (searchVal.trim()) {
      setSearchOpen(false);
      setSearchVal('');
    }
  }

  return (
    <>
      <header className="header">
        <div className="header-promo">
          Free shipping at participating boutiques · New drops every weekday
        </div>
        <div className="header-row container-wide">
          <Logo size="md" />

          {/* Desktop nav */}
          <nav className="nav">
            {categories.slice(0, 6).map((c, i) => (
              <a
                key={c.id}
                href={`#/c/${c.id}`}
                className={[
                  currentPage === 'category' && currentCategory === c.id ? 'active' : '',
                  i === 5 ? 'nav-trim-1' : i === 4 ? 'nav-trim-2' : i === 3 ? 'nav-trim-3' : i === 2 ? 'nav-trim-4' : '',
                ].filter(Boolean).join(' ')}
                onClick={(e) => { e.preventDefault(); onNav('category', c.id); }}
              >
                {c.label}
              </a>
            ))}
            <a
              href="#/boutiques"
              className={currentPage === 'boutiques' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); onNav('boutiques'); }}
            >Boutiques</a>
          </nav>

          <div className="header-actions">
            {searchOpen ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--ink)', padding: '6px 4px' }}>
                <Icon.Search />
                <input
                  autoFocus
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="silk maxi, gold sequin…"
                  onBlur={() => { if (!searchVal) setSearchOpen(false); }}
                  style={{ border: 0, background: 'transparent', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 13, width: 180, color: 'var(--ink)' }}
                />
                <button className="icon-btn" style={{ width: 24, height: 24 }} onClick={() => { setSearchVal(''); setSearchOpen(false); }}>
                  <Icon.Close />
                </button>
              </div>
            ) : (
              <button className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
                <Icon.Search />
              </button>
            )}
            <button className="icon-btn" onClick={() => onNav('wishlist')} aria-label="Wishlist">
              <Icon.Heart />
              {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
            </button>
            <button className="btn btn-ink btn-sm desktop-only" onClick={() => onNav('home', null, 'email')}>
              Email sign-up
            </button>
            {/* Mobile hamburger */}
            <button className="icon-btn mobile-only" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
              <Icon.Menu />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileNavOpen(false)}>
          <div className="mobile-nav-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-nav-head">
              <Logo size="sm" />
              <button className="icon-btn" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
                <Icon.Close />
              </button>
            </div>
            <nav className="mobile-nav-links">
              <div className="mobile-nav-section-label">Shop</div>
              {categories.map(c => (
                <a
                  key={c.id}
                  href={`#/c/${c.id}`}
                  className={currentPage === 'category' && currentCategory === c.id ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); onNav('category', c.id); setMobileNavOpen(false); }}
                >
                  {c.label}
                  <span className="mobile-nav-count">{c.count}</span>
                </a>
              ))}
              <div className="mobile-nav-divider" />
              <div className="mobile-nav-section-label">Discover</div>
              <a href="#/boutiques" onClick={(e) => { e.preventDefault(); onNav('boutiques'); setMobileNavOpen(false); }}>Boutiques</a>
              <a href="#/about" onClick={(e) => { e.preventDefault(); onNav('about'); setMobileNavOpen(false); }}>How It Works</a>
              <a href="#/wishlist" onClick={(e) => { e.preventDefault(); onNav('wishlist'); setMobileNavOpen(false); }}>
                Wishlist {wishlistCount > 0 && <span className="pill pill-gold" style={{ fontSize: 9 }}>{wishlistCount}</span>}
              </a>
            </nav>
            <div className="mobile-nav-footer">
              <button className="btn btn-gold btn-block" onClick={() => { onNav('home', null, 'email'); setMobileNavOpen(false); }}>
                Email sign-up
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Footer({ onNav, categories }) {
  return (
    <footer className="footer">
      <div className="container-wide">
        <div className="footer-grid">
          <div>
            <Logo size="md" showTagline />
            <p style={{ color: 'var(--ink-soft)', fontSize: 13, lineHeight: 1.6, margin: '20px 0 0', maxWidth: 320 }}>
              We aggregate sales from premium Australian boutiques and online retailers. You click through, you buy direct.
            </p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              {categories.slice(0, 6).map(c => (
                <li key={c.id}>
                  <a href={`#/c/${c.id}`} onClick={(e) => { e.preventDefault(); onNav('category', c.id); }}>{c.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Discover</h4>
            <ul>
              <li><a href="#/boutiques" onClick={(e)=>{e.preventDefault();onNav('boutiques');}}>All Boutiques</a></li>
              <li><a href="#/about" onClick={(e)=>{e.preventDefault();onNav('about');}}>How It Works</a></li>
              <li><a href="#/wishlist" onClick={(e)=>{e.preventDefault();onNav('wishlist');}}>Wishlist</a></li>
              <li><a href="#/">New This Week</a></li>
              <li><a href="#/">70% Off & More</a></li>
            </ul>
          </div>
          <div>
            <h4>For Boutiques</h4>
            <ul>
              <li><a href="#/about" onClick={(e)=>{e.preventDefault();onNav('about');}}>List Your Sales</a></li>
              <li><a href="#/about" onClick={(e)=>{e.preventDefault();onNav('about');}}>Our Story</a></li>
              <li><a href="https://fashionspectrum.com.au" target="_blank" rel="noreferrer">Fashion Spectrum</a></li>
              <li><a href="#/">Press</a></li>
            </ul>
          </div>
          <div>
            <h4>Help</h4>
            <ul>
              <li><a href="#/">Contact</a></li>
              <li><a href="#/">FAQ</a></li>
              <li><a href="#/">Privacy</a></li>
              <li><a href="#/">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 DesignerSale Pty Ltd. Made in Australia.</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
            Backed by Fashion Spectrum
          </span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Header, Footer });

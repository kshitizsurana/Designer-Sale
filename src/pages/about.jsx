/* global React, Icon */

function AboutPage({ onNav }) {
  return (
    <main>
      <section className="about-hero container-wide">
        <div className="eyebrow" style={{ marginBottom: 28 }}>About DesignerSale</div>
        <h1>
          One place for every<br />
          designer sale<br />
          <em className="serif-it" style={{ color: 'var(--gold-deep)' }}>in Australia.</em>
        </h1>
        <p>
          Think Google Shopping — but only for Australian boutiques, only premium fashion, and only when items are on sale. We scrape, curate, and link you straight to the boutique. We never hold stock.
        </p>
      </section>

      <section className="container-wide">
        <div className="about-grid">
          <div className="about-col">
            <div className="num">i.</div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>For Shoppers</div>
            <h3>Find the deal first.<br/>Buy direct.</h3>
            <p>
              New sale items land on the site every weekday, pulled from over a hundred Australian boutiques and online retailers. Browse, filter, save — and when you're ready, click through. You buy from the boutique, not us.
            </p>
            <ul>
              <li>Updated daily across 140+ boutiques</li>
              <li>Filter by size, price, brand, discount tier</li>
              <li>Save favourites to your wishlist</li>
              <li>Email alerts when new items drop in your size</li>
            </ul>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 28 }} onClick={() => onNav('home')}>
              Start browsing
            </button>
          </div>

          <div className="about-col">
            <div className="num">ii.</div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>For Boutiques</div>
            <h3>List your sales<br/>in one place.</h3>
            <p>
              We bring premium shoppers straight to your storefront. No commission, no holding stock — we link out to your existing product pages. Your sale inventory gets surfaced to a national audience already in a buying mindset.
            </p>
            <ul>
              <li>Free standard listing for participating boutiques</li>
              <li>Daily product feed via API or CSV</li>
              <li>Featured placement options available</li>
              <li>Analytics dashboard included</li>
            </ul>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 28 }}>
              Apply to list
            </button>
          </div>

          <div className="about-col">
            <div className="num">iii.</div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Our Story</div>
            <h3>Built by people<br/>who know fashion.</h3>
            <p>
              DesignerSale is backed by <strong style={{ color: 'var(--ink)' }}>Fashion Spectrum</strong>, an Australian wholesale fashion house specialising in 100% silk, hand-beaded and sequined garments made in workshops outside Jaipur. We've spent twenty years stocking the boutiques on this platform.
            </p>
            <ul>
              <li>Founded 2025 in Sydney</li>
              <li>Backed by a 20-year-old wholesale house</li>
              <li>Independent editorial — we don't take payment for placement</li>
            </ul>
            <a
              href="https://fashionspectrum.com.au"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm"
              style={{ marginTop: 28 }}
            >
              Visit Fashion Spectrum →
            </a>
          </div>
        </div>
      </section>

      {/* Closing pull quote */}
      <section style={{
        padding: 'var(--pad-2xl) 0',
        textAlign: 'center',
        borderTop: '1px solid var(--line)',
        background: 'var(--bg-card)',
      }}>
        <div className="container-wide">
          <div className="eyebrow" style={{ marginBottom: 24, color: 'var(--gold-deep)' }}>One last thing</div>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'clamp(28px, 3vw, 44px)',
            lineHeight: 1.2,
            maxWidth: 880,
            margin: '0 auto',
            color: 'var(--ink)',
            letterSpacing: '-0.01em',
          }}>
            "We don't shout about the discounts. We just find them, sort them, and put them somewhere you can actually look through them."
          </p>
          <div className="mono" style={{ marginTop: 28, color: 'var(--ink-muted)' }}>
            — The DesignerSale Editors
          </div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { AboutPage });

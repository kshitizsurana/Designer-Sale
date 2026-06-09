/* global React, Icon, ProductImage, Logo */
// Shared atoms — icons, logo, image placeholders.

const { useState } = React;

// ---------- Icons ----------
const Icon = {
  Search: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="20" y1="20" x2="16.5" y2="16.5" />
    </svg>
  ),
  Heart: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s-7.5-4.6-9.5-9.5C1 7.5 4 4 7.5 4c2 0 3.5 1 4.5 2.5C13 5 14.5 4 16.5 4 20 4 23 7.5 21.5 11.5 19.5 16.4 12 21 12 21z" />
    </svg>
  ),
  HeartFilled: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
      <path d="M12 21s-7.5-4.6-9.5-9.5C1 7.5 4 4 7.5 4c2 0 3.5 1 4.5 2.5C13 5 14.5 4 16.5 4 20 4 23 7.5 21.5 11.5 19.5 16.4 12 21 12 21z" />
    </svg>
  ),
  Mail: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" />
      <path d="M3 7l9 7 9-7" />
    </svg>
  ),
  Bag: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8h12l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H8.7a1.5 1.5 0 0 1-1.5-1.3L6 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  ),
  ArrowRight: (props) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="4" y1="12" x2="20" y2="12" />
      <polyline points="14 6 20 12 14 18" />
    </svg>
  ),
  ArrowLeft: (props) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="20" y1="12" x2="4" y2="12" />
      <polyline points="10 18 4 12 10 6" />
    </svg>
  ),
  Chevron: (props) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Filter: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="6" y1="12" x2="18" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  ),
  Grid: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" {...props}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  Close: (props) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...props}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  ),
  Pin: (props) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  Menu: (props) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...props}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Share: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  ExternalLink: (props) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Globe: (props) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
};

// ---------- Diamond mark for logo ----------
function DiamondMark({ size = 18, color = 'currentColor', filled = false }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <g transform="translate(12 12) rotate(45)">
        <rect x={-7} y={-7} width={14} height={14} fill={filled ? color : 'none'} stroke={color} strokeWidth={filled ? 0 : 1.4} />
        <line x1={-7} y1={0} x2={7} y2={0} stroke={color} strokeWidth={0.6} opacity={0.4} />
      </g>
    </svg>
  );
}

// ---------- Logo ----------
function Logo({ variant, size = 'md', showTagline = false, color }) {
  const [globalVariant, setGlobalVariant] = useState(window.__ds_logo_variant || 'editorial');
  React.useEffect(() => {
    const onChange = (e) => setGlobalVariant(e.detail || 'editorial');
    document.addEventListener('ds-logo-variant-change', onChange);
    return () => document.removeEventListener('ds-logo-variant-change', onChange);
  }, []);
  variant = variant || globalVariant;

  const fs = size === 'lg' ? 38 : size === 'sm' ? 18 : 26;
  const tagFs = size === 'lg' ? 10 : 9;
  const clr = color || 'currentColor';
  const nav = (e) => { e.preventDefault(); window.dsNav && window.dsNav('home'); };

  if (variant === 'stacked') {
    return (
      <a href="#/" className="logo-wrap" onClick={nav} style={{ display: 'inline-block' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: clr, gap: 6, lineHeight: 1 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: fs, fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' }}>DesignerSale</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ height: 1, width: 16, background: 'var(--gold-deep)', opacity: 0.55 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: fs * 0.30, letterSpacing: '0.22em', color: 'var(--gold-deep)', fontWeight: 600 }}>.COM.AU</span>
            <span style={{ height: 1, width: 16, background: 'var(--gold-deep)', opacity: 0.55 }} />
          </div>
          {showTagline && <span style={{ fontFamily: 'var(--font-mono)', fontSize: tagFs, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginTop: 10 }}>Australia's designer boutique sales</span>}
        </div>
      </a>
    );
  }

  if (variant === 'caps') {
    return (
      <a href="#/" className="logo-wrap" onClick={nav} style={{ display: 'inline-block' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', color: clr, lineHeight: 1 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: fs * 0.78, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'baseline' }}>
            DesignerSale<span style={{ color: 'var(--gold-deep)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'lowercase', marginLeft: 1 }}>.com.au</span>
          </span>
          {showTagline && <span style={{ fontFamily: 'var(--font-mono)', fontSize: tagFs, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginTop: 10 }}>Australia's designer boutique sales, in one place</span>}
        </div>
      </a>
    );
  }

  // editorial (default)
  return (
    <a href="#/" className="logo-wrap" onClick={nav} style={{ display: 'inline-block' }}>
      <div style={{ display: 'flex', flexDirection: 'column', color: clr, lineHeight: 1 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: fs, fontWeight: 500, letterSpacing: '-0.012em', display: 'inline-flex', alignItems: 'baseline', whiteSpace: 'nowrap' }}>
          Designer<em style={{ fontStyle: 'italic', color: 'var(--gold-deep)' }}>Sale</em><em style={{ fontStyle: 'italic', fontWeight: 400, fontSize: fs * 0.42, color: 'var(--gold-deep)', marginLeft: 4, letterSpacing: 0, opacity: 0.85 }}>.com.au</em>
        </span>
        {showTagline && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: tagFs, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginTop: 12 }}>
            Australia's designer boutique sales, in one place
          </span>
        )}
      </div>
    </a>
  );
}

// ---------- Image placeholder ----------
function FashionPlaceholder({ hue = 30, lightness = 80, label = 'editorial shot', shape = 'portrait' }) {
  const bg = `oklch(${lightness}% 0.04 ${hue})`;
  const bgDark = `oklch(${lightness - 14}% 0.06 ${hue})`;
  return (
    <div className="ph-fashion pcard-img-inner" style={{ background: `linear-gradient(160deg, ${bg} 0%, ${bgDark} 100%)` }}>
      <span className="ph-label">{label}</span>
    </div>
  );
}

// ---------- Real photo with fallback ----------
function ProductImage({ src, alt, hue = 30, lightness = 80, label = 'product shot' }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return <FashionPlaceholder hue={hue} lightness={lightness} label={label} />;
  }
  return (
    <img
      className="pcard-img-inner"
      src={src}
      alt={alt || label}
      loading="lazy"
      onError={() => setErrored(true)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}

// ---------- Big hero placeholder ----------
function HeroPlaceholder({ label = 'monthly editorial' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #E8D4B8 0%, #C9A87C 35%, #8B6B45 70%, #5C4632 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(115deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 2px, transparent 2px, transparent 22px)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 70% 30%, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0.0) 50%, rgba(0,0,0,0.35) 100%)' }} />
      <div style={{ position: 'absolute', left: 24, bottom: 24, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', background: 'rgba(0,0,0,0.18)', padding: '6px 10px', backdropFilter: 'blur(2px)' }}>
        [ {label} ]
      </div>
    </div>
  );
}

Object.assign(window, { Icon, DiamondMark, Logo, FashionPlaceholder, ProductImage, HeroPlaceholder });

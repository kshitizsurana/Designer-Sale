/* global React, Icon */

const { useState: useStateBou, useMemo: useMemoBou } = React;

function BoutiquesPage({ data, onNav }) {
  const [state, setState] = useStateBou('all');     // 'all' / 'NSW' / ...
  const [channel, setChannel] = useStateBou('all'); // 'all' / 'online' / 'in-store'
  const [q, setQ] = useStateBou('');

  const states = ['all', ...Array.from(new Set(data.boutiques.map(b => b.state)))];
  const filtered = useMemoBou(() => {
    return data.boutiques.filter(b => {
      if (state !== 'all' && b.state !== state) return false;
      if (channel === 'online' && !b.online) return false;
      if (channel === 'in-store' && !b.inStore) return false;
      if (q && !b.name.toLowerCase().includes(q.toLowerCase()) && !b.city.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [data.boutiques, state, channel, q]);

  return (
    <main>
      <div className="container-wide">
        <div className="cat-header">
          <div className="breadcrumb">
            <a href="#/" onClick={(e)=>{e.preventDefault(); onNav('home');}}>Home</a>
            <span className="sep">/</span>
            <span style={{ color: 'var(--ink)' }}>Boutiques</span>
          </div>
          <div className="cat-title-row">
            <div>
              <h1 className="cat-title">The Boutique<br/><em className="serif-it" style={{ color: 'var(--gold-deep)' }}>Directory.</em></h1>
              <p style={{ maxWidth: 540, marginTop: 18, color: 'var(--ink-soft)', fontSize: 16 }}>
                Every boutique we aggregate, in one place. Filter by state, browse by speciality, click through to their sales.
              </p>
            </div>
            <div className="cat-meta">
              <span className="mono">{filtered.length} of {data.boutiques.length} boutiques</span>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 0',
          borderBottom: '1px solid var(--line)',
          gap: 24,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="mono" style={{ marginRight: 8, alignSelf: 'center', color: 'var(--ink-muted)' }}>State:</span>
            {states.map(s => (
              <button
                key={s}
                className="chip"
                onClick={() => setState(s)}
                style={{
                  background: state === s ? 'var(--ink)' : 'transparent',
                  color: state === s ? 'var(--bg)' : 'var(--ink)',
                  borderColor: state === s ? 'var(--ink)' : 'var(--line-strong)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fontSize: 10,
                }}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              borderBottom: '1px solid var(--line-strong)', padding: '6px 4px',
            }}>
              <Icon.Search />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search boutiques…"
                style={{ border: 0, background: 'transparent', outline: 'none', width: 180, fontSize: 13, fontFamily: 'var(--font-body)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 4, border: '1px solid var(--line-strong)' }}>
              {['all','online','in-store'].map(c => (
                <button
                  key={c}
                  onClick={() => setChannel(c)}
                  style={{
                    padding: '8px 14px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    background: channel === c ? 'var(--ink)' : 'transparent',
                    color: channel === c ? 'var(--bg)' : 'var(--ink-soft)',
                    fontWeight: 600,
                    transition: 'all 180ms ease',
                  }}
                >
                  {c === 'all' ? 'All' : c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <section style={{ padding: 'var(--pad-xl) 0 var(--pad-2xl)' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--pad-2xl) 0' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 32 }}>No boutiques match.</h3>
              <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={() => { setState('all'); setChannel('all'); setQ(''); }}>
                Reset filters
              </button>
            </div>
          ) : (
            <div className="boutique-grid">
              {filtered.map((b, i) => (
                <article key={b.id} className="boutique-card fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="boutique-logo">
                    {b.name.split(' ').slice(0, 3).map(w => w[0]).join('')}
                  </div>
                  <div>
                    <div className="boutique-name">{b.name}</div>
                    <div className="boutique-loc" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon.Pin /> {b.city}, {b.state}
                      <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 6 }}>
                        {b.online && <span style={{ fontSize: 9 }}>● Online</span>}
                        {b.inStore && <span style={{ fontSize: 9 }}>● In-store</span>}
                      </span>
                    </div>
                  </div>
                  <div className="boutique-desc">
                    {b.focus} · curated selection of premium Australian and international labels.
                  </div>
                  <div className="boutique-foot">
                    <span className="boutique-items">
                      <strong>{b.items}</strong> on sale
                    </span>
                    <button className="btn btn-outline btn-sm">
                      View sales <Icon.ArrowRight />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

Object.assign(window, { BoutiquesPage });

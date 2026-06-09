/* global React, AIcon, API */
// Admin Dashboard — KPIs, category breakdown, recent products

const { useState: useDash, useEffect: useEffDash } = React;

function AdminDashboard({ onNav, toast }) {
  const [stats, setStats] = useDash({});
  const [recent, setRecent] = useDash([]);
  const [cats, setCats] = useDash([]);
  const [loading, setLoading] = useDash(true);

  async function refresh() {
    setLoading(true);
    try {
        const [st, products, categories] = await Promise.all([
            API.stats.get(),
            API.products.getAll(),
            API.categories.getAll()
        ]);
        setStats(st);
        
        const recentProds = products
          .slice()
          .sort((a, b) => (b.added || 0) - (a.added || 0))
          .slice(0, 8);
        setRecent(recentProds);

        setCats(categories.map(c => ({
          ...c,
          count: products.filter(p => p.category === c.id).length,
        })));
    } catch(e) {
        toast('Failed to load dashboard data', 'error');
    } finally {
        setLoading(false);
    }
  }

  useEffDash(() => { refresh(); }, []);

  if (loading) return <div>Loading...</div>;

  const maxCount = Math.max(...cats.map(c => c.count), 1);

  const kpis = [
    { label: 'Total Merchants', value: stats.totalMerchants || 0, sub: 'active boutiques', accent: true },
    { label: 'Total Brands',    value: stats.totalBrands || 0,    sub: 'fashion labels' },
    { label: 'Total Products',  value: stats.totalProducts || 0,  sub: `${stats.avgDiscount || 0}% avg discount` },
    { label: 'New In',          value: stats.newIn || 0,          sub: 'added last 48h', accent: true },
  ];

  return (
    <div>
      {/* KPI cards */}
      <div className="admin-kpi-grid">
        {kpis.map((k, i) => (
          <div key={i} className={`admin-kpi-card ${k.accent ? 'admin-kpi-accent' : ''}`}>
            <div className="admin-kpi-label">{k.label}</div>
            <div className="admin-kpi-value">{k.value.toLocaleString()}</div>
            <div className="admin-kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Category breakdown */}
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--line)', padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 20 }}>Products by category</div>
          <div className="cat-chart">
            {cats.map(c => (
              <div key={c.id} className="cat-chart-row">
                <div className="cat-chart-label">{c.label}</div>
                <div className="cat-chart-bar-wrap">
                  <div className="cat-chart-bar" style={{ width: `${Math.round((c.count / maxCount) * 100)}%` }} />
                </div>
                <div className="cat-chart-count">{c.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--line)', padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 20 }}>Quick actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Add new product', page: 'products', accent: true },
              { label: 'Add new merchant', page: 'merchants' },
              { label: 'Add new brand',   page: 'brands' },
              { label: 'Bulk CSV upload', page: 'upload' },
            ].map(a => (
              <button key={a.page + a.label} className={`btn ${a.accent ? 'btn-gold' : 'btn-ghost'}`} style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => onNav(a.page)}>
                <AIcon.Plus /> {a.label}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--line)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 8 }}>Real Node.js Backend</div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>Changes are securely persisted to an SQLite database.</div>
          </div>
        </div>
      </div>

      {/* Recent products */}
      <div>
        <div className="admin-section-head">
          <div>
            <div className="admin-section-title">Recently Added</div>
            <div className="admin-section-sub">Latest {recent.length} products across all categories</div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => onNav('products')}>View all products</button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="col-thumb"></th>
                <th>Brand</th>
                <th>Product</th>
                <th>Merchant</th>
                <th>Category</th>
                <th>RRP</th>
                <th>Sale</th>
                <th>Discount</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-muted)' }}>No products yet.</td></tr>
              ) : recent.map(p => (
                <tr key={p.id}>
                  <td className="col-thumb">
                    {p.image
                      ? <img src={p.image} className="thumb-img" alt="" onError={e => e.currentTarget.style.display='none'} />
                      : <div className="thumb-ph">{(p.brand || '?')[0]}</div>
                    }
                  </td>
                  <td style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>{p.brand}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                  <td style={{ color: 'var(--ink-soft)', fontSize: 12 }}>{p.merchant}</td>
                  <td><span className="badge badge-muted">{p.category}</span></td>
                  <td style={{ color: 'var(--ink-muted)', textDecoration: 'line-through' }}>${p.rrp}</td>
                  <td style={{ fontWeight: 600 }}>${p.sale}</td>
                  <td><span className="badge badge-gold">{p.discountPct}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

window.AdminDashboard = AdminDashboard;

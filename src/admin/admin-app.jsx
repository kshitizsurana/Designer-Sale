/* global React, ReactDOM, API */
// Admin Panel — Main App Router + Auth

const { useState: useAdminState, useEffect: useAdminEffect } = React;

// ---- SVG Icons for admin (inline, no dependency) ----
const AIcon = {
  Dashboard: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  Merchants: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Brands: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Products: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  Upload: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  Logout: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Close: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Eye: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Search: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.5" y2="16.5"/></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Alert: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  External: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
};
window.AIcon = AIcon;

// ---- Toast system ----
function AdminToast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`admin-toast ${toast.type || ''}`}>
      {toast.type === 'success' ? <AIcon.Check /> : toast.type === 'error' ? <AIcon.Alert /> : null}
      {toast.msg}
    </div>
  );
}

// ---- Login page ----
function AdminLogin({ onLogin }) {
  const [username, setUsername] = useAdminState('admin');
  const [password, setPassword] = useAdminState('');
  const [err, setErr] = useAdminState('');
  const [loading, setLoading] = useAdminState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
        await API.auth.login(username, password);
        onLogin();
    } catch(err) {
        setErr(err.message || 'Login failed');
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--ink)', lineHeight: 1 }}>
            Designer<em style={{ fontStyle: 'italic', color: 'var(--gold-deep)' }}>Sale</em>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-muted)', display: 'block', marginTop: 6, textTransform: 'uppercase' }}>Admin Panel</span>
          </div>
        </div>
        <h2 className="admin-login-title">Sign in</h2>
        {err && <div className="admin-login-error">{err}</div>}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-ink" style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div style={{ marginTop: 20, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-muted)', letterSpacing: '0.14em', textAlign: 'center', textTransform: 'uppercase' }}>
          <a href="DesignerSale Standalone Source.html" style={{ color: 'var(--gold-deep)' }}>← Back to store</a>
        </div>
      </div>
    </div>
  );
}

// ---- Main admin shell ----
function AdminApp() {
  const [authed, setAuthed] = useAdminState(API.auth.isLoggedIn());
  const [page, setPage] = useAdminState('dashboard');
  const [toast, setToast] = useAdminState(null);
  const [stats, setStats] = useAdminState({});

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }
  window.adminToast = showToast;

  function logout() {
    API.auth.logout();
    setAuthed(false);
  }

  useAdminEffect(() => {
    if (authed) {
        API.stats.get().then(setStats).catch(console.error);
    }
  }, [authed, page]);

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', Icon: AIcon.Dashboard },
    { id: 'merchants', label: 'Merchants', Icon: AIcon.Merchants, count: stats.totalMerchants },
    { id: 'brands',   label: 'Brands',    Icon: AIcon.Brands,    count: stats.totalBrands },
    { id: 'products', label: 'Products',  Icon: AIcon.Products,  count: stats.totalProducts },
  ];

  const pageTitles = { dashboard: 'Dashboard', merchants: 'Merchants', brands: 'Brands', products: 'Products', upload: 'Bulk Upload' };

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <div className="admin-sidebar-logo-text">Designer<em>Sale</em></div>
          <div className="admin-sidebar-logo-sub">Admin Panel</div>
        </div>
        <nav className="admin-nav">
          <div className="admin-nav-section">Main</div>
          {navItems.map(item => (
            <button key={item.id} className={`admin-nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}>
              <item.Icon />
              <span>{item.label}</span>
              {item.count > 0 && <span className="admin-nav-badge">{item.count}</span>}
            </button>
          ))}
          <div className="admin-nav-section">Tools</div>
          <button className={`admin-nav-item ${page === 'upload' ? 'active' : ''}`} onClick={() => setPage('upload')}>
            <AIcon.Upload />
            <span>Bulk Upload</span>
          </button>
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-nav-item" onClick={logout} style={{ width: '100%', padding: '10px 20px' }}>
            <AIcon.Logout />
            <span>Sign out</span>
          </button>
          <div style={{ marginTop: 8, fontSize: 10 }}>v2.0 · Node API</div>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-title">{pageTitles[page]}</div>
          <div className="admin-topbar-actions">
            <a href="DesignerSale Standalone Source.html" target="_blank" className="btn btn-ghost btn-sm">
              <AIcon.External /> View store
            </a>
          </div>
        </div>
        <div className="admin-content">
          {page === 'dashboard' && <AdminDashboard onNav={setPage} toast={showToast} />}
          {page === 'merchants' && <AdminMerchants toast={showToast} />}
          {page === 'brands'   && <AdminBrands toast={showToast} />}
          {page === 'products' && <AdminProducts toast={showToast} />}
          {page === 'upload'   && <AdminBulkUpload toast={showToast} />}
        </div>
      </div>

      <AdminToast toast={toast} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('admin-root')).render(<AdminApp />);

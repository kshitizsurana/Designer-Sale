/* global React, AIcon, DeleteConfirm, API */

const { useState, useEffect, useMemo } = React;

function LandingPageFormModal({ landingPage, allProducts, onSave, onClose }) {
  const [form, setForm] = useState(landingPage || {
    title: '', short_description: '', image: '', products: []
  });
  const [errors, setErrors] = useState({});
  const [q, setQ] = useState('');

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function validate() {
    const e = {};
    if (!form.title?.trim()) e.title = 'Title is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  }

  function toggleProduct(pId) {
    if (form.products.includes(pId)) {
      set('products', form.products.filter(id => id !== pId));
    } else {
      set('products', [...form.products, pId]);
    }
  }

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.brand?.toLowerCase().includes(q.toLowerCase()));
  }, [allProducts, q]);

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ width: 600, maxWidth: '90%' }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal-head">
          <div className="admin-modal-title">{landingPage ? 'Edit Landing Page' : 'Create Landing Page'}</div>
          <button className="btn-icon" onClick={onClose}><AIcon.Close /></button>
        </div>
        <form onSubmit={submit} style={{ display: 'contents' }}>
          <div className="admin-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="form-group">
              <label className="form-label">URL Slug / Title <span>*</span></label>
              <input className={`form-input ${errors.title ? 'error' : ''}`} value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder="e.g. July Sales" />
              <p style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>Used for the URL: #/landing-page/<strong>{form.title ? form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'july-sales'}</strong></p>
              {errors.title && <div className="form-error">{errors.title}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Banner Image URL</label>
              <input type="url" className="form-input" value={form.image || ''} onChange={e => set('image', e.target.value)} placeholder="https://..." />
            </div>

            <div className="form-group">
              <label className="form-label">Short Description</label>
              <textarea className="form-input" rows="2" value={form.short_description || ''} onChange={e => set('short_description', e.target.value)} placeholder="Summer clearance up to 50% off..." style={{ resize: 'vertical' }} />
            </div>

            <div className="form-group" style={{ marginTop: 24 }}>
              <label className="form-label">Tag Products ({form.products.length} selected)</label>
              <input className="form-input" placeholder="Search products..." value={q} onChange={e => setQ(e.target.value)} style={{ marginBottom: 12 }} />
              <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: 8 }}>
                {filteredProducts.map(p => {
                  const isSelected = form.products.includes(p.id);
                  return (
                    <div key={p.id} onClick={() => toggleProduct(p.id)} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', background: isSelected ? 'var(--blush-soft)' : '#fff' }}>
                      <input type="checkbox" checked={isSelected} readOnly style={{ marginRight: 12 }} />
                      <img src={p.image || ''} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, marginRight: 12, background: '#eee' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{p.brand}</div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, marginLeft: 12 }}>${p.sale}</div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
          <div className="admin-modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-gold btn-sm">
              {landingPage ? 'Save changes' : 'Create page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminLandingPages({ toast }) {
  const [landingPages, setLandingPages] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  async function refresh() {
    setLoading(true);
    try {
        const token = localStorage.getItem('ds_token');
        const [lpRes, p] = await Promise.all([
          fetch('https://designer-sale.vercel.app/api/landing-pages', { headers: { 'Authorization': `Bearer ${token}` } }),
          API.products.getAll()
        ]);
        const lp = await lpRes.json();
        if (lp.error || !Array.isArray(lp)) {
            console.error('Landing pages fetch error:', lp);
            setLandingPages([]);
            toast('Warning: Could not load landing pages (Table might be missing)', 'error');
        } else {
            setLandingPages(lp);
        }
        setAllProducts(p);
    } catch(e) {
        toast('Failed to load landing pages', 'error');
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function handleSave(data) {
    try {
        const token = localStorage.getItem('ds_token');
        if (editItem) {
          const res = await fetch(`https://designer-sale.vercel.app/api/landing-pages/${editItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
          });
          if (!res.ok) throw new Error('Update failed');
          toast('Landing page updated', 'success');
        } else {
          const res = await fetch(`https://designer-sale.vercel.app/api/landing-pages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
          });
          if (!res.ok) throw new Error('Create failed');
          toast('Landing page created', 'success');
        }
        setShowForm(false);
        setEditItem(null);
        refresh();
    } catch(e) {
        toast(e.message, 'error');
    }
  }

  async function handleDelete() {
    try {
        const token = localStorage.getItem('ds_token');
        const res = await fetch(`https://designer-sale.vercel.app/api/landing-pages/${deleteItem.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Delete failed');
        toast(`Landing page deleted`, 'success');
        setDeleteItem(null);
        refresh();
    } catch(e) {
        toast(e.message, 'error');
    }
  }

  return (
    <div>
      <div className="admin-section-head">
        <div>
          <div className="admin-section-title">Curated Landing Pages</div>
          <div className="admin-section-sub">Create custom collection pages</div>
        </div>
        <button className="btn btn-gold btn-sm" onClick={() => { setEditItem(null); setShowForm(true); }}>
          <AIcon.Plus /> Create page
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="col-thumb">Banner</th>
              <th>Title</th>
              <th>Description</th>
              <th>Tagged Products</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" style={{textAlign: 'center', padding: 30}}>Loading...</td></tr> : landingPages.length === 0 ? (
              <tr><td colSpan="5">
                <div className="admin-empty">
                  <h3>No landing pages yet</h3>
                  <p>Create a curated collection page to feature specific items.</p>
                  <button className="btn btn-gold btn-sm" onClick={() => { setEditItem(null); setShowForm(true); }}><AIcon.Plus /> Create page</button>
                </div>
              </td></tr>
            ) : Array.isArray(landingPages) && landingPages.map(lp => (
              <tr key={lp.id}>
                <td className="col-thumb">
                  {lp.image ? <img src={lp.image} className="thumb-img" style={{ width: 60 }} alt="" /> : <div className="thumb-ph">Img</div>}
                </td>
                <td>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>{lp.title}</div>
                  <a href={`/#/landing-page/${lp.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} target="_blank" style={{ fontSize: 11, color: 'var(--gold-deep)', textDecoration: 'none' }}>View Page ↗</a>
                </td>
                <td style={{ fontSize: 12, color: 'var(--ink-soft)', maxWidth: 200 }}>
                  {lp.short_description || 'No description'}
                </td>
                <td>
                  <span className="badge badge-muted">{lp.products?.length || 0} products</span>
                </td>
                <td className="col-actions">
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button className="btn-icon btn btn-ghost btn-xs" title="Edit" onClick={() => { setEditItem(lp); setShowForm(true); }}><AIcon.Edit /></button>
                    <button className="btn-icon btn btn-danger btn-xs" title="Delete" onClick={() => setDeleteItem(lp)}><AIcon.Trash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && <LandingPageFormModal landingPage={editItem} allProducts={allProducts} onSave={handleSave} onClose={() => { setShowForm(false); setEditItem(null); }} />}
      {deleteItem && <DeleteConfirm item={deleteItem} entity="landing page" onConfirm={handleDelete} onClose={() => setDeleteItem(null)} />}
    </div>
  );
}

window.AdminLandingPages = AdminLandingPages;

/* global React, AIcon, DeleteConfirm, API */

const { useState, useEffect, useMemo } = React;

function LandingPageFormModal({ landingPage, allProducts, onSave, onClose }) {
  const [form, setForm] = useState(landingPage || {
    title: '', short_description: '', image: '', products: [], look_id: '', status: 'published', sort_order: 0, filter_rules: {}
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
    onSave({
      ...form,
      sort_order: Number(form.sort_order) || 0,
      filter_rules: form.filter_rules || {}
    });
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

  const previewSlug = (window.DSUtils && window.DSUtils.slugifyTitle(form.title)) || (form.title || 'july-sales').toLowerCase().replace(/[^a-z0-9]+/g, '-');

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
              <label className="form-label">Title <span>*</span></label>
              <input className={`form-input ${errors.title ? 'error' : ''}`} value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder="e.g. July Sales" />
              <p style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>Preview URL: #/landing-page/{landingPage?.id || previewSlug}</p>
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

            <div className="form-group">
              <label className="form-label">Fashion Look</label>
              <select className="form-input admin-select" value={form.look_id || ''} onChange={e => set('look_id', parseInt(e.target.value, 10) || '')} style={{ appearance: 'auto' }}>
                <option value="">Select a look...</option>
                {window._adminLooks?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status || 'published'} onChange={e => set('status', e.target.value)}>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Sort order</label>
                <input type="number" className="form-input" value={form.sort_order || 0} onChange={e => set('sort_order', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Minimum discount rule</label>
                <input
                  type="number"
                  min="0"
                  max="95"
                  className="form-input"
                  value={form.filter_rules?.minDiscount || ''}
                  onChange={e => set('filter_rules', { ...(form.filter_rules || {}), minDiscount: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="e.g. 70"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tagged Products ({form.products.length})</label>
              <div className="admin-search" style={{ marginBottom: 12 }}>
                <AIcon.Search />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products to tag..." />
              </div>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--line)', padding: 8 }}>
                {filteredProducts.slice(0, 50).map(p => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px', cursor: 'pointer', fontSize: 13 }}>
                    <input type="checkbox" checked={form.products.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                    <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{p.brand}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="admin-modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-gold">{landingPage ? 'Save changes' : 'Create page'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminLandingPages({ toast, initialAction, onActionHandled }) {
  const [landingPages, setLandingPages] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  async function refresh() {
    setLoading(true);
    try {
        const [lp, p, l] = await Promise.all([
          API.landingPages.getAll(),
          API.products.getAll(),
          API.looks.getAll()
        ]);
        setLandingPages(Array.isArray(lp) ? lp : []);
        setAllProducts(p);
        window._adminLooks = l;
    } catch(e) {
        toast('Failed to load landing pages', 'error');
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (initialAction === 'add') {
      setEditItem(null);
      setShowForm(true);
      onActionHandled && onActionHandled();
    }
  }, [initialAction]);

  async function handleSave(data) {
    try {
        if (editItem) {
          await API.landingPages.update(editItem.id, data);
          toast('Landing page updated', 'success');
        } else {
          await API.landingPages.create(data);
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
        await API.landingPages.delete(deleteItem.id);
        toast('Landing page deleted', 'success');
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
              <th>Status</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="6" style={{textAlign: 'center', padding: 30}}>Loading...</td></tr> : landingPages.length === 0 ? (
              <tr><td colSpan="6">
                <div className="admin-empty">
                  <h3>No landing pages yet</h3>
                  <p>Create a curated collection page to feature specific items.</p>
                  <button className="btn btn-gold btn-sm" onClick={() => { setEditItem(null); setShowForm(true); }}><AIcon.Plus /> Create page</button>
                </div>
              </td></tr>
            ) : landingPages.slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map(lp => (
              <tr key={lp.id}>
                <td className="col-thumb">
                  {lp.image ? <img src={lp.image} className="thumb-img" style={{ width: 60 }} alt="" /> : <div className="thumb-ph">Img</div>}
                </td>
                <td>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>{lp.title}</div>
                  <a href={`/#/landing-page/${lp.id}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--gold-deep)', textDecoration: 'none' }}>View Page ↗</a>
                </td>
                <td style={{ fontSize: 12, color: 'var(--ink-soft)', maxWidth: 200 }}>
                  {lp.short_description || 'No description'}
                </td>
                <td>
                  <span className="badge badge-muted">{lp.products?.length || 0} products</span>
                </td>
                <td>
                  <span style={{ 
                    padding: '2px 6px', borderRadius: 4, fontSize: 10, textTransform: 'uppercase', 
                    background: lp.status === 'published' ? '#d4edda' : '#f8d7da',
                    color: lp.status === 'published' ? '#155724' : '#721c24'
                  }}>
                    {lp.status || 'published'}
                  </span>
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

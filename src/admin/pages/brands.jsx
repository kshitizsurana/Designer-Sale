/* global React, AIcon, DeleteConfirm, API */
// Admin Brands — CRUD table

const { useState: useBrState, useEffect: useBrEffect, useMemo: useBrMemo } = React;

function BrandFormModal({ brand, onSave, onClose }) {
  const [form, setForm] = useBrState(brand || {
    name: '', description: '', website: '', founded: '', country: 'AU',
  });
  const [errors, setErrors] = useBrState({});

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function validate() {
    const e = {};
    if (!form.name?.trim()) e.name = 'Brand name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-head">
          <div className="admin-modal-title">{brand ? 'Edit Brand' : 'Add Brand'}</div>
          <button className="btn-icon" onClick={onClose}><AIcon.Close /></button>
        </div>
        <form onSubmit={submit} style={{ display: 'contents' }}>
          <div className="admin-modal-body">
            <div className="form-group">
              <label className="form-label">Brand name <span>*</span></label>
              <input className={`form-input ${errors.name ? 'error' : ''}`} value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Fashion Spectrum" autoFocus />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows="4" value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Brief description of the brand's story, aesthetic, and product focus..." style={{ resize: 'vertical' }} />
              <div className="form-hint">Used on the brand landing page.</div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Founded year</label>
                <input className="form-input" value={form.founded || ''} onChange={e => set('founded', e.target.value)} placeholder="e.g. 2015" type="number" min="1900" max="2026" />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <select className="form-input" value={form.country || 'AU'} onChange={e => set('country', e.target.value)} style={{ appearance: 'auto' }}>
                  <option value="AU">Australia</option>
                  <option value="NZ">New Zealand</option>
                  <option value="FR">France</option>
                  <option value="IT">Italy</option>
                  <option value="UK">United Kingdom</option>
                  <option value="US">United States</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Website URL</label>
              <input className="form-input" type="url" value={form.website || ''} onChange={e => set('website', e.target.value)} placeholder="https://brand.com.au" />
            </div>
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-gold btn-sm">
              {brand ? 'Save changes' : 'Add brand'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminBrands({ toast }) {
  const [brands, setBrands] = useBrState([]);
  const [products, setProducts] = useBrState([]);
  const [q, setQ] = useBrState('');
  const [editItem, setEditItem] = useBrState(null);
  const [showForm, setShowForm] = useBrState(false);
  const [deleteItem, setDeleteItem] = useBrState(null);
  const [loading, setLoading] = useBrState(true);

  async function refresh() {
    setLoading(true);
    try {
        const [b, p] = await Promise.all([API.brands.getAll(), API.products.getAll()]);
        setBrands(b);
        setProducts(p);
    } catch(e) {
        toast('Failed to load brands', 'error');
    } finally {
        setLoading(false);
    }
  }
  useBrEffect(() => { refresh(); }, []);

  const filtered = useBrMemo(() => {
    if (!q) return brands;
    return brands.filter(b => b.name.toLowerCase().includes(q.toLowerCase()));
  }, [brands, q]);

  const productCounts = useBrMemo(() => {
    const counts = {};
    products.forEach(p => { counts[p.brandId] = (counts[p.brandId] || 0) + 1; });
    return counts;
  }, [products]);

  const merchantCounts = useBrMemo(() => {
    const counts = {};
    products.forEach(p => {
      if (!counts[p.brandId]) counts[p.brandId] = new Set();
      counts[p.brandId].add(p.merchantId);
    });
    const result = {};
    Object.entries(counts).forEach(([k, v]) => { result[k] = v.size; });
    return result;
  }, [products]);

  async function handleSave(data) {
    try {
        if (editItem) {
          await API.brands.update(editItem.id, data);
          toast('Brand updated', 'success');
        } else {
          await API.brands.create(data);
          toast('Brand added', 'success');
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
        await API.brands.delete(deleteItem.id);
        toast(`${deleteItem.name} deleted`, 'success');
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
          <div className="admin-section-title">Brands</div>
          <div className="admin-section-sub">{brands.length} fashion labels</div>
        </div>
        <button className="btn btn-gold btn-sm" onClick={() => { setEditItem(null); setShowForm(true); }}>
          <AIcon.Plus /> Add brand
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <div className="admin-search">
            <AIcon.Search />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search brands…" />
          </div>
        </div>
        <div className="admin-toolbar-right">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {filtered.length} of {brands.length}
          </span>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Brand</th>
              <th>Country</th>
              <th>Founded</th>
              <th>Products</th>
              <th>Boutiques</th>
              <th>Website</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="7" style={{textAlign: 'center', padding: 30}}>Loading...</td></tr> : filtered.length === 0 ? (
              <tr><td colSpan="7">
                <div className="admin-empty">
                  <div className="admin-empty-icon"><AIcon.Brands /></div>
                  <h3>No brands found</h3>
                  <p>Start by adding your first brand.</p>
                  <button className="btn btn-gold btn-sm" onClick={() => { setEditItem(null); setShowForm(true); }}><AIcon.Plus /> Add brand</button>
                </div>
              </td></tr>
            ) : filtered.map(b => (
              <tr key={b.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, background: 'var(--bg-card)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--gold)', fontStyle: 'italic', flexShrink: 0 }}>
                      {b.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>{b.name}</div>
                      {b.description && <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.description}</div>}
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-muted">{b.country || 'AU'}</span></td>
                <td style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{b.founded || '—'}</td>
                <td><strong style={{ color: 'var(--gold-deep)' }}>{productCounts[b.id] || 0}</strong></td>
                <td style={{ color: 'var(--ink-soft)' }}>{merchantCounts[b.id] || 0}</td>
                <td>
                  {b.website ? (
                    <a href={b.website} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs" style={{ textDecoration: 'none' }}>
                      <AIcon.External /> Visit
                    </a>
                  ) : <span style={{ color: 'var(--ink-muted)', fontSize: 12 }}>—</span>}
                </td>
                <td className="col-actions">
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button className="btn-icon btn btn-ghost btn-xs" title="Edit" onClick={() => { setEditItem(b); setShowForm(true); }}><AIcon.Edit /></button>
                    <button className="btn-icon btn btn-danger btn-xs" title="Delete" onClick={() => setDeleteItem(b)}><AIcon.Trash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && <BrandFormModal brand={editItem} onSave={handleSave} onClose={() => { setShowForm(false); setEditItem(null); }} />}
      {deleteItem && <DeleteConfirm item={deleteItem} entity="brand" onConfirm={handleDelete} onClose={() => setDeleteItem(null)} />}
    </div>
  );
}

window.AdminBrands = AdminBrands;

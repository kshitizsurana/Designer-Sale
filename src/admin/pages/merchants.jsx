/* global React, AIcon, DeleteConfirm, API */
// Admin Merchants — full CRUD table

const { useState: useMState, useEffect: useMEffect, useMemo: useMemo_M } = React;

function MerchantFormModal({ merchant, onSave, onClose }) {
  const [form, setForm] = useMState(merchant || {
    name: '', city: '', state: '', focus: '', email: '', phone: '',
    website: '', description: '', online: true, inStore: true,
    facebook: '', instagram: '', bestContactMethod: 'email'
  });
  const [errors, setErrors] = useMState({});

  const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function validate() {
    const e = {};
    if (!form.name?.trim()) e.name = 'Name is required';
    if (!form.city?.trim()) e.city = 'City is required';
    if (!form.state) e.state = 'State is required';
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
          <div className="admin-modal-title">{merchant ? 'Edit Merchant' : 'Add Merchant'}</div>
          <button className="btn-icon" onClick={onClose}><AIcon.Close /></button>
        </div>
        <form onSubmit={submit} style={{ display: 'contents' }}>
          <div className="admin-modal-body">
            <div className="form-group">
              <label className="form-label">Boutique name <span>*</span></label>
              <input className={`form-input ${errors.name ? 'error' : ''}`} value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Blue Bungalow" />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City <span>*</span></label>
                <input className={`form-input ${errors.city ? 'error' : ''}`} value={form.city || ''} onChange={e => set('city', e.target.value)} placeholder="e.g. Noosa Heads" />
                {errors.city && <div className="form-error">{errors.city}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">State <span>*</span></label>
                <select className={`form-input admin-select ${errors.state ? 'error' : ''}`} value={form.state || ''} onChange={e => set('state', e.target.value)} style={{ appearance: 'auto', paddingRight: 14 }}>
                  <option value="">Select state</option>
                  {AU_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <div className="form-error">{errors.state}</div>}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Focus / Speciality</label>
              <input className="form-input" value={form.focus || ''} onChange={e => set('focus', e.target.value)} placeholder="e.g. Resort & holiday" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows="3" value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Brief description of the boutique..." style={{ resize: 'vertical' }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="hello@boutique.com.au" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="02 0000 0000" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Website URL</label>
              <input className="form-input" type="url" value={form.website || ''} onChange={e => set('website', e.target.value)} placeholder="https://boutique.com.au" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Facebook URL</label>
                <input className="form-input" type="url" value={form.facebook || ''} onChange={e => set('facebook', e.target.value)} placeholder="https://facebook.com/..." />
              </div>
              <div className="form-group">
                <label className="form-label">Instagram URL</label>
                <input className="form-input" type="url" value={form.instagram || ''} onChange={e => set('instagram', e.target.value)} placeholder="https://instagram.com/..." />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Best Contact Method</label>
              <select className="form-input admin-select" value={form.bestContactMethod || 'email'} onChange={e => set('bestContactMethod', e.target.value)}>
                <option value="email">Email</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div className="toggle-wrap" onClick={() => set('online', !form.online)}>
                <div className={`toggle ${form.online ? 'on' : ''}`} />
                <span className="toggle-label">Online store</span>
              </div>
              <div className="toggle-wrap" onClick={() => set('inStore', !form.inStore)}>
                <div className={`toggle ${form.inStore ? 'on' : ''}`} />
                <span className="toggle-label">Physical store</span>
              </div>
            </div>
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-gold btn-sm">
              {merchant ? 'Save changes' : 'Add merchant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ item, entity, onConfirm, onClose }) {
  return (
    <div className="confirm-dialog">
      <div className="confirm-box">
        <h3>Delete {entity}?</h3>
        <p>
          You are about to permanently delete <strong>{item?.name}</strong>.
          {entity === 'merchant' ? ' All products belonging to this merchant will also be removed.' : ''}
          This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger btn-sm" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function MerchantBulkUploadModal({ onClose, onComplete }) {
  const [file, setFile] = useMState(null);
  const [uploading, setUploading] = useMState(false);
  const [error, setError] = useMState(null);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) { setError('Please select a CSV file.'); return; }
    
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      
      const token = localStorage.getItem('ds_token');
      const res = await fetch('https://designer-sale.vercel.app/api/merchants/bulk', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Upload failed');
      onComplete(data.count);
    } catch(err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-head">
          <div className="admin-modal-title">Bulk Upload Merchants</div>
          <button className="btn-icon" onClick={onClose}><AIcon.Close /></button>
        </div>
        <form onSubmit={handleUpload} style={{ display: 'contents' }}>
          <div className="admin-modal-body">
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 20 }}>
              Upload a CSV file. Required columns: <code>name</code>. Optional columns: <code>state</code>, <code>city</code>, <code>online</code>, <code>inStore</code>, <code>focus</code>, <code>email</code>, <code>phone</code>, <code>website</code>, <code>description</code>, <code>facebook</code>, <code>instagram</code>, <code>bestContactMethod</code>.
            </p>
            {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}
            <div className="form-group">
              <label className="form-label">CSV File</label>
              <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} className="form-input" style={{ padding: 8 }} />
            </div>
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={uploading}>Cancel</button>
            <button type="submit" className="btn btn-gold btn-sm" disabled={uploading || !file}>
              {uploading ? 'Uploading...' : 'Upload CSV'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminMerchants({ toast }) {
  const [merchants, setMerchants] = useMState([]);
  const [products, setProducts] = useMState([]);
  const [q, setQ] = useMState('');
  const [stateFilter, setStateFilter] = useMState('all');
  const [channelFilter, setChannelFilter] = useMState('all');
  const [editItem, setEditItem] = useMState(null);
  const [showForm, setShowForm] = useMState(false);
  const [showBulk, setShowBulk] = useMState(false);
  const [deleteItem, setDeleteItem] = useMState(null);
  const [loading, setLoading] = useMState(true);

  async function refresh() {
    setLoading(true);
    try {
        const [m, p] = await Promise.all([API.merchants.getAll(), API.products.getAll()]);
        setMerchants(m);
        setProducts(p);
    } catch(e) {
        toast('Failed to load merchants', 'error');
    } finally {
        setLoading(false);
    }
  }
  useMEffect(() => { refresh(); }, []);

  const filtered = useMemo_M(() => {
    return merchants.filter(m => {
      if (stateFilter !== 'all' && m.state !== stateFilter) return false;
      if (channelFilter === 'online' && !m.online) return false;
      if (channelFilter === 'in-store' && !m.inStore) return false;
      if (q && !m.name.toLowerCase().includes(q.toLowerCase()) && !m.city.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [merchants, q, stateFilter, channelFilter]);

  const states = ['all', ...Array.from(new Set(merchants.map(m => m.state))).sort()];
  
  const productCounts = useMemo_M(() => {
    const counts = {};
    products.forEach(p => { counts[p.merchantId] = (counts[p.merchantId] || 0) + 1; });
    return counts;
  }, [products]);

  async function handleSave(data) {
    try {
        if (editItem) {
          await API.merchants.update(editItem.id, data);
          toast('Merchant updated', 'success');
        } else {
          await API.merchants.create(data);
          toast('Merchant added', 'success');
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
        await API.merchants.delete(deleteItem.id);
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
          <div className="admin-section-title">Merchants</div>
          <div className="admin-section-sub">{merchants.length} boutiques in directory</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline btn-sm" onClick={() => setShowBulk(true)}>
            <AIcon.Upload /> Bulk Upload
          </button>
          <button className="btn btn-gold btn-sm" onClick={() => { setEditItem(null); setShowForm(true); }}>
            <AIcon.Plus /> Add merchant
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <div className="admin-search">
            <AIcon.Search />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search merchants…" />
          </div>
          <select className="admin-select" value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
            {states.map(s => <option key={s} value={s}>{s === 'all' ? 'All states' : s}</option>)}
          </select>
          <select className="admin-select" value={channelFilter} onChange={e => setChannelFilter(e.target.value)}>
            <option value="all">All channels</option>
            <option value="online">Online only</option>
            <option value="in-store">In-store only</option>
          </select>
        </div>
        <div className="admin-toolbar-right">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {filtered.length} of {merchants.length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Focus</th>
              <th>Channels</th>
              <th>Products</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="6" style={{textAlign: 'center', padding: 30}}>Loading...</td></tr> : filtered.length === 0 ? (
              <tr><td colSpan="6">
                <div className="admin-empty">
                  <div className="admin-empty-icon"><AIcon.Merchants /></div>
                  <h3>No merchants found</h3>
                  <p>Try adjusting your filters or add a new merchant.</p>
                  <button className="btn btn-gold btn-sm" onClick={() => { setEditItem(null); setShowForm(true); }}><AIcon.Plus /> Add merchant</button>
                </div>
              </td></tr>
            ) : filtered.map(m => (
              <tr key={m.id}>
                <td>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>{m.name}</div>
                  {m.email && <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>{m.email}</div>}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-soft)', letterSpacing: '0.1em' }}>
                  {m.city}, {m.state}
                </td>
                <td style={{ fontSize: 12, color: 'var(--ink-soft)', maxWidth: 160 }}>{m.focus}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {m.online   && <span className="badge badge-success">Online</span>}
                    {m.inStore  && <span className="badge badge-muted">In-store</span>}
                  </div>
                </td>
                <td>
                  <strong style={{ color: 'var(--gold-deep)' }}>{productCounts[m.id] || 0}</strong>
                  <span style={{ color: 'var(--ink-muted)', fontSize: 11 }}> items</span>
                </td>
                <td className="col-actions">
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button className="btn-icon btn btn-ghost btn-xs" title="Edit" onClick={() => { setEditItem(m); setShowForm(true); }}><AIcon.Edit /></button>
                    <button className="btn-icon btn btn-danger btn-xs" title="Delete" onClick={() => setDeleteItem(m)}><AIcon.Trash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && <MerchantFormModal merchant={editItem} onSave={handleSave} onClose={() => { setShowForm(false); setEditItem(null); }} />}
      {showBulk && <MerchantBulkUploadModal onClose={() => setShowBulk(false)} onComplete={(count) => { setShowBulk(false); toast(`Uploaded ${count} merchants`, 'success'); refresh(); }} />}
      {deleteItem && <DeleteConfirm item={deleteItem} entity="merchant" onConfirm={handleDelete} onClose={() => setDeleteItem(null)} />}
    </div>
  );
}

window.AdminMerchants = AdminMerchants;
window.DeleteConfirm = DeleteConfirm;

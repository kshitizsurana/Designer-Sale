/* global React, AIcon, DeleteConfirm, API */
// Admin Looks — CRUD table

const { useState: useLkState, useEffect: useLkEffect, useMemo: useLkMemo } = React;

function LookFormModal({ look, onSave, onClose }) {
  const [form, setForm] = useLkState(look || {
    name: '', slug: '', description: '', hero_image: '', status: 'active'
  });
  const [errors, setErrors] = useLkState({});

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function validate() {
    const e = {};
    if (!form.name?.trim()) e.name = 'Look name is required';
    if (!form.slug?.trim()) e.slug = 'Slug is required';
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
          <div className="admin-modal-title">{look ? 'Edit Look' : 'Add Look'}</div>
          <button className="btn-icon" onClick={onClose}><AIcon.Close /></button>
        </div>
        <form onSubmit={submit} style={{ display: 'contents' }}>
          <div className="admin-modal-body">
            <div className="form-group">
              <label className="form-label">Look name <span>*</span></label>
              <input className={`form-input ${errors.name ? 'error' : ''}`} value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Formal Wear" autoFocus />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Slug <span>*</span></label>
              <input className={`form-input ${errors.slug ? 'error' : ''}`} value={form.slug || ''} onChange={e => set('slug', e.target.value)} placeholder="e.g. formal-wear" />
              {errors.slug && <div className="form-error">{errors.slug}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows="4" value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Describe the style, fit, and target audience..." style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Hero Image URL</label>
              <input className="form-input" type="url" value={form.hero_image || ''} onChange={e => set('hero_image', e.target.value)} placeholder="https://..." />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status || 'active'} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-gold btn-sm">
              {look ? 'Save changes' : 'Add look'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminLooks({ toast }) {
  const [looks, setLooks] = useLkState([]);
  const [merchants, setMerchants] = useLkState([]);
  const [products, setProducts] = useLkState([]);
  const [q, setQ] = useLkState('');
  const [editItem, setEditItem] = useLkState(null);
  const [showForm, setShowForm] = useLkState(false);
  const [deleteItem, setDeleteItem] = useLkState(null);
  const [loading, setLoading] = useLkState(true);

  async function refresh() {
    setLoading(true);
    try {
        const [l, m, p] = await Promise.all([API.looks.getAll(), API.merchants.getAll(), API.products.getAll()]);
        setLooks(l);
        setMerchants(m);
        setProducts(p);
    } catch(e) {
        toast('Failed to load looks', 'error');
    } finally {
        setLoading(false);
    }
  }
  useLkEffect(() => { refresh(); }, []);

  const filtered = useLkMemo(() => {
    if (!q) return looks;
    return looks.filter(l => l.name.toLowerCase().includes(q.toLowerCase()));
  }, [looks, q]);

  const stats = useLkMemo(() => {
    const s = {};
    looks.forEach(l => {
      s[l.id] = { merchants: 0, products: 0 };
    });
    merchants.forEach(m => {
      if (m.look_id && s[m.look_id]) s[m.look_id].merchants++;
    });
    products.forEach(p => {
      if (p.look_id && s[p.look_id]) s[p.look_id].products++;
    });
    return s;
  }, [looks, merchants, products]);

  async function handleSave(data) {
    try {
        if (editItem) {
          await API.looks.update(editItem.id, data);
          toast('Look updated', 'success');
        } else {
          await API.looks.create(data);
          toast('Look added', 'success');
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
        await API.looks.delete(deleteItem.id);
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
          <div className="admin-section-title">Fashion Looks</div>
          <div className="admin-section-sub">{looks.length} style profiles</div>
        </div>
        <button className="btn btn-gold btn-sm" onClick={() => { setEditItem(null); setShowForm(true); }}>
          <AIcon.Plus /> Add look
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <div className="admin-search">
            <AIcon.Search />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search looks…" />
          </div>
        </div>
        <div className="admin-toolbar-right">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {filtered.length} of {looks.length}
          </span>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Look</th>
              <th>Status</th>
              <th>Merchants</th>
              <th>Products</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" style={{textAlign: 'center', padding: 30}}>Loading...</td></tr> : filtered.length === 0 ? (
              <tr><td colSpan="5">
                <div className="admin-empty">
                  <div className="admin-empty-icon"><AIcon.Category /></div>
                  <h3>No looks found</h3>
                  <p>Start by adding your first style profile.</p>
                  <button className="btn btn-gold btn-sm" onClick={() => { setEditItem(null); setShowForm(true); }}><AIcon.Plus /> Add look</button>
                </div>
              </td></tr>
            ) : filtered.map(l => {
              const st = stats[l.id] || { merchants: 0, products: 0 };
              return (
                <tr key={l.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 48, height: 48, background: 'var(--bg-card)', border: '1px solid var(--line)', backgroundImage: `url(${l.hero_image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>{l.name}</div>
                        {l.description && <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${l.status === 'active' ? '' : 'badge-muted'}`} style={l.status === 'active' ? {background: 'var(--success-bg)', color: 'var(--success-text)'} : {}}>
                      {l.status === 'active' ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td><strong style={{ color: 'var(--gold-deep)' }}>{st.merchants}</strong></td>
                  <td><strong style={{ color: 'var(--gold-deep)' }}>{st.products}</strong></td>
                  <td className="col-actions">
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <a href={`/#/looks/${l.slug}`} target="_blank" rel="noreferrer" className="btn-icon btn btn-ghost btn-xs" title="View"><AIcon.External /></a>
                      <button className="btn-icon btn btn-ghost btn-xs" title="Edit" onClick={() => { setEditItem(l); setShowForm(true); }}><AIcon.Edit /></button>
                      <button className="btn-icon btn btn-danger btn-xs" title="Delete" onClick={() => setDeleteItem(l)}><AIcon.Trash /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && <LookFormModal look={editItem} onSave={handleSave} onClose={() => { setShowForm(false); setEditItem(null); }} />}
      {deleteItem && <DeleteConfirm item={deleteItem} entity="look" onConfirm={handleDelete} onClose={() => setDeleteItem(null)} />}
    </div>
  );
}

window.AdminLooks = AdminLooks;

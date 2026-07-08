/* global React, AIcon, DeleteConfirm, API */
// Admin Looks — CRUD table

const { useState: useLkState, useEffect: useLkEffect, useMemo: useLkMemo } = React;

function LookFormModal({ look, onSave, onClose }) {
  const [form, setForm] = useLkState(look || {
    name: '', slug: '', description: '', hero_image: '', status: 'active',
    tagline: '', keywords: [], feature_title: '', feature_body: '', feature_cta: ''
  });
  const [errors, setErrors] = useLkState({});
  const [keywordsStr, setKeywordsStr] = useLkState((look?.keywords || []).join(', '));
  const [uploading, setUploading] = useLkState(false);
  const [uploadMsg, setUploadMsg] = useLkState('');

  async function handleImageFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setUploadMsg('File too large (max 8 MB)'); return; }
    setUploading(true);
    setUploadMsg('Uploading…');
    try {
      const result = await API.images.upload(file);
      set('hero_image', result.url);
      setUploadMsg(result.warning ? `⚠️ ${result.warning}` : '✅ Uploaded!');
    } catch (err) {
      setUploadMsg('❌ Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

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
    const keywords = keywordsStr.split(',').map(k => k.trim()).filter(Boolean);
    onSave({ ...form, keywords });
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ width: 680, maxWidth: '95%' }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal-head">
          <div className="admin-modal-title">{look ? 'Edit Look' : 'Add Look'}</div>
          <button className="btn-icon" onClick={onClose}><AIcon.Close /></button>
        </div>
        <form onSubmit={submit} style={{ display: 'contents' }}>
          <div className="admin-modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold-deep)', padding: '0 0 12px', borderBottom: '1px solid var(--border-light)', marginBottom: 20 }}>Basic Info</div>
            <div className="form-group">
              <label className="form-label">Look name <span>*</span></label>
              <input className={`form-input ${errors.name ? 'error' : ''}`} value={form.name || ''} onChange={e => { set('name', e.target.value); if (!look) set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')); }} placeholder="e.g. Formal Wear" autoFocus />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Slug <span>*</span></label>
              <input className={`form-input ${errors.slug ? 'error' : ''}`} value={form.slug || ''} onChange={e => set('slug', e.target.value)} placeholder="e.g. formal-wear" />
              {errors.slug && <div className="form-error">{errors.slug}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Short Description</label>
              <textarea className="form-input" rows="3" value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Describe the style, fit, and target audience..." style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Hero Image URL</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <input className="form-input" type="url" value={form.hero_image || ''} onChange={e => set('hero_image', e.target.value)} placeholder="Paste image URL..." style={{ flex: 1 }} />
                <label className={`btn btn-ghost btn-sm`} style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1, whiteSpace: 'nowrap' }}>
                  {uploading ? 'Uploading…' : '⬆ Upload File'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFile} disabled={uploading} />
                </label>
              </div>
              {uploadMsg && <div style={{ fontSize: 11, color: uploadMsg.startsWith('❌') ? 'var(--color-danger)' : uploadMsg.startsWith('⚠️') ? '#c9a24a' : 'green', marginBottom: 6 }}>{uploadMsg}</div>}
              {form.hero_image && (
                <div style={{ marginTop: 6 }}>
                  <img src={form.hero_image} alt="Preview" style={{ maxWidth: 120, maxHeight: 80, objectFit: 'cover', border: '1px solid var(--line)' }} onError={e => { e.currentTarget.style.display='none'; }} />
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status || 'active'} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold-deep)', padding: '20px 0 12px', borderBottom: '1px solid var(--border-light)', marginBottom: 20 }}>Editorial Content (overrides defaults)</div>
            <div className="form-group">
              <label className="form-label">Hero Tagline</label>
              <input className="form-input" value={form.tagline || ''} onChange={e => set('tagline', e.target.value)} placeholder="e.g. Sharply dressed, always." />
              <p style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>Shown below the look name in the hero section.</p>
            </div>
            <div className="form-group">
              <label className="form-label">Keywords (comma-separated)</label>
              <input className="form-input" value={keywordsStr} onChange={e => setKeywordsStr(e.target.value)} placeholder="e.g. Tailored, Classic, Refined" />
              <p style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 4 }}>Shown as pills in the hero. Separate each keyword with a comma.</p>
            </div>
            <div className="form-group">
              <label className="form-label">Feature Section Title</label>
              <input className="form-input" value={form.feature_title || ''} onChange={e => set('feature_title', e.target.value)} placeholder="e.g. The Art of Formal Dressing" />
            </div>
            <div className="form-group">
              <label className="form-label">Feature Section Body</label>
              <textarea className="form-input" rows="4" value={form.feature_body || ''} onChange={e => set('feature_body', e.target.value)} placeholder="Describe the look's story and values..." style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Feature CTA Button Text</label>
              <input className="form-input" value={form.feature_cta || ''} onChange={e => set('feature_cta', e.target.value)} placeholder="e.g. Shop Formal Now" />
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
        const [l, mRaw, pRaw] = await Promise.all([API.looks.getAll(), API.merchants.getAll(), API.products.getAll()]);
        const m = mRaw.map(merchant => ({
          ...merchant,
          look_id: merchant.look_id || null
        }));

        const mLookup = Object.fromEntries(m.map(x => [x.id, x.look_id]));

        const p = pRaw.map(prod => ({
          ...prod,
          look_id: prod.look_id || mLookup[prod.merchantId] || null
        }));

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
                  <div className="admin-empty-icon"><AIcon.Looks /></div>
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
                      <a href={`/#/look/${l.slug}`} target="_blank" rel="noreferrer" className="btn-icon btn btn-ghost btn-xs" title="View"><AIcon.External /></a>
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

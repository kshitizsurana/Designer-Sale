/* global React, AIcon, DeleteConfirm, API */

const { useState: useCatAdminState, useEffect: useCatAdminEffect, useMemo: useCatAdminMemo } = React;

function CategoryFormModal({ category, onSave, onClose }) {
  const [form, setForm] = useCatAdminState(category || {
    id: '', label: '', image: '', swatch: ['#C9B8A8', '#A8854A'], status: 'active', sort_order: 0
  });
  const [errors, setErrors] = useCatAdminState({});

  function set(key, value) { setForm(f => ({ ...f, [key]: value })); }

  function validate() {
    const next = {};
    if (!form.label?.trim()) next.label = 'Name is required';
    if (!category && !form.id?.trim()) next.id = 'Slug is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...form,
      id: form.id || form.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      swatch: Array.isArray(form.swatch) ? form.swatch : ['#C9B8A8', '#A8854A'],
      sort_order: Number(form.sort_order) || 0
    });
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-head">
          <div className="admin-modal-title">{category ? 'Edit Category' : 'Add Category'}</div>
          <button className="btn-icon" onClick={onClose}><AIcon.Close /></button>
        </div>
        <form onSubmit={submit} style={{ display: 'contents' }}>
          <div className="admin-modal-body">
            <div className="form-group">
              <label className="form-label">Category name <span>*</span></label>
              <input className={`form-input ${errors.label ? 'error' : ''}`} value={form.label || ''} onChange={e => {
                set('label', e.target.value);
                if (!category) set('id', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
              }} placeholder="e.g. Footwear" />
              {errors.label && <div className="form-error">{errors.label}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Slug <span>*</span></label>
              <input className={`form-input ${errors.id ? 'error' : ''}`} value={form.id || ''} onChange={e => set('id', e.target.value)} disabled={!!category} />
              {errors.id && <div className="form-error">{errors.id}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input className="form-input" type="url" value={form.image || ''} onChange={e => set('image', e.target.value)} placeholder="https://..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Swatch A</label>
                <input className="form-input" type="color" value={(form.swatch && form.swatch[0]) || '#C9B8A8'} onChange={e => set('swatch', [e.target.value, (form.swatch && form.swatch[1]) || '#A8854A'])} />
              </div>
              <div className="form-group">
                <label className="form-label">Swatch B</label>
                <input className="form-input" type="color" value={(form.swatch && form.swatch[1]) || '#A8854A'} onChange={e => set('swatch', [(form.swatch && form.swatch[0]) || '#C9B8A8', e.target.value])} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Sort order</label>
                <input className="form-input" type="number" value={form.sort_order || 0} onChange={e => set('sort_order', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status || 'active'} onChange={e => set('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-gold btn-sm">{category ? 'Save changes' : 'Add category'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminCategories({ toast, initialAction, onActionHandled }) {
  const [categories, setCategories] = useCatAdminState([]);
  const [products, setProducts] = useCatAdminState([]);
  const [q, setQ] = useCatAdminState('');
  const [loading, setLoading] = useCatAdminState(true);
  const [editItem, setEditItem] = useCatAdminState(null);
  const [showForm, setShowForm] = useCatAdminState(false);
  const [deleteItem, setDeleteItem] = useCatAdminState(null);

  async function refresh() {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([API.categories.getAll(), API.products.getAll()]);
      setCategories(c);
      setProducts(p);
    } catch (error) {
      toast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  }

  useCatAdminEffect(() => { refresh(); }, []);
  useCatAdminEffect(() => {
    if (initialAction === 'add') {
      setEditItem(null);
      setShowForm(true);
      onActionHandled && onActionHandled();
    }
  }, [initialAction]);

  const productCounts = useCatAdminMemo(() => {
    const counts = {};
    products.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return counts;
  }, [products]);

  const filtered = useCatAdminMemo(() => {
    return categories
      .filter(c => !q || c.label.toLowerCase().includes(q.toLowerCase()) || c.id.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.label.localeCompare(b.label));
  }, [categories, q]);

  async function handleSave(data) {
    try {
      if (editItem) {
        await API.categories.update(editItem.id, data);
        toast('Category updated', 'success');
      } else {
        await API.categories.create(data);
        toast('Category added', 'success');
      }
      setShowForm(false);
      setEditItem(null);
      refresh();
    } catch (error) {
      toast(error.message, 'error');
    }
  }

  async function handleDelete() {
    try {
      await API.categories.delete(deleteItem.id);
      toast('Category deleted', 'success');
      setDeleteItem(null);
      refresh();
    } catch (error) {
      toast(error.message, 'error');
    }
  }

  return (
    <div>
      <div className="admin-section-head">
        <div>
          <div className="admin-section-title">Categories</div>
          <div className="admin-section-sub">{categories.length} shopping filters</div>
        </div>
        <button className="btn btn-gold btn-sm" onClick={() => { setEditItem(null); setShowForm(true); }}>
          <AIcon.Plus /> Add category
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <AIcon.Search />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search categories..." />
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="col-thumb">Image</th>
              <th>Category</th>
              <th>Products</th>
              <th>Status</th>
              <th>Order</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: 30 }}>Loading...</td></tr> : filtered.map(c => (
              <tr key={c.id}>
                <td className="col-thumb">
                  {c.image ? <img src={c.image} className="thumb-img" alt="" /> : <div className="thumb-ph">{c.label[0]}</div>}
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{c.label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-muted)' }}>{c.id}</div>
                </td>
                <td><span className="badge badge-muted">{productCounts[c.id] || 0}</span></td>
                <td><span className={`badge ${c.status === 'archived' ? 'badge-danger' : 'badge-success'}`}>{c.status || 'active'}</span></td>
                <td>{c.sort_order || 0}</td>
                <td className="col-actions">
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button className="btn-icon btn btn-ghost btn-xs" onClick={() => { setEditItem(c); setShowForm(true); }}><AIcon.Edit /></button>
                    <button className="btn-icon btn btn-danger btn-xs" onClick={() => setDeleteItem(c)}><AIcon.Trash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && <CategoryFormModal category={editItem} onSave={handleSave} onClose={() => { setShowForm(false); setEditItem(null); }} />}
      {deleteItem && <DeleteConfirm item={deleteItem} entity="category" onConfirm={handleDelete} onClose={() => setDeleteItem(null)} />}
    </div>
  );
}

window.AdminCategories = AdminCategories;

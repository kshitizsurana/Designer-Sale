/* global React, AIcon, DeleteConfirm, API */
// Admin Products — full CRUD table with complex filters

const { useState: usePState, useEffect: usePEffect, useMemo: useMemo_P } = React;

function ProductFormModal({ product, categories, merchants, brands, onSave, onClose }) {
  const [form, setForm] = usePState(product || {
    title: '', category: 'maxi-dresses', merchantId: merchants[0]?.id || '', brandId: brands[0]?.id || '',
    rrp: '', sale: '', newIn: false, sizes: [], image: '', description: ''
  });
  const [sizeInput, setSizeInput] = usePState('');
  const [errors, setErrors] = usePState({});

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function addSize(e) {
    if (e.key === 'Enter' || e.type === 'blur') {
      e.preventDefault();
      const s = sizeInput.trim();
      if (s && !form.sizes.includes(s)) {
        set('sizes', [...form.sizes, s]);
      }
      setSizeInput('');
    }
  }

  function removeSize(s) {
    set('sizes', form.sizes.filter(x => x !== s));
  }

  function validate() {
    const e = {};
    if (!form.title?.trim()) e.title = 'Title is required';
    if (!form.merchantId) e.merchantId = 'Merchant is required';
    if (!form.brandId) e.brandId = 'Brand is required';
    if (!form.rrp || form.rrp <= 0) e.rrp = 'Valid RRP is required';
    if (!form.sale || form.sale <= 0) e.sale = 'Valid Sale Price is required';
    if (form.sale > form.rrp) e.sale = 'Sale price must be lower than RRP';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...form,
      rrp: Number(form.rrp),
      sale: Number(form.sale),
    });
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-head">
          <div className="admin-modal-title">{product ? 'Edit Product' : 'Add Product'}</div>
          <button className="btn-icon" onClick={onClose}><AIcon.Close /></button>
        </div>
        <form onSubmit={submit} style={{ display: 'contents' }}>
          <div className="admin-modal-body">
            
            <div className="form-group">
              <label className="form-label">Product title <span>*</span></label>
              <input className={`form-input ${errors.title ? 'error' : ''}`} value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder="e.g. Bias-Cut Silk Slip Maxi" autoFocus />
              {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Category <span>*</span></label>
                <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)} style={{ appearance: 'auto' }}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Brand <span>*</span></label>
                <select className={`form-input ${errors.brandId ? 'error' : ''}`} value={form.brandId} onChange={e => set('brandId', e.target.value)} style={{ appearance: 'auto' }}>
                  <option value="">Select brand...</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                {errors.brandId && <div className="form-error">{errors.brandId}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Merchant <span>*</span></label>
                <select className={`form-input ${errors.merchantId ? 'error' : ''}`} value={form.merchantId} onChange={e => set('merchantId', e.target.value)} style={{ appearance: 'auto' }}>
                  <option value="">Select merchant...</option>
                  {merchants.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                {errors.merchantId && <div className="form-error">{errors.merchantId}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">RRP ($) <span>*</span></label>
                <input type="number" className={`form-input ${errors.rrp ? 'error' : ''}`} value={form.rrp || ''} onChange={e => set('rrp', e.target.value)} placeholder="0" />
                {errors.rrp && <div className="form-error">{errors.rrp}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Sale Price ($) <span>*</span></label>
                <input type="number" className={`form-input ${errors.sale ? 'error' : ''}`} value={form.sale || ''} onChange={e => set('sale', e.target.value)} placeholder="0" />
                {errors.sale && <div className="form-error">{errors.sale}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Available Sizes</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                {form.sizes.map(s => (
                  <span key={s} className="badge badge-muted" style={{ paddingRight: 4 }}>
                    {s} <button type="button" onClick={() => removeSize(s)} style={{ marginLeft: 4 }}><AIcon.Close /></button>
                  </span>
                ))}
              </div>
              <input
                className="form-input"
                placeholder="Type size and press Enter (e.g. S, M, L, OS)"
                value={sizeInput}
                onChange={e => setSizeInput(e.target.value)}
                onKeyDown={addSize}
                onBlur={addSize}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input type="url" className="form-input" value={form.image || ''} onChange={e => set('image', e.target.value)} placeholder="https://..." />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows="3" value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="About this piece..." style={{ resize: 'vertical' }} />
            </div>

            <div className="toggle-wrap" onClick={() => set('newIn', !form.newIn)}>
              <div className={`toggle ${form.newIn ? 'on' : ''}`} />
              <span className="toggle-label">Mark as "New In"</span>
            </div>

          </div>
          <div className="admin-modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-gold btn-sm">
              {product ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


function AdminProducts({ toast }) {
  const [products, setProducts] = usePState([]);
  const [categories, setCategories] = usePState([]);
  const [merchants, setMerchants] = usePState([]);
  const [brands, setBrands] = usePState([]);
  const [loading, setLoading] = usePState(true);

  const [q, setQ] = usePState('');
  const [catFilter, setCatFilter] = usePState('all');
  const [merchFilter, setMerchFilter] = usePState('all');
  const [brandFilter, setBrandFilter] = usePState('all');
  const [page, setPage] = usePState(1);
  const itemsPerPage = 20;

  const [editItem, setEditItem] = usePState(null);
  const [showForm, setShowForm] = usePState(false);
  const [deleteItem, setDeleteItem] = usePState(null);

  async function refresh() {
    setLoading(true);
    try {
        const [p, c, m, b] = await Promise.all([
            API.products.getAll(),
            API.categories.getAll(),
            API.merchants.getAll(),
            API.brands.getAll()
        ]);
        setProducts(p);
        setCategories(c);
        setMerchants(m);
        setBrands(b);
    } catch(e) {
        toast('Failed to load products', 'error');
    } finally {
        setLoading(false);
    }
  }

  usePEffect(() => { refresh(); }, []);

  const filtered = useMemo_P(() => {
    return products.filter(p => {
      if (catFilter !== 'all' && p.category !== catFilter) return false;
      if (merchFilter !== 'all' && p.merchantId !== merchFilter) return false;
      if (brandFilter !== 'all' && p.brandId !== brandFilter) return false;
      if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    }).sort((a, b) => (b.added || 0) - (a.added || 0)); // Latest first
  }, [products, q, catFilter, merchFilter, brandFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Reset page when filters change
  usePEffect(() => { setPage(1); }, [q, catFilter, merchFilter, brandFilter]);

  async function handleSave(data) {
    try {
        if (editItem) {
          await API.products.update(editItem.id, data);
          toast('Product updated', 'success');
        } else {
          await API.products.create(data);
          toast('Product added', 'success');
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
        await API.products.delete(deleteItem.id);
        toast('Product deleted', 'success');
        setDeleteItem(null);
        refresh();
    } catch(e) {
        toast(e.message, 'error');
    }
  }

  const merchMap = useMemo_P(() => {
    const map = {};
    merchants.forEach(m => map[m.id] = m.name);
    return map;
  }, [merchants]);

  const brandMap = useMemo_P(() => {
    const map = {};
    brands.forEach(b => map[b.id] = b.name);
    return map;
  }, [brands]);

  return (
    <div>
      <div className="admin-section-head">
        <div>
          <div className="admin-section-title">Products</div>
          <div className="admin-section-sub">{products.length} total items on sale</div>
        </div>
        <button className="btn btn-gold btn-sm" onClick={() => { setEditItem(null); setShowForm(true); }}>
          <AIcon.Plus /> Add product
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <div className="admin-search">
            <AIcon.Search />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products…" />
          </div>
          <select className="admin-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select className="admin-select" value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
            <option value="all">All Brands</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select className="admin-select" value={merchFilter} onChange={e => setMerchFilter(e.target.value)}>
            <option value="all">All Merchants</option>
            {merchants.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="admin-toolbar-right">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {filtered.length} found
          </span>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="col-thumb"></th>
              <th>Product</th>
              <th>Brand / Category</th>
              <th>Merchant</th>
              <th>RRP</th>
              <th>Sale</th>
              <th>%</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="8" style={{textAlign: 'center', padding: 30}}>Loading...</td></tr> : filtered.length === 0 ? (
              <tr><td colSpan="8">
                <div className="admin-empty">
                  <div className="admin-empty-icon"><AIcon.Products /></div>
                  <h3>No products found</h3>
                  <p>Try adjusting your filters.</p>
                </div>
              </td></tr>
            ) : paginated.map(p => (
              <tr key={p.id}>
                <td className="col-thumb">
                  {p.image
                    ? <img src={p.image} className="thumb-img" alt="" onError={e => e.currentTarget.style.display='none'} />
                    : <div className="thumb-ph">{(brandMap[p.brandId] || '?')[0]}</div>
                  }
                </td>
                <td>
                  <div style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{p.title}</div>
                  {p.newIn && <div style={{ marginTop: 4 }}><span className="badge badge-success" style={{ fontSize: 9 }}>New In</span></div>}
                </td>
                <td>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>{brandMap[p.brandId] || 'Unknown'}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, textTransform: 'uppercase', color: 'var(--ink-muted)' }}>{p.category}</div>
                </td>
                <td><span className="badge badge-muted">{merchMap[p.merchantId] || 'Unknown'}</span></td>
                <td style={{ color: 'var(--ink-muted)', textDecoration: 'line-through' }}>${p.rrp}</td>
                <td style={{ fontWeight: 600 }}>${p.sale}</td>
                <td><span className="badge badge-gold">{p.discountPct}%</span></td>
                <td className="col-actions">
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button className="btn-icon btn btn-ghost btn-xs" title="Edit" onClick={() => { setEditItem(p); setShowForm(true); }}><AIcon.Edit /></button>
                    <button className="btn-icon btn btn-danger btn-xs" title="Delete" onClick={() => setDeleteItem(p)}><AIcon.Trash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button className="admin-pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span style={{ padding: '0 10px', fontFamily: 'var(--font-mono)', fontSize: 10 }}>Page {page} of {totalPages}</span>
          <button className="admin-pag-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      {showForm && <ProductFormModal product={editItem} categories={categories} brands={brands} merchants={merchants} onSave={handleSave} onClose={() => { setShowForm(false); setEditItem(null); }} />}
      {deleteItem && <DeleteConfirm item={deleteItem} entity="product" onConfirm={handleDelete} onClose={() => setDeleteItem(null)} />}
    </div>
  );
}

window.AdminProducts = AdminProducts;

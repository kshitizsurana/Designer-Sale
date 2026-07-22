/* global React, API, AIcon */
// AdminPanel — Collections Management

const { useState: useCollectionsState, useEffect: useCollectionsEffect, useMemo: useCollectionsMemo } = React;

function AdminCollections({ toast }) {
  const [collections, setCollections] = useCollectionsState([]);
  const [looks, setLooks] = useCollectionsState([]);
  const [products, setProducts] = useCollectionsState([]);
  const [loading, setLoading] = useCollectionsState(true);

  // Form states
  const [editing, setEditing] = useCollectionsState(null);
  const [isProductsModalOpen, setIsProductsModalOpen] = useCollectionsState(false);
  const [selectedProductIds, setSelectedProductIds] = useCollectionsState([]);
  const [searchTerm, setSearchTerm] = useCollectionsState('');

  const filteredProducts = useCollectionsMemo(() => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(p => 
      (p.title || '').toLowerCase().includes(term) || 
      (p.brand || '').toLowerCase().includes(term) ||
      (p.category || '').toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  // Derived arrays for selected vs unselected
  const selectedProducts = useCollectionsMemo(() => {
    const map = new Map(products.map(p => [p.id, p]));
    return selectedProductIds.map(id => map.get(id)).filter(Boolean);
  }, [products, selectedProductIds]);

  useCollectionsEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [colData, looksData, prodData] = await Promise.all([
        API.collections.getAll().catch(() => []), // gracefully handle missing tables
        API.looks.getAll(),
        API.products.getAll()
      ]);
      setCollections(colData);
      setLooks(looksData);
      setProducts(prodData);
    } catch (e) {
      toast({ type: 'error', msg: e.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    payload.look_id = parseInt(payload.look_id);
    payload.display_order = parseInt(payload.display_order) || 0;
    
    // Simple slug generator if not provided
    if (!payload.slug) {
        payload.slug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    try {
      if (editing.id) {
        await API.collections.update(editing.id, payload);
        toast({ type: 'success', msg: 'Collection updated' });
      } else {
        await API.collections.create(payload);
        toast({ type: 'success', msg: 'Collection created' });
      }
      setEditing(null);
      loadData();
    } catch (err) {
      toast({ type: 'error', msg: err.message });
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    try {
      await API.collections.delete(id);
      toast({ type: 'success', msg: 'Collection deleted' });
      loadData();
    } catch (e) {
      toast({ type: 'error', msg: e.message });
    }
  }

  // ---- Products Assignment ----
  function openProductsModal(collection) {
    setEditing(collection);
    setSelectedProductIds(collection.product_ids || []);
    setIsProductsModalOpen(true);
  }

  function addProduct(id) {
    if (!selectedProductIds.includes(id)) setSelectedProductIds(prev => [...prev, id]);
  }
  function removeProduct(id) {
    setSelectedProductIds(prev => prev.filter(pid => pid !== id));
  }
  function moveProduct(index, dir) {
    setSelectedProductIds(prev => {
      if (index + dir < 0 || index + dir >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + dir];
      next[index + dir] = temp;
      return next;
    });
  }

  async function saveProductsSelection() {
    try {
      await API.collections.updateProducts(editing.id, selectedProductIds);
      toast({ type: 'success', msg: 'Products updated for collection' });
      setIsProductsModalOpen(false);
      loadData();
    } catch (err) {
      toast({ type: 'error', msg: err.message });
    }
  }

  if (loading) return <div style={{ padding: 40, color: 'var(--ink-muted)' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>Curated Collections</h2>
        <button className="btn btn-ink" onClick={() => setEditing({ status: 'published', display_order: 0 })}>
          <AIcon.Plus /> New Collection
        </button>
      </div>

      {editing && !isProductsModalOpen && (
        <div className="admin-card" style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 16 }}>{editing.id ? 'Edit Collection' : 'New Collection'}</h3>
          <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Title</label>
              <input type="text" name="title" className="form-input" defaultValue={editing.title} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">Look / Style</label>
              <select name="look_id" className="form-input" defaultValue={editing.look_id} required>
                <option value="">Select a Style...</option>
                {looks.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Slug (URL Segment)</label>
              <input type="text" name="slug" className="form-input" defaultValue={editing.slug} placeholder="Leave blank to auto-generate" />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Hero Image URL</label>
              <input type="url" name="hero_image" className="form-input" defaultValue={editing.hero_image} />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Description</label>
              <textarea name="description" className="form-input" defaultValue={editing.description} rows={3}></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Display Order (0 is first)</label>
              <input type="number" name="display_order" className="form-input" defaultValue={editing.display_order} required />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-input" defaultValue={editing.status}>
                <option value="published">Published</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="submit" className="btn btn-ink">Save</button>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* PRODUCTS MODAL - REDESIGNED */}
      {isProductsModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="admin-card" style={{ width: '95%', maxWidth: 1200, height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <h3 style={{ marginBottom: 4 }}>Assign Products: {editing.title}</h3>
                        <p style={{ color: 'var(--ink-muted)', fontSize: 13 }}>Search and assign products. Order matters (items at top show first).</p>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setIsProductsModalOpen(false)}><AIcon.Close /></button>
                </div>
                
                <div style={{ display: 'flex', gap: 24, flex: 1, minHeight: 0 }}>
                    {/* Left side: Selected Products */}
                    <div style={{ flex: '0 0 45%', display: 'flex', flexDirection: 'column', border: '1px solid var(--gold-soft)', borderRadius: 6, background: '#faf9f7', overflow: 'hidden' }}>
                        <div style={{ padding: '12px 16px', background: 'var(--gold-soft)', color: 'var(--ink)', fontWeight: 600, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            Selected Items ({selectedProducts.length})
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                            {selectedProducts.length === 0 ? (
                                <div style={{ color: 'var(--ink-muted)', textAlign: 'center', padding: 40, fontSize: 14 }}>No products selected yet. Add some from the right.</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {selectedProducts.map((p, idx) => (
                                        <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#fff', border: '1px solid var(--line)', borderRadius: 4, padding: '8px 12px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                <button className="btn btn-ghost btn-sm" style={{ padding: 2, height: 'auto', minWidth: 'auto', color: idx === 0 ? '#ccc' : 'var(--ink)' }} onClick={() => moveProduct(idx, -1)} disabled={idx === 0}>▲</button>
                                                <button className="btn btn-ghost btn-sm" style={{ padding: 2, height: 'auto', minWidth: 'auto', color: idx === selectedProducts.length - 1 ? '#ccc' : 'var(--ink)' }} onClick={() => moveProduct(idx, 1)} disabled={idx === selectedProducts.length - 1}>▼</button>
                                            </div>
                                            <img src={p.image} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, background: '#eee' }} />
                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                <div style={{ fontWeight: 600, fontSize: 13, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{p.brand}</div>
                                                <div style={{ fontSize: 12, color: 'var(--ink-muted)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{p.title}</div>
                                                <div style={{ fontSize: 11, color: 'var(--gold-deep)' }}>${p.sale} <span style={{ textDecoration: 'line-through', color: '#aaa' }}>${p.rrp}</span></div>
                                            </div>
                                            <button className="btn btn-ghost btn-sm" style={{ color: 'red' }} onClick={() => removeProduct(p.id)} title="Remove">✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right side: Available Products */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid var(--line)', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ padding: 12, borderBottom: '1px solid var(--line)', background: '#f5f5f5', display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ fontWeight: 600 }}>Available Products</div>
                            <input 
                                type="text" 
                                className="form-input" 
                                placeholder="Search by brand, title..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ flex: 1, padding: '6px 12px' }}
                            />
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, alignContent: 'start' }}>
                            {filteredProducts.map(p => {
                                const isSelected = selectedProductIds.includes(p.id);
                                if (isSelected) return null; // hide already selected items from available pool to keep it clean
                                return (
                                    <div 
                                        key={p.id} 
                                        onClick={() => addProduct(p.id)}
                                        style={{ 
                                            border: '1px solid var(--line)', 
                                            borderRadius: 4, padding: 8, cursor: 'pointer',
                                            background: '#fff',
                                            display: 'flex', gap: 8, alignItems: 'center',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
                                    >
                                        <img src={p.image} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 2 }} />
                                        <div style={{ fontSize: 11, lineHeight: 1.2, overflow: 'hidden' }}>
                                            <div style={{ fontWeight: 600 }}>{p.brand}</div>
                                            <div style={{ color: 'var(--ink-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{p.title}</div>
                                            <div style={{ color: 'var(--gold)', marginTop: 4 }}>Add +</div>
                                        </div>
                                    </div>
                                )
                            })}
                            {filteredProducts.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--ink-muted)' }}>No products found matching "{searchTerm}"</div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 14, color: 'var(--ink-muted)' }}>Saving will update the Live site immediately.</div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn btn-outline" onClick={() => setIsProductsModalOpen(false)}>Cancel Changes</button>
                        <button className="btn btn-ink" onClick={saveProductsSelection}>Save Collection Products</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Title</th>
            <th>Style (Look)</th>
            <th>Products</th>
            <th>Status</th>
            <th width="120">Actions</th>
          </tr>
        </thead>
        <tbody>
          {collections.map(c => {
            const lookName = looks.find(l => l.id === c.look_id)?.name || 'Unknown';
            return (
              <tr key={c.id}>
                <td>{c.display_order}</td>
                <td style={{ fontWeight: 500 }}>{c.title}</td>
                <td>{lookName}</td>
                <td>{(c.product_ids || []).length} items</td>
                <td>
                  <span style={{ 
                    padding: '2px 6px', borderRadius: 4, fontSize: 10, textTransform: 'uppercase', 
                    background: c.status === 'published' ? '#d4edda' : '#f8d7da',
                    color: c.status === 'published' ? '#155724' : '#721c24'
                  }}>
                    {c.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openProductsModal(c)} title="Manage Products">
                      <AIcon.Products />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(c)}>
                      <AIcon.Edit />
                    </button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'red' }} onClick={() => handleDelete(c.id)}>
                      <AIcon.Trash />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

window.AdminCollections = AdminCollections;

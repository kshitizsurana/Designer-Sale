/* global React, API, AIcon */
// AdminPanel — Collections Management

const { useState: useCollectionsState, useEffect: useCollectionsEffect } = React;

function AdminCollections({ toast }) {
  const [collections, setCollections] = useCollectionsState([]);
  const [looks, setLooks] = useCollectionsState([]);
  const [products, setProducts] = useCollectionsState([]);
  const [loading, setLoading] = useCollectionsState(true);

  // Form states
  const [editing, setEditing] = useCollectionsState(null);
  const [isProductsModalOpen, setIsProductsModalOpen] = useCollectionsState(false);
  const [selectedProductIds, setSelectedProductIds] = useCollectionsState([]);

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

  function toggleProductSelection(id) {
    setSelectedProductIds(prev => {
      if (prev.includes(id)) return prev.filter(pid => pid !== id);
      return [...prev, id];
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

      {/* PRODUCTS MODAL */}
      {isProductsModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="admin-card" style={{ width: '90%', maxWidth: 800, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3>Assign Products: {editing.title}</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setIsProductsModalOpen(false)}><AIcon.Close /></button>
                </div>
                
                <div style={{ overflowY: 'auto', flex: 1, border: '1px solid var(--line)', borderRadius: 4, padding: 8, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                    {products.map(p => {
                        const isSelected = selectedProductIds.includes(p.id);
                        return (
                            <div 
                                key={p.id} 
                                onClick={() => toggleProductSelection(p.id)}
                                style={{ 
                                    border: `2px solid ${isSelected ? 'var(--gold-deep)' : 'var(--line)'}`, 
                                    borderRadius: 4, padding: 8, cursor: 'pointer',
                                    background: isSelected ? 'rgba(168, 133, 74, 0.1)' : 'transparent',
                                    display: 'flex', gap: 8, alignItems: 'center'
                                }}
                            >
                                <img src={p.image} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 2 }} />
                                <div style={{ fontSize: 11, lineHeight: 1.2, overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 600 }}>{p.brand}</div>
                                    <div style={{ color: 'var(--ink-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.title}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{selectedProductIds.length} products selected</div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn btn-outline" onClick={() => setIsProductsModalOpen(false)}>Cancel</button>
                        <button className="btn btn-ink" onClick={saveProductsSelection}>Save Selection</button>
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

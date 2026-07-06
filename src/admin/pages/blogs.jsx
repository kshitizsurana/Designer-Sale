/* global React, AIcon, DeleteConfirm, API */

const { useState, useEffect } = React;

function BlogFormModal({ blog, onSave, onClose }) {
  const [form, setForm] = useState(blog || {
    title: '', slug: '', content: '', image: '', author: '', status: 'draft', published_at: null
  });
  const [errors, setErrors] = useState({});

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function validate() {
    const e = {};
    if (!form.title?.trim()) e.title = 'Title is required';
    if (!form.slug?.trim()) e.slug = 'Slug is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    
    // Auto-set published_at if publishing for the first time
    let dataToSave = { ...form };
    if (dataToSave.status === 'published' && !dataToSave.published_at) {
        dataToSave.published_at = new Date().toISOString();
    }
    onSave(dataToSave);
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ width: 800, maxWidth: '95%' }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal-head">
          <div className="admin-modal-title">{blog ? 'Edit Blog Post' : 'Create Blog Post'}</div>
          <button className="btn-icon" onClick={onClose}><AIcon.Close /></button>
        </div>
        <form onSubmit={submit} style={{ display: 'contents' }}>
          <div className="admin-modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            
            <div className="form-group">
              <label className="form-label">Post Title <span>*</span></label>
              <input className={`form-input ${errors.title ? 'error' : ''}`} value={form.title || ''} onChange={e => {
                  set('title', e.target.value);
                  if (!blog) set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
              }} placeholder="Enter blog title" />
              {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">URL Slug <span>*</span></label>
              <input className={`form-input ${errors.slug ? 'error' : ''}`} value={form.slug || ''} onChange={e => set('slug', e.target.value)} placeholder="e.g. spring-trends-2026" />
              {errors.slug && <div className="form-error">{errors.slug}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Cover Image URL</label>
              <input type="url" className="form-input" value={form.image || ''} onChange={e => set('image', e.target.value)} placeholder="https://..." />
            </div>

            <div className="form-group">
              <label className="form-label">Author Name</label>
              <input className="form-input" value={form.author || ''} onChange={e => set('author', e.target.value)} placeholder="John Doe" />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status || 'draft'} onChange={e => set('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Content (HTML or plain text)</label>
              <textarea className="form-input" rows="15" value={form.content || ''} onChange={e => set('content', e.target.value)} placeholder="Write your blog post here..." style={{ resize: 'vertical', fontFamily: 'var(--font-mono)' }} />
            </div>

          </div>
          <div className="admin-modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-gold btn-sm">
              {blog ? 'Save changes' : 'Create post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminBlogs({ toast }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  async function refresh() {
    setLoading(true);
    try {
        const data = await API.blogs.getAll();
        if (data.error || !Array.isArray(data)) {
            console.error('Blogs fetch error:', data);
            setBlogs([]);
            toast('Warning: Could not load blogs (Table might be missing)', 'error');
        } else {
            setBlogs(data);
        }
    } catch(e) {
        toast('Failed to load blogs', 'error');
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function handleSave(data) {
    try {
        if (editItem) {
          const res = await API.blogs.update(editItem.id, data);
          if (res.error) throw new Error(res.error);
          toast('Blog post updated', 'success');
        } else {
          const res = await API.blogs.create(data);
          if (res.error) throw new Error(res.error);
          toast('Blog post created', 'success');
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
        const res = await API.blogs.delete(deleteItem.id);
        if (res.error) throw new Error(res.error);
        toast(`Blog post deleted`, 'success');
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
          <div className="admin-section-title">Blog Posts</div>
          <div className="admin-section-sub">Manage your editorial content</div>
        </div>
        <button className="btn btn-gold btn-sm" onClick={() => { setEditItem(null); setShowForm(true); }}>
          <AIcon.Plus /> Create post
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="col-thumb">Cover</th>
              <th>Title</th>
              <th>Author</th>
              <th>Date</th>
              <th>Status</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="6" style={{textAlign: 'center', padding: 30}}>Loading...</td></tr> : blogs.length === 0 ? (
              <tr><td colSpan="6">
                <div className="admin-empty">
                  <h3>No blog posts yet</h3>
                  <p>Create your first editorial piece to engage customers.</p>
                  <button className="btn btn-gold btn-sm" onClick={() => { setEditItem(null); setShowForm(true); }}><AIcon.Plus /> Create post</button>
                </div>
              </td></tr>
            ) : Array.isArray(blogs) && blogs.map(b => (
              <tr key={b.id}>
                <td className="col-thumb">
                  {b.image ? <img src={b.image} className="thumb-img" style={{ width: 60 }} alt="" /> : <div className="thumb-ph">Img</div>}
                </td>
                <td>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>{b.title}</div>
                  <a href={`/#/blog/${b.slug}`} target="_blank" style={{ fontSize: 11, color: 'var(--gold-deep)', textDecoration: 'none' }}>/{b.slug} ↗</a>
                </td>
                <td style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                  {b.author || '—'}
                </td>
                <td style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                  {b.published_at ? new Date(b.published_at).toLocaleDateString() : '—'}
                </td>
                <td>
                  <span style={{ 
                    padding: '2px 6px', borderRadius: 4, fontSize: 10, textTransform: 'uppercase', 
                    background: b.status === 'published' ? '#d4edda' : '#e2e3e5',
                    color: b.status === 'published' ? '#155724' : '#383d41'
                  }}>
                    {b.status || 'draft'}
                  </span>
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

      {showForm && <BlogFormModal blog={editItem} onSave={handleSave} onClose={() => { setShowForm(false); setEditItem(null); }} />}
      {deleteItem && <DeleteConfirm item={deleteItem} entity="blog post" onConfirm={handleDelete} onClose={() => setDeleteItem(null)} />}
    </div>
  );
}

window.AdminBlogs = AdminBlogs;

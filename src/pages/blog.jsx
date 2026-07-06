/* global React, Icon */

const { useState, useEffect } = React;

function BlogList({ onNav }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://designer-sale.vercel.app/api/blogs')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBlogs(data.filter(b => b.status === 'published'));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page" style={{ display: 'flex', justifyContent: 'center', padding: 100, color: 'var(--ink-soft)' }}>Loading...</div>;
  }

  return (
    <main className="page" style={{ paddingTop: 'var(--pad-2xl)', paddingBottom: 'var(--pad-2xl)' }}>
      <div className="container-wide" style={{ padding: '0 var(--pad-lg)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 64px)', marginBottom: 16 }}>The Editorial</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 18, marginBottom: 40, maxWidth: 600 }}>
          Latest fashion news, style guides, and boutique spotlights.
        </p>

        {blogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--ink-muted)' }}>
            <p>No articles published yet. Check back soon.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32 }}>
            {blogs.map(blog => (
              <button key={blog.id} style={{ textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={() => onNav('blog-post', null, null, blog.slug)}>
                <div style={{ width: '100%', aspectRatio: '4/3', background: '#eee', marginBottom: 16, overflow: 'hidden', position: 'relative' }}>
                  {blog.image && (
                    <img src={blog.image} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 400ms ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} alt={blog.title} />
                  )}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--gold-deep)', marginBottom: 8 }}>
                  {new Date(blog.published_at || blog.created_at).toLocaleDateString()}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1.2, marginBottom: 8 }}>{blog.title}</h3>
                <div style={{ color: 'var(--ink-soft)', fontSize: 14 }}>By {blog.author || 'Editorial Team'}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function BlogPost({ slug, onNav }) {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://designer-sale.vercel.app/api/blogs')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find(b => b.slug === slug);
          setBlog(found || null);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="page" style={{ padding: 100, textAlign: 'center' }}>Loading...</div>;
  if (!blog) return (
    <div className="page" style={{ padding: 100, textAlign: 'center' }}>
      <h1>Post not found</h1>
      <button className="btn btn-outline" onClick={() => onNav('blog')} style={{ marginTop: 24 }}>Back to Editorial</button>
    </div>
  );

  return (
    <main className="page" style={{ paddingBottom: 'var(--pad-2xl)' }}>
      {blog.image && (
        <div style={{ width: '100%', height: '50vh', minHeight: 400, background: '#eee', position: 'relative' }}>
          <img src={blog.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
        </div>
      )}
      <div className="container" style={{ maxWidth: 760, padding: 'var(--pad-xl) var(--pad-lg)' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => onNav('blog')} style={{ marginBottom: 32, padding: 0 }}>
          ← Back to Editorial
        </button>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--gold-deep)', marginBottom: 16 }}>
          {new Date(blog.published_at || blog.created_at).toLocaleDateString()}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.1, marginBottom: 24 }}>
          {blog.title}
        </h1>
        <div style={{ color: 'var(--ink-soft)', fontSize: 15, marginBottom: 48, borderBottom: '1px solid var(--line)', paddingBottom: 24 }}>
          Words by <strong>{blog.author || 'Editorial Team'}</strong>
        </div>
        
        <div className="blog-content" style={{ fontSize: 18, lineHeight: 1.8, color: 'var(--ink)' }} dangerouslySetInnerHTML={{ __html: blog.content?.replace(/\n/g, '<br/>') }} />
      </div>
    </main>
  );
}

Object.assign(window, { BlogList, BlogPost });

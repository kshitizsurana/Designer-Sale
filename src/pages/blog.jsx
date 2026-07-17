/* global React, Icon */

const { useState, useEffect } = React;

function getApiBase() {
  return (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? `${window.location.protocol}//${window.location.hostname}:3000/api`
    : '/api';
}

// ─── Blog Listing Page ───────────────────────────────────────────────────────

function BlogList({ onNav }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${getApiBase()}/blogs`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBlogs(data.filter(b => b.status === 'published'));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featured = blogs[0] || null;
  const rest = blogs.slice(1);

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', gap: 20, color: 'var(--ink-soft)'
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, opacity: 0.5 }}>Loading The Editorial…</div>
        <div style={{ width: 120, height: 1, background: 'var(--line-strong)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'var(--gold)', animation: 'progress 1.4s infinite ease-in-out', width: '40%' }} />
        </div>
        <style>{`@keyframes progress { 0%{transform:translateX(-100%)} 100%{transform:translateX(350%)} }`}</style>
      </div>
    );
  }

  return (
    <main style={{ paddingBottom: 'var(--pad-2xl)' }}>
      {/* ── Hero Banner ── */}
      <div style={{
        background: 'var(--ink)',
        padding: 'clamp(60px, 8vw, 120px) var(--pad-lg) clamp(48px, 6vw, 80px)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background texture */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 60% 40%, rgba(168,133,74,0.18) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase',
            letterSpacing: '0.26em', color: 'var(--gold-soft)', marginBottom: 20,
          }}>
            ── The Editor's Desk ──
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 72px)',
            lineHeight: 1.06, color: '#fff', letterSpacing: '-0.02em', marginBottom: 20,
          }}>
            Style Notes<br /><em style={{ color: 'var(--gold-soft)' }}>&amp; Guides.</em>
          </h1>
          <p style={{ color: 'rgba(245,240,234,0.65)', fontSize: 17, maxWidth: 520, margin: '0 auto' }}>
            Fashion intelligence from Australia's most considered boutiques — trend edits, buying guides, and stories worth reading.
          </p>
        </div>
      </div>

      <div className="container-wide" style={{ padding: 'var(--pad-2xl) var(--pad-lg)' }}>
        {blogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--ink-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✍️</div>
            <p style={{ fontSize: 16 }}>No articles published yet. Check back soon.</p>
          </div>
        ) : (
          <>
            {/* ── Featured Post ── */}
            {featured && (
              <div style={{ marginBottom: 64 }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
                  letterSpacing: '0.22em', color: 'var(--gold-deep)', marginBottom: 24,
                }}>
                  Featured Article
                </div>
                <button
                  onClick={() => onNav('blog-post', null, null, featured.slug)}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
                    width: '100%', background: 'none', border: '1px solid var(--line)',
                    borderRadius: 16, overflow: 'hidden', cursor: 'pointer', textAlign: 'left',
                    transition: 'box-shadow 400ms ease, transform 300ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.15)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', minHeight: 440, background: 'var(--linen)', overflow: 'hidden' }}>
                    {featured.image ? (
                      <img
                        src={featured.image}
                        alt={featured.title}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 700ms ease' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--linen), var(--gold-soft))' }} />
                    )}
                  </div>
                  {/* Content */}
                  <div style={{
                    padding: 'clamp(32px, 5vw, 56px)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    background: 'var(--bg)',
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
                      letterSpacing: '0.18em', color: 'var(--gold-deep)', marginBottom: 16,
                    }}>
                      {featured.author || 'Editorial Team'}
                      {featured.published_at && (
                        <span style={{ color: 'var(--ink-muted)', marginLeft: 12 }}>
                          {new Date(featured.published_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <h2 style={{
                      fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 40px)',
                      lineHeight: 1.15, color: 'var(--ink)', marginBottom: 20,
                    }}>
                      {featured.title}
                    </h2>
                    <p style={{
                      fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 32,
                      display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {featured.content?.replace(/<[^>]+>/g, '')}
                    </p>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase',
                      letterSpacing: '0.16em', color: 'var(--gold-deep)', fontWeight: 600,
                    }}>
                      Read Article →
                    </span>
                  </div>
                </button>
              </div>
            )}

            {/* ── All Other Posts ── */}
            {rest.length > 0 && (
              <>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
                  letterSpacing: '0.22em', color: 'var(--gold-deep)', marginBottom: 28,
                  paddingTop: 12, borderTop: '1px solid var(--line)',
                }}>
                  More from the Editorial
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 36,
                }}>
                  {rest.map((blog, i) => (
                    <button
                      key={blog.id}
                      onClick={() => onNav('blog-post', null, null, blog.slug)}
                      className="fade-in"
                      style={{
                        background: 'none', border: 'none', padding: 0,
                        cursor: 'pointer', textAlign: 'left', display: 'flex',
                        flexDirection: 'column', animationDelay: `${i * 60}ms`,
                        transition: 'transform 300ms ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {/* Thumbnail */}
                      <div style={{
                        width: '100%', aspectRatio: '4/3', overflow: 'hidden',
                        borderRadius: 12, background: 'var(--linen)', marginBottom: 20,
                        position: 'relative',
                      }}>
                        {blog.image ? (
                          <img
                            src={blog.image}
                            alt={blog.title}
                            loading="lazy"
                            style={{
                              position: 'absolute', inset: 0, width: '100%', height: '100%',
                              objectFit: 'cover', transition: 'transform 600ms ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            onError={e => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--linen), var(--gold-soft))', opacity: 0.5 }} />
                        )}
                      </div>
                      {/* Meta */}
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
                        letterSpacing: '0.16em', color: 'var(--gold-deep)', marginBottom: 10,
                      }}>
                        {blog.author || 'Editorial Team'}
                        {blog.published_at && (
                          <span style={{ color: 'var(--ink-muted)', marginLeft: 10 }}>
                            {new Date(blog.published_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                      <h3 style={{
                        fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1.2,
                        color: 'var(--ink)', marginBottom: 10,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {blog.title}
                      </h3>
                      <p style={{
                        fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.65, margin: 0,
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {blog.content?.replace(/<[^>]+>/g, '')}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// ─── Individual Blog Post ─────────────────────────────────────────────────────

function BlogPost({ slug, onNav }) {
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${getApiBase()}/blogs`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const published = data.filter(b => b.status === 'published');
          const found = published.find(b => b.slug === slug);
          setBlog(found || null);
          setRelated(published.filter(b => b.slug !== slug).slice(0, 3));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink-muted)' }}>Loading…</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div style={{ padding: '100px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 24 }}>Post not found</h1>
        <button className="btn btn-gold" onClick={() => onNav('blog')}>← Back to Editorial</button>
      </div>
    );
  }

  return (
    <main style={{ paddingBottom: 'var(--pad-2xl)' }}>
      {/* Hero Image */}
      {blog.image && (
        <div style={{ width: '100%', height: 'clamp(300px, 50vh, 560px)', position: 'relative', overflow: 'hidden' }}>
          <img
            src={blog.image}
            alt={blog.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.currentTarget.parentElement.style.display = 'none'; }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4) 100%)' }} />
        </div>
      )}

      {/* Article Content */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: 'clamp(40px, 6vw, 72px) var(--pad-lg)' }}>
        {/* Back */}
        <button
          onClick={() => onNav('blog')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase',
            letterSpacing: '0.16em', color: 'var(--gold-deep)', marginBottom: 36,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ← The Editorial
        </button>

        {/* Meta */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase',
          letterSpacing: '0.18em', color: 'var(--gold-deep)', marginBottom: 18,
          display: 'flex', gap: 16, flexWrap: 'wrap',
        }}>
          <span>{blog.author || 'Editorial Team'}</span>
          {blog.published_at && (
            <span style={{ color: 'var(--ink-muted)' }}>
              {new Date(blog.published_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 54px)',
          lineHeight: 1.1, color: 'var(--ink)', letterSpacing: '-0.015em',
          marginBottom: 32,
        }}>
          {blog.title}
        </h1>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--line-strong)', marginBottom: 40 }} />

        {/* Body */}
        <div
          style={{
            fontSize: 18, lineHeight: 1.85, color: 'var(--ink)',
            fontFamily: 'var(--font-body)',
          }}
          dangerouslySetInnerHTML={{ __html: blog.content?.replace(/\n/g, '<br/>') || '' }}
        />
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 'var(--pad-xl)' }}>
          <div className="container-wide" style={{ padding: '0 var(--pad-lg)' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
              letterSpacing: '0.22em', color: 'var(--gold-deep)', marginBottom: 28,
            }}>
              More from the Editorial
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 28 }}>
              {related.map(r => (
                <button
                  key={r.id}
                  onClick={() => { onNav('blog-post', null, null, r.slug); }}
                  style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    textAlign: 'left', display: 'flex', flexDirection: 'column',
                    transition: 'transform 300ms ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{
                    width: '100%', aspectRatio: '3/2', overflow: 'hidden',
                    borderRadius: 10, background: 'var(--linen)', marginBottom: 14, position: 'relative',
                  }}>
                    {r.image ? (
                      <img src={r.image} alt={r.title} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 500ms ease' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        onError={e => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--linen), var(--gold-soft))', opacity: 0.4 }} />
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--gold-deep)', marginBottom: 8 }}>
                    {r.author || 'Editorial Team'}
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 18, lineHeight: 1.25, color: 'var(--ink)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {r.title}
                  </h4>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

Object.assign(window, { BlogList, BlogPost });

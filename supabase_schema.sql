-- ============================================================
-- DesignerSale.com.au — Supabase Schema (run in SQL Editor)
-- ============================================================
-- Run this entire file in one go in the Supabase SQL Editor.
-- Existing tables are left untouched (IF NOT EXISTS).
-- ============================================================

-- Looks table (must be created FIRST — referenced by merchants and products)
CREATE TABLE IF NOT EXISTS looks (
  id         INTEGER PRIMARY KEY,
  name       TEXT    NOT NULL,
  slug       TEXT    NOT NULL UNIQUE,
  description TEXT,
  hero_image  TEXT,
  status      TEXT    DEFAULT 'active',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the three default looks
INSERT INTO looks (id, name, slug, description, hero_image, status)
VALUES
  (1, 'Formal Wear', 'formal-wear',  'Tailored fits, office wear, and sophisticated styles for young professionals.',       'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=800', 'active'),
  (2, 'Bohemian',    'bohemian',     'Boho chic, floral patterns, and earthy relaxed styles for an effortless look.',       'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800', 'active'),
  (3, 'Casuals',     'casuals',      'Baggy fits, everyday casual wear, and structured basics for teens and young adults.',  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=800', 'active')
ON CONFLICT (id) DO NOTHING;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id       TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id    TEXT PRIMARY KEY,
  label TEXT NOT NULL
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  website     TEXT,
  founded     TEXT,
  country     TEXT
);

-- Merchants table
CREATE TABLE IF NOT EXISTS merchants (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  state               TEXT,
  city                TEXT,
  online              BOOLEAN DEFAULT false,
  instore             BOOLEAN DEFAULT false,
  focus               TEXT,
  email               TEXT,
  phone               TEXT,
  website             TEXT,
  description         TEXT,
  facebook            TEXT,
  instagram           TEXT,
  best_contact_method TEXT,
  look_id             INTEGER REFERENCES looks(id)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  category    TEXT,
  title       TEXT NOT NULL,
  brandid     TEXT REFERENCES brands(id),
  merchantid  TEXT REFERENCES merchants(id),
  rrp         REAL NOT NULL,
  sale        REAL NOT NULL,
  discountpct INTEGER,
  newin       BOOLEAN DEFAULT false,
  sizes       JSONB,
  image       TEXT,
  added       BIGINT,
  description TEXT,
  inventory   INTEGER DEFAULT 0,
  look_id     INTEGER REFERENCES looks(id)
);

-- Landing Pages table
CREATE TABLE IF NOT EXISTS landing_pages (
  id                TEXT PRIMARY KEY,
  title             TEXT NOT NULL,
  short_description TEXT,
  image             TEXT,
  products          JSONB DEFAULT '[]'::jsonb,
  look_id           INTEGER REFERENCES looks(id),
  status            TEXT DEFAULT 'published',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id SERIAL PRIMARY KEY,
  look_id INTEGER REFERENCES looks(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  hero_image TEXT,
  description TEXT,
  seo_title TEXT,
  seo_description TEXT,
  display_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collection Products Junction Table
CREATE TABLE IF NOT EXISTS collection_products (
  collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  PRIMARY KEY (collection_id, product_id)
);

-- Landing Pages updates
ALTER TABLE landing_pages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

-- Blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  image TEXT,
  author TEXT,
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Looks updates (for dynamic text)
ALTER TABLE looks ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE looks ADD COLUMN IF NOT EXISTS keywords TEXT[];
ALTER TABLE looks ADD COLUMN IF NOT EXISTS feature_title TEXT;
ALTER TABLE looks ADD COLUMN IF NOT EXISTS feature_body TEXT;
ALTER TABLE looks ADD COLUMN IF NOT EXISTS feature_cta TEXT;

-- Merchants updates (social and contact fields)
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS facebook TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS best_contact_method TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS look_id INTEGER REFERENCES looks(id);

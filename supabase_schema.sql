-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

-- Categories table
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL
);

-- Brands table
CREATE TABLE brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  founded TEXT,
  country TEXT
);

-- Merchants table
CREATE TABLE merchants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT,
  city TEXT,
  online BOOLEAN DEFAULT false,
  inStore BOOLEAN DEFAULT false,
  focus TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  description TEXT
);

-- Products table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  category TEXT,
  title TEXT NOT NULL,
  brandId TEXT REFERENCES brands(id),
  merchantId TEXT REFERENCES merchants(id),
  rrp REAL NOT NULL,
  sale REAL NOT NULL,
  discountPct INTEGER,
  newIn BOOLEAN DEFAULT false,
  sizes JSONB,
  image TEXT,
  added BIGINT,
  description TEXT
);

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'designer_sale.sqlite');
const dbExists = fs.existsSync(dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        if (!dbExists) {
            initSchema();
        }
    }
});

function initSchema() {
    console.log('Initializing database schema...');
    
    db.serialize(() => {
        // Users (Admin Auth)
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL -- Storing plaintext for this prototype as requested, normally this would be hashed
        )`);

        // Insert default admin user
        db.run(`INSERT INTO users (username, password) VALUES ('admin', 'admin123')`);

        // Categories (Static reference)
        db.run(`CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            label TEXT NOT NULL
        )`);

        // Merchants
        db.run(`CREATE TABLE IF NOT EXISTS merchants (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            state TEXT,
            city TEXT,
            online INTEGER DEFAULT 0,
            inStore INTEGER DEFAULT 0,
            focus TEXT,
            email TEXT,
            phone TEXT,
            website TEXT,
            description TEXT
        )`);

        // Brands
        db.run(`CREATE TABLE IF NOT EXISTS brands (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            website TEXT,
            founded TEXT,
            country TEXT
        )`);

        // Products
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            category TEXT NOT NULL,
            title TEXT NOT NULL,
            brandId TEXT NOT NULL,
            merchantId TEXT NOT NULL,
            rrp INTEGER NOT NULL,
            sale INTEGER NOT NULL,
            discountPct INTEGER,
            newIn INTEGER DEFAULT 0,
            sizes TEXT, -- Stored as JSON string
            image TEXT,
            added INTEGER,
            description TEXT,
            FOREIGN KEY (category) REFERENCES categories(id),
            FOREIGN KEY (brandId) REFERENCES brands(id),
            FOREIGN KEY (merchantId) REFERENCES merchants(id)
        )`);

        console.log('Schema created.');
        seedData();
    });
}

function seedData() {
    console.log('Seeding initial data...');
    const now = Date.now();

    // Categories
    const categories = [
        ['maxi-dresses', 'Maxi Dresses'],
        ['kaftans', 'Kaftans'],
        ['tops-blouses', 'Tops & Blouses'],
        ['coats-jackets', 'Coats & Jackets'],
        ['bags-accessories', 'Bags & Accessories'],
        ['jewellery', 'Jewellery']
    ];
    const catStmt = db.prepare(`INSERT INTO categories (id, label) VALUES (?, ?)`);
    categories.forEach(c => catStmt.run(c));
    catStmt.finalize();

    // Brands
    const brands = [
        ['fashion-spectrum', 'Fashion Spectrum', '100% silk, hand-beaded garments made in workshops outside Jaipur.', 'https://fashionspectrum.com.au', '2005', 'AU'],
        ['marlowe-quinn', 'Marlowe & Quinn', 'Contemporary Australian womenswear with a focus on resort and occasion dressing.', '', '2018', 'AU'],
        ['bondi-atelier', 'Bondi Atelier', 'Sydney-born label specialising in elevated coastal casualwear.', '', '2019', 'AU'],
        ['saltbush-studio', 'Saltbush Studio', 'Ethical Australian fashion using natural fibres and native plant dyes.', '', '2020', 'AU']
    ];
    const brandStmt = db.prepare(`INSERT INTO brands (id, name, description, website, founded, country) VALUES (?, ?, ?, ?, ?, ?)`);
    brands.forEach(b => brandStmt.run(b));
    brandStmt.finalize();

    // Merchants
    const merchants = [
        ['blue-bungalow', 'Blue Bungalow', 'QLD', 'Noosa Heads', 1, 1, 'Resort & holiday', 'hello@bluebungalow.com.au', '07 5447 0000', 'https://bluebungalow.com.au', 'Noosa\'s favourite resort boutique since 2003.'],
        ['pizazz', 'Pizazz Boutique', 'VIC', 'Armadale', 1, 1, 'Occasion & evening', 'info@pizazz.com.au', '03 9822 0000', 'https://pizazz.com.au', 'Melbourne\'s go-to for occasion dressing and evening wear.']
    ];
    const merchStmt = db.prepare(`INSERT INTO merchants (id, name, state, city, online, inStore, focus, email, phone, website, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    merchants.forEach(m => merchStmt.run(m));
    merchStmt.finalize();

    // Products (just a few to start)
    const products = [
        ['prod-1', 'maxi-dresses', 'Bias-Cut Silk Slip Maxi in Almond', 'fashion-spectrum', 'blue-bungalow', 350, 245, 30, 1, JSON.stringify(['S', 'M']), null, now, 'An impeccably crafted maxi.'],
        ['prod-2', 'kaftans', 'Hand-Embellished Silk Kaftan in Gold', 'fashion-spectrum', 'pizazz', 420, 210, 50, 0, JSON.stringify(['One Size']), null, now - 100000, 'Stunning detail.']
    ];
    const prodStmt = db.prepare(`INSERT INTO products (id, category, title, brandId, merchantId, rrp, sale, discountPct, newIn, sizes, image, added, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    products.forEach(p => prodStmt.run(p));
    prodStmt.finalize();

    console.log('Seeding complete.');
}

module.exports = db;

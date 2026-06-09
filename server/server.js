const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const db = require('./database');

const app = express();
const port = 3000;
const SECRET_KEY = 'designersale_super_secret_prototype_key'; // For prototype use

app.use(cors());
app.use(express.json());

// Serve static files from the parent directory (the frontend code)
app.use(express.static(path.join(__dirname, '..')));

// Serve the main storefront at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'DesignerSale Standalone Source.html'));
});

// Serve the admin panel at /admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'admin.html'));
});

const upload = multer({ dest: 'uploads/' });

// --- AUTHENTICATION ---

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: 'Invalid credentials' });
        
        const token = jwt.sign({ id: row.id, username: row.username }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ token });
    });
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- CATEGORIES (Public) ---
app.get('/api/categories', (req, res) => {
    db.all('SELECT * FROM categories', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- MERCHANTS (Public Read, Protected Write) ---
app.get('/api/merchants', (req, res) => {
    db.all('SELECT * FROM merchants', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        // Map integer booleans back to true/false
        const merchants = rows.map(r => ({
            ...r,
            online: !!r.online,
            inStore: !!r.inStore
        }));
        res.json(merchants);
    });
});

app.post('/api/merchants', authenticateToken, (req, res) => {
    const { id, name, state, city, online, inStore, focus, email, phone, website, description } = req.body;
    const newId = id || 'm_' + Date.now().toString(36);
    
    db.run(
        `INSERT INTO merchants (id, name, state, city, online, inStore, focus, email, phone, website, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [newId, name, state, city, online ? 1 : 0, inStore ? 1 : 0, focus, email, phone, website, description],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: newId, ...req.body });
        }
    );
});

app.put('/api/merchants/:id', authenticateToken, (req, res) => {
    const { name, state, city, online, inStore, focus, email, phone, website, description } = req.body;
    db.run(
        `UPDATE merchants SET name=?, state=?, city=?, online=?, inStore=?, focus=?, email=?, phone=?, website=?, description=? WHERE id=?`,
        [name, state, city, online ? 1 : 0, inStore ? 1 : 0, focus, email, phone, website, description, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: req.params.id, ...req.body });
        }
    );
});

app.delete('/api/merchants/:id', authenticateToken, (req, res) => {
    db.serialize(() => {
        db.run('DELETE FROM products WHERE merchantId = ?', [req.params.id]);
        db.run('DELETE FROM merchants WHERE id = ?', [req.params.id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, deletedId: req.params.id });
        });
    });
});


// --- BRANDS (Public Read, Protected Write) ---
app.get('/api/brands', (req, res) => {
    db.all('SELECT * FROM brands', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/brands', authenticateToken, (req, res) => {
    const { id, name, description, website, founded, country } = req.body;
    const newId = id || 'b_' + Date.now().toString(36);
    
    db.run(
        `INSERT INTO brands (id, name, description, website, founded, country) VALUES (?, ?, ?, ?, ?, ?)`,
        [newId, name, description, website, founded, country],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: newId, ...req.body });
        }
    );
});

app.put('/api/brands/:id', authenticateToken, (req, res) => {
    const { name, description, website, founded, country } = req.body;
    db.run(
        `UPDATE brands SET name=?, description=?, website=?, founded=?, country=? WHERE id=?`,
        [name, description, website, founded, country, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: req.params.id, ...req.body });
        }
    );
});

app.delete('/api/brands/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM brands WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, deletedId: req.params.id });
    });
});


// --- PRODUCTS (Public Read, Protected Write) ---
app.get('/api/products', (req, res) => {
    const query = `
        SELECT p.*, b.name as brand, m.name as merchant 
        FROM products p
        LEFT JOIN brands b ON p.brandId = b.id
        LEFT JOIN merchants m ON p.merchantId = m.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        // Parse JSON sizes
        const products = rows.map(r => ({
            ...r,
            sizes: r.sizes ? JSON.parse(r.sizes) : [],
            newIn: !!r.newIn
        }));
        res.json(products);
    });
});

app.post('/api/products', authenticateToken, (req, res) => {
    const { id, category, title, brandId, merchantId, rrp, sale, discountPct, newIn, sizes, image, description } = req.body;
    const newId = id || 'p_' + Date.now().toString(36);
    const added = Date.now();
    const pct = discountPct || Math.round(((rrp - sale) / rrp) * 100);
    const sizeStr = JSON.stringify(sizes || []);

    db.run(
        `INSERT INTO products (id, category, title, brandId, merchantId, rrp, sale, discountPct, newIn, sizes, image, added, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [newId, category, title, brandId, merchantId, rrp, sale, pct, newIn ? 1 : 0, sizeStr, image, added, description],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: newId, ...req.body, discountPct: pct, added });
        }
    );
});

app.put('/api/products/:id', authenticateToken, (req, res) => {
    const { category, title, brandId, merchantId, rrp, sale, discountPct, newIn, sizes, image, description } = req.body;
    const pct = discountPct || Math.round(((rrp - sale) / rrp) * 100);
    const sizeStr = JSON.stringify(sizes || []);

    db.run(
        `UPDATE products SET category=?, title=?, brandId=?, merchantId=?, rrp=?, sale=?, discountPct=?, newIn=?, sizes=?, image=?, description=? WHERE id=?`,
        [category, title, brandId, merchantId, rrp, sale, pct, newIn ? 1 : 0, sizeStr, image, description, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: req.params.id, ...req.body, discountPct: pct });
        }
    );
});

app.delete('/api/products/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, deletedId: req.params.id });
    });
});

// --- BULK UPLOAD ---
app.post('/api/products/bulk', authenticateToken, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const results = [];
    const errors = [];
    let rowCount = 0;

    // We need existing brands and merchants to validate foreign keys
    db.all('SELECT id FROM brands', (err, brandRows) => {
        if (err) return res.status(500).json({ error: err.message });
        const validBrands = new Set(brandRows.map(b => b.id));

        db.all('SELECT id FROM merchants', (err, merchRows) => {
            if (err) return res.status(500).json({ error: err.message });
            const validMerchants = new Set(merchRows.map(m => m.id));

            fs.createReadStream(req.file.path)
                .pipe(csvParser())
                .on('data', (data) => {
                    rowCount++;
                    const { title, brandId, merchantId, category, rrp, sale, sizes, image, description } = data;
                    
                    // Validation
                    if (!title || !brandId || !merchantId || !category || !rrp || !sale) {
                        errors.push({ row: rowCount, msg: 'Missing required fields' });
                        return; // Skip row
                    }
                    if (!validBrands.has(brandId)) {
                        errors.push({ row: rowCount, msg: `Unknown brandId: ${brandId}` });
                        return; // Skip row
                    }
                    if (!validMerchants.has(merchantId)) {
                        errors.push({ row: rowCount, msg: `Unknown merchantId: ${merchantId}` });
                        return; // Skip row
                    }

                    const numRRP = parseInt(rrp, 10);
                    const numSale = parseInt(sale, 10);
                    if (isNaN(numRRP) || isNaN(numSale)) {
                        errors.push({ row: rowCount, msg: 'RRP and Sale must be numbers' });
                        return; // Skip row
                    }

                    results.push({
                        title, brandId, merchantId, category, 
                        rrp: numRRP, sale: numSale, 
                        sizes: sizes ? sizes.split(',').map(s => s.trim()) : [], 
                        image: image || null, 
                        description: description || null
                    });
                })
                .on('end', () => {
                    // Remove temp file
                    fs.unlinkSync(req.file.path);

                    if (results.length === 0) {
                        return res.json({ success: true, imported: 0, errors });
                    }

                    // Insert valid rows
                    const stmt = db.prepare(`INSERT INTO products (id, category, title, brandId, merchantId, rrp, sale, discountPct, sizes, image, added, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                    const now = Date.now();
                    
                    db.serialize(() => {
                        db.run('BEGIN TRANSACTION');
                        results.forEach((r, i) => {
                            const newId = 'p_bulk_' + Date.now().toString(36) + '_' + i;
                            const pct = Math.round(((r.rrp - r.sale) / r.rrp) * 100);
                            stmt.run([newId, r.category, r.title, r.brandId, r.merchantId, r.rrp, r.sale, pct, JSON.stringify(r.sizes), r.image, now, r.description]);
                        });
                        db.run('COMMIT', (err) => {
                            stmt.finalize();
                            if (err) return res.status(500).json({ error: 'Transaction failed', details: err.message });
                            res.json({ success: true, imported: results.length, errors });
                        });
                    });
                });
        });
    });
});


// --- STATS ---
app.get('/api/stats', (req, res) => {
    db.serialize(() => {
        let stats = {};
        db.get('SELECT COUNT(*) as count FROM merchants', (err, row) => { stats.totalMerchants = row.count; });
        db.get('SELECT COUNT(*) as count FROM brands', (err, row) => { stats.totalBrands = row.count; });
        db.get('SELECT COUNT(*) as count FROM products', (err, row) => { stats.totalProducts = row.count; });
        db.get('SELECT COUNT(*) as count FROM products WHERE newIn = 1 OR added > ?', [Date.now() - (48 * 3600000)], (err, row) => { stats.newIn = row?.count || 0; });
        db.get('SELECT AVG(discountPct) as avg FROM products', (err, row) => { 
            stats.avgDiscount = row?.avg ? Math.round(row.avg) : 0; 
            res.json(stats);
        });
    });
});

app.listen(port, () => {
    console.log(`DesignerSale Backend running on http://localhost:${port}`);
});

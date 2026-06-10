require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = 3000;
const SECRET_KEY = 'designersale_super_secret_prototype_key'; // For prototype use

// Initialize Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials in .env');
  // Don't exit, let the endpoints return a 500 with the error so we can debug on Vercel
}
const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Middleware to check if Supabase is initialized
app.use((req, res, next) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase credentials are not configured in Vercel Environment Variables.' });
    }
    next();
});

app.use(cors());
app.use(express.json());
// Vercel serves static files natively via vercel.json configuration.
// No express.static or static HTML routes needed here.

const upload = multer({ dest: 'uploads/' });

// --- AUTHENTICATION ---

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();
        
    if (error || !data) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: data.id, username: data.username }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token });
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
app.get('/api/categories', async (req, res) => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// --- MERCHANTS (Public Read, Protected Write) ---
app.get('/api/merchants', async (req, res) => {
    const { data, error } = await supabase.from('merchants').select('*');
    if (error) return res.status(500).json({ error: error.message });
    
    // Convert instore to inStore, etc.
    const merchants = data.map(r => ({
        ...r,
        inStore: r.instore,
    }));
    res.json(merchants);
});

app.post('/api/merchants', authenticateToken, async (req, res) => {
    const { id, name, state, city, online, inStore, focus, email, phone, website, description } = req.body;
    const newId = id || 'm_' + Date.now().toString(36);
    
    const { error } = await supabase.from('merchants').insert([{
        id: newId, name, state, city, online: !!online, instore: !!inStore, focus, email, phone, website, description
    }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: newId, ...req.body });
});

app.put('/api/merchants/:id', authenticateToken, async (req, res) => {
    const { name, state, city, online, inStore, focus, email, phone, website, description } = req.body;
    const { error } = await supabase.from('merchants').update({
        name, state, city, online: !!online, instore: !!inStore, focus, email, phone, website, description
    }).eq('id', req.params.id);
    
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/merchants/:id', authenticateToken, async (req, res) => {
    // Delete associated products first
    await supabase.from('products').delete().eq('merchantid', req.params.id);
    const { error } = await supabase.from('merchants').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, deletedId: req.params.id });
});


// --- BRANDS (Public Read, Protected Write) ---
app.get('/api/brands', async (req, res) => {
    const { data, error } = await supabase.from('brands').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post('/api/brands', authenticateToken, async (req, res) => {
    const { id, name, description, website, founded, country } = req.body;
    const newId = id || 'b_' + Date.now().toString(36);
    
    const { error } = await supabase.from('brands').insert([{
        id: newId, name, description, website, founded, country
    }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: newId, ...req.body });
});

app.put('/api/brands/:id', authenticateToken, async (req, res) => {
    const { name, description, website, founded, country } = req.body;
    const { error } = await supabase.from('brands').update({
        name, description, website, founded, country
    }).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/brands/:id', authenticateToken, async (req, res) => {
    const { error } = await supabase.from('brands').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, deletedId: req.params.id });
});


// --- PRODUCTS (Public Read, Protected Write) ---
app.get('/api/products', async (req, res) => {
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            brand:brands(name),
            merchant:merchants(name)
        `);
        
    if (error) return res.status(500).json({ error: error.message });
    
    const products = data.map(r => ({
        ...r,
        brandId: r.brandid,
        merchantId: r.merchantid,
        discountPct: r.discountpct,
        newIn: r.newin,
        brand: r.brand ? r.brand.name : null,
        merchant: r.merchant ? r.merchant.name : null
    }));
    res.json(products);
});

app.post('/api/products', authenticateToken, async (req, res) => {
    const { id, category, title, brandId, merchantId, rrp, sale, discountPct, newIn, sizes, image, description } = req.body;
    const newId = id || 'p_' + Date.now().toString(36);
    const added = Date.now();
    const pct = discountPct || Math.round(((rrp - sale) / rrp) * 100);

    const { error } = await supabase.from('products').insert([{
        id: newId, category, title, brandid: brandId, merchantid: merchantId, rrp, sale, discountpct: pct, newin: !!newIn, sizes: sizes || [], image, added, description
    }]);
    
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: newId, ...req.body, discountPct: pct, added });
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
    const { category, title, brandId, merchantId, rrp, sale, discountPct, newIn, sizes, image, description } = req.body;
    const pct = discountPct || Math.round(((rrp - sale) / rrp) * 100);

    const { error } = await supabase.from('products').update({
        category, title, brandid: brandId, merchantid: merchantId, rrp, sale, discountpct: pct, newin: !!newIn, sizes: sizes || [], image, description
    }).eq('id', req.params.id);
    
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: req.params.id, ...req.body, discountPct: pct });
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, deletedId: req.params.id });
});

// --- BULK UPLOAD ---
app.post('/api/products/bulk', authenticateToken, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const results = [];
    const errors = [];
    let rowCount = 0;

    const { data: brandRows, error: brandErr } = await supabase.from('brands').select('id');
    if (brandErr) return res.status(500).json({ error: brandErr.message });
    const validBrands = new Set(brandRows.map(b => b.id));

    const { data: merchRows, error: merchErr } = await supabase.from('merchants').select('id');
    if (merchErr) return res.status(500).json({ error: merchErr.message });
    const validMerchants = new Set(merchRows.map(m => m.id));

    fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', (data) => {
            rowCount++;
            const { title, brandId, merchantId, category, rrp, sale, sizes, image, description } = data;
            
            if (!title || !brandId || !merchantId || !category || !rrp || !sale) {
                errors.push({ row: rowCount, msg: 'Missing required fields' });
                return;
            }
            if (!validBrands.has(brandId)) {
                errors.push({ row: rowCount, msg: `Unknown brandId: ${brandId}` });
                return;
            }
            if (!validMerchants.has(merchantId)) {
                errors.push({ row: rowCount, msg: `Unknown merchantId: ${merchantId}` });
                return;
            }

            const numRRP = parseInt(rrp, 10);
            const numSale = parseInt(sale, 10);
            if (isNaN(numRRP) || isNaN(numSale)) {
                errors.push({ row: rowCount, msg: 'RRP and Sale must be numbers' });
                return;
            }

            results.push({
                title, brandid: brandId, merchantid: merchantId, category, 
                rrp: numRRP, sale: numSale, 
                sizes: sizes ? sizes.split(',').map(s => s.trim()) : [], 
                image: image || null, 
                description: description || null
            });
        })
        .on('end', async () => {
            fs.unlinkSync(req.file.path);

            if (results.length === 0) {
                return res.json({ success: true, imported: 0, errors });
            }

            const now = Date.now();
            const insertData = results.map((r, i) => {
                const newId = 'p_bulk_' + Date.now().toString(36) + '_' + i;
                const pct = Math.round(((r.rrp - r.sale) / r.rrp) * 100);
                return {
                    id: newId,
                    category: r.category,
                    title: r.title,
                    brandid: r.brandid,
                    merchantid: r.merchantid,
                    rrp: r.rrp,
                    sale: r.sale,
                    discountpct: pct,
                    sizes: r.sizes,
                    image: r.image,
                    added: now,
                    description: r.description
                };
            });

            const { error } = await supabase.from('products').insert(insertData);
            if (error) return res.status(500).json({ error: 'Transaction failed', details: error.message });
            
            res.json({ success: true, imported: results.length, errors });
        });
});

// --- STATS ---
app.get('/api/stats', async (req, res) => {
    try {
        const [{ count: totalMerchants }, { count: totalBrands }, { count: totalProducts }, { count: newInCount }, { data: avgData }] = await Promise.all([
            supabase.from('merchants').select('*', { count: 'exact', head: true }),
            supabase.from('brands').select('*', { count: 'exact', head: true }),
            supabase.from('products').select('*', { count: 'exact', head: true }),
            supabase.from('products').select('*', { count: 'exact', head: true }).or(`newin.eq.true,added.gt.${Date.now() - (48 * 3600000)}`),
            supabase.from('products').select('discountpct')
        ]);
        
        let avgDiscount = 0;
        if (avgData && avgData.length > 0) {
            const sum = avgData.reduce((acc, curr) => acc + (curr.discountpct || 0), 0);
            avgDiscount = Math.round(sum / avgData.length);
        }

        res.json({
            totalMerchants,
            totalBrands,
            totalProducts,
            newIn: newInCount,
            avgDiscount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;

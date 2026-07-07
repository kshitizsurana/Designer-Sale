// Load .env from the api/ directory regardless of working directory
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

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

app.get('/api/version', (req, res) => {
    res.json({ version: '1.0.1-no-inventory' });
});
// Vercel serves static files natively via vercel.json configuration.
// No express.static or static HTML routes needed here.

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

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

// --- IMAGE UPLOAD (Cloudinary or base64 fallback) ---
// POST /api/upload-image  (multipart: field 'file') or JSON body { url: '...' }
app.post('/api/upload-image', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
    const API_KEY    = process.env.CLOUDINARY_API_KEY;
    const API_SECRET = process.env.CLOUDINARY_API_SECRET;
    // Passthrough URL
    if (!req.file && req.body && req.body.url) return res.json({ url: req.body.url });
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    // No Cloudinary creds — return base64 fallback
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      return res.json({ url: dataUrl, warning: 'Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET in env vars.' });
    }
    // Upload to Cloudinary
    const crypto = require('crypto');
    const FormData = require('form-data');
    const nodeFetch = require('node-fetch');
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'designersale';
    const signature = crypto.createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${API_SECRET}`).digest('hex');
    const form = new FormData();
    form.append('file', req.file.buffer, { filename: req.file.originalname, contentType: req.file.mimetype });
    form.append('api_key', API_KEY);
    form.append('timestamp', String(timestamp));
    form.append('folder', folder);
    form.append('signature', signature);
    const r = await nodeFetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: form });
    const result = await r.json();
    if (result.error) return res.status(500).json({ error: result.error.message });
    return res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// --- LOOKS (Public Read, Protected Write) ---
app.get('/api/looks', async (req, res) => {
    const { data, error } = await supabase.from('looks').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

function pickLookRow(body) {
    const {
        name, slug, description, hero_image, status,
        tagline, keywords, feature_title, feature_body, feature_cta,
    } = body;
    return {
        name, slug, description, hero_image, status: status || 'active',
        tagline, keywords, feature_title, feature_body, feature_cta,
        updated_at: new Date().toISOString(),
    };
}

app.post('/api/looks', authenticateToken, async (req, res) => {
    let id = req.body.id;
    if (!id) {
        const { data: allLooks } = await supabase.from('looks').select('id');
        const maxId = (allLooks && allLooks.length > 0) ? Math.max(...allLooks.map(l => l.id)) : 0;
        id = maxId + 1;
    }
    const row = { id, ...pickLookRow(req.body) };
    const { error } = await supabase.from('looks').insert([row]);
    if (error) return res.status(500).json({ error: error.message });
    res.json(row);
});

app.put('/api/looks/:id', authenticateToken, async (req, res) => {
    const row = pickLookRow(req.body);
    const { error } = await supabase.from('looks').update(row).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: parseInt(req.params.id, 10), ...req.body });
});

app.delete('/api/looks/:id', authenticateToken, async (req, res) => {
    const { error } = await supabase.from('looks').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, deletedId: req.params.id });
});

// --- COLLECTIONS (Public & Admin) ---
app.get('/api/collections', async (req, res) => {
    const { data: collections, error: cErr } = await supabase.from('collections').select('*').order('display_order', { ascending: true });
    if (cErr) return res.status(500).json({ error: cErr.message });
    
    const { data: cpData, error: cpErr } = await supabase.from('collection_products').select('*');
    if (cpErr) return res.status(500).json({ error: cpErr.message });
    
    const result = collections.map(c => ({
        ...c,
        product_ids: cpData.filter(cp => cp.collection_id === c.id).sort((a, b) => a.display_order - b.display_order).map(cp => cp.product_id)
    }));
    res.json(result);
});

app.post('/api/collections', authenticateToken, async (req, res) => {
    const { look_id, title, slug, hero_image, description, seo_title, seo_description, display_order, status } = req.body;
    const { data, error } = await supabase.from('collections').insert([{
        look_id, title, slug, hero_image, description, seo_title, seo_description, display_order, status
    }]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ...data[0], product_ids: [] });
});

app.put('/api/collections/:id', authenticateToken, async (req, res) => {
    const { look_id, title, slug, hero_image, description, seo_title, seo_description, display_order, status } = req.body;
    const { error } = await supabase.from('collections').update({
        look_id, title, slug, hero_image, description, seo_title, seo_description, display_order, status, updated_at: new Date().toISOString()
    }).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: parseInt(req.params.id), ...req.body });
});

app.delete('/api/collections/:id', authenticateToken, async (req, res) => {
    const { error } = await supabase.from('collections').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, deletedId: req.params.id });
});

app.put('/api/collections/:id/products', authenticateToken, async (req, res) => {
    const collection_id = parseInt(req.params.id);
    const { product_ids } = req.body; // Array of product IDs
    
    // 1. Delete existing mappings
    const { error: delErr } = await supabase.from('collection_products').delete().eq('collection_id', collection_id);
    if (delErr) return res.status(500).json({ error: delErr.message });
    
    // 2. Insert new mappings
    if (product_ids && product_ids.length > 0) {
        const inserts = product_ids.map((pid, idx) => ({
            collection_id,
            product_id: pid,
            display_order: idx
        }));
        const { error: insErr } = await supabase.from('collection_products').insert(inserts);
        if (insErr) return res.status(500).json({ error: insErr.message });
    }
    
    res.json({ success: true });
});

// --- CATEGORIES (Public Read, Protected Write) ---
app.get('/api/categories', async (req, res) => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.put('/api/categories/:id', authenticateToken, async (req, res) => {
    const { label, image, swatch } = req.body;
    const updates = {};
    if (label !== undefined) updates.label = label;
    if (image !== undefined) updates.image = image;
    if (swatch !== undefined) updates.swatch = swatch;
    const { error } = await supabase.from('categories').update(updates).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: req.params.id, ...updates });
});

// --- MERCHANTS (Public Read, Protected Write) ---
app.get('/api/merchants', async (req, res) => {
    const { data, error } = await supabase.from('merchants').select('*');
    if (error) return res.status(500).json({ error: error.message });
    
    // Convert instore to inStore, etc.
    const merchants = data.map(r => ({
        ...r,
        inStore: r.instore,
        bestContactMethod: r.best_contact_method
    }));
    res.json(merchants);
});

app.post('/api/merchants', authenticateToken, async (req, res) => {
    const { id, name, state, city, online, inStore, focus, email, phone, website, description, facebook, instagram, bestContactMethod, look_id } = req.body;
    const newId = id || 'm_' + Date.now().toString(36);
    
    // Only include fields that are defined to avoid schema errors for columns not yet migrated
    const row = { id: newId, name, state, city, online: !!online, instore: !!inStore, focus, email, phone, website, description };
    if (facebook !== undefined) row.facebook = facebook;
    if (instagram !== undefined) row.instagram = instagram;
    if (bestContactMethod !== undefined) row.best_contact_method = bestContactMethod;
    if (look_id !== undefined) row.look_id = look_id;

    const { error } = await supabase.from('merchants').insert([row]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: newId, ...req.body });
});

app.put('/api/merchants/:id', authenticateToken, async (req, res) => {
    const { name, state, city, online, inStore, focus, email, phone, website, description, facebook, instagram, bestContactMethod, look_id } = req.body;
    
    const updates = { name, state, city, online: !!online, instore: !!inStore, focus, email, phone, website, description };
    if (facebook !== undefined) updates.facebook = facebook;
    if (instagram !== undefined) updates.instagram = instagram;
    if (bestContactMethod !== undefined) updates.best_contact_method = bestContactMethod;
    if (look_id !== undefined) updates.look_id = look_id;

    const { error } = await supabase.from('merchants').update(updates).eq('id', req.params.id);
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

app.post('/api/merchants/bulk', authenticateToken, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const results = [];
    const errors = [];
    let rowCount = 0;

    const { Readable } = require('stream');
    Readable.from(req.file.buffer)
        .pipe(csvParser())
        .on('data', (data) => {
            rowCount++;
            const { name, state, city, online, inStore, focus, email, phone, website, description, facebook, instagram, bestContactMethod } = data;
            
            if (!name) {
                errors.push({ row: rowCount, msg: 'Missing required field: name' });
                return;
            }

            results.push({
                id: 'm_' + Date.now().toString(36) + rowCount,
                name, state, city,
                online: String(online).toLowerCase() === 'true' || String(online) === '1',
                instore: String(inStore).toLowerCase() === 'true' || String(inStore) === '1',
                focus, email, phone, website, description,
                facebook, instagram, best_contact_method: bestContactMethod
            });
        })
        .on('end', async () => {
            if (errors.length > 0) {
                return res.status(400).json({ errors, message: `Found ${errors.length} errors in CSV.` });
            }
            if (results.length === 0) {
                return res.status(400).json({ error: 'CSV file is empty or invalid.' });
            }

            // Insert in batches
            const batchSize = 50;
            for (let i = 0; i < results.length; i += batchSize) {
                const batch = results.slice(i, i + batchSize);
                const { error } = await supabase.from('merchants').insert(batch);
                if (error) {
                    return res.status(500).json({ error: `Insert failed at row ${i}: ` + error.message });
                }
            }
            
            res.json({ success: true, count: results.length });
        });
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
    const { id, category, title, brandId, merchantId, rrp, sale, discountPct, newIn, sizes, image, description, inventory, look_id } = req.body;
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
    const { category, title, brandId, merchantId, rrp, sale, discountPct, newIn, sizes, image, description, inventory, look_id } = req.body;
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

    const { Readable } = require('stream');
    Readable.from(req.file.buffer)
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

// --- BLOGS ---
app.get('/api/blogs', async (req, res) => {
    const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

app.post('/api/blogs', authenticateToken, async (req, res) => {
    const { title, slug, content, image, author, status, published_at } = req.body;
    const newId = 'b_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const { error } = await supabase.from('blogs').insert([{
        id: newId, title, slug, content, image, author, status: status || 'draft', published_at
    }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: newId, ...req.body });
});

app.put('/api/blogs/:id', authenticateToken, async (req, res) => {
    const { title, slug, content, image, author, status, published_at } = req.body;
    const { error } = await supabase.from('blogs').update({
        title, slug, content, image, author, status, published_at
    }).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/blogs/:id', authenticateToken, async (req, res) => {
    const { error } = await supabase.from('blogs').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, deletedId: req.params.id });
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

// --- LANDING PAGES ---
app.get('/api/landing-pages', async (req, res) => {
    const { data, error } = await supabase.from('landing_pages').select('*');
    if (error) {
        console.error('landing_pages error:', error.message);
        // Return empty array so the UI doesn't crash (table may not exist yet)
        return res.json([]);
    }
    res.json(data || []);
});

app.post('/api/landing-pages', authenticateToken, async (req, res) => {
    const { id, title, short_description, image, products, look_id, status } = req.body;
    const newId = id || 'lp_' + Date.now().toString(36);
    const { error } = await supabase.from('landing_pages').insert([{
        id: newId, title, short_description, image, products: products || [], look_id, status: status || 'published'
    }]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: newId, ...req.body });
});

app.put('/api/landing-pages/:id', authenticateToken, async (req, res) => {
    const { title, short_description, image, products, look_id, status } = req.body;
    const { error } = await supabase.from('landing_pages').update({
        title, short_description, image, products: products || [], look_id, status: status || 'published'
    }).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/landing-pages/:id', authenticateToken, async (req, res) => {
    const { error } = await supabase.from('landing_pages').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, deletedId: req.params.id });
});

module.exports = app;

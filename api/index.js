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

app.use(cors());
app.use(express.json());

app.get('/api/version', (req, res) => {
    res.json({
        version: '1.0.3-bootstrap-performance',
        supabaseConfigured: Boolean(supabase)
    });
});

// Middleware to check if Supabase is initialized
app.use((req, res, next) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Supabase credentials are not configured in Vercel Environment Variables.' });
    }
    next();
});
// Vercel serves static files natively via vercel.json configuration.
// No express.static or static HTML routes needed here.

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function parseProductDescription(rawDescription) {
    let description = rawDescription || '';
    let url = null;
    if (typeof description === 'string' && description.startsWith('{')) {
        try {
            const parsed = JSON.parse(description);
            description = parsed.desc || '';
            url = parsed.url || null;
        } catch (e) {}
    }
    return { description, url };
}

function mapProductRow(row) {
    const parsed = parseProductDescription(row.description);
    return {
        ...row,
        brandId: row.brandid,
        merchantId: row.merchantid,
        discountPct: row.discountpct,
        newIn: row.newin,
        status: row.status || 'active',
        tags: row.tags || [],
        brand: row.brand ? row.brand.name : null,
        merchant: row.merchant ? row.merchant.name : null,
        description: parsed.description,
        url: parsed.url
    };
}

function mapMerchantRow(row) {
    return {
        ...row,
        inStore: row.instore,
        bestContactMethod: row.best_contact_method,
        status: row.status || 'active'
    };
}

function normalizeSlug(value, fallback = '') {
    return String(value || fallback || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function activeStatus(value, fallback = 'active') {
    return value || fallback;
}

async function getCollectionsWithProducts() {
    const { data: collections, error: cErr } = await supabase
        .from('collections')
        .select('*')
        .order('display_order', { ascending: true });
    if (cErr) throw cErr;

    const { data: cpData, error: cpErr } = await supabase.from('collection_products').select('*');
    if (cpErr) throw cpErr;

    return (collections || []).map(c => ({
        ...c,
        product_ids: (cpData || [])
            .filter(cp => cp.collection_id === c.id)
            .sort((a, b) => a.display_order - b.display_order)
            .map(cp => cp.product_id)
    }));
}

async function getLandingPages() {
    const { data, error } = await supabase.from('landing_pages').select('*');
    if (error) {
        console.error('landing_pages error:', error.message);
        return [];
    }
    return data || [];
}

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

// --- PUBLIC BOOTSTRAP ---
// One request for the public app shell. This avoids seven separate serverless
// round trips during first render while keeping the existing CRUD endpoints.
app.get('/api/bootstrap', async (req, res) => {
    try {
        const [
            { data: categories, error: categoriesError },
            { data: merchants, error: merchantsError },
            { data: brands, error: brandsError },
            { data: products, error: productsError },
            { data: looks, error: looksError },
            collections,
            landingPages
        ] = await Promise.all([
            supabase.from('categories').select('*'),
            supabase.from('merchants').select('*'),
            supabase.from('brands').select('*'),
            supabase.from('products').select(`
                *,
                brand:brands(name),
                merchant:merchants(name)
            `),
            supabase.from('looks').select('*'),
            getCollectionsWithProducts().catch((error) => {
                console.error('collections error:', error.message);
                return [];
            }),
            getLandingPages()
        ]);

        const firstError = categoriesError || merchantsError || brandsError || productsError || looksError;
        if (firstError) return res.status(500).json({ error: firstError.message });

        res.set('Cache-Control', 'no-store');
        res.json({
            categories: categories || [],
            merchants: (merchants || []).map(mapMerchantRow),
            brands: brands || [],
            products: (products || []).map(mapProductRow),
            looks: looks || [],
            collections,
            landing_pages: landingPages
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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
    // Upload to Cloudinary. Uses Node 20's built-in fetch/FormData/Blob so the
    // serverless function has no hidden runtime dependencies.
    const crypto = require('crypto');
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'designersale';
    const signature = crypto.createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${API_SECRET}`).digest('hex');
    const form = new FormData();
    form.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
    form.append('api_key', API_KEY);
    form.append('timestamp', String(timestamp));
    form.append('folder', folder);
    form.append('signature', signature);
    const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: form });
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
        tagline, keywords, feature_title, feature_body, feature_cta, sort_order,
    } = body;
    const row = {
        name, slug: normalizeSlug(slug, name), description, hero_image, status: status || 'active',
        tagline, keywords, feature_title, feature_body, feature_cta,
        updated_at: new Date().toISOString(),
    };
    if (sort_order !== undefined && sort_order !== '') row.sort_order = Number(sort_order);
    return row;
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
    const [{ count: merchantCount }, { count: productCount }] = await Promise.all([
        supabase.from('merchants').select('*', { count: 'exact', head: true }).eq('look_id', req.params.id),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('look_id', req.params.id)
    ]);
    if ((merchantCount || 0) > 0 || (productCount || 0) > 0) {
        return res.status(409).json({
            error: 'This look still has boutiques or products attached. Archive it or reassign those records before deleting.'
        });
    }
    const { error } = await supabase.from('looks').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, deletedId: req.params.id });
});

// --- COLLECTIONS (Public & Admin) ---
app.get('/api/collections', async (req, res) => {
    try {
        const result = await getCollectionsWithProducts();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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

function pickCategoryRow(body) {
    const { id, label, image, swatch, status, sort_order } = body;
    const row = {
        id: normalizeSlug(id, label),
        label,
    };
    if (image !== undefined) row.image = image;
    if (swatch !== undefined) row.swatch = swatch;
    if (status !== undefined) row.status = status;
    if (sort_order !== undefined && sort_order !== '') row.sort_order = Number(sort_order);
    return row;
}

app.post('/api/categories', authenticateToken, async (req, res) => {
    const row = pickCategoryRow(req.body);
    if (!row.id || !row.label) return res.status(400).json({ error: 'Category id and label are required' });
    const { error } = await supabase.from('categories').insert([row]);
    if (error) return res.status(500).json({ error: error.message });
    res.json(row);
});

app.put('/api/categories/:id', authenticateToken, async (req, res) => {
    const { label, image, swatch, status, sort_order } = req.body;
    const updates = {};
    if (label !== undefined) updates.label = label;
    if (image !== undefined) updates.image = image;
    if (swatch !== undefined) updates.swatch = swatch;
    if (status !== undefined) updates.status = status;
    if (sort_order !== undefined && sort_order !== '') updates.sort_order = Number(sort_order);
    const { error } = await supabase.from('categories').update(updates).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: req.params.id, ...updates });
});

app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
    const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('category', req.params.id);
    if ((count || 0) > 0) {
        return res.status(409).json({ error: 'This category still has products attached. Reassign those products before deleting.' });
    }
    const { error } = await supabase.from('categories').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, deletedId: req.params.id });
});

// --- MERCHANTS (Public Read, Protected Write) ---
app.get('/api/merchants', async (req, res) => {
    const { data, error } = await supabase.from('merchants').select('*');
    if (error) return res.status(500).json({ error: error.message });

    res.json((data || []).map(mapMerchantRow));
});

app.post('/api/merchants', authenticateToken, async (req, res) => {
    const { id, name, state, city, suburb, street_address, online, inStore, focus, email, phone, website, description, facebook, instagram, bestContactMethod, look_id, logo_image, status } = req.body;
    const newId = id || 'm_' + Date.now().toString(36);
    
    // Only include fields that are defined to avoid schema errors for columns not yet migrated
    const row = { id: newId, name, state, city, online: !!online, instore: !!inStore, focus, email, phone, website, description };
    if (facebook !== undefined) row.facebook = facebook;
    if (instagram !== undefined) row.instagram = instagram;
    if (bestContactMethod !== undefined) row.best_contact_method = bestContactMethod;
    if (look_id !== undefined) row.look_id = look_id;
    if (suburb !== undefined) row.suburb = suburb;
    if (street_address !== undefined) row.street_address = street_address;
    if (logo_image !== undefined) row.logo_image = logo_image;
    if (status !== undefined) row.status = activeStatus(status);

    const { error } = await supabase.from('merchants').insert([row]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: newId, ...req.body });
});

app.put('/api/merchants/:id', authenticateToken, async (req, res) => {
    const { name, state, city, suburb, street_address, online, inStore, focus, email, phone, website, description, facebook, instagram, bestContactMethod, look_id, logo_image, status } = req.body;
    
    const updates = { name, state, city, online: !!online, instore: !!inStore, focus, email, phone, website, description };
    if (facebook !== undefined) updates.facebook = facebook;
    if (instagram !== undefined) updates.instagram = instagram;
    if (bestContactMethod !== undefined) updates.best_contact_method = bestContactMethod;
    if (look_id !== undefined) updates.look_id = look_id;
    if (suburb !== undefined) updates.suburb = suburb;
    if (street_address !== undefined) updates.street_address = street_address;
    if (logo_image !== undefined) updates.logo_image = logo_image;
    if (status !== undefined) updates.status = activeStatus(status);

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
    const { id, name, description, website, founded, country, logo } = req.body;
    const newId = id || 'b_' + Date.now().toString(36);

    const row = { id: newId, name, description, website, founded, country };
    if (logo !== undefined) row.logo = logo;
    const { error } = await supabase.from('brands').insert([row]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: newId, ...req.body });
});

app.put('/api/brands/:id', authenticateToken, async (req, res) => {
    const { name, description, website, founded, country, logo } = req.body;
    const updates = { name, description, website, founded, country };
    if (logo !== undefined) updates.logo = logo;
    const { error } = await supabase.from('brands').update(updates).eq('id', req.params.id);
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
    
    res.json((data || []).map(mapProductRow));
});

app.post('/api/products', authenticateToken, async (req, res) => {
    const { id, category, title, brandId, merchantId, rrp, sale, discountPct, newIn, sizes, image, description, url, look_id, inventory, status, tags } = req.body;
    const newId = id || 'p_' + Date.now().toString(36);
    const added = Date.now();
    const pct = discountPct || Math.round(((rrp - sale) / rrp) * 100);

    const finalDesc = url ? JSON.stringify({ desc: description || '', url }) : (description || '');
    const row = {
        id: newId, category, title, brandid: brandId, merchantid: merchantId, rrp, sale, discountpct: pct, newin: !!newIn, sizes: sizes || [], image, added, description: finalDesc
    };
    if (look_id !== undefined && look_id !== '') row.look_id = Number(look_id);
    if (inventory !== undefined && inventory !== '') row.inventory = Number(inventory) || 0;
    if (status !== undefined) row.status = activeStatus(status);
    if (tags !== undefined) row.tags = Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim()).filter(Boolean);

    const { error } = await supabase.from('products').insert([row]);
    
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: newId, ...req.body, look_id: row.look_id, discountPct: pct, added });
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
    const { category, title, brandId, merchantId, rrp, sale, discountPct, newIn, sizes, image, description, url, look_id, inventory, status, tags } = req.body;
    const pct = discountPct || Math.round(((rrp - sale) / rrp) * 100);

    const finalDesc = url ? JSON.stringify({ desc: description || '', url }) : (description || '');
    const updates = {
        category, title, brandid: brandId, merchantid: merchantId, rrp, sale, discountpct: pct, newin: !!newIn, sizes: sizes || [], image, description: finalDesc
    };
    if (look_id !== undefined) updates.look_id = look_id === '' ? null : Number(look_id);
    if (inventory !== undefined && inventory !== '') updates.inventory = Number(inventory) || 0;
    if (status !== undefined) updates.status = activeStatus(status);
    if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim()).filter(Boolean);

    const { error } = await supabase.from('products').update(updates).eq('id', req.params.id);
    
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: req.params.id, ...req.body, look_id: updates.look_id, discountPct: pct });
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, deletedId: req.params.id });
});

// --- BULK UPLOAD ---
app.post('/api/products/bulk', authenticateToken, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { data: brandRows, error: brandErr } = await supabase.from('brands').select('id');
    if (brandErr) return res.status(500).json({ error: brandErr.message });
    const validBrands = new Set(brandRows.map(b => b.id));

    const { data: merchRows, error: merchErr } = await supabase.from('merchants').select('id');
    if (merchErr) return res.status(500).json({ error: merchErr.message });
    const validMerchants = new Set(merchRows.map(m => m.id));

    const results = [];
    const errors = [];

    function normalizeProductImportRow(data, rowCount) {
        const { title, brandId, merchantId, category, rrp, sale, sizes, image, description, url, look_id, newIn, inventory } = data;

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

        const numRRP = Number(rrp);
        const numSale = Number(sale);
        if (!Number.isFinite(numRRP) || !Number.isFinite(numSale) || numRRP <= 0 || numSale <= 0) {
            errors.push({ row: rowCount, msg: 'RRP and Sale must be positive numbers' });
            return;
        }

        results.push({
            title,
            brandid: brandId,
            merchantid: merchantId,
            category,
            rrp: numRRP,
            sale: numSale,
            sizes: Array.isArray(sizes) ? sizes : (sizes ? String(sizes).split(',').map(s => s.trim()).filter(Boolean) : []),
            image: image || null,
            description: url ? JSON.stringify({ desc: description || '', url }) : (description || null),
            look_id: look_id ? Number(look_id) : null,
            newin: String(newIn).toLowerCase() === 'true' || String(newIn) === '1',
            inventory: inventory === undefined || inventory === '' ? 0 : Number(inventory) || 0
        });
    }

    const isJson = req.file.mimetype === 'application/json' || req.file.originalname.toLowerCase().endsWith('.json');

    if (isJson) {
        try {
            const parsed = JSON.parse(req.file.buffer.toString('utf8'));
            const rows = Array.isArray(parsed) ? parsed : parsed.products;
            if (!Array.isArray(rows)) return res.status(400).json({ error: 'JSON must be an array or an object with a products array.' });
            rows.forEach((row, idx) => normalizeProductImportRow(row, idx + 1));
        } catch (error) {
            return res.status(400).json({ error: 'Invalid JSON file: ' + error.message });
        }

        if (results.length === 0) return res.json({ success: true, imported: 0, errors });

        const now = Date.now();
        const insertData = results.map((r, i) => ({
            id: 'p_bulk_' + Date.now().toString(36) + '_' + i,
            ...r,
            discountpct: Math.round(((r.rrp - r.sale) / r.rrp) * 100),
            added: now
        }));
        const { error } = await supabase.from('products').insert(insertData);
        if (error) return res.status(500).json({ error: 'Transaction failed', details: error.message });
        return res.json({ success: true, imported: results.length, errors });
    }

    let rowCount = 0;
    const { Readable } = require('stream');
    Readable.from(req.file.buffer)
        .pipe(csvParser())
        .on('data', (data) => {
            rowCount++;
            normalizeProductImportRow(data, rowCount);
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
                    ...r,
                    discountpct: pct,
                    added: now
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
    res.json(await getLandingPages());
});

app.post('/api/landing-pages', authenticateToken, async (req, res) => {
    const { id, title, short_description, image, products, look_id, status, filter_rules, sort_order } = req.body;
    const newId = id || 'lp_' + Date.now().toString(36);
    const row = {
        id: newId, title, short_description, image, products: products || [], look_id, status: status || 'published'
    };
    if (filter_rules !== undefined) row.filter_rules = filter_rules || {};
    if (sort_order !== undefined && sort_order !== '') row.sort_order = Number(sort_order);
    const { error } = await supabase.from('landing_pages').insert([row]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: newId, ...req.body });
});

app.put('/api/landing-pages/:id', authenticateToken, async (req, res) => {
    const { title, short_description, image, products, look_id, status, filter_rules, sort_order } = req.body;
    const updates = {
        title, short_description, image, products: products || [], look_id, status: status || 'published'
    };
    if (filter_rules !== undefined) updates.filter_rules = filter_rules || {};
    if (sort_order !== undefined && sort_order !== '') updates.sort_order = Number(sort_order);
    const { error } = await supabase.from('landing_pages').update(updates).eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/landing-pages/:id', authenticateToken, async (req, res) => {
    const { error } = await supabase.from('landing_pages').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, deletedId: req.params.id });
});

module.exports = app;

if (require.main === module) {
    const listenPort = process.env.PORT || 3000;
    app.listen(listenPort, () => console.log(`API Server listening on port ${listenPort}`));
}

// DesignerSale.com.au — Central Data Layer (db.js)
// Persists to localStorage. All CRUD operations go through this module.
// Swap DB.* calls for fetch('/api/...') to upgrade to a real backend.

(function () {
  const I = window.IMG || {};

  // ---- Seed Data ----------------------------------------------------------------

  const SEED_CATEGORIES = [
    { id: 'maxi-dresses',     label: 'Maxi Dresses',       count: 412, swatch: ['#C9B8A8', '#A8854A'], image: I.catMaxi },
    { id: 'kaftans',          label: 'Kaftans',            count: 186, swatch: ['#E8D9C4', '#7A6450'], image: I.catKaftan },
    { id: 'tops-blouses',     label: 'Tops & Blouses',     count: 528, swatch: ['#D8C8B8', '#8E7558'], image: I.catTops },
    { id: 'coats-jackets',    label: 'Coats & Jackets',    count: 247, swatch: ['#6B5B4A', '#2A2520'], image: I.catCoats },
    { id: 'bags-accessories', label: 'Bags & Accessories', count: 311, swatch: ['#A8854A', '#5C4632'], image: I.catBags },
    { id: 'jewellery',        label: 'Jewellery',          count: 192, swatch: ['#C9A84C', '#E8D4B8'], image: I.catJewel },
  ];

  const SEED_BRANDS = [
    { id: 'fashion-spectrum', name: 'Fashion Spectrum',   description: '100% silk, hand-beaded garments made in workshops outside Jaipur. Stocked by 40+ boutiques nationwide.', website: 'https://fashionspectrum.com.au', founded: '2005', country: 'AU' },
    { id: 'marlowe-quinn',    name: 'Marlowe & Quinn',    description: 'Contemporary Australian womenswear with a focus on resort and occasion dressing.', website: '', founded: '2018', country: 'AU' },
    { id: 'bondi-atelier',    name: 'Bondi Atelier',      description: 'Sydney-born label specialising in elevated coastal casualwear.', website: '', founded: '2019', country: 'AU' },
    { id: 'saltbush-studio',  name: 'Saltbush Studio',    description: 'Ethical Australian fashion using natural fibres and native plant dyes.', website: '', founded: '2020', country: 'AU' },
    { id: 'wren-the-label',   name: 'Wren the Label',     description: 'Feminine, seasonal pieces designed for the Australian climate.', website: '', founded: '2017', country: 'AU' },
    { id: 'coastal-co',       name: 'Coastal & Co.',      description: 'Effortless resort and beach-to-bar dressing.', website: '', founded: '2016', country: 'AU' },
    { id: 'hayman-edit',      name: 'Hayman Edit',        description: 'Luxury island resort wear inspired by the Whitsundays.', website: '', founded: '2021', country: 'AU' },
    { id: 'indigo-lane',      name: 'Indigo Lane',        description: 'Rich jewel-tone prints and artisan embroidery.', website: '', founded: '2015', country: 'AU' },
    { id: 'field-fern',       name: 'Field & Fern',       description: 'Botanical-inspired prints and natural linen fabrications.', website: '', founded: '2019', country: 'AU' },
    { id: 'margot-house',     name: 'Margot House',       description: 'Parisian-influenced tailoring with an Australian sensibility.', website: '', founded: '2020', country: 'AU' },
  ];

  const SEED_MERCHANTS = [
    { id: 'blue-bungalow',   name: 'Blue Bungalow',        state: 'QLD', city: 'Noosa Heads',   online: true,  inStore: true,  items: 87,  focus: 'Resort & holiday',         email: 'hello@bluebungalow.com.au',   phone: '07 5447 0000', website: 'https://bluebungalow.com.au',   description: 'Noosa\'s favourite resort boutique since 2003.' },
    { id: 'pizazz',          name: 'Pizazz Boutique',      state: 'VIC', city: 'Armadale',      online: true,  inStore: true,  items: 124, focus: 'Occasion & evening',        email: 'info@pizazz.com.au',          phone: '03 9822 0000', website: 'https://pizazz.com.au',         description: 'Melbourne\'s go-to for occasion dressing and evening wear.' },
    { id: 'the-edit-paddo',  name: 'The Edit Paddington',  state: 'NSW', city: 'Paddington',    online: true,  inStore: true,  items: 56,  focus: 'Contemporary',              email: 'hello@theeditpaddo.com.au',   phone: '02 9380 0000', website: 'https://theeditpaddington.com.au', description: 'A tightly curated edit of contemporary Australian labels.' },
    { id: 'silk-and-stone',  name: 'Silk & Stone',         state: 'NSW', city: 'Mosman',        online: true,  inStore: true,  items: 39,  focus: 'Silk specialists',          email: 'hello@silkandstone.com.au',   phone: '02 9969 0000', website: 'https://silkandstone.com.au',   description: 'Sydney\'s silk specialists — natural fabrics only.' },
    { id: 'driftwood',       name: 'Driftwood Byron',      state: 'NSW', city: 'Byron Bay',     online: true,  inStore: true,  items: 71,  focus: 'Bohemian luxe',             email: 'hello@driftwoodbyron.com.au', phone: '02 6685 0000', website: 'https://driftwoodbyron.com.au', description: 'Byron Bay\'s bohemian luxe destination.' },
    { id: 'hayman-edit-co',  name: 'Hayman Edit Co.',      state: 'QLD', city: 'Brisbane',      online: true,  inStore: false, items: 92,  focus: 'Designer resale',           email: 'hello@haymandit.com.au',      phone: '07 3000 0000', website: 'https://haymanedit.com.au',     description: 'Premium designer resale, authenticated and curated.' },
    { id: 'south-yarra',     name: 'South Yarra Atelier',  state: 'VIC', city: 'South Yarra',   online: true,  inStore: true,  items: 110, focus: 'Tailoring & coats',         email: 'hello@southyarraatelier.com.au', phone: '03 9826 0000', website: 'https://southyarraatelier.com.au', description: 'Melbourne\'s finest tailoring atelier for coats and suiting.' },
    { id: 'cottesloe',       name: 'Cottesloe & Co.',      state: 'WA',  city: 'Cottesloe',     online: true,  inStore: true,  items: 44,  focus: 'Coastal contemporary',      email: 'hello@cottesloeandco.com.au', phone: '08 9384 0000', website: 'https://cottesloeandco.com.au', description: 'Perth\'s coastal contemporary boutique on the beachfront.' },
    { id: 'kingston-lane',   name: 'Kingston Lane',        state: 'ACT', city: 'Kingston',      online: false, inStore: true,  items: 28,  focus: 'Curated capsule',           email: 'hello@kingstonlane.com.au',   phone: '02 6295 0000', website: '',                             description: 'Canberra\'s most considered capsule boutique.' },
    { id: 'north-adelaide',  name: 'North Adelaide Edit',  state: 'SA',  city: 'North Adelaide',online: true,  inStore: true,  items: 51,  focus: 'Workwear & every-day',      email: 'hello@northadelaideedit.com.au', phone: '08 8267 0000', website: 'https://northadelaideedit.com.au', description: 'Elevated workwear and everyday essentials for Adelaide women.' },
    { id: 'hobart-house',    name: 'Hobart House',         state: 'TAS', city: 'Battery Point', online: true,  inStore: true,  items: 22,  focus: 'Knitwear & wool',           email: 'hello@hobarthouse.com.au',    phone: '03 6223 0000', website: 'https://hobarthouse.com.au',    description: 'Tasmania\'s home for fine knitwear and wool specialists.' },
    { id: 'darwin-trader',   name: 'The Darwin Trader',    state: 'NT',  city: 'Darwin',        online: true,  inStore: true,  items: 18,  focus: 'Resort & tropical',         email: 'hello@darwintrader.com.au',   phone: '08 8981 0000', website: 'https://darwintrader.com.au',   description: 'Darwin\'s tropical resort wear destination.' },
  ];

  // Product titles
  const PRODUCT_TITLES = {
    'maxi-dresses': [
      'Bias-Cut Silk Slip Maxi in Almond', 'Hand-Beaded Sequin Maxi in Champagne',
      'Tiered Cotton Voile Maxi in Ivory', 'Empire Waist Floral Maxi in Ochre',
      'Halter-Neck Crepe Maxi in Espresso', 'Off-Shoulder Linen Maxi in Sand',
      'Smocked Bodice Print Maxi in Clay', 'V-Neck Pleated Maxi in Bone',
      'Open-Back Silk Maxi in Rosewater', 'Long-Sleeve Cotton Maxi in Pearl',
      'Drape-Front Jersey Maxi in Charcoal', 'Embroidered Tulle Maxi in Cream',
    ],
    'kaftans': [
      'Hand-Embellished Silk Kaftan in Gold', 'Block-Print Cotton Kaftan in Indigo',
      'V-Neck Beaded Kaftan in Coral', 'Tassel-Trim Linen Kaftan in Sand',
    ],
    'tops-blouses': [
      'Pintuck Silk Blouse in Ivory', 'Tie-Neck Cotton Poplin Blouse in Sage',
      'Cropped Cashmere Knit in Oat',
    ],
    'coats-jackets': [
      'Belted Wool Coat in Camel', 'Quilted Liner Jacket in Olive',
    ],
    'bags-accessories': [
      'Woven Raffia Tote in Natural', 'Soft Leather Crescent Bag in Tan',
    ],
    'jewellery': [
      'Hammered Gold Hoop Earrings', 'Freshwater Pearl Drop Necklace',
    ],
  };

  const IMAGE_POOL = {
    'maxi-dresses':     [I.prodMaxi0, I.prodMaxi1, I.prodMaxi2, I.prodMaxi3, I.prodMaxi4, I.prodMaxi5,
                         I.prodMaxi6, I.prodMaxi7, I.prodMaxi8, I.prodMaxi9, I.prodMaxi10, I.prodMaxi11],
    'kaftans':          [I.prodKaftan0, I.prodKaftan1, I.prodKaftan2, I.prodKaftan3],
    'tops-blouses':     [I.prodTops0, I.prodTops1, I.prodTops2],
    'coats-jackets':    [I.prodCoats0, I.prodCoats1],
    'bags-accessories': [I.prodBags0, I.prodBags1],
    'jewellery':        [I.prodJewel0, I.prodJewel1],
  };

  function generateProducts(category, n, brandIds, merchantIds, startId = 0) {
    const titles = PRODUCT_TITLES[category] || PRODUCT_TITLES['maxi-dresses'];
    const pool = IMAGE_POOL[category] || IMAGE_POOL['maxi-dresses'];
    const out = [];
    for (let i = 0; i < n; i++) {
      const id = `${category}-${startId + i}`;
      const rrp = 280 + ((i * 137) % 720);
      const discountPct = 30 + ((i * 17) % 55);
      const sale = Math.round(rrp * (100 - discountPct) / 100 / 5) * 5;
      const brandId = brandIds[(i * 3 + startId) % brandIds.length];
      const merchantId = merchantIds[(i * 5 + startId) % merchantIds.length];
      const title = titles[i % titles.length];
      const newIn = (i % 7 === 0);
      const hue = 18 + ((i * 37) % 40);
      const lightness = 78 + ((i * 11) % 14);
      const image = pool[i % pool.length];
      out.push({
        id, category, title, brandId, merchantId, rrp, sale, discountPct, newIn,
        sizes: ['XS', 'S', 'M', 'L', 'XL'].filter((_, idx) => (i + idx) % 4 !== 0),
        placeholder: { hue, lightness }, image,
        added: Date.now() - (n - i) * 3600000,
        description: `An impeccably crafted ${title.toLowerCase()}. Made with attention to every detail.`,
      });
    }
    return out;
  }

  // ---- Storage helpers ----------------------------------------------------------

  function load(key) {
    try { const r = localStorage.getItem('ds_' + key); return r ? JSON.parse(r) : null; } catch (e) { return null; }
  }
  function save(key, val) {
    try { localStorage.setItem('ds_' + key, JSON.stringify(val)); } catch (e) {}
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // ---- Seeding -----------------------------------------------------------------

  function seed() {
    if (load('seeded')) return; // already seeded

    save('categories', SEED_CATEGORIES);
    save('brands', SEED_BRANDS);
    save('merchants', SEED_MERCHANTS);

    const brandIds = SEED_BRANDS.map(b => b.id);
    const merchantIds = SEED_MERCHANTS.map(m => m.id);

    const allProducts = [
      ...generateProducts('maxi-dresses',     24, brandIds, merchantIds),
      ...generateProducts('kaftans',          12, brandIds, merchantIds),
      ...generateProducts('tops-blouses',     12, brandIds, merchantIds),
      ...generateProducts('coats-jackets',     8, brandIds, merchantIds),
      ...generateProducts('bags-accessories',  8, brandIds, merchantIds),
      ...generateProducts('jewellery',         8, brandIds, merchantIds),
    ];
    save('products', allProducts);
    save('seeded', true);
  }

  // ---- DB API ------------------------------------------------------------------

  const DB = {
    // ---- Categories (read-only from UI) ----
    categories: {
      getAll() { return load('categories') || SEED_CATEGORIES; },
    },

    // ---- Merchants ----
    merchants: {
      getAll()       { return load('merchants') || []; },
      get(id)        { return (load('merchants') || []).find(m => m.id === id) || null; },
      create(data)   {
        const merchants = load('merchants') || [];
        const m = { ...data, id: data.id || uid(), items: 0 };
        merchants.push(m);
        save('merchants', merchants);
        return m;
      },
      update(id, data) {
        const merchants = (load('merchants') || []).map(m => m.id === id ? { ...m, ...data, id } : m);
        save('merchants', merchants);
        return merchants.find(m => m.id === id);
      },
      delete(id) {
        const merchants = (load('merchants') || []).filter(m => m.id !== id);
        save('merchants', merchants);
        // Also remove products for this merchant
        const products = (load('products') || []).filter(p => p.merchantId !== id);
        save('products', products);
      },
    },

    // ---- Brands ----
    brands: {
      getAll()       { return load('brands') || []; },
      get(id)        { return (load('brands') || []).find(b => b.id === id) || null; },
      getBySlug(slug){ return (load('brands') || []).find(b => b.id === slug) || null; },
      create(data)   {
        const brands = load('brands') || [];
        const b = { ...data, id: data.id || uid() };
        brands.push(b);
        save('brands', brands);
        return b;
      },
      update(id, data) {
        const brands = (load('brands') || []).map(b => b.id === id ? { ...b, ...data, id } : b);
        save('brands', brands);
        return brands.find(b => b.id === id);
      },
      delete(id) {
        const brands = (load('brands') || []).filter(b => b.id !== id);
        save('brands', brands);
      },
    },

    // ---- Products ----
    products: {
      getAll()               { return load('products') || []; },
      get(id)                { return (load('products') || []).find(p => p.id === id) || null; },
      getByCategory(catId)   { return (load('products') || []).filter(p => p.category === catId); },
      getByMerchant(mId)     { return (load('products') || []).filter(p => p.merchantId === mId); },
      getByBrand(bId)        { return (load('products') || []).filter(p => p.brandId === bId); },
      getJustAdded(n)        {
        return (load('products') || [])
          .slice()
          .sort((a, b) => (b.added || 0) - (a.added || 0))
          .slice(0, n || 8);
      },
      create(data) {
        const products = load('products') || [];
        const p = {
          ...data,
          id: data.id || uid(),
          added: Date.now(),
          placeholder: data.placeholder || { hue: 30, lightness: 80 },
          discountPct: data.discountPct || Math.round(((data.rrp - data.sale) / data.rrp) * 100),
        };
        products.push(p);
        save('products', products);
        // Update merchant item count
        DB.merchants._recountItems(data.merchantId);
        return p;
      },
      update(id, data) {
        const products = (load('products') || []).map(p => p.id === id ? {
          ...p, ...data, id,
          discountPct: data.discountPct || Math.round(((data.rrp - data.sale) / data.rrp) * 100),
        } : p);
        save('products', products);
        DB.merchants._recountItems(data.merchantId);
        return products.find(p => p.id === id);
      },
      delete(id) {
        const products = load('products') || [];
        const p = products.find(x => x.id === id);
        save('products', products.filter(x => x.id !== id));
        if (p) DB.merchants._recountItems(p.merchantId);
      },
      bulkCreate(rows) {
        // rows: array of product-like objects (pre-validated)
        const products = load('products') || [];
        const created = rows.map(r => ({
          ...r,
          id: r.id || uid(),
          added: Date.now(),
          placeholder: r.placeholder || { hue: 30, lightness: 80 },
          discountPct: Math.round(((r.rrp - r.sale) / r.rrp) * 100),
        }));
        save('products', [...products, ...created]);
        // Recount all merchants
        const merchantIds = [...new Set(created.map(p => p.merchantId))];
        merchantIds.forEach(id => DB.merchants._recountItems(id));
        return created;
      },
    },

    // ---- Stats ----
    stats: {
      get() {
        const products = load('products') || [];
        const merchants = load('merchants') || [];
        const brands = load('brands') || [];
        const now = Date.now();
        const newIn = products.filter(p => p.newIn || (now - (p.added || 0)) < 48 * 3600000).length;
        const totalItems = merchants.reduce((s, m) => s + (m.items || 0), 0);
        return {
          totalMerchants: merchants.length,
          totalBrands: brands.length,
          totalProducts: products.length,
          newIn,
          totalItems,
          avgDiscount: products.length
            ? Math.round(products.reduce((s, p) => s + (p.discountPct || 0), 0) / products.length)
            : 0,
        };
      },
    },

    // ---- Internal ----
    merchants: null, // reassigned below after full definition
    _merchantsHelper: {
      _recountItems(merchantId) {
        if (!merchantId) return;
        const count = (load('products') || []).filter(p => p.merchantId === merchantId).length;
        const merchants = (load('merchants') || []).map(m => m.id === merchantId ? { ...m, items: count } : m);
        save('merchants', merchants);
      },
    },

    // ---- Computed views (read-only, for the frontend) ----
    // Enrich products with joined merchant + brand objects
    views: {
      enrichProduct(p) {
        if (!p) return null;
        const brand = DB.brands.get(p.brandId) || { name: p.brandId || 'Unknown', id: p.brandId };
        const merchant = DB.merchants.get(p.merchantId) || { name: p.merchantId || 'Unknown', id: p.merchantId };
        return {
          ...p,
          brand: brand.name,
          brandSlug: brand.id,
          merchant: merchant.name,
          merchantData: merchant,
        };
      },
      allEnriched() {
        return (load('products') || []).map(p => DB.views.enrichProduct(p));
      },
      byCategory(catId) {
        return DB.products.getByCategory(catId).map(p => DB.views.enrichProduct(p));
      },
      byBrand(brandId) {
        return DB.products.getByBrand(brandId).map(p => DB.views.enrichProduct(p));
      },
      byMerchant(merchantId) {
        return DB.products.getByMerchant(merchantId).map(p => DB.views.enrichProduct(p));
      },
      justAdded(n) {
        return DB.products.getJustAdded(n).map(p => DB.views.enrichProduct(p));
      },
    },

    seed,
  };

  // Patch merchants to include _recountItems
  DB.merchants = {
    getAll()       { return load('merchants') || []; },
    get(id)        { return (load('merchants') || []).find(m => m.id === id) || null; },
    create(data)   {
      const merchants = load('merchants') || [];
      const m = { ...data, id: data.id || uid(), items: 0 };
      merchants.push(m);
      save('merchants', merchants);
      return m;
    },
    update(id, data) {
      const merchants = (load('merchants') || []).map(m => m.id === id ? { ...m, ...data, id } : m);
      save('merchants', merchants);
      return merchants.find(m => m.id === id);
    },
    delete(id) {
      const merchants = (load('merchants') || []).filter(m => m.id !== id);
      save('merchants', merchants);
      const products = (load('products') || []).filter(p => p.merchantId !== id);
      save('products', products);
    },
    _recountItems(merchantId) {
      if (!merchantId) return;
      const count = (load('products') || []).filter(p => p.merchantId === merchantId).length;
      const merchants = (load('merchants') || []).map(m => m.id === merchantId ? { ...m, items: count } : m);
      save('merchants', merchants);
    },
  };

  // Run seed on load
  DB.seed();

  // Expose globally
  window.DB = DB;

  // Also expose legacy DS_DATA shape for backwards compat with any old code
  window.DS_DATA = {
    get categories() { return DB.categories.getAll(); },
    get brands()     { return DB.brands.getAll().map(b => b.name); },
    get boutiques()  { return DB.merchants.getAll(); },
    get products()   {
      const all = {};
      DB.categories.getAll().forEach(c => {
        all[c.id] = DB.views.byCategory(c.id);
      });
      return all;
    },
    get justAdded()  { return DB.views.justAdded(8); },
  };

})();

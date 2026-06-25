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
    { id: 'calexico',            name: 'Calexico',                state: 'QLD', city: 'Fortitude Valley', online: true,  inStore: true,  items: 0, focus: 'International luxury & styling',     email: 'shop@calexico.com.au',                    phone: '', website: 'https://calexico.com.au',              description: 'International luxury fashion, effortless styling, and premium multi-brand curation.',            facebook: 'https://www.facebook.com/CalexicoBoutique',       instagram: 'https://www.instagram.com/calexicofusion/',        best_contact_method: 'email', look_id: 1 },
    { id: 'parlour-x',          name: 'Parlour X',               state: 'NSW', city: 'Paddington',       online: true,  inStore: true,  items: 0, focus: 'High-end luxury & avant-garde',      email: 'shop@parlourx.com.au',                    phone: '', website: 'https://parlourx.com.au',              description: 'High-end international luxury fashion, avant-garde and curated designer selection.',             facebook: 'https://www.facebook.com/ParlourX',               instagram: 'https://www.instagram.com/parlourx/',              best_contact_method: 'email', look_id: 1 },
    { id: 'byfreer',            name: 'byfreer',                 state: 'NSW', city: 'Paddington',       online: true,  inStore: true,  items: 0, focus: 'Everyday luxury & European fabrics', email: 'info@byfreer.com',                        phone: '', website: 'https://byfreer.com',                  description: 'Effortless, everyday luxury clothing focusing on fine European fabrics and silks.',              facebook: 'https://www.facebook.com/byfreer',                instagram: 'https://www.instagram.com/byfreer/',               best_contact_method: 'email', look_id: 1 },
    { id: 'grace-melbourne',    name: 'GRACE Melbourne',         state: 'VIC', city: 'Toorak',           online: true,  inStore: true,  items: 0, focus: 'Luxury classics & tailoring',        email: 'info@gracemelbourne.com.au',               phone: '', website: 'https://gracemelbourne.com.au',        description: 'High-end luxury fashion classics, luxury designer tailoring, and premium closet staples.',       facebook: 'https://www.facebook.com/GraceMelbourne',         instagram: 'https://www.instagram.com/gracemelbourne/',        best_contact_method: 'email', look_id: 1 },
    { id: 'the-standard-store', name: 'The Standard Store',      state: 'NSW', city: 'Surry Hills',      online: true,  inStore: true,  items: 0, focus: 'Independent streetwear & lifestyle',  email: 'hello@thestandardstore.com.au',            phone: '', website: 'https://thestandardstore.com.au',      description: 'Curated independent international streetwear and lifestyle fashion with a playful edge.',        facebook: 'https://www.facebook.com/TheStandardStore',       instagram: 'https://www.instagram.com/thestandardstore/',      best_contact_method: 'email', look_id: 3 },
    { id: 'qurated',            name: 'qurated',                 state: 'NSW', city: 'Surry Hills',      online: true,  inStore: true,  items: 0, focus: 'Niche designer labels',               email: 'info@qurated.com.au',                     phone: '', website: 'https://qurated.com.au',               description: 'Premium, niche designer labels sourced directly from Europe, Japan, Korea, and beyond.',         facebook: 'https://www.facebook.com/Qurated',                instagram: 'https://www.instagram.com/quratedfashion/',        best_contact_method: 'email', look_id: 2 },
    { id: 'hansen-and-gretel',  name: 'Hansen & Gretel',         state: 'NSW', city: 'Paddington',       online: true,  inStore: true,  items: 0, focus: 'Contemporary prints & styling',      email: 'customerservice@hansenandgretel.com',      phone: '', website: 'https://hansenandgretel.com',           description: 'Chic contemporary styling, unique prints, and feminine everyday staples.',                       facebook: 'https://www.facebook.com/HansenandGretel',        instagram: 'https://www.instagram.com/hansenandgretel/',       best_contact_method: 'email', look_id: 3 },
    { id: 'duchess-boutique',   name: 'Duchess Boutique',        state: 'NSW', city: 'Paddington',       online: true,  inStore: true,  items: 0, focus: 'Evening gowns & occasion wear',      email: 'info@duchessboutique.com.au',              phone: '', website: 'https://duchessboutique.com.au',       description: 'Formal evening gowns, cocktail dresses, and premium special occasion wear.',                    facebook: 'https://www.facebook.com/DuchessBoutique',        instagram: 'https://www.instagram.com/duchessboutique/',       best_contact_method: 'email', look_id: 1 },
    { id: 'riada-concept',      name: 'Riada Concept',           state: 'NSW', city: 'Woollahra',        online: true,  inStore: true,  items: 0, focus: 'Curated luxury & European design',   email: 'info@riadaconcept.com',                   phone: '', website: 'https://riadaconcept.com',             description: 'Multi-brand curated luxury styling focusing on modern European and premium global designs.',     facebook: 'https://www.facebook.com/RiadaConcept',           instagram: 'https://www.instagram.com/riadaconcept/',          best_contact_method: 'email', look_id: 1 },
    { id: 'koriah',             name: 'Koriah',                  state: 'NSW', city: 'Sydney CBD',       online: true,  inStore: false, items: 0, focus: 'Emerging Asian designers',            email: 'info@koriah.com.au',                      phone: '', website: 'https://koriah.com.au',                description: 'Avant-garde, structured styling showcasing emerging independent Asian designers.',               facebook: 'https://www.facebook.com/Koriah',                 instagram: 'https://www.instagram.com/koriah_official/',       best_contact_method: 'email', look_id: 3 },
    { id: 'mode-sportif',       name: 'Mode Sportif',            state: 'NSW', city: 'Paddington',       online: true,  inStore: true,  items: 0, focus: 'Resort wear & relaxed luxury',       email: 'orders@modesportif.com',                  phone: '', website: 'https://modesportif.com',              description: 'Elegant contemporary designer outfits, resort wear, and relaxed luxury tailoring.',              facebook: 'https://www.facebook.com/ModeSportif',            instagram: 'https://www.instagram.com/modesportif/',           best_contact_method: 'email', look_id: 2 },
    { id: 'flannel',            name: 'Flannel',                 state: 'NSW', city: 'Paddington',       online: true,  inStore: true,  items: 0, focus: 'Bohemian-luxe essentials',           email: 'orders@flannel.com.au',                   phone: '', website: 'https://flannel.com.au',               description: 'Effortless bohemian-luxe essentials focusing on flowing silks, fine knits, and romantic slips.', facebook: 'https://www.facebook.com/Flannel',                instagram: 'https://www.instagram.com/flannelluxe/',           best_contact_method: 'email', look_id: 2 },
    { id: 'aquel-boutique',     name: 'Aquel Boutique',          state: 'NSW', city: 'Woollahra',        online: true,  inStore: true,  items: 0, focus: 'Hand-selected ready-to-wear',        email: 'shop@aquel.com.au',                       phone: '', website: 'https://aquel.com.au',                 description: 'Personalized boutique service presenting hand-selected ready-to-wear labels for discerning tastes.', facebook: 'https://www.facebook.com/AquelBoutique',      instagram: 'https://www.instagram.com/aquelboutique/',         best_contact_method: 'email', look_id: 1 },
    { id: 'elysian-collective', name: 'Elysian Collective',      state: 'NSW', city: 'Narrabeen',        online: true,  inStore: true,  items: 0, focus: 'Casual & colourful fashion',         email: 'hello@elysiancollective.com.au',           phone: '', website: 'https://elysiancollective.com.au',    description: 'Casual, colourful fashion with a curated selection of vibrant everyday pieces.',                 facebook: 'https://www.facebook.com/ElysianCollective',      instagram: 'https://www.instagram.com/elysiancollective_/',    best_contact_method: 'email', look_id: 3 },
    { id: 'st-agni',            name: 'St. Agni',                state: 'NSW', city: 'Paddington',       online: true,  inStore: true,  items: 0, focus: 'Minimalist formal wear',              email: 'hello@st-agni.com',                       phone: '', website: 'https://st-agni.com',                  description: 'Formal, minimalistic design with a focus on clean silhouettes and premium fabrications.',        facebook: 'https://www.facebook.com/StAgni',                 instagram: 'https://www.instagram.com/stagnistudio/',          best_contact_method: 'email', look_id: 1 },
    { id: 'viktoria-and-woods', name: 'Viktoria & Woods',        state: 'NSW', city: 'Paddington',       online: true,  inStore: true,  items: 0, focus: 'Premium tailored smart casual',       email: 'customercare@viktoriaandwoods.com.au',     phone: '', website: 'https://viktoriaandwoods.com.au',      description: 'Premium, tailored, smart casual pieces designed for the modern Australian woman.',               facebook: 'https://www.facebook.com/ViktoriaandWoods',       instagram: 'https://www.instagram.com/viktoriaandwoods/',      best_contact_method: 'email', look_id: 1 },
    { id: 'store-moss',         name: 'Store Moss',              state: 'NSW', city: 'Sydney',           online: true,  inStore: false, items: 0, focus: 'Streetwear & tailored fit',           email: 'info@storemoss.com.au',                   phone: '', website: 'https://storemoss.com.au',             description: 'Streetwear and tailored fit fashion for teens and young adults.',                                facebook: 'https://www.facebook.com/StoreMoss',              instagram: 'https://www.instagram.com/storemoss/',             best_contact_method: 'email', look_id: 3 },
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

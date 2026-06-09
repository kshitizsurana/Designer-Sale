// Mock data for DesignerSale.com.au prototype.
// All brand and boutique names are fictional except Fashion Spectrum (per brief).

window.DS_DATA = (() => {
  const I = window.IMG || {};

  const categories = [
    { id: 'maxi-dresses',     label: 'Maxi Dresses',       count: 412, swatch: ['#C9B8A8', '#A8854A'], image: I.catMaxi },
    { id: 'kaftans',          label: 'Kaftans',            count: 186, swatch: ['#E8D9C4', '#7A6450'], image: I.catKaftan },
    { id: 'tops-blouses',     label: 'Tops & Blouses',     count: 528, swatch: ['#D8C8B8', '#8E7558'], image: I.catTops },
    { id: 'coats-jackets',    label: 'Coats & Jackets',    count: 247, swatch: ['#6B5B4A', '#2A2520'], image: I.catCoats },
    { id: 'bags-accessories', label: 'Bags & Accessories', count: 311, swatch: ['#A8854A', '#5C4632'], image: I.catBags },
    { id: 'jewellery',        label: 'Jewellery',          count: 192, swatch: ['#C9A84C', '#E8D4B8'], image: I.catJewel },
  ];

  const brands = [
    'Fashion Spectrum',
    'Marlowe & Quinn',
    'Bondi Atelier',
    'Saltbush Studio',
    'Wren the Label',
    'Coastal & Co.',
    'Hayman Edit',
    'Indigo Lane',
    'Field & Fern',
    'Margot House',
  ];

  const boutiques = [
    { id: 'blue-bungalow',   name: 'Blue Bungalow',          state: 'QLD', city: 'Noosa Heads',  online: true,  inStore: true,  items: 87, focus: 'Resort & holiday' },
    { id: 'pizazz',          name: 'Pizazz Boutique',        state: 'VIC', city: 'Armadale',     online: true,  inStore: true,  items: 124, focus: 'Occasion & evening' },
    { id: 'the-edit-paddo',  name: 'The Edit Paddington',    state: 'NSW', city: 'Paddington',   online: true,  inStore: true,  items: 56, focus: 'Contemporary' },
    { id: 'silk-and-stone',  name: 'Silk & Stone',           state: 'NSW', city: 'Mosman',       online: true,  inStore: true,  items: 39, focus: 'Silk specialists' },
    { id: 'driftwood',       name: 'Driftwood Byron',        state: 'NSW', city: 'Byron Bay',    online: true,  inStore: true,  items: 71, focus: 'Bohemian luxe' },
    { id: 'hayman-edit-co',  name: 'Hayman Edit Co.',        state: 'QLD', city: 'Brisbane',     online: true,  inStore: false, items: 92, focus: 'Designer resale' },
    { id: 'south-yarra',     name: 'South Yarra Atelier',    state: 'VIC', city: 'South Yarra',  online: true,  inStore: true,  items: 110, focus: 'Tailoring & coats' },
    { id: 'cottesloe',       name: 'Cottesloe & Co.',        state: 'WA',  city: 'Cottesloe',    online: true,  inStore: true,  items: 44, focus: 'Coastal contemporary' },
    { id: 'kingston-lane',   name: 'Kingston Lane',          state: 'ACT', city: 'Kingston',     online: false, inStore: true,  items: 28, focus: 'Curated capsule' },
    { id: 'north-adelaide',  name: 'North Adelaide Edit',    state: 'SA',  city: 'North Adelaide', online: true, inStore: true, items: 51, focus: 'Workwear & every-day' },
    { id: 'hobart-house',    name: 'Hobart House',           state: 'TAS', city: 'Battery Point', online: true, inStore: true,  items: 22, focus: 'Knitwear & wool' },
    { id: 'darwin-trader',   name: 'The Darwin Trader',      state: 'NT',  city: 'Darwin',       online: true,  inStore: true,  items: 18, focus: 'Resort & tropical' },
  ];

  // Product titles intentionally evocative-but-original.
  const productTitles = {
    'maxi-dresses': [
      'Bias-Cut Silk Slip Maxi in Almond',
      'Hand-Beaded Sequin Maxi in Champagne',
      'Tiered Cotton Voile Maxi in Ivory',
      'Empire Waist Floral Maxi in Ochre',
      'Halter-Neck Crepe Maxi in Espresso',
      'Off-Shoulder Linen Maxi in Sand',
      'Smocked Bodice Print Maxi in Clay',
      'V-Neck Pleated Maxi in Bone',
      'Open-Back Silk Maxi in Rosewater',
      'Long-Sleeve Cotton Maxi in Pearl',
      'Drape-Front Jersey Maxi in Charcoal',
      'Embroidered Tulle Maxi in Cream',
    ],
    'kaftans': [
      'Hand-Embellished Silk Kaftan in Gold',
      'Block-Print Cotton Kaftan in Indigo',
      'V-Neck Beaded Kaftan in Coral',
      'Tassel-Trim Linen Kaftan in Sand',
    ],
    'tops-blouses': [
      'Pintuck Silk Blouse in Ivory',
      'Tie-Neck Cotton Poplin Blouse in Sage',
      'Cropped Cashmere Knit in Oat',
    ],
    'coats-jackets': [
      'Belted Wool Coat in Camel',
      'Quilted Liner Jacket in Olive',
    ],
    'bags-accessories': [
      'Woven Raffia Tote in Natural',
      'Soft Leather Crescent Bag in Tan',
    ],
    'jewellery': [
      'Hammered Gold Hoop Earrings',
      'Freshwater Pearl Drop Necklace',
    ],
  };

  // Pool of editorial fashion photos. Sources resolved via window.IMG (set by
  // src/image-manifest.js) so the standalone bundler can swap them for blob
  // URLs without touching this file. We cycle through these deterministically
  // so reloads stay stable.
  const imagePool = {
    'maxi-dresses':     [I.prodMaxi0, I.prodMaxi1, I.prodMaxi2, I.prodMaxi3, I.prodMaxi4, I.prodMaxi5,
                         I.prodMaxi6, I.prodMaxi7, I.prodMaxi8, I.prodMaxi9, I.prodMaxi10, I.prodMaxi11],
    'kaftans':          [I.prodKaftan0, I.prodKaftan1, I.prodKaftan2, I.prodKaftan3],
    'tops-blouses':     [I.prodTops0, I.prodTops1, I.prodTops2],
    'coats-jackets':    [I.prodCoats0, I.prodCoats1],
    'bags-accessories': [I.prodBags0, I.prodBags1],
    'jewellery':        [I.prodJewel0, I.prodJewel1],
  };

  // Generate listings deterministically (seeded by index) so reloads stay stable.
  function gen(category, n, startId = 0) {
    const titles = productTitles[category] || productTitles['maxi-dresses'];
    const pool = imagePool[category] || imagePool['maxi-dresses'];
    const out = [];
    for (let i = 0; i < n; i++) {
      const id = `${category}-${startId + i}`;
      const rrp = 280 + ((i * 137) % 720);
      const discountPct = 30 + ((i * 17) % 55);
      const sale = Math.round(rrp * (100 - discountPct) / 100 / 5) * 5;
      const brand = brands[(i * 3 + startId) % brands.length];
      const boutique = boutiques[(i * 5 + startId) % boutiques.length];
      const title = titles[i % titles.length];
      const newIn = (i % 7 === 0);
      const hue = 18 + ((i * 37) % 40);
      const lightness = 78 + ((i * 11) % 14);
      const image = pool[i % pool.length];
      out.push({
        id,
        category,
        title,
        brand,
        merchant: boutique.name,
        merchantId: boutique.id,
        rrp,
        sale,
        discountPct,
        newIn,
        sizes: ['XS', 'S', 'M', 'L', 'XL'].filter((_, idx) => (i + idx) % 4 !== 0),
        placeholder: { hue, lightness },
        image,
        added: i,
      });
    }
    return out;
  }

  const products = {
    'maxi-dresses':     gen('maxi-dresses', 24),
    'kaftans':          gen('kaftans', 12),
    'tops-blouses':     gen('tops-blouses', 12),
    'coats-jackets':    gen('coats-jackets', 8),
    'bags-accessories': gen('bags-accessories', 8),
    'jewellery':        gen('jewellery', 8),
  };

  // Mixed feed for homepage "Just Added"
  const justAdded = [
    ...products['maxi-dresses'].slice(0, 4),
    ...products['kaftans'].slice(0, 2),
    ...products['tops-blouses'].slice(0, 2),
  ];

  return { categories, brands, boutiques, products, justAdded };
})();

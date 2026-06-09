// Centralised image URL manifest. All images referenced from JS code (data.js,
// pages/*) read from window.IMG[<key>] so the standalone bundler can swap
// these URLs for inlined blob URLs at build time without touching app code.
//
// Curated for SILK / RESORT / EDITORIAL feel — US, European and Australian
// fashion photography only, female models only. Hero and featured slots use
// the most visually distinctive shots in the verified pool. Product cards
// apply a saturation filter for magazine-shot vibrance.

window.IMG = {
  // ---- Hero + editorial ----
  // Hero: vibrant resort/silk editorial.
  heroBanner:    'https://images.unsplash.com/photo-1583846783214-7229a91b20ed?w=1800&q=85&auto=format&fit=crop',
  featuredBrand: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1200&q=85&auto=format&fit=crop',

  // ---- Category tiles ----
  catMaxi:   'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=85&auto=format&fit=crop',
  catKaftan: 'https://images.unsplash.com/photo-1485518882345-15568b007407?w=900&q=85&auto=format&fit=crop',
  catTops:   'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=900&q=85&auto=format&fit=crop',
  catCoats:  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=85&auto=format&fit=crop',
  catBags:   'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&q=85&auto=format&fit=crop',
  catJewel:  'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=900&q=85&auto=format&fit=crop',

  // ---- Product pool — maxi dresses (12) ----
  prodMaxi0:  'https://images.unsplash.com/photo-1583846783214-7229a91b20ed?w=900&q=85&auto=format&fit=crop',
  prodMaxi1:  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&q=85&auto=format&fit=crop',
  prodMaxi2:  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=85&auto=format&fit=crop',
  prodMaxi3:  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=85&auto=format&fit=crop',
  prodMaxi4:  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=85&auto=format&fit=crop',
  prodMaxi5:  'https://images.unsplash.com/photo-1551803091-e20673f15770?w=900&q=85&auto=format&fit=crop',
  prodMaxi6:  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&q=85&auto=format&fit=crop',
  prodMaxi7:  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=85&auto=format&fit=crop',
  prodMaxi8:  'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=900&q=85&auto=format&fit=crop',
  prodMaxi9:  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=85&auto=format&fit=crop',
  prodMaxi10: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=85&auto=format&fit=crop',
  prodMaxi11: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=900&q=85&auto=format&fit=crop',

  // ---- Kaftans (4) ----
  prodKaftan0: 'https://images.unsplash.com/photo-1485518882345-15568b007407?w=900&q=85&auto=format&fit=crop',
  prodKaftan1: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=900&q=85&auto=format&fit=crop',
  prodKaftan2: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=900&q=85&auto=format&fit=crop',
  prodKaftan3: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=900&q=85&auto=format&fit=crop&v=k3',

  // ---- Tops (3) — female-model blouses ----
  prodTops0: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=900&q=85&auto=format&fit=crop',
  prodTops1: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=900&q=85&auto=format&fit=crop',
  prodTops2: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=900&q=85&auto=format&fit=crop',

  // ---- Coats (2) ----
  prodCoats0: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=85&auto=format&fit=crop',
  prodCoats1: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=85&auto=format&fit=crop&v=c',

  // ---- Bags (2) ----
  prodBags0: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&q=85&auto=format&fit=crop',
  prodBags1: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&q=85&auto=format&fit=crop',

  // ---- Jewellery (2) ----
  prodJewel0: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=85&auto=format&fit=crop',
  prodJewel1: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=900&q=85&auto=format&fit=crop',
};

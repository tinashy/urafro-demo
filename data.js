/* =========================================================================
   urAfro demo data — Amara Fashion fixture
   Single fictional merchant in Harare, Zimbabwe. Tweak any field for
   Saturday's screens. Everything stays in memory — no persistence layer.
   =========================================================================

   Persona anchor: Segment A (WhatsApp-native seller), 9 months trading,
   primarily women's ankara & knitwear, ZWG + USD, WhatsApp storefront.
   Pain anchors: order chaos in WhatsApp chats, running out of popular
   variants, slow handwritten receipts for corporate customers.
   ========================================================================= */

window.AppData = {
  merchant: {
    id: 'm_0001',
    storeName: 'Amara Fashion',
    storeSlug: 'amara-fashion',
    tagline: 'Handmade ankara & knitwear · Harare',
    phone: '+263 77 539 1219',
    phoneCountry: '+263',
    phoneNumber: '77 539 1219',
    email: 'amara.fashion@gmail.com',
    currency: 'USD',
    location: 'Avondale, Harare',
    brandColor: '#0D9488',
    joinedAt: '2026-04-15',
  },

  products: [
    { id: 'p_001', name: 'Ankara Wrap Dress — Sunset',       price: 45,  stock:  8, lowStockAt: 3, category: 'Dresses',      color: '#E8826B' },
    { id: 'p_002', name: 'Ankara Wrap Dress — Ocean',        price: 45,  stock:  2, lowStockAt: 3, category: 'Dresses',      color: '#4A7C9E' },
    { id: 'p_003', name: 'Knit Cardigan — Cream',            price: 32,  stock:  6, lowStockAt: 3, category: 'Knitwear',     color: '#E8DFCF' },
    { id: 'p_004', name: 'Kitenge Headwrap — Assorted',      price: 12,  stock: 22, lowStockAt: 5, category: 'Accessories',  color: '#D4A843' },
    { id: 'p_005', name: 'Silk Maxi Skirt — Emerald',        price: 38,  stock:  0, lowStockAt: 2, category: 'Skirts',       color: '#0F766E' },
    { id: 'p_006', name: 'Beaded Clutch — Bronze',           price: 28,  stock:  4, lowStockAt: 2, category: 'Accessories',  color: '#8B6F47' },
  ],

  orders: [
    {
      id: 'ord_001',
      code: 'A-20426',
      status: 'new',            // new | confirmed | fulfilled | cancelled
      customerName: 'Tendai Moyo',
      customerPhone: '+263 77 539 1219',
      items: [
        { productId: 'p_001', name: 'Ankara Wrap Dress — Sunset', qty: 1, price: 45 },
        { productId: 'p_004', name: 'Kitenge Headwrap',           qty: 1, price: 12 },
      ],
      subtotal: 57,
      total: 57,
      placedAt: '2026-04-24T14:32:00',
      channel: 'storefront',
    },
    {
      id: 'ord_002',
      code: 'A-20425',
      status: 'confirmed',
      customerName: 'Nyasha Chiwanza',
      customerPhone: '+263 77 539 1219',
      items: [
        { productId: 'p_003', name: 'Knit Cardigan — Cream', qty: 2, price: 32 },
      ],
      subtotal: 64,
      total: 64,
      placedAt: '2026-04-24T11:08:00',
      channel: 'whatsapp',
      depositPaid: 30,
    },
    {
      id: 'ord_003',
      code: 'A-20424',
      status: 'fulfilled',
      customerName: 'Farai Dube',
      customerPhone: '+263 77 539 1219',
      items: [
        { productId: 'p_002', name: 'Ankara Wrap Dress — Ocean', qty: 1, price: 45 },
        { productId: 'p_006', name: 'Beaded Clutch — Bronze',    qty: 1, price: 28 },
      ],
      subtotal: 73,
      total: 73,
      placedAt: '2026-04-23T16:45:00',
      fulfilledAt: '2026-04-24T09:12:00',
      channel: 'storefront',
    },
    {
      id: 'ord_004',
      code: 'A-20423',
      status: 'cancelled',
      customerName: 'Rutendo Sithole',
      customerPhone: '+263 77 539 1219',
      items: [
        { productId: 'p_005', name: 'Silk Maxi Skirt — Emerald', qty: 1, price: 38 },
      ],
      subtotal: 38,
      total: 38,
      placedAt: '2026-04-22T10:20:00',
      cancelledAt: '2026-04-22T14:00:00',
      cancelReason: 'Out of stock',
      channel: 'whatsapp',
    },
  ],

  customers: [
    { id: 'c_001', name: 'Tendai Moyo',      phone: '+263 77 539 1219', orderCount: 1, totalSpend: 57  },
    { id: 'c_002', name: 'Nyasha Chiwanza',  phone: '+263 77 539 1219', orderCount: 3, totalSpend: 178 },
    { id: 'c_003', name: 'Farai Dube',       phone: '+263 77 539 1219', orderCount: 5, totalSpend: 312 },
    { id: 'c_004', name: 'Rutendo Sithole',  phone: '+263 77 539 1219', orderCount: 1, totalSpend: 0   },
  ],

  // Metrics used on Tier 2 static mockups (dashboard, end-of-day).
  metrics: {
    today:     { revenue: 121, orders: 2 },
    week:      { revenue: 658, orders: 11, prevWeek: 512 },
    month:     { revenue: 2410, orders: 47, prevMonth: 2180 },
    aov:       51,
    topProducts: [
      { name: 'Ankara Wrap Dress — Sunset', units: 14, revenue: 630 },
      { name: 'Knit Cardigan — Cream',      units: 11, revenue: 352 },
      { name: 'Kitenge Headwrap',           units: 24, revenue: 288 },
    ],
  },

  // Controls which screens are "live" vs "coming soon" in the nav.
  roadmap: {
    now:       ['auth', 'onboarding', 'inventory', 'product', 'store', 'storefront', 'inbox', 'order', 'stock-how'],
    threeMon:  ['offline', 'receipts', 'low-stock', 'barcode'],
    sixMon:    ['customers', 'broadcasts', 'dashboard', 'end-of-day', 'expenses', 'currency', 'vat'],
  },
};

// Helpers accessed by screens.
window.AppData.helpers = {
  money(n, curr = 'USD') {
    return `${curr === 'USD' ? '$' : curr + ' '}${n.toFixed(n % 1 === 0 ? 0 : 2)}`;
  },
  stockPill(stock, low) {
    if (stock === 0)  return { label: 'Out of stock', cls: 'pill-danger' };
    if (stock <= low) return { label: 'Low stock',    cls: 'pill-warning' };
    return { label: 'In stock', cls: 'pill-success' };
  },
  statusPill(status) {
    switch (status) {
      case 'new':       return { label: 'New',       cls: 'pill-info' };
      case 'confirmed': return { label: 'Confirmed', cls: 'pill-primary' };
      case 'fulfilled': return { label: 'Fulfilled', cls: 'pill-success' };
      case 'cancelled': return { label: 'Cancelled', cls: 'pill-neutral' };
      default:          return { label: status,      cls: 'pill-neutral' };
    }
  },
  timeAgo(iso) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60)       return 'Just now';
    if (diff < 3600)     return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400)    return `${Math.floor(diff / 3600)} hr ago`;
    if (diff < 86400*7)  return `${Math.floor(diff / 86400)} days ago`;
    return new Date(iso).toLocaleDateString('en-GB');
  },
};

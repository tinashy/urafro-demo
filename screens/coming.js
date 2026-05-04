/* =========================================================================
   /coming — "What's coming" roadmap landing
   Routes:
     /coming                     show roadmap; default bucket is state.roadmapFilter || 'now'
   State:
     state.roadmapFilter         'now' | '3mo' | '6mo'  (chips mutate this)

   The chip row helper lives in _shared.js (`UI.comingChips`) and updates
   `state.roadmapFilter` then re-navigates to /coming, which triggers a re-render.

   Each card lists a feature with merchant-facing language (no dev ticket
   prefixes), an ETA tag, and an action that takes the merchant either to the
   live screen (Now bucket) or to the existing placeholder (3mo / 6mo buckets).

   Overrides the placeholder registration for key 'coming'.
   ========================================================================= */

/* Merchant-facing catalog. Keys match window.Screens registrations.
   The Now items deliberately skip auth/onboarding — those are plumbing,
   not features merchants think about as separate product surfaces. */
const COMING_CATALOG = {
  /* Now — live in this demo and shipping in v1 */
  inventory:  { title: 'Products & inventory',     note: 'Add products, set prices, and track stock from one screen.',                          icon: '📦', route: '/inventory' },
  store:      { title: 'Your storefront',          note: 'Preview, copy, or share your store link in two taps.',                                icon: '🏬', route: '/store' },
  inbox:      { title: 'Order inbox',              note: 'Every order in one place — New, Confirmed, Fulfilled, Cancelled.',                    icon: '🧾', route: '/inbox' },
  'stock-how':{ title: 'Stock that updates itself', note: 'Stock drops automatically the moment you confirm an order.',                          icon: '🔄', route: '/stock-how' },

  /* 3 months — v1.1 mockups */
  offline:    { title: 'Works offline',            note: 'Keep selling when the network drops. Syncs as soon as you\'re back online.',           icon: '📶', route: '/offline' },
  receipts:   { title: 'PDF receipts',             note: 'Branded receipts you can WhatsApp or email straight to the customer.',                 icon: '📄', route: '/receipts' },
  'low-stock':{ title: 'Low-stock alerts',         note: 'Get pinged when a product drops below your threshold — never miss a restock.',         icon: '⚠️', route: '/low-stock' },
  barcode:    { title: 'Barcode scanning',         note: 'Scan a barcode to look up or add a product in seconds.',                               icon: '📱', route: '/barcode' },

  /* 6 months — Tier 2 mockups */
  customers:    { title: 'Customer records',         note: 'A list of every buyer, auto-built from their orders. Notes, totals, repeat-rate.',     icon: '👥', route: '/customers' },
  broadcasts:   { title: 'Broadcast messages',       note: 'Send a WhatsApp or SMS to a customer segment — restocks, sales, holiday hours.',       icon: '📣', route: '/broadcasts' },
  dashboard:    { title: 'Sales dashboard',          note: 'Today, this week, this month — revenue, top products, and 30-day trend.',              icon: '📊', route: '/dashboard' },
  'end-of-day': { title: 'End-of-day snapshot',      note: 'An automatic 18:00 message with the day\'s revenue and best seller.',                  icon: '🌙', route: '/end-of-day' },
  expenses:     { title: 'Expenses + monthly P&L',   note: 'Log expenses, see Revenue − Expenses = Profit at a glance.',                           icon: '💸', route: '/expenses' },
  currency:     { title: 'USD + ZiG pricing',        note: 'Price products in both currencies — customers see whichever they prefer.',             icon: '💱', route: '/currency' },
  vat:          { title: 'ZIMRA VAT invoices',       note: 'VAT-compatible invoices for corporate buyers who need them for tax.',                  icon: '🧮', route: '/vat' },
};

/* Chip key → roadmap bucket key in AppData.roadmap */
const FILTER_TO_BUCKET = { now: 'now', '3mo': 'threeMon', '6mo': 'sixMon' };

/* Chip key → tag label + bucket-level intro copy */
const BUCKET_META = {
  now:  { tagLabel: 'Live now',          tagBg: 'var(--c-success-bg)',  tagFg: 'var(--c-success)',      intro: 'These are working in this demo and shipping in v1.' },
  '3mo':{ tagLabel: 'Within 3 months',   tagBg: 'var(--c-warning-bg)',  tagFg: 'var(--c-warning)',      intro: 'v1.1 — designed and ready to build once v1 is out.' },
  '6mo':{ tagLabel: 'Within 6 months',   tagBg: 'var(--c-info-bg)',     tagFg: 'var(--c-info)',         intro: 'Tier 2 — bigger features that follow once v1.1 is in merchants\' hands.' },
};

window.Screens.coming = {
  title: "What's coming",
  render(state) {
    const filter = (state.roadmapFilter && BUCKET_META[state.roadmapFilter]) ? state.roadmapFilter : 'now';
    const bucketKey = FILTER_TO_BUCKET[filter];
    const meta = BUCKET_META[filter];
    const screenKeys = (AppData.roadmap[bucketKey] || []).filter(k => COMING_CATALOG[k]);

    const card = (key) => {
      const item = COMING_CATALOG[key];
      return `
        <div class="list-item" onclick="navigate('${item.route}')" role="button" tabindex="0">
          <div class="list-item-icon" style="background:var(--c-bg-soft);font-size:22px">
            ${item.icon}
          </div>
          <div class="list-item-body">
            <p class="list-item-title">${item.title}</p>
            <p class="list-item-sub">${item.note}</p>
          </div>
          <span class="pill" style="background:${meta.tagBg};color:${meta.tagFg};font-size:11px">${meta.tagLabel}</span>
        </div>
      `;
    };

    const empty = UI.empty({
      title: 'Nothing here yet',
      sub: 'No features are scheduled for this window.',
      icon: '🗓️',
    });

    return `
      <section class="screen">
        ${UI.header({ title: "What's coming", back: '/inbox' })}

        <div class="screen-body" style="padding-bottom:88px">

          <p class="text-sm text-muted" style="margin:0 0 4px">
            Tap a feature to see the screen — Now items are live in this demo, later items show a preview with their ETA.
          </p>

          ${UI.comingChips(filter)}

          <p class="text-sm" style="margin:0;color:var(--c-ink-muted)">${meta.intro}</p>

          ${screenKeys.length === 0 ? empty : `<div class="list">${screenKeys.map(card).join('')}</div>`}

          <p class="text-xs text-subtle text-center" style="margin:24px 0 0;line-height:1.5">
            Anything missing? <button class="btn-link" style="font-size:12px" onclick="UI.openWhatsApp('+263775391219', 'Hi! I was using the urAfro demo and I\\'d love to see ___ in the app.')">Message us on WhatsApp</button>
          </p>
        </div>

        ${UI.tabBar('more')}
      </section>
    `;
  },
};

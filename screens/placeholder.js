/* =========================================================================
   Placeholder fallback — used by the router when no screen matches the route.
   Also exposes named placeholders for every Tier 1 / v1.1 / Tier 2 screen
   that hasn't been built yet, so the desktop quick-nav and bottom tab bar
   never land on a blank page.

   Each placeholder shows: title, what the screen will do, the demo
   treatment from the build spec, and a "Back to inbox" escape.
   ========================================================================= */

/* Notes use merchant-facing language, not dev tickets — they're rendered
   verbatim in the placeholder body if a screen file ever fails to load.
   All entries are overridden by their dedicated screen files in
   index.html load order; this registry is a safety net. */
const NOT_BUILT = {
  /* Tier 1 — interactive */
  inventory:  { title: 'Inventory',          note: 'Add products, set prices, and track stock from one screen.',                  kind: 'tier1' },
  product:    { title: 'Product',            note: 'Edit a single product — name, price, stock, photo.',                          kind: 'tier1' },
  store:      { title: 'Storefront preview', note: 'See how your storefront looks to customers.',                                 kind: 'tier1' },
  storefront: { title: 'Customer storefront',note: 'The customer-facing storefront with cart and checkout.',                      kind: 'tier1' },
  inbox:      { title: 'Order inbox',        note: 'New, Confirmed, Fulfilled, and Cancelled orders in one list.',                kind: 'tier1' },
  order:      { title: 'Order detail',       note: 'Confirm, fulfil, or cancel an order — stock updates automatically.',          kind: 'tier1' },
  more:       { title: 'More',               note: 'Help, account, and session settings.',                                        kind: 'tier1' },

  /* v1.1 — within 3 months */
  offline:    { title: 'Works offline',          note: 'Keep selling when the network drops. Syncs as soon as you\'re back online.', kind: 'v1.1' },
  receipts:   { title: 'PDF receipts',           note: 'Branded receipts you can WhatsApp or email straight to the customer.',       kind: 'v1.1' },
  'low-stock':{ title: 'Low-stock alerts',       note: 'Get pinged when a product drops below your threshold.',                      kind: 'v1.1' },
  barcode:    { title: 'Barcode scanning',       note: 'Scan a barcode to look up or add a product in seconds.',                     kind: 'v1.1' },

  /* Tier 2 — within 6 months */
  customers:    { title: 'Customers',                note: 'A list of every buyer, auto-built from their orders.',                   kind: 'tier2' },
  broadcasts:   { title: 'Send a broadcast',         note: 'Send a WhatsApp or SMS to a customer segment.',                           kind: 'tier2' },
  dashboard:    { title: 'Sales dashboard',          note: 'Today, this week, this month — revenue, top products, and trend.',        kind: 'tier2' },
  'end-of-day': { title: 'End-of-day snapshot',      note: 'An automatic evening message with the day\'s revenue and best seller.',   kind: 'tier2' },
  expenses:     { title: 'Expenses + monthly P&L',   note: 'Log expenses; see Revenue − Expenses = Profit.',                          kind: 'tier2' },
  currency:     { title: 'USD + ZiG pricing',        note: 'Price products in both currencies; customers pick whichever they prefer.',kind: 'tier2' },
  vat:          { title: 'ZIMRA VAT invoices',       note: 'VAT-compatible invoices for corporate buyers.',                           kind: 'tier2' },

  /* Roadmap landing */
  coming:     { title: "What's coming",          note: 'A filtered roadmap by ETA — Now, 3 months, 6 months.',                       kind: 'meta' },
};

/* Register a top-level "_placeholder" handler used as router fallback. */
window.Screens._placeholder = {
  title: 'Coming soon',
  render(state) {
    const key = state.route.screen;
    const meta = NOT_BUILT[key] || { title: 'Screen not found', note: `Unknown route "${key}". Try the side nav or tap below.`, kind: 'meta' };
    return renderPlaceholder(meta);
  },
};

/* Register every named not-yet-built screen so quick-nav / tab-bar don't
   route through the generic fallback. */
Object.entries(NOT_BUILT).forEach(([key, meta]) => {
  window.Screens[key] = {
    title: meta.title,
    render() { return renderPlaceholder(meta, key); },
  };
});

function renderPlaceholder(meta, key) {
  const tagBg = {
    tier1: 'var(--c-primary-soft)',
    'v1.1': 'var(--c-warning-bg)',
    tier2: 'var(--c-info-bg)',
    meta:  'var(--c-bg-soft)',
  }[meta.kind] || 'var(--c-bg-soft)';

  const tagFg = {
    tier1: 'var(--c-primary-dark)',
    'v1.1': 'var(--c-warning)',
    tier2: 'var(--c-info)',
    meta:  'var(--c-ink-muted)',
  }[meta.kind] || 'var(--c-ink-muted)';

  const tagLabel = {
    tier1: 'Tier 1 · interactive',
    'v1.1': 'v1.1 · within 3 months',
    tier2: 'Tier 2 · within 6 months',
    meta:  'Roadmap',
  }[meta.kind] || 'Roadmap';

  return `
    <section class="screen">
      <header class="screen-header">
        <button class="screen-header-back" onclick="navigate('/inbox')" aria-label="Back to inbox">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1>${meta.title}</h1>
        <span style="width:40px"></span>
      </header>

      <div class="screen-body" style="justify-content:center;align-items:center;text-align:center;padding:48px 24px">
        <div style="display:inline-block;padding:6px 12px;border-radius:var(--r-pill);background:${tagBg};color:${tagFg};font-size:12px;font-weight:600;letter-spacing:0.02em;margin-bottom:20px">
          ${tagLabel}
        </div>

        <div style="width:72px;height:72px;border-radius:20px;background:var(--c-bg-soft);color:var(--c-ink-muted);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:32px">🛠️</div>

        <h2 style="margin:0 0 8px;font-size:20px;font-weight:600">Not built yet</h2>
        <p class="text-muted" style="max-width:320px;margin:0 0 28px">${meta.note}</p>

        <div class="row row-sm" style="justify-content:center">
          <button class="btn btn-secondary" onclick="navigate('/inbox')">Back to inbox</button>
          <button class="btn btn-ghost" onclick="navigate('/coming')">See roadmap</button>
        </div>
      </div>
    </section>
  `;
}

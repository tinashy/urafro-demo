/* =========================================================================
   ORD-03 — Auto stock deduction explainer
   Route: /stock-how

   Single static screen with a "before / confirm / after" sequence. The
   feature itself is already live in ORD-02 (confirm an order → stock
   decrements). This screen is for interviews where a merchant says "wait,
   does it actually do that?" — easier than walking them through the full
   confirm flow.

   Visual: three product cards side-by-side, with a "tap Confirm" arrow
   between B and C. Anchor product is p_001 (Ankara Wrap Dress — Sunset)
   with a hypothetical 2-unit order.

   Note: caption is "Live in v1" — we built it. Not a "within 3 months" mockup.
   ========================================================================= */

window.Screens['stock-how'] = {
  title: 'How stock works',
  render(state) {
    // Use a stable hypothetical scenario, not live AppData — this screen
    // explains the rule, not the current state.
    const productName  = 'Ankara Wrap Dress — Sunset';
    const productColor = '#E8826B';
    const beforeStock  = 8;
    const orderQty     = 2;
    const afterStock   = beforeStock - orderQty;

    const card = (state, n, label, sub) => `
      <div class="stock-how-card" data-state="${state}">
        <div class="stock-how-card-image" style="background:${productColor}">
          <span style="font-size:28px;font-weight:700;color:white">${productName[0]}</span>
        </div>
        <p class="stock-how-card-name">${productName}</p>
        <p class="stock-how-card-stock">
          <span class="stock-how-card-stock-num">${n}</span>
          <span class="stock-how-card-stock-unit">in stock</span>
        </p>
        <p class="stock-how-card-label">${label}</p>
        ${sub ? `<p class="stock-how-card-sub">${sub}</p>` : ''}
      </div>
    `;

    return `
      <section class="screen layout-stack">
        ${UI.header({ title: 'How stock works', back: '/inventory' })}

        <div class="screen-body app-container" style="padding-top:16px;padding-bottom:24px">
          <p class="text-sm text-muted" style="margin:0 0 4px;text-align:center;line-height:1.5">
            Stock updates automatically when you confirm or cancel orders. No more spreadsheet sync.
          </p>

          <div class="stock-how-flow">
            ${card('before', beforeStock, 'Before', 'Customer places order')}

            <div class="stock-how-arrow" aria-hidden="true">
              <div class="stock-how-arrow-line"></div>
              <div class="stock-how-arrow-tag">Tap <span class="text-bold">Confirm</span></div>
              <div class="stock-how-arrow-head">→</div>
            </div>

            ${card('after', afterStock, 'After', `${orderQty} sold · stock updated`)}
          </div>

          <div class="card" style="padding:14px 16px;margin-top:8px">
            <p class="section-label-title" style="margin:0 0 8px">What happens</p>
            <ul class="stock-how-list">
              <li><span class="text-bold">Confirm</span> an order → stock subtracts.</li>
              <li><span class="text-bold">Cancel</span> a confirmed order → stock comes back.</li>
              <li><span class="text-bold">New &amp; pending</span> orders don't touch stock until you act.</li>
            </ul>
          </div>

          <div class="card" style="padding:14px 16px;background:var(--c-primary-tint);border-color:var(--c-primary-soft)">
            <p class="text-bold" style="margin:0;font-size:14px;color:var(--c-primary-dark)">See it live</p>
            <p class="text-sm text-muted" style="margin:4px 0 10px">
              Open the inbox, tap a New order, and hit Confirm. Watch the stock count change in real time.
            </p>
            <button class="btn btn-secondary btn-block" onclick="navigate('/inbox')">
              Open order inbox
            </button>
          </div>

          <p class="text-xs text-subtle text-center" style="margin:12px 0 0;line-height:1.5">
            <span class="text-bold">Live in v1</span> — works offline too: changes queue and sync when you're back online.
          </p>
        </div>
      </section>
    `;
  },
};

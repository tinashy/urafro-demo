/* =========================================================================
   /receipts — REC-01 static mockup
   v1.1 feature preview: branded PDF receipts shareable via WhatsApp/email.
   Static screen — buttons toast with the v1.1 ETA. Overrides the placeholder
   registration for key 'receipts'.

   Design rationale: rather than describe the feature with words, render a
   realistic faux-PDF card the merchant can see and react to. Uses Amara
   Fashion fixture + ord_001 so the preview shows real-looking content.
   ========================================================================= */

window.Screens.receipts = {
  title: 'PDF receipts',
  render(state) {
    const m = AppData.merchant;
    // Use the first new-status order as the preview source — it's the order
    // the merchant was looking at on the inbox before tapping into here.
    const order = AppData.orders.find(o => o.status === 'new') || AppData.orders[0];
    const initial = (m.storeName || 'S').trim()[0].toUpperCase();

    const itemRow = (line) => `
      <div class="row row-between" style="font-size:13px;padding:6px 0;font-family:var(--font-mono);">
        <span style="flex:1;min-width:0">
          <span style="color:var(--c-ink)">${line.name.length > 28 ? line.name.slice(0, 28) + '…' : line.name}</span>
          <span style="color:var(--c-ink-muted);margin-left:6px">× ${line.qty}</span>
        </span>
        <span class="text-bold" style="color:var(--c-ink)">${AppData.helpers.money(line.price * line.qty)}</span>
      </div>
    `;

    const placedDate = new Date(order.placedAt).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });

    return `
      <section class="screen layout-stack">
        ${UI.header({ title: 'PDF receipts', back: '/coming' })}

        <div class="screen-body app-container" style="padding-bottom:88px">

          <div style="display:inline-block;padding:6px 12px;border-radius:var(--r-pill);background:var(--c-warning-bg);color:var(--c-warning);font-size:12px;font-weight:600;letter-spacing:0.02em;align-self:flex-start">
            Within 3 months · v1.1
          </div>

          <h2 style="margin:4px 0 6px;font-size:20px;font-weight:700">Branded PDF receipts</h2>
          <p class="text-sm text-muted" style="margin:0">
            Send a clean, branded receipt to your customer's WhatsApp the moment you confirm an order. Below is a preview using a real order from your inbox.
          </p>

          <!-- Faux PDF preview -->
          <div class="receipt-paper" style="background:#fff;border:1px solid var(--c-line-strong);border-radius:14px;box-shadow:0 4px 24px rgba(15,23,42,0.06);padding:22px 22px 18px;margin-top:8px">

            <!-- Brand strip -->
            <div class="row" style="align-items:center;gap:12px;padding-bottom:14px;border-bottom:1px solid var(--c-line)">
              <div style="width:44px;height:44px;border-radius:12px;background:${m.brandColor};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:20px;flex-shrink:0">
                ${initial}
              </div>
              <div style="flex:1;min-width:0">
                <p class="text-bold" style="margin:0;font-size:15px;letter-spacing:-0.01em">${m.storeName}</p>
                <p class="text-xs" style="margin:1px 0 0;color:var(--c-ink-muted)">${m.tagline}</p>
              </div>
            </div>

            <!-- Receipt title + meta -->
            <div style="padding-top:14px">
              <p style="margin:0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--c-ink-muted);font-weight:600">Receipt</p>
              <div class="row row-between" style="margin-top:6px;align-items:flex-end">
                <p class="text-bold" style="margin:0;font-family:var(--font-mono);font-size:22px;color:var(--c-primary-dark);letter-spacing:-0.01em">${order.code}</p>
                <p class="text-xs" style="margin:0;color:var(--c-ink-muted)">${placedDate}</p>
              </div>
            </div>

            <!-- Customer line -->
            <div style="margin-top:12px;padding:10px 12px;border-radius:10px;background:var(--c-bg-soft)">
              <p class="text-xs" style="margin:0;color:var(--c-ink-muted);text-transform:uppercase;letter-spacing:0.06em;font-weight:600">For</p>
              <p class="text-bold" style="margin:1px 0 0;font-size:14px">${order.customerName}</p>
              <p class="text-xs" style="margin:1px 0 0;color:var(--c-ink-muted);font-family:var(--font-mono)">${order.customerPhone}</p>
            </div>

            <!-- Line items -->
            <div style="margin-top:14px">
              ${order.items.map(itemRow).join('<div style="height:1px;background:var(--c-line);margin:0"></div>')}
            </div>

            <!-- Totals -->
            <div style="margin-top:14px;padding-top:10px;border-top:1.5px solid var(--c-ink)">
              <div class="row row-between" style="font-family:var(--font-mono)">
                <span class="text-bold" style="font-size:15px">TOTAL</span>
                <span class="text-bold" style="font-size:18px;color:var(--c-primary-dark)">${AppData.helpers.money(order.total)}</span>
              </div>
            </div>

            <!-- Footer / branding -->
            <div style="margin-top:18px;text-align:center">
              <p class="text-xs" style="margin:0;color:var(--c-ink-muted);line-height:1.5">
                Thank you for shopping with ${m.storeName}.<br>
                Questions? WhatsApp us: <span style="font-family:var(--font-mono);color:var(--c-ink)">${m.phone}</span>
              </p>
              <p class="text-xs" style="margin:10px 0 0;color:var(--c-ink-soft);letter-spacing:0.04em">
                Powered by <span class="text-bold" style="color:var(--c-primary-dark)">urAfro</span>
              </p>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="stack stack-sm" style="margin-top:8px">
            <button class="btn btn-primary btn-block"
                    onclick="UI.toast('Sharing receipts via WhatsApp arrives within 3 months')">
              Share via WhatsApp
            </button>
            <div class="row row-sm" style="gap:8px">
              <button class="btn btn-secondary" style="flex:1"
                      onclick="UI.toast('PDF download arrives within 3 months')">
                Download PDF
              </button>
              <button class="btn btn-secondary" style="flex:1"
                      onclick="UI.toast('Emailing receipts arrives within 3 months')">
                Email
              </button>
            </div>
          </div>

          <p class="text-xs text-subtle text-center" style="margin:18px 0 0;line-height:1.5">
            What we still need to figure out: do you want one fixed template, or a few brand presets to choose from?
            <button class="btn-link" style="font-size:12px"
                    onclick="UI.openWhatsApp('+263775391219', 'Hi! On the urAfro receipts mockup — I\\'d prefer ___ for receipts.')">
              Tell us
            </button>
          </p>
        </div>

        ${UI.tabBar('more')}
      </section>
    `;
  },
};

/* =========================================================================
   /vat — REC-02 static mockup
   Tier 2 (within 6 months): VAT-compatible invoices for corporate buyers
   who need them for tax. Static — Issue / Download / Email CTAs toast.
   ========================================================================= */

window.Screens.vat = {
  title: 'ZIMRA VAT invoices',
  render(state) {
    const m = AppData.merchant;
    const initial = (m.storeName || 'S').trim()[0].toUpperCase();

    // Invoice line items — same shape as the receipts mockup but with
    // explicit VAT lines (Zimbabwe standard rate is 15%).
    const items = [
      { name: 'Ankara Wrap Dress — Sunset', qty: 4, unit: 45 },
      { name: 'Knit Cardigan — Cream',       qty: 2, unit: 32 },
      { name: 'Kitenge Headwrap',            qty: 6, unit: 12 },
    ];
    const subtotal = items.reduce((s, i) => s + i.qty * i.unit, 0);
    const vatRate = 0.15;
    const vat = Math.round(subtotal * vatRate * 100) / 100;
    const total = Math.round((subtotal + vat) * 100) / 100;

    const itemRow = (line, idx) => `
      <div class="row row-between" style="padding:8px 0;${idx > 0 ? 'border-top:1px solid var(--c-line)' : ''};font-family:var(--font-mono);font-size:13px">
        <span style="flex:1;min-width:0">
          <span style="color:var(--c-ink)">${line.name}</span>
          <span style="color:var(--c-ink-muted);margin-left:6px">× ${line.qty}</span>
          <span style="color:var(--c-ink-soft);margin-left:6px;font-size:11px">@ ${AppData.helpers.money(line.unit)}</span>
        </span>
        <span class="text-bold">${AppData.helpers.money(line.qty * line.unit)}</span>
      </div>
    `;

    return `
      <section class="screen layout-stack">
        ${UI.header({ title: 'ZIMRA VAT invoice', back: '/coming' })}

        <div class="screen-body app-container" style="padding-bottom:88px">

          <div style="display:inline-block;padding:6px 12px;border-radius:var(--r-pill);background:var(--c-info-bg);color:var(--c-info);font-size:12px;font-weight:600;letter-spacing:0.02em;align-self:flex-start">
            Within 6 months · Tier 2
          </div>

          <h2 style="margin:4px 0 6px;font-size:20px;font-weight:700">VAT invoices for corporate buyers</h2>
          <p class="text-sm text-muted" style="margin:0">
            When a corporate buyer asks for "an invoice with VAT", you'll have a ZIMRA-compatible PDF ready in two taps. Sample shown below.
          </p>

          <!-- Faux invoice preview -->
          <div style="background:#fff;border:1px solid var(--c-line-strong);border-radius:14px;box-shadow:0 4px 24px rgba(15,23,42,0.06);padding:22px 22px 18px;margin-top:8px">

            <!-- Brand strip + invoice meta -->
            <div class="row" style="align-items:flex-start;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--c-line)">
              <div style="width:44px;height:44px;border-radius:12px;background:${m.brandColor};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:20px;flex-shrink:0">
                ${initial}
              </div>
              <div style="flex:1;min-width:0">
                <p class="text-bold" style="margin:0;font-size:15px;letter-spacing:-0.01em">${m.storeName}</p>
                <p class="text-xs" style="margin:1px 0 0;color:var(--c-ink-muted)">${m.location}</p>
                <p class="text-xs" style="margin:1px 0 0;color:var(--c-ink-muted);font-family:var(--font-mono)">VAT no. 10001234567</p>
              </div>
            </div>

            <!-- Title + meta -->
            <div style="padding-top:12px">
              <p style="margin:0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--c-ink-muted);font-weight:600">Tax invoice</p>
              <div class="row row-between" style="margin-top:4px;align-items:flex-end">
                <p class="text-bold" style="margin:0;font-family:var(--font-mono);font-size:20px;color:var(--c-primary-dark);letter-spacing:-0.01em">INV-2026-0042</p>
                <p class="text-xs" style="margin:0;color:var(--c-ink-muted)">28 Apr 2026</p>
              </div>
            </div>

            <!-- Bill to -->
            <div style="margin-top:10px;padding:10px 12px;border-radius:10px;background:var(--c-bg-soft)">
              <p class="text-xs" style="margin:0;color:var(--c-ink-muted);text-transform:uppercase;letter-spacing:0.06em;font-weight:600">Bill to</p>
              <p class="text-bold" style="margin:1px 0 0;font-size:14px">Harare Boutique Hotel (Pvt) Ltd</p>
              <p class="text-xs" style="margin:1px 0 0;color:var(--c-ink-muted)">12 Sam Nujoma St, Avondale</p>
              <p class="text-xs" style="margin:1px 0 0;color:var(--c-ink-muted);font-family:var(--font-mono)">BP no. 2003456789 · TPIN 10987654321</p>
            </div>

            <!-- Line items -->
            <div style="margin-top:14px">
              ${items.map(itemRow).join('')}
            </div>

            <!-- Totals breakdown -->
            <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--c-line);font-family:var(--font-mono);font-size:13px">
              <div class="row row-between" style="padding:3px 0">
                <span style="color:var(--c-ink-muted)">Subtotal (excl. VAT)</span>
                <span>${AppData.helpers.money(subtotal)}</span>
              </div>
              <div class="row row-between" style="padding:3px 0">
                <span style="color:var(--c-ink-muted)">VAT @ 15%</span>
                <span>${AppData.helpers.money(vat)}</span>
              </div>
              <div class="row row-between" style="padding:8px 0 0;margin-top:6px;border-top:1.5px solid var(--c-ink)">
                <span class="text-bold" style="font-size:15px">TOTAL</span>
                <span class="text-bold" style="font-size:18px;color:var(--c-primary-dark)">${AppData.helpers.money(total)}</span>
              </div>
            </div>

            <!-- ZIMRA footer -->
            <div style="margin-top:18px;text-align:center">
              <p class="text-xs" style="margin:0;color:var(--c-ink-muted);line-height:1.5">
                Issued in compliance with Zimbabwe Revenue Authority (ZIMRA) requirements.<br>
                Subject to the terms agreed at sale. Goods sold are not refundable except as required by law.
              </p>
              <p class="text-xs" style="margin:10px 0 0;color:var(--c-ink-soft);letter-spacing:0.04em">
                Powered by <span class="text-bold" style="color:var(--c-primary-dark)">urAfro</span>
              </p>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="stack stack-sm" style="margin-top:8px">
            <button class="btn btn-primary btn-block"
                    onclick="UI.toast('Issuing VAT invoices arrives within 6 months')">
              Issue invoice
            </button>
            <div class="row row-sm" style="gap:8px">
              <button class="btn btn-secondary" style="flex:1"
                      onclick="UI.toast('PDF download arrives within 6 months')">
                Download PDF
              </button>
              <button class="btn btn-secondary" style="flex:1"
                      onclick="UI.toast('Email to buyer arrives within 6 months')">
                Email buyer
              </button>
            </div>
          </div>

          <p class="text-xs text-subtle text-center" style="margin:18px 0 0;line-height:1.5">
            Do you sell to corporate buyers who need VAT invoices?
            <button class="btn-link" style="font-size:12px"
                    onclick="UI.openWhatsApp('+263775391219', 'Hi! On the urAfro VAT invoices mockup — corporate buyers are ___% of my sales.')">
              Tell us
            </button>
          </p>
        </div>

        ${UI.tabBar('more')}
      </section>
    `;
  },
};

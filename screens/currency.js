/* =========================================================================
   /currency — CUR-01 static mockup
   Tier 2 (within 6 months): dual USD + ZiG pricing on every product.
   Static — toggles and rate refresh CTAs toast with the Tier 2 ETA.
   Conditional on VALIDATE-11 (merchant validation).
   ========================================================================= */

window.Screens.currency = {
  title: 'USD + ZiG pricing',
  render(state) {
    // Static rate for the mockup (April 2026 ballpark — purely illustrative).
    const rate = 26.4;
    const sample = AppData.products.slice(0, 3);

    const productRow = (p, idx) => {
      const zig = Math.round(p.price * rate);
      return `
        <div class="row row-between" style="padding:12px 0;${idx > 0 ? 'border-top:1px solid var(--c-line)' : ''};align-items:center;gap:10px">
          <div class="row" style="align-items:center;gap:10px;flex:1;min-width:0">
            <div class="list-item-icon" style="background:${p.color};color:white;font-weight:700;width:36px;height:36px;font-size:14px">
              ${p.name[0]}
            </div>
            <p class="text-bold" style="margin:0;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              ${p.name}
            </p>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <p class="text-bold" style="margin:0;font-family:var(--font-mono);font-size:14px;color:var(--c-primary-dark)">$${p.price}</p>
            <p class="text-xs" style="margin:1px 0 0;font-family:var(--font-mono);color:var(--c-ink-muted)">ZiG ${zig.toLocaleString()}</p>
          </div>
        </div>
      `;
    };

    return `
      <section class="screen">
        ${UI.header({ title: 'USD + ZiG pricing', back: '/coming' })}

        <div class="screen-body" style="padding-bottom:88px">

          <div style="display:inline-block;padding:6px 12px;border-radius:var(--r-pill);background:var(--c-info-bg);color:var(--c-info);font-size:12px;font-weight:600;letter-spacing:0.02em;align-self:flex-start">
            Within 6 months · Tier 2
          </div>

          <h2 style="margin:4px 0 6px;font-size:20px;font-weight:700">Show prices in both USD and ZiG</h2>
          <p class="text-sm text-muted" style="margin:0">
            Set your price in either currency once. Customers see both — so they pay with whatever they have.
          </p>

          <!-- Rate card -->
          <div class="card" style="padding:14px;background:linear-gradient(180deg, var(--c-primary-tint) 0%, var(--c-bg) 100%);border:1px solid var(--c-primary-soft)">
            <div class="row row-between" style="align-items:center">
              <div>
                <p class="text-xs" style="margin:0;color:var(--c-ink-muted);text-transform:uppercase;letter-spacing:0.06em;font-weight:600">Today's rate</p>
                <p class="text-bold" style="margin:2px 0 0;font-family:var(--font-mono);font-size:18px;color:var(--c-primary-dark)">$1 = ZiG ${rate}</p>
                <p class="text-xs" style="margin:2px 0 0;color:var(--c-ink-muted)">Updated 09:15 · RBZ interbank</p>
              </div>
              <button class="btn btn-secondary"
                      onclick="UI.toast('Manual rate refresh arrives within 6 months — auto-refresh runs hourly')">
                Refresh
              </button>
            </div>
          </div>

          <!-- Pricing source toggle -->
          <div>
            <p class="section-label-title" style="margin:14px 0 8px">I price my products in</p>
            <div class="row row-sm" style="gap:8px">
              <button class="chip" aria-pressed="true"  onclick="UI.toast('Pricing source switching arrives within 6 months')">USD</button>
              <button class="chip" aria-pressed="false" onclick="UI.toast('Pricing source switching arrives within 6 months')">ZiG</button>
              <button class="chip" aria-pressed="false" onclick="UI.toast('Per-product currency arrives within 6 months')">Mixed</button>
            </div>
            <p class="text-xs text-muted" style="margin:8px 0 0">
              You enter the USD price; ZiG is calculated automatically using today's rate.
            </p>
          </div>

          <!-- Live preview of products with both prices -->
          <div>
            <p class="section-label-title" style="margin:14px 0 8px">How customers see your products</p>
            <div class="card" style="padding:6px 14px">
              ${sample.map(productRow).join('')}
            </div>
          </div>

          <!-- Customer choice preview -->
          <div class="card" style="padding:14px;border:1px dashed var(--c-line-strong)">
            <p class="text-xs" style="margin:0 0 10px;color:var(--c-ink-muted);text-transform:uppercase;letter-spacing:0.06em;font-weight:600">At checkout, the customer picks</p>
            <div class="row row-sm" style="gap:8px">
              <button class="btn btn-secondary" style="flex:1"
                      onclick="UI.toast('Customer-facing currency picker arrives within 6 months')">
                Pay in USD ($45)
              </button>
              <button class="btn btn-secondary" style="flex:1"
                      onclick="UI.toast('Customer-facing currency picker arrives within 6 months')">
                Pay in ZiG (1,188)
              </button>
            </div>
            <p class="text-xs text-muted" style="margin:8px 0 0;text-align:center;line-height:1.45">
              You receive whichever they paid. urAfro tracks both totals for you.
            </p>
          </div>

          <p class="text-xs text-subtle text-center" style="margin:18px 0 0;line-height:1.5">
            Which split do you typically see — more USD or more ZiG?
            <button class="btn-link" style="font-size:12px"
                    onclick="UI.openWhatsApp('+263775391219', 'Hi! On the urAfro currency mockup — my sales are typically ___% USD and ___% ZiG.')">
              Tell us
            </button>
          </p>
        </div>

        ${UI.tabBar('more')}
      </section>
    `;
  },
};

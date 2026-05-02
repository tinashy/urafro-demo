/* =========================================================================
   /barcode — INV-04 static mockup
   v1.1 (within 3 months): scan a barcode to look up or add a product.
   Conditional on VALIDATE-9. Static — buttons toast with the v1.1 ETA.
   Design: faux camera viewfinder with corner brackets + last-scanned card.
   ========================================================================= */

window.Screens.barcode = {
  title: 'Barcode scanning',
  render(state) {
    const recent = AppData.products[0]; // shown as "last scanned"

    return `
      <section class="screen layout-stack">
        ${UI.header({ title: 'Barcode scanning', back: '/coming' })}

        <div class="screen-body app-container" style="padding-bottom:88px">

          <div style="display:inline-block;padding:6px 12px;border-radius:var(--r-pill);background:var(--c-warning-bg);color:var(--c-warning);font-size:12px;font-weight:600;letter-spacing:0.02em;align-self:flex-start">
            Within 3 months · v1.1
          </div>

          <h2 style="margin:4px 0 6px;font-size:20px;font-weight:700">Scan to find or add</h2>
          <p class="text-sm text-muted" style="margin:0">
            Point your phone at a barcode to look up the product instantly — or scan a new product to add it without typing.
          </p>

          <!-- Faux viewfinder -->
          <div style="position:relative;background:#1A1714;border-radius:18px;padding:24px;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;overflow:hidden">

            <!-- Dimmed full-frame -->
            <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.4) 70%)"></div>

            <!-- Corner brackets (target frame) -->
            <div style="position:absolute;inset:18%;border-radius:8px">
              <span style="position:absolute;top:0;left:0;width:24px;height:24px;border-top:3px solid var(--c-primary);border-left:3px solid var(--c-primary);border-top-left-radius:8px"></span>
              <span style="position:absolute;top:0;right:0;width:24px;height:24px;border-top:3px solid var(--c-primary);border-right:3px solid var(--c-primary);border-top-right-radius:8px"></span>
              <span style="position:absolute;bottom:0;left:0;width:24px;height:24px;border-bottom:3px solid var(--c-primary);border-left:3px solid var(--c-primary);border-bottom-left-radius:8px"></span>
              <span style="position:absolute;bottom:0;right:0;width:24px;height:24px;border-bottom:3px solid var(--c-primary);border-right:3px solid var(--c-primary);border-bottom-right-radius:8px"></span>

              <!-- Mock barcode in the middle -->
              <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px">
                <div style="display:flex;gap:2px;height:64px;align-items:flex-end;background:#fff;padding:6px 10px;border-radius:4px">
                  ${[3,5,2,8,4,3,6,2,5,4,7,3,5,8,2,4,6,3,5].map(w => `<span style="width:${w}px;height:100%;background:#1A1714"></span>`).join('')}
                </div>
                <span style="font-family:var(--font-mono);color:#fff;font-size:11px;letter-spacing:0.2em;opacity:0.85">6 161472 003204</span>
              </div>

              <!-- Animated scan-line -->
              <span style="position:absolute;left:0;right:0;height:2px;background:var(--c-primary);box-shadow:0 0 8px var(--c-primary);top:50%"></span>
            </div>

            <!-- Hint at bottom -->
            <p style="position:absolute;bottom:14px;left:0;right:0;text-align:center;color:#fff;font-size:12px;margin:0;opacity:0.85">
              Hold steady · We'll detect it
            </p>
          </div>

          <!-- Mode toggle -->
          <div class="row row-sm" style="gap:8px;margin-top:6px">
            <button class="chip" aria-pressed="true"  onclick="UI.toast('Scan modes arrive within 3 months')">Find product</button>
            <button class="chip" aria-pressed="false" onclick="UI.toast('Adding-on-scan arrives within 3 months')">Add new</button>
            <button class="chip" aria-pressed="false" onclick="UI.toast('Scanning at checkout arrives within 3 months')">At checkout</button>
          </div>

          <!-- Last scanned card -->
          <div>
            <p class="section-label-title" style="margin:14px 0 8px">Last scanned</p>
            <div class="card" style="padding:0">
              <div class="list-item">
                <div class="list-item-icon" style="background:${recent.color};color:white;font-weight:700">
                  ${recent.name[0]}
                </div>
                <div class="list-item-body">
                  <p class="list-item-title">${recent.name}</p>
                  <p class="list-item-sub">
                    ${AppData.helpers.money(recent.price)} · ${recent.stock} in stock
                    <span class="text-subtle" style="margin-left:6px;font-family:var(--font-mono);font-size:11px">6161472003204</span>
                  </p>
                </div>
                <span class="text-subtle" style="font-size:18px">›</span>
              </div>
            </div>
          </div>

          <button class="btn btn-primary btn-block"
                  onclick="UI.toast('Camera-based scanning arrives within 3 months — needs validation that merchants use barcodes day-to-day')"
                  style="margin-top:8px">
            Open camera
          </button>

          <p class="text-xs text-subtle text-center" style="margin:18px 0 0;line-height:1.5">
            Do your products even have barcodes?
            <button class="btn-link" style="font-size:12px"
                    onclick="UI.openWhatsApp('+263775391219', 'Hi! On the urAfro barcode mockup — my products ___ have barcodes already.')">
              Tell us
            </button>
          </p>
        </div>

        ${UI.tabBar('more')}
      </section>
    `;
  },
};

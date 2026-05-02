/* =========================================================================
   /low-stock — INV-02 static mockup
   v1.1 (within 3 months): push notification when a product's stock drops
   to or below its lowStockAt threshold. Static screen — toggles + Mark
   reviewed CTA toast with the v1.1 ETA.
   ========================================================================= */

window.Screens['low-stock'] = {
  title: 'Low-stock alerts',
  render(state) {
    // Real fixture data — products at or below their threshold (or out).
    const triggered = AppData.products
      .filter(p => p.stock === 0 || p.stock <= p.lowStockAt)
      .sort((a, b) => a.stock - b.stock);

    const alertRow = (p, when) => {
      const out = p.stock === 0;
      const pillCls = out ? 'pill-danger' : 'pill-warning';
      const pillLbl = out ? 'Out of stock' : `Only ${p.stock} left`;
      return `
        <div class="list-item">
          <div class="list-item-icon" style="background:${p.color};color:white;font-weight:700">
            ${p.name[0]}
          </div>
          <div class="list-item-body">
            <p class="list-item-title">${p.name}</p>
            <p class="list-item-sub">
              <span class="pill ${pillCls}" style="font-size:11px">${pillLbl}</span>
              <span class="text-subtle" style="margin-left:8px">${when}</span>
            </p>
          </div>
          <span class="text-subtle" style="font-size:18px">›</span>
        </div>
      `;
    };

    return `
      <section class="screen layout-stack">
        ${UI.header({ title: 'Low-stock alerts', back: '/coming' })}

        <div class="screen-body app-container" style="padding-bottom:88px">

          <div style="display:inline-block;padding:6px 12px;border-radius:var(--r-pill);background:var(--c-warning-bg);color:var(--c-warning);font-size:12px;font-weight:600;letter-spacing:0.02em;align-self:flex-start">
            Within 3 months · v1.1
          </div>

          <h2 style="margin:4px 0 6px;font-size:20px;font-weight:700">Never run out unexpectedly</h2>
          <p class="text-sm text-muted" style="margin:0">
            Get a push notification the moment a product hits the low-stock threshold you set on the product editor.
          </p>

          <!-- Notification preview -->
          <div style="background:linear-gradient(180deg, var(--c-bg-soft) 0%, var(--c-bg) 100%);padding:18px 14px;border-radius:14px;margin-top:6px">
            <p class="text-xs text-muted" style="margin:0 0 8px;text-align:center;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">A push notification looks like</p>
            <div style="background:#fff;border:1px solid var(--c-line);border-radius:14px;padding:12px 14px;display:flex;align-items:flex-start;gap:10px;box-shadow:0 4px 14px rgba(15,23,42,0.08)">
              <div style="width:36px;height:36px;border-radius:9px;background:var(--c-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0">
                uA
              </div>
              <div style="flex:1;min-width:0">
                <div class="row row-between" style="margin-bottom:1px">
                  <p class="text-bold" style="margin:0;font-size:13px">urAfro</p>
                  <p class="text-xs" style="margin:0;color:var(--c-ink-muted)">now</p>
                </div>
                <p class="text-sm text-bold" style="margin:0;font-size:13px">Low stock: Ankara Wrap Dress — Ocean</p>
                <p class="text-xs" style="margin:1px 0 0;color:var(--c-ink-muted);line-height:1.4">Only 2 left. Tap to restock or hide on storefront.</p>
              </div>
            </div>
          </div>

          <!-- Settings panel -->
          <div class="card" style="padding:0;margin-top:6px">
            <div class="list-item" style="cursor:default">
              <div class="list-item-icon" style="background:var(--c-bg-soft);font-size:20px">🔔</div>
              <div class="list-item-body">
                <p class="list-item-title">Push notifications</p>
                <p class="list-item-sub">When a product hits its low-stock alert</p>
              </div>
              <span style="display:inline-block;width:42px;height:24px;background:var(--c-primary);border-radius:12px;position:relative">
                <span style="position:absolute;top:2px;right:2px;width:20px;height:20px;background:#fff;border-radius:50%;box-shadow:0 1px 2px rgba(0,0,0,0.2)"></span>
              </span>
            </div>
            <div style="height:1px;background:var(--c-line);margin:0 14px"></div>
            <div class="list-item" onclick="UI.toast('WhatsApp alerts arrive within 3 months — depends on WABA approval')" role="button" tabindex="0">
              <div class="list-item-icon" style="background:var(--c-bg-soft);font-size:20px">💬</div>
              <div class="list-item-body">
                <p class="list-item-title">WhatsApp alerts</p>
                <p class="list-item-sub">Same alerts, in your WhatsApp</p>
              </div>
              <span style="display:inline-block;width:42px;height:24px;background:var(--c-bg-soft);border-radius:12px;position:relative;border:1px solid var(--c-line)">
                <span style="position:absolute;top:2px;left:2px;width:20px;height:20px;background:#fff;border-radius:50%;box-shadow:0 1px 2px rgba(0,0,0,0.2)"></span>
              </span>
            </div>
          </div>

          <!-- Recent triggered alerts -->
          <div>
            <p class="section-label-title" style="margin:14px 0 8px">Currently triggered</p>
            ${triggered.length === 0
              ? UI.empty({ title: 'No low-stock items', sub: 'You\'re all caught up.', icon: '✅' })
              : `<div class="list">
                  ${alertRow(triggered[0], '2 hr ago')}
                  ${triggered[1] ? alertRow(triggered[1], '5 hr ago') : ''}
                  ${triggered[2] ? alertRow(triggered[2], 'yesterday') : ''}
                </div>`
            }
          </div>

          <button class="btn btn-secondary btn-block"
                  onclick="UI.toast('Bulk-review arrives within 3 months')"
                  style="margin-top:8px">
            Mark all reviewed
          </button>

          <p class="text-xs text-subtle text-center" style="margin:18px 0 0;line-height:1.5">
            What threshold would you actually use?
            <button class="btn-link" style="font-size:12px"
                    onclick="UI.openWhatsApp('+263775391219', 'Hi! On the urAfro low-stock alerts mockup — I\\'d set my threshold to ___.')">
              Tell us
            </button>
          </p>
        </div>

        ${UI.tabBar('more')}
      </section>
    `;
  },
};

/* =========================================================================
   /offline — OFF-01 static mockup
   v1.1 (within 3 months): keep selling when the network drops; sync on reconnect.
   Static — toggle/sync CTAs toast with the v1.1 ETA.
   ========================================================================= */

window.Screens.offline = {
  title: 'Works offline',
  render(state) {
    const pill = (label, bg, fg, dot) => `
      <span style="display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:var(--r-pill);background:${bg};color:${fg};font-size:12px;font-weight:600">
        <span style="width:8px;height:8px;border-radius:50%;background:${dot}"></span>${label}
      </span>
    `;

    const queueRow = (icon, title, sub, when) => `
      <div class="list-item">
        <div class="list-item-icon" style="background:var(--c-bg-soft);font-size:20px">${icon}</div>
        <div class="list-item-body">
          <p class="list-item-title">${title}</p>
          <p class="list-item-sub">${sub}</p>
        </div>
        <span class="text-xs text-subtle">${when}</span>
      </div>
    `;

    return `
      <section class="screen">
        ${UI.header({ title: 'Works offline', back: '/coming' })}

        <div class="screen-body" style="padding-bottom:88px">

          <div style="display:inline-block;padding:6px 12px;border-radius:var(--r-pill);background:var(--c-warning-bg);color:var(--c-warning);font-size:12px;font-weight:600;letter-spacing:0.02em;align-self:flex-start">
            Within 3 months · v1.1
          </div>

          <h2 style="margin:4px 0 6px;font-size:20px;font-weight:700">Keep selling when the network drops</h2>
          <p class="text-sm text-muted" style="margin:0">
            Add products, take orders, mark stock — even with no signal. Everything queues up and syncs the moment you're back online.
          </p>

          <!-- Sync pill states preview -->
          <div class="card" style="padding:14px">
            <p class="text-xs text-muted" style="margin:0 0 8px;text-transform:uppercase;letter-spacing:0.06em;font-weight:600">Connection states you'll see</p>
            <div class="row row-sm" style="flex-wrap:wrap;gap:8px">
              ${pill('Synced',   'var(--c-success-bg)', 'var(--c-success)',  'var(--c-success)')}
              ${pill('Syncing…', 'var(--c-info-bg)',    'var(--c-info)',     'var(--c-info)')}
              ${pill('Offline',  'var(--c-warning-bg)', 'var(--c-warning)',  'var(--c-warning)')}
              ${pill('Error',    'var(--c-bg-soft)',    'var(--c-danger)',   'var(--c-danger)')}
            </div>
          </div>

          <!-- Live status simulation -->
          <div class="card" style="padding:16px;background:var(--c-warning-bg);border:1px solid var(--c-warning);border-style:dashed">
            <div class="row" style="align-items:center;gap:10px;margin-bottom:8px">
              ${pill('Offline', '#fff', 'var(--c-warning)', 'var(--c-warning)')}
              <p class="text-xs" style="margin:0;color:var(--c-warning)">3 changes queued</p>
            </div>
            <p class="text-sm text-bold" style="margin:0;color:var(--c-ink)">You're offline — but the shop's still open.</p>
            <p class="text-xs" style="margin:4px 0 0;color:var(--c-ink-muted);line-height:1.45">
              Customers placing orders on your storefront will see them queue. Anything you do here saves locally and syncs when you reconnect.
            </p>
          </div>

          <!-- Queued changes -->
          <div>
            <p class="section-label-title" style="margin:14px 0 8px">Queued to sync</p>
            <div class="list">
              ${queueRow('📦', 'Stock change · Headwrap', 'Marked 3 sold', '2 min ago')}
              ${queueRow('🧾', 'Order confirmed · A-20426', 'Tendai Moyo · $57', '5 min ago')}
              ${queueRow('📷', 'New product photo', 'Knit Cardigan — Cream', '8 min ago')}
            </div>
          </div>

          <button class="btn btn-secondary btn-block"
                  onclick="UI.toast('Manual sync arrives within 3 months — auto-sync will fire as soon as you reconnect')"
                  style="margin-top:8px">
            Try syncing now
          </button>

          <p class="text-xs text-subtle text-center" style="margin:18px 0 0;line-height:1.5">
            How often do you lose signal mid-order?
            <button class="btn-link" style="font-size:12px"
                    onclick="UI.openWhatsApp('+263775391219', 'Hi! On the urAfro offline mockup — I lose signal ___ a week typically.')">
              Tell us
            </button>
          </p>
        </div>

        ${UI.tabBar('more')}
      </section>
    `;
  },
};

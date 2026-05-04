/* =========================================================================
   /end-of-day — ANL-02 static mockup
   Tier 2 (within 6 months): automatic 18:00 closing-time message with
   the day's revenue + best seller. Static — settings toast with ETA.
   ========================================================================= */

window.Screens['end-of-day'] = {
  title: 'End-of-day snapshot',
  render(state) {
    const m = AppData.merchant;
    const today = (AppData.metrics && AppData.metrics.today) || { revenue: 121, orders: 2 };
    const top = ((AppData.metrics && AppData.metrics.topProducts) || [])[0] || { name: 'Ankara Wrap Dress — Sunset', units: 14 };

    return `
      <section class="screen">
        ${UI.header({ title: 'End-of-day snapshot', back: '/coming' })}

        <div class="screen-body" style="padding-bottom:88px">

          <div style="display:inline-block;padding:6px 12px;border-radius:var(--r-pill);background:var(--c-info-bg);color:var(--c-info);font-size:12px;font-weight:600;letter-spacing:0.02em;align-self:flex-start">
            Within 6 months · Tier 2
          </div>

          <h2 style="margin:4px 0 6px;font-size:20px;font-weight:700">A daily summary in your WhatsApp</h2>
          <p class="text-sm text-muted" style="margin:0">
            Every evening at the time you choose, urAfro sends you a short summary of the day — revenue, orders, your best seller. No app needed.
          </p>

          <!-- Faux WhatsApp message preview -->
          <div style="background:#E5DDD5;padding:18px 14px;border-radius:14px;margin-top:6px">
            <p class="text-xs text-muted" style="margin:0 0 10px;text-align:center;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">What lands in your WhatsApp at 18:00</p>
            <div style="background:#DCF8C6;padding:12px 14px;border-radius:8px 8px 2px 8px;max-width:88%;margin-left:auto;box-shadow:0 1px 1px rgba(0,0,0,0.06)">
              <p class="text-xs text-bold" style="margin:0 0 4px;color:#075E54">urAfro</p>
              <p class="text-sm" style="margin:0;line-height:1.5;color:var(--c-ink)">
                🌙 <span class="text-bold">${m.storeName} · today</span><br><br>
                💰 Revenue: <span class="text-bold">${AppData.helpers.money(today.revenue)}</span> from ${today.orders} orders<br>
                ⭐ Best seller: <span class="text-bold">${top.name}</span><br>
                📦 ${top.units} units sold this month<br><br>
                Sleep well — your shop is in good shape.
              </p>
              <p class="text-xs" style="margin:6px 0 0;text-align:right;color:var(--c-ink-muted)">18:00 ✓✓</p>
            </div>
          </div>

          <!-- Settings -->
          <div>
            <p class="section-label-title" style="margin:14px 0 8px">When &amp; where</p>
            <div class="card" style="padding:0">
              <div class="list-item" onclick="UI.toast('Time picker arrives within 6 months')" role="button" tabindex="0">
                <div class="list-item-icon" style="background:var(--c-bg-soft);font-size:20px">🕕</div>
                <div class="list-item-body">
                  <p class="list-item-title">Send at</p>
                  <p class="list-item-sub">18:00 every day</p>
                </div>
                <span class="text-subtle" style="font-size:18px">›</span>
              </div>
              <div style="height:1px;background:var(--c-line);margin:0 14px"></div>
              <div class="list-item" onclick="UI.toast('Channel switching arrives within 6 months — WABA-dependent')" role="button" tabindex="0">
                <div class="list-item-icon" style="background:var(--c-bg-soft);font-size:20px">💬</div>
                <div class="list-item-body">
                  <p class="list-item-title">Send via</p>
                  <p class="list-item-sub">WhatsApp · falls back to push</p>
                </div>
                <span class="text-subtle" style="font-size:18px">›</span>
              </div>
              <div style="height:1px;background:var(--c-line);margin:0 14px"></div>
              <div class="list-item" onclick="UI.toast('Custom message picker arrives within 6 months')" role="button" tabindex="0">
                <div class="list-item-icon" style="background:var(--c-bg-soft);font-size:20px">✏️</div>
                <div class="list-item-body">
                  <p class="list-item-title">What's in it</p>
                  <p class="list-item-sub">Revenue · orders · best seller</p>
                </div>
                <span class="text-subtle" style="font-size:18px">›</span>
              </div>
            </div>
          </div>

          ${UI.wabaBanner()}

          <p class="text-xs text-subtle text-center" style="margin:18px 0 0;line-height:1.5">
            What time would actually be useful to you?
            <button class="btn-link" style="font-size:12px"
                    onclick="UI.openWhatsApp('+263775391219', 'Hi! On the urAfro end-of-day mockup — ___ would be a more useful time for me than 18:00.')">
              Tell us
            </button>
          </p>
        </div>

        ${UI.tabBar('more')}
      </section>
    `;
  },
};

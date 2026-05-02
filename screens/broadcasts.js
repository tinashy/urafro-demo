/* =========================================================================
   /broadcasts — CRM-02 static mockup
   Tier 2 (within 6 months): segmented WhatsApp/SMS broadcast composer.
   Static screen — buttons toast with the Tier 2 ETA. Overrides the
   placeholder registration for key 'broadcasts'.

   Design: composer-style layout — segment chips (audience), channel toggle,
   message textarea with example copy, live preview bubble, send CTA.
   ========================================================================= */

window.Screens.broadcasts = {
  title: 'Broadcasts',
  render(state) {
    const m = AppData.merchant;
    const totalCustomers = (AppData.customers || []).length;

    // Segment counts derive from fixture customers; fall back to hand-tuned
    // numbers so the mockup feels populated even with the small fixture set.
    const segments = [
      { key: 'all',      label: 'All customers',      count: Math.max(142, totalCustomers),   selected: true  },
      { key: 'repeat',   label: 'Repeat buyers',      count: 47,   selected: false },
      { key: 'recent',   label: 'Last 30 days',       count: 23,   selected: false },
      { key: 'vip',      label: 'Top spenders',       count: 8,    selected: false },
    ];
    const selected = segments.find(s => s.selected);

    const segmentChip = (s) => `
      <button class="chip" aria-pressed="${s.selected}"
              onclick="UI.toast('Audience picker arrives within 6 months')">
        ${s.label} <span class="text-subtle" style="margin-left:6px">${s.count}</span>
      </button>
    `;

    const sampleMsg = `Hey! New ankara wraps just landed at ${m.storeName}. First come first served — reply YES to claim 🌅`;

    return `
      <section class="screen layout-stack">
        ${UI.header({ title: 'Broadcasts', back: '/coming' })}

        <div class="screen-body app-container" style="padding-bottom:88px">

          <div style="display:inline-block;padding:6px 12px;border-radius:var(--r-pill);background:var(--c-info-bg);color:var(--c-info);font-size:12px;font-weight:600;letter-spacing:0.02em;align-self:flex-start">
            Within 6 months · Tier 2
          </div>

          <h2 style="margin:4px 0 6px;font-size:20px;font-weight:700">Reach your customers in one tap</h2>
          <p class="text-sm text-muted" style="margin:0">
            Send a WhatsApp or SMS to a slice of your customer list — restocks, sales, holiday hours, anything.
          </p>

          ${UI.wabaBanner()}

          <!-- Audience -->
          <div>
            <p class="section-label-title" style="margin:14px 0 8px">Audience</p>
            <div class="row row-sm" style="flex-wrap:wrap;gap:8px">
              ${segments.map(segmentChip).join('')}
            </div>
            <p class="text-xs text-muted" style="margin:8px 0 0">
              Sending to <span class="text-bold" style="color:var(--c-ink)">${selected.count}</span> ${selected.label.toLowerCase()}.
            </p>
          </div>

          <!-- Channel -->
          <div>
            <p class="section-label-title" style="margin:14px 0 8px">Send via</p>
            <div class="row row-sm" style="gap:8px">
              <button class="chip" aria-pressed="true"
                      onclick="UI.toast('Channel switching arrives within 6 months')">
                💬 WhatsApp
              </button>
              <button class="chip" aria-pressed="false"
                      onclick="UI.toast('SMS fallback arrives within 6 months')">
                ✉️ SMS
              </button>
            </div>
          </div>

          <!-- Composer -->
          <div>
            <p class="section-label-title" style="margin:14px 0 8px">Message</p>
            <div class="field">
              <div class="field-input" style="align-items:flex-start;padding:10px 12px;min-height:96px">
                <textarea readonly rows="4"
                          style="width:100%;border:0;outline:0;resize:none;font:inherit;background:transparent;color:var(--c-ink);line-height:1.5"
                          onclick="UI.toast('Message editing arrives within 6 months')">${sampleMsg}</textarea>
              </div>
              <p class="field-hint">${sampleMsg.length} / 1024 characters · Tap to edit (preview only in this demo).</p>
            </div>
          </div>

          <!-- Live preview -->
          <div>
            <p class="section-label-title" style="margin:14px 0 8px">Preview on the customer's phone</p>
            <div style="background:#E5DDD5;padding:18px 14px;border-radius:14px">
              <div style="background:#fff;padding:10px 12px;border-radius:8px 8px 8px 2px;max-width:88%;box-shadow:0 1px 1px rgba(0,0,0,0.06)">
                <p class="text-xs text-bold" style="margin:0 0 2px;color:#075E54">${m.storeName}</p>
                <p class="text-sm" style="margin:0;line-height:1.45;color:var(--c-ink)">${sampleMsg}</p>
                <p class="text-xs" style="margin:4px 0 0;text-align:right;color:var(--c-ink-muted)">10:14 ✓✓</p>
              </div>
            </div>
          </div>
        </div>

        <footer class="screen-footer">
          <button class="btn btn-primary btn-block"
                  onclick="UI.toast('Sending broadcasts arrives within 6 months — drop us a message if this is your top need')">
            Send to ${selected.count} customers
          </button>
          <p class="text-xs text-subtle text-center" style="margin:0;line-height:1.5">
            Want this sooner?
            <button class="btn-link" style="font-size:12px"
                    onclick="UI.openWhatsApp('+263775391219', 'Hi! On the urAfro broadcasts mockup — broadcasts would be most valuable to me for ___.')">
              Tell us what you'd send
            </button>
          </p>
        </footer>
      </section>
    `;
  },
};

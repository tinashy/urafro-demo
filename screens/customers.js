/* =========================================================================
   /customers — CRM-01 static mockup
   Tier 2 (within 6 months): customer records auto-built from orders.
   Static screen — search, sort, and tap-to-detail toast with the Tier 2 ETA.
   ========================================================================= */

window.Screens.customers = {
  title: 'Customers',
  render(state) {
    const customers = (AppData.customers || []).slice().sort((a, b) => b.totalSpend - a.totalSpend);
    const totalCustomers = customers.length;
    const totalSpend = customers.reduce((s, c) => s + c.totalSpend, 0);
    const repeatBuyers = customers.filter(c => c.orderCount >= 2).length;

    const initials = (name) =>
      name.split(/\s+/).slice(0, 2).map(s => s[0]).join('').toUpperCase();

    const customerRow = (c) => {
      // Pill colour carries the "repeat customer" signal; the label is just the order count.
      const isRepeat = c.orderCount >= 2;
      const pillCls = isRepeat ? 'pill-success' : 'pill-neutral';
      const pillLabel = `${c.orderCount} ${c.orderCount === 1 ? 'order' : 'orders'}`;
      return `
        <div class="list-item"
             onclick="UI.toast('Customer detail arrives within 6 months')"
             role="button" tabindex="0">
          <div class="list-item-icon" style="background:var(--c-primary-soft);color:var(--c-primary-dark);font-weight:700">
            ${initials(c.name)}
          </div>
          <div class="list-item-body">
            <p class="list-item-title">${c.name}</p>
            <p class="list-item-sub" style="font-family:var(--font-mono)">${c.phone}</p>
          </div>
          <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:4px">
            <p class="text-bold" style="margin:0;font-size:14px;font-family:var(--font-mono);color:var(--c-primary-dark)">${AppData.helpers.money(c.totalSpend)}</p>
            <span class="pill ${pillCls}" style="font-size:10px;white-space:nowrap">${pillLabel}</span>
          </div>
        </div>
      `;
    };

    return `
      <section class="screen">
        ${UI.header({ title: 'Customers', back: '/coming' })}

        <div class="screen-body" style="padding-bottom:88px">

          <div style="display:inline-block;padding:6px 12px;border-radius:var(--r-pill);background:var(--c-info-bg);color:var(--c-info);font-size:12px;font-weight:600;letter-spacing:0.02em;align-self:flex-start">
            Within 6 months · Tier 2
          </div>

          <h2 style="margin:4px 0 6px;font-size:20px;font-weight:700">Your customer list builds itself</h2>
          <p class="text-sm text-muted" style="margin:0">
            Every order creates or updates a customer record automatically — name, phone, total spend, repeat-rate. No manual entry.
          </p>

          <!-- Stats strip — labels kept to a single short word so all three
               tiles match height on narrow viewports. -->
          <div class="row row-sm" style="gap:8px;align-items:stretch">
            <div class="card" style="flex:1;padding:12px 14px">
              <p class="text-xs text-muted" style="margin:0;white-space:nowrap">Customers</p>
              <p class="text-bold" style="margin:2px 0 0;font-size:18px">${totalCustomers}</p>
            </div>
            <div class="card" style="flex:1;padding:12px 14px">
              <p class="text-xs text-muted" style="margin:0;white-space:nowrap">Repeat</p>
              <p class="text-bold" style="margin:2px 0 0;font-size:18px">${repeatBuyers}</p>
            </div>
            <div class="card" style="flex:1.3;padding:12px 14px">
              <p class="text-xs text-muted" style="margin:0;white-space:nowrap">Lifetime spend</p>
              <p class="text-bold" style="margin:2px 0 0;font-size:18px">${AppData.helpers.money(totalSpend)}</p>
            </div>
          </div>

          <!-- Search bar (static) -->
          <div class="field">
            <div class="field-input" onclick="UI.toast('Customer search arrives within 6 months')" style="cursor:pointer">
              <span class="text-subtle" style="padding-right:8px;font-size:16px">🔎</span>
              <span class="text-muted" style="font-size:14px">Search by name or phone</span>
            </div>
          </div>

          <!-- Sort chips -->
          <div class="row row-sm" style="gap:8px">
            <button class="chip" aria-pressed="true"  onclick="UI.toast('Sorting arrives within 6 months')">Most spent</button>
            <button class="chip" aria-pressed="false" onclick="UI.toast('Sorting arrives within 6 months')">A–Z</button>
            <button class="chip" aria-pressed="false" onclick="UI.toast('Sorting arrives within 6 months')">Last order</button>
          </div>

          <!-- Customer list -->
          <div class="list">
            ${customers.map(customerRow).join('')}
          </div>

          <p class="text-xs text-subtle text-center" style="margin:18px 0 0;line-height:1.5">
            What's the one thing you'd want to remember about each customer?
            <button class="btn-link" style="font-size:12px"
                    onclick="UI.openWhatsApp('+263775391219', 'Hi! On the urAfro customers mockup — I\\'d want to remember ___ about each customer.')">
              Tell us
            </button>
          </p>
        </div>

        ${UI.tabBar('more')}
      </section>
    `;
  },
};

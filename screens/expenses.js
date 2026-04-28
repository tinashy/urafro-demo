/* =========================================================================
   /expenses — EXP-01 static mockup
   Tier 2 (within 6 months): log expenses; see Revenue − Expenses = Profit.
   Static screen — chips, Add expense, and rows toast with the Tier 2 ETA.
   ========================================================================= */

window.Screens.expenses = {
  title: 'Expenses & P&L',
  render(state) {
    const m = AppData.metrics || {};
    const revenue = (m.month && m.month.revenue) || 2410;

    // Plausible monthly expenses for an Amara Fashion-sized shop in Harare.
    const expenses = [
      { id: 'e_001', name: 'Restock — Ankara fabric',  category: 'Stock',     amount: 480, date: 'Apr 23' },
      { id: 'e_002', name: 'Delivery (Vaya)',           category: 'Logistics', amount: 65,  date: 'Apr 22' },
      { id: 'e_003', name: 'Studio rent (April)',       category: 'Rent',      amount: 280, date: 'Apr 18' },
      { id: 'e_004', name: 'Mobile data + WhatsApp',    category: 'Comms',     amount: 22,  date: 'Apr 15' },
      { id: 'e_005', name: 'Knitwear yarn restock',     category: 'Stock',     amount: 145, date: 'Apr 12' },
      { id: 'e_006', name: 'Sewing machine service',    category: 'Equipment', amount: 40,  date: 'Apr  6' },
    ];
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const profit = revenue - totalExpenses;
    const margin = Math.round((profit / revenue) * 100);

    const categoryColor = {
      Stock:     '#0D9488',
      Logistics: '#7C3AED',
      Rent:     '#E8826B',
      Comms:    '#4A7C9E',
      Equipment:'#D97706',
      Other:    '#6B7280',
    };

    const expenseRow = (e) => `
      <div class="list-item"
           onclick="UI.toast('Expense editing arrives within 6 months')"
           role="button" tabindex="0">
        <div class="list-item-icon" style="background:${categoryColor[e.category] || categoryColor.Other};color:white;font-weight:700">
          ${e.category[0]}
        </div>
        <div class="list-item-body">
          <p class="list-item-title">${e.name}</p>
          <p class="list-item-sub">${e.date} · <span class="text-subtle">${e.category}</span></p>
        </div>
        <span class="text-bold" style="font-family:var(--font-mono);color:var(--c-ink)">−${AppData.helpers.money(e.amount)}</span>
      </div>
    `;

    return `
      <section class="screen">
        ${UI.header({ title: 'Expenses & P&L', back: '/coming' })}

        <div class="screen-body" style="padding-bottom:88px">

          <div style="display:inline-block;padding:6px 12px;border-radius:var(--r-pill);background:var(--c-info-bg);color:var(--c-info);font-size:12px;font-weight:600;letter-spacing:0.02em;align-self:flex-start">
            Within 6 months · Tier 2
          </div>

          <h2 style="margin:4px 0 6px;font-size:20px;font-weight:700">Know what you actually made</h2>
          <p class="text-sm text-muted" style="margin:0">
            Log expenses as you go — restocks, delivery, rent. urAfro does the maths so you can see Revenue − Expenses = Profit.
          </p>

          <!-- Period chips -->
          <div class="row row-sm" style="gap:8px;margin-top:6px">
            <button class="chip" aria-pressed="false" onclick="UI.toast('Period switching arrives within 6 months')">Last month</button>
            <button class="chip" aria-pressed="true"  onclick="UI.toast('Period switching arrives within 6 months')">This month</button>
            <button class="chip" aria-pressed="false" onclick="UI.toast('Period switching arrives within 6 months')">This quarter</button>
          </div>

          <!-- P&L summary card -->
          <div class="card" style="padding:16px 16px;background:linear-gradient(180deg, var(--c-primary-tint) 0%, var(--c-bg) 100%);border:1px solid var(--c-primary-soft)">
            <p class="text-xs text-muted" style="margin:0;text-transform:uppercase;letter-spacing:0.06em;font-weight:600">This month · Profit</p>
            <p class="text-bold" style="margin:4px 0 8px;font-size:30px;letter-spacing:-0.02em;color:var(--c-primary-dark)">${AppData.helpers.money(profit)}</p>

            <div style="height:1px;background:var(--c-primary-soft);margin:8px 0"></div>

            <div class="row row-between" style="margin-top:6px;font-family:var(--font-mono)">
              <span class="text-sm text-muted">Revenue</span>
              <span class="text-sm text-bold" style="color:var(--c-success)">+${AppData.helpers.money(revenue)}</span>
            </div>
            <div class="row row-between" style="margin-top:4px;font-family:var(--font-mono)">
              <span class="text-sm text-muted">Expenses</span>
              <span class="text-sm text-bold" style="color:var(--c-danger)">−${AppData.helpers.money(totalExpenses)}</span>
            </div>
            <div class="row row-between" style="margin-top:8px">
              <span class="text-xs text-muted">Margin</span>
              <span class="text-xs text-bold" style="color:var(--c-primary-dark)">${margin}%</span>
            </div>
          </div>

          <!-- Recent expenses -->
          <div>
            <div class="row row-between" style="margin:14px 0 8px">
              <p class="section-label-title" style="margin:0">Recent expenses</p>
              <button class="btn-link text-sm"
                      onclick="UI.toast('Add expense arrives within 6 months')"
                      style="font-size:13px;color:var(--c-primary-dark)">+ Add</button>
            </div>
            <div class="list">
              ${expenses.map(expenseRow).join('')}
            </div>
          </div>

          <p class="text-xs text-subtle text-center" style="margin:18px 0 0;line-height:1.5">
            What expense do you forget to log most often?
            <button class="btn-link" style="font-size:12px"
                    onclick="UI.openWhatsApp('+263775391219', 'Hi! On the urAfro expenses mockup — I forget to log ___ most often.')">
              Tell us
            </button>
          </p>
        </div>

        ${UI.tabBar('more')}
      </section>
    `;
  },
};

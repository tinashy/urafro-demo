/* =========================================================================
   /dashboard — ANL-01 static mockup
   Tier 2: today / this week / this month revenue + top products + 30-day trend.
   Static screen — period chips and CTAs toast with the Tier 2 ETA.
   ========================================================================= */

window.Screens.dashboard = {
  title: 'Sales dashboard',
  render(state) {
    const m = AppData.metrics || {};
    const today = m.today || { revenue: 0, orders: 0 };
    const week  = m.week  || { revenue: 0, orders: 0, prevWeek: 0 };
    const month = m.month || { revenue: 0, orders: 0, prevMonth: 0 };
    const aov   = m.aov || 0;
    const top   = m.topProducts || [];

    const weekDelta = week.prevWeek ? Math.round(((week.revenue - week.prevWeek) / week.prevWeek) * 100) : 0;
    const monthDelta = month.prevMonth ? Math.round(((month.revenue - month.prevMonth) / month.prevMonth) * 100) : 0;

    const tile = (label, value, sub, deltaPct = null) => `
      <div class="card" style="flex:1;min-width:0;padding:14px 14px;display:flex;flex-direction:column;gap:4px">
        <p class="text-xs text-muted" style="margin:0;text-transform:uppercase;letter-spacing:0.06em;font-weight:600">${label}</p>
        <p class="text-bold" style="margin:0;font-size:22px;letter-spacing:-0.02em">${value}</p>
        <p class="text-xs" style="margin:0;color:var(--c-ink-muted)">
          ${sub}
          ${deltaPct !== null ? `<span style="margin-left:6px;color:${deltaPct >= 0 ? 'var(--c-success)' : 'var(--c-danger)'};font-weight:600">${deltaPct >= 0 ? '↑' : '↓'} ${Math.abs(deltaPct)}%</span>` : ''}
        </p>
      </div>
    `;

    // 30-day trend — hand-shaped sparkline that "feels" plausible.
    // Numbers are heights between 0 and 1 (multiplied by 60px in the SVG).
    const trend = [.34,.41,.28,.55,.62,.48,.72,.65,.58,.81,.74,.69,.55,.62,.78,.70,.83,.91,.75,.82,.95,.88,.79,.92,1.0,.86,.94,.83,.90,.97];
    const W = 320, H = 64, pad = 2;
    const stepX = (W - pad * 2) / (trend.length - 1);
    const points = trend.map((v, i) => `${pad + i * stepX},${H - pad - v * (H - pad * 2)}`).join(' ');
    const areaPoints = `${pad},${H - pad} ${points} ${W - pad},${H - pad}`;

    const topProductRow = (p, idx) => `
      <div class="row row-between" style="padding:10px 0;${idx > 0 ? 'border-top:1px solid var(--c-line)' : ''}">
        <div style="flex:1;min-width:0">
          <p class="text-bold" style="margin:0;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name}</p>
          <p class="text-xs text-muted" style="margin:2px 0 0">${p.units} units sold</p>
        </div>
        <span class="text-bold" style="font-size:14px;font-family:var(--font-mono);color:var(--c-primary-dark)">${AppData.helpers.money(p.revenue)}</span>
      </div>
    `;

    return `
      <section class="screen layout-stack">
        ${UI.header({ title: 'Sales dashboard', back: '/coming' })}

        <div class="screen-body app-container" style="padding-bottom:88px">

          <div style="display:inline-block;padding:6px 12px;border-radius:var(--r-pill);background:var(--c-info-bg);color:var(--c-info);font-size:12px;font-weight:600;letter-spacing:0.02em;align-self:flex-start">
            Within 6 months · Tier 2
          </div>

          <h2 style="margin:4px 0 6px;font-size:20px;font-weight:700">See how the shop's doing</h2>
          <p class="text-sm text-muted" style="margin:0">
            Revenue, orders, top products, and a 30-day trend at a glance. Real numbers from your store — nothing here is estimated.
          </p>

          <!-- Period chips -->
          <div class="row row-sm" style="gap:8px;margin-top:6px">
            <button class="chip" aria-pressed="false" onclick="UI.toast('Period switching arrives within 6 months')">Today</button>
            <button class="chip" aria-pressed="false" onclick="UI.toast('Period switching arrives within 6 months')">This week</button>
            <button class="chip" aria-pressed="true"  onclick="UI.toast('Period switching arrives within 6 months')">This month</button>
          </div>

          <!-- Big tiles -->
          <div class="row row-sm" style="gap:8px">
            ${tile('Revenue', AppData.helpers.money(month.revenue), `${month.orders} orders`, monthDelta)}
            ${tile('AOV',     AppData.helpers.money(aov),           'avg order value')}
          </div>
          <div class="row row-sm" style="gap:8px">
            ${tile('Today',     AppData.helpers.money(today.revenue), `${today.orders} orders`)}
            ${tile('This week', AppData.helpers.money(week.revenue),  `${week.orders} orders`, weekDelta)}
          </div>

          <!-- 30-day trend -->
          <div class="card" style="padding:14px">
            <div class="row row-between" style="margin-bottom:6px">
              <p class="text-xs text-muted" style="margin:0;text-transform:uppercase;letter-spacing:0.06em;font-weight:600">30-day trend</p>
              <p class="text-xs" style="margin:0;color:var(--c-success);font-weight:600">↑ ${monthDelta}% vs last month</p>
            </div>
            <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="none" style="display:block">
              <polygon points="${areaPoints}" fill="var(--c-primary-soft)" opacity="0.6"/>
              <polyline points="${points}" fill="none" stroke="var(--c-primary)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
            </svg>
            <p class="text-xs text-muted" style="margin:8px 0 0;text-align:center">
              Best day this month: <span class="text-bold" style="color:var(--c-ink)">Wed Apr 22 · ${AppData.helpers.money(312)}</span>
            </p>
          </div>

          <!-- Top products -->
          <div>
            <p class="section-label-title" style="margin:14px 0 6px">Top products this month</p>
            <div class="card" style="padding:6px 14px">
              ${top.map(topProductRow).join('')}
            </div>
          </div>

          <p class="text-xs text-subtle text-center" style="margin:18px 0 0;line-height:1.5">
            What single number would matter most to you?
            <button class="btn-link" style="font-size:12px"
                    onclick="UI.openWhatsApp('+263775391219', 'Hi! On the urAfro dashboard mockup — the metric I really want to see is ___.')">
              Tell us
            </button>
          </p>
        </div>

        ${UI.tabBar('more')}
      </section>
    `;
  },
};

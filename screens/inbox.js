/* =========================================================================
   ORD-01 — Order inbox
   Route: /inbox
   The merchant's "home base" — every customer order lands here. The wow
   moment for the demo: place an order from the customer storefront, then
   come back here and see it sitting at the top of the New tab.

   Layout:
     [Header (just title — no back button, this IS home)]
     [Status filter strip — New / Confirmed / Fulfilled / Cancelled with counts]
     [Order rows — tap to open /order/:id]
     [Bottom tab bar]

   State:
     state.inbox.tab    'new' | 'confirmed' | 'fulfilled' | 'cancelled'

   Data:
     AppData.orders     fixture orders + any orders placed via storefront
                        (storefront _place unshifts to FRONT so they appear
                        at the top of /inbox automatically).
   ========================================================================= */

const INBOX_TABS = [
  { key: 'new',       label: 'New' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'fulfilled', label: 'Fulfilled' },
  { key: 'cancelled', label: 'Cancelled' },
];

window.Screens.inbox = {
  title: 'Orders',
  render(state) {
    state.inbox = state.inbox || {};
    const tab = state.inbox.tab || 'new';

    // Group orders by status, preserving the order they appear in AppData.orders
    // (newest at front, courtesy of storefront._place's unshift).
    const byStatus = {};
    INBOX_TABS.forEach(t => byStatus[t.key] = []);
    AppData.orders.forEach(o => { (byStatus[o.status] || (byStatus[o.status] = [])).push(o); });

    const counts = {};
    INBOX_TABS.forEach(t => counts[t.key] = byStatus[t.key].length);

    const orders = byStatus[tab] || [];

    return `
      <section class="screen">
        <header class="screen-header">
          <span style="width:40px"></span>
          <h1>Orders</h1>
          <span style="width:40px"></span>
        </header>

        ${renderTabStrip(tab, counts)}

        <div class="screen-body" style="padding-top:12px;padding-bottom:96px">
          ${orders.length === 0
            ? UI.empty({
                title: emptyTitleFor(tab),
                sub:   emptySubFor(tab),
                icon:  emptyIconFor(tab),
              })
            : `<div class="list">${orders.map(orderRow).join('')}</div>`
          }
        </div>

        ${UI.tabBar('inbox')}
      </section>
    `;
  },
};

/* --------------- tab strip --------------- */
function renderTabStrip(activeKey, counts) {
  return `
    <div class="inbox-tabs" role="tablist">
      ${INBOX_TABS.map(t => {
        const isActive = t.key === activeKey;
        const count    = counts[t.key] || 0;
        const isNewWithOrders = t.key === 'new' && count > 0;
        return `
          <button class="inbox-tab" role="tab" aria-selected="${isActive}" data-active="${isActive}"
                  onclick="Screens.inbox._setTab('${t.key}')">
            <span>${t.label}</span>
            ${count > 0
              ? `<span class="inbox-tab-count" data-pulse="${isNewWithOrders}">${count}</span>`
              : ''}
          </button>
        `;
      }).join('')}
    </div>
  `;
}

/* --------------- order row ---------------
   Mobile-first card layout adapted from the design reference:
     • Top metadata line: ORDER CODE · time-ago (small, muted)
     • Customer name as the heading (wraps to 2 lines if very long)
     • Summary: items + price + channel (single line, ellipsis)
     • Right column: dot-prefixed status pill + total
   Total uses .nowrap so global overflow-wrap:anywhere can't break "$57".
*/
function orderRow(o) {
  const pill   = AppData.helpers.statusPill(o.status);
  const ago    = AppData.helpers.timeAgo(o.placedAt);
  const total  = AppData.helpers.money(o.total);
  const itemCt = o.items.reduce((s, it) => s + it.qty, 0);
  const itemLabel = `${itemCt} item${itemCt === 1 ? '' : 's'}`;
  const channelTag = o.channel === 'storefront' ? 'Storefront' : 'WhatsApp';
  const subStatus = subStatusFor(o);
  // Map our existing pill.cls onto a CSS-variable-driven dot color.
  const dotColor = {
    'pill-info':    'var(--c-info)',
    'pill-primary': 'var(--c-primary)',
    'pill-success': 'var(--c-success)',
    'pill-warning': 'var(--c-warning)',
    'pill-danger':  'var(--c-danger)',
    'pill-neutral': 'var(--c-ink-muted)',
  }[pill.cls] || 'var(--c-ink-muted)';

  return `
    <a class="inbox-row" href="#/order/${o.id}" aria-label="Open order ${o.code} for ${o.customerName}">
      <div class="inbox-row-avatar" style="background:var(--c-primary-soft);color:var(--c-primary-dark)">
        ${initials(o.customerName)}
      </div>
      <div class="inbox-row-body">
        <p class="inbox-row-meta">
          <span class="inbox-row-code">${o.code}</span>
          <span class="inbox-row-meta-dot" aria-hidden="true"></span>
          <span class="inbox-row-time">${ago}</span>
        </p>
        <p class="inbox-row-name">${o.customerName}</p>
        <p class="inbox-row-summary">
          ${itemLabel}
          <span class="inbox-row-summary-sep" aria-hidden="true">·</span>
          <span class="inbox-row-total">${total}</span>
          <span class="inbox-row-summary-sep" aria-hidden="true">·</span>
          ${channelTag}
        </p>
      </div>
      <div class="inbox-row-status">
        <span class="pill ${pill.cls} inbox-row-pill">
          <span class="inbox-row-pill-dot" style="background:${dotColor}" aria-hidden="true"></span>
          ${pill.label}
        </span>
        ${subStatus ? `<span class="inbox-row-substatus">${subStatus}</span>` : ''}
      </div>
    </a>
  `;
}

/* Sub-status hint shown below the status pill — a one-line "what's next"
   note that mirrors the design reference's "Awaiting fulfillment" /
   "TRK: ZA…" pattern, but using urafro-relevant copy. */
function subStatusFor(o) {
  switch (o.status) {
    case 'new':       return 'Awaiting confirm';
    case 'confirmed': return 'Stock deducted';
    case 'fulfilled': return 'Sent';
    case 'cancelled': return o.cancelReason ? 'See reason' : '';
    default:          return '';
  }
}

/* --------------- helpers --------------- */
function initials(name) {
  const parts = (name || '').trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0] || '').join('').toUpperCase() || '?';
}

function emptyTitleFor(tab) {
  switch (tab) {
    case 'new':       return 'No new orders yet';
    case 'confirmed': return 'No confirmed orders';
    case 'fulfilled': return 'No fulfilled orders yet';
    case 'cancelled': return 'No cancelled orders';
    default:          return 'No orders';
  }
}
function emptySubFor(tab) {
  switch (tab) {
    case 'new':       return 'When a customer places an order, it shows up here. Try the storefront preview to send yourself a test order.';
    case 'confirmed': return 'Orders you\'ve confirmed but not yet handed over will live here.';
    case 'fulfilled': return 'Once you mark an order fulfilled, it moves here.';
    case 'cancelled': return 'Cancelled orders stay in your records here.';
    default:          return '';
  }
}
function emptyIconFor(tab) {
  switch (tab) {
    case 'new':       return '🔔';
    case 'confirmed': return '✅';
    case 'fulfilled': return '📦';
    case 'cancelled': return '🗂️';
    default:          return '📭';
  }
}

/* --------------- mutators --------------- */
window.Screens.inbox._setTab = function (key) {
  state.inbox = state.inbox || {};
  state.inbox.tab = key;
  render();
};

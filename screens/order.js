/* =========================================================================
   ORD-02 — Process order (order detail)
   Route: /order/<orderId>

   Layout:
     [Header — back to /inbox, title = order code]
     [Order summary card — customer, channel, time, status pill]
     [Line items card — qty × name, prices, subtotal/total]
     [Optional deposit card if order.depositPaid set]
     [Auto-message preview — what the customer will receive]
     [Action footer — actions vary by status]

   Status transitions:
     new       →  Confirm   →  confirmed   (decrements stock)
     new       →  Cancel    →  cancelled
     confirmed →  Fulfilled →  fulfilled
     confirmed →  Cancel    →  cancelled   (restores stock)
     fulfilled →  (terminal — read-only, footer hidden)
     cancelled →  (terminal — read-only, footer hidden)

   Side effects of confirm/cancel/fulfilled handled by mutators below; they
   also write a one-shot `state.orderFlash` toast for the *next* render so
   the merchant sees "Order confirmed · stock updated" feedback.
   ========================================================================= */

window.Screens.order = {
  title: 'Order',
  render(state) {
    const id = state.route.args[0];
    const o  = AppData.orders.find(x => x.id === id);

    if (!o) {
      return `
        <section class="screen">
          ${UI.header({ title: 'Order not found', back: '/inbox' })}
          <div class="screen-body">
            ${UI.empty({ title: 'Order not found', sub: 'It may have been removed.', icon: '🤔' })}
          </div>
        </section>
      `;
    }

    const pill   = AppData.helpers.statusPill(o.status);
    const ago    = AppData.helpers.timeAgo(o.placedAt);
    const total  = AppData.helpers.money(o.total);
    const flash  = state.orderFlash;
    state.orderFlash = null; // one-shot

    return `
      <section class="screen">
        ${UI.header({ title: o.code, back: '/inbox' })}
        ${flash ? `<div class="flash-toast">${flash}</div>` : ''}

        <div class="screen-body" style="padding-bottom:${footerHidden(o) ? 24 : 132}px">

          <!-- Customer card -->
          <div class="card" style="padding:14px 16px">
            <div class="row row-between" style="margin-bottom:8px">
              <span class="pill ${pill.cls}">${pill.label}</span>
              <span class="text-xs text-subtle">${o.channel === 'storefront' ? 'Via Storefront' : 'Via WhatsApp'} · ${ago}</span>
            </div>
            <p class="text-bold" style="margin:0;font-size:16px">${o.customerName}</p>
            <p class="text-sm text-muted" style="margin:2px 0 0">${o.customerPhone}</p>
            <a class="btn-link" style="font-size:13px;display:inline-flex;align-items:center;gap:6px;margin-top:8px;padding:0"
               href="https://wa.me/${o.customerPhone.replace(/\D/g, '')}" target="_blank" rel="noopener">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 0 5.37 0 12a11.94 11.94 0 001.64 6.06L0 24l6.16-1.62A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.21-1.25-6.22-3.48-8.52zM12 22a10 10 0 01-5.1-1.4l-.36-.22-3.65.96.98-3.56-.24-.37A10 10 0 1112 22zm5.5-7.4c-.3-.15-1.78-.88-2.06-.98s-.48-.15-.68.15-.78.98-.96 1.18-.36.22-.66.07a8.2 8.2 0 01-2.4-1.48 9 9 0 01-1.66-2.06c-.18-.3 0-.46.13-.6s.3-.36.45-.54.2-.3.3-.5a.55.55 0 00-.02-.52c-.07-.15-.66-1.6-.9-2.18s-.5-.5-.68-.5h-.58a1.1 1.1 0 00-.8.37 3.36 3.36 0 00-1.05 2.5 5.83 5.83 0 001.22 3.1c.15.2 2.1 3.2 5.1 4.48a17 17 0 001.7.63 4.1 4.1 0 001.88.12 3.07 3.07 0 002-1.42 2.5 2.5 0 00.18-1.42c-.07-.12-.27-.2-.57-.35z"/></svg>
              Open chat with ${o.customerName.split(' ')[0]}
            </a>
          </div>

          <!-- Line items -->
          <div class="card" style="padding:0;overflow:hidden">
            <p class="section-label-title" style="margin:14px 16px 8px">Items</p>
            ${o.items.map(itemRow).join('<div class="divider" style="margin:0"></div>')}
            <div class="divider" style="margin:0"></div>
            <div style="padding:12px 16px">
              <div class="row row-between" style="margin-bottom:6px">
                <span class="text-sm text-muted">Subtotal</span>
                <span class="text-sm">${AppData.helpers.money(o.subtotal)}</span>
              </div>
              ${o.depositPaid ? `
                <div class="row row-between" style="margin-bottom:6px">
                  <span class="text-sm text-muted">Deposit paid</span>
                  <span class="text-sm text-success">−${AppData.helpers.money(o.depositPaid)}</span>
                </div>
                <div class="divider" style="margin:8px 0"></div>
                <div class="row row-between">
                  <span class="text-bold">Balance due on delivery</span>
                  <span class="text-bold" style="font-size:16px">${AppData.helpers.money(o.total - o.depositPaid)}</span>
                </div>
              ` : `
                <div class="divider" style="margin:8px 0"></div>
                <div class="row row-between">
                  <span class="text-bold">Total</span>
                  <span class="text-bold" style="font-size:18px">${total}</span>
                </div>
              `}
            </div>
          </div>

          ${o.cancelReason ? `
            <div class="card" style="padding:14px 16px;background:var(--c-danger-bg);border-color:transparent">
              <p class="text-xs text-bold" style="margin:0;text-transform:uppercase;letter-spacing:0.06em;color:var(--c-danger)">Cancelled</p>
              <p style="margin:4px 0 0;font-size:13px;color:var(--c-danger)">Reason: ${o.cancelReason}</p>
            </div>
          ` : ''}

          ${o.status !== 'cancelled' ? renderAutoMessage(o) : ''}

          ${stockHintFor(o)}
        </div>

        ${footerHidden(o) ? '' : renderActionFooter(o)}
      </section>
    `;
  },
};

/* --------------- partials --------------- */
function itemRow(it) {
  const product = AppData.products.find(p => p.id === it.productId);
  const colour  = product ? product.color : '#0D9488';
  return `
    <div class="row" style="padding:12px 16px;gap:12px">
      <div class="list-item-icon" style="background:${colour};color:white;width:40px;height:40px;font-size:14px;border-radius:10px">
        ${it.qty}×
      </div>
      <div style="flex:1;min-width:0">
        <p class="text-bold" style="margin:0;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${it.name}</p>
        <p class="text-sm text-muted" style="margin:2px 0 0">${AppData.helpers.money(it.price)} each</p>
      </div>
      <span class="text-bold" style="font-size:14px">${AppData.helpers.money(it.price * it.qty)}</span>
    </div>
  `;
}

function renderAutoMessage(o) {
  const firstName = (o.customerName || '').split(' ')[0] || 'there';
  let msg;
  switch (o.status) {
    case 'new':
      msg = `Hi ${firstName}! We've received your order ${o.code}. We'll confirm shortly and arrange delivery.`;
      break;
    case 'confirmed':
      msg = `Hi ${firstName}, your order ${o.code} is confirmed. Total ${AppData.helpers.money(o.total)}. We'll be in touch about pickup or delivery.`;
      break;
    case 'fulfilled':
      msg = `Hi ${firstName}, thanks for your order! ${o.code} has been delivered. Enjoy — and tag us if you share!`;
      break;
    default:
      return '';
  }
  return `
    <div class="card" style="padding:14px 16px">
      <p class="section-label-title" style="margin:0 0 8px">Auto-message preview</p>
      <div class="auto-msg">
        <div class="auto-msg-bubble">${msg}</div>
        <p class="text-xs text-subtle" style="margin:6px 0 0">
          Sent via WhatsApp on confirm/fulfil if WABA approved · falls back to SMS otherwise.
        </p>
      </div>
    </div>
  `;
}

function stockHintFor(o) {
  // Only show on confirmed orders — explain that stock was deducted.
  if (o.status !== 'confirmed') return '';
  return `
    <p class="text-xs text-subtle" style="margin:0;text-align:center;line-height:1.5">
      ✓ Stock deducted on confirm.
      <a class="btn-link" href="#/inventory" style="font-size:12px;padding:0">Open inventory →</a>
    </p>
  `;
}

function footerHidden(o) {
  return o.status === 'fulfilled' || o.status === 'cancelled';
}

function renderActionFooter(o) {
  if (o.status === 'new') {
    return `
      <footer class="screen-footer">
        <button class="btn btn-primary btn-block" onclick="Screens.order._confirm('${o.id}')">
          Confirm order
        </button>
        <button class="btn btn-link" style="text-align:center;color:var(--c-danger)"
                onclick="Screens.order._cancel('${o.id}')">
          Cancel order
        </button>
      </footer>
    `;
  }
  if (o.status === 'confirmed') {
    return `
      <footer class="screen-footer">
        <button class="btn btn-primary btn-block" onclick="Screens.order._fulfil('${o.id}')">
          Mark fulfilled
        </button>
        <button class="btn btn-link" style="text-align:center;color:var(--c-danger)"
                onclick="Screens.order._cancel('${o.id}')">
          Cancel order
        </button>
      </footer>
    `;
  }
  return '';
}

/* =========================================================================
   Mutators — change order status, mutate stock, route + flash
   ========================================================================= */

window.Screens.order._confirm = function (id) {
  const o = AppData.orders.find(x => x.id === id);
  if (!o || o.status !== 'new') return;
  // Decrement stock for each item (clamped to 0).
  o.items.forEach(it => {
    const p = AppData.products.find(p => p.id === it.productId);
    if (p) p.stock = Math.max(0, p.stock - it.qty);
  });
  o.status = 'confirmed';
  o.confirmedAt = new Date().toISOString();
  state.orderFlash = `Order ${o.code} confirmed · stock updated`;
  render();
};

window.Screens.order._fulfil = function (id) {
  const o = AppData.orders.find(x => x.id === id);
  if (!o || o.status !== 'confirmed') return;
  o.status = 'fulfilled';
  o.fulfilledAt = new Date().toISOString();
  state.orderFlash = `Order ${o.code} marked fulfilled`;
  render();
};

window.Screens.order._cancel = function (id) {
  const o = AppData.orders.find(x => x.id === id);
  if (!o) return;
  if (o.status !== 'new' && o.status !== 'confirmed') return;
  // If we're cancelling a confirmed order, restore stock.
  if (o.status === 'confirmed') {
    o.items.forEach(it => {
      const p = AppData.products.find(p => p.id === it.productId);
      if (p) p.stock += it.qty;
    });
  }
  o.status = 'cancelled';
  o.cancelledAt = new Date().toISOString();
  o.cancelReason = o.cancelReason || 'Cancelled by merchant';
  state.orderFlash = `Order ${o.code} cancelled`;
  render();
};

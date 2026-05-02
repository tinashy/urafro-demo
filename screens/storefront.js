/* =========================================================================
   STR-02 — Customer-facing storefront
   Routes (second arg switches sub-view):
     /storefront/<slug>             grid of products  (default)
     /storefront/<slug>/cart        review cart, adjust qty
     /storefront/<slug>/checkout    name + phone, place order
     /storefront/<slug>/done        thank-you + order code

   This is the half of the demo that creates the magic moment: customer
   places an order from a phone, merchant sees it land in /inbox.

   State:
     state.storefront = {
       cart:            [{ productId, qty }, ...]
       customer:        { name, phone }
       lastOrderCode:   'A-12345' (set after place order, used on done view)
     }

   Side effects on "Place order":
     - Pushes a new order to the FRONT of AppData.orders with status='new'
       so it shows up at the top of /inbox.
     - Clears the cart.
     - Does NOT decrement stock yet — that happens on merchant Confirm
       (ORD-02). Mirrors the real-world flow: order is provisional until
       merchant confirms.

   Notes:
     - All sub-views are wrapped in a brand-coloured storefront header
       (no merchant tab bar — this is the customer's view).
     - The back arrow on every sub-view returns to /store so the merchant
       can exit "preview as customer" mode cleanly.
   ========================================================================= */

window.Screens.storefront = {
  title: 'Storefront',
  render(state) {
    // Initialise state slot
    state.storefront = state.storefront || { cart: [], customer: { name: '', phone: '' }, lastOrderCode: '' };
    const slug = state.route.args[0] || AppData.merchant.storeSlug;
    const sub  = state.route.args[1] || 'grid';

    const ctx = storefrontContext(state, slug);
    if (sub === 'cart')      return renderCart(state, ctx);
    if (sub === 'checkout')  return renderCheckout(state, ctx);
    if (sub === 'done')      return renderDone(state, ctx);
    if (sub === 'product')   return renderProductDetail(state, ctx, state.route.args[2]);
    return renderGrid(state, ctx);
  },
  init(state) {
    const sub = state.route.args[1] || 'grid';
    if (sub === 'checkout') wireCheckout(state);
    if (!sub || sub === 'grid') wireGridSearch(state);
    // Other sub-views use inline onclick handlers; no init wiring needed.
  },
};

/* --------------- helpers (PDP size mock) --------------- */
// For Sprint 0 the size selector is illustrative; real sizing data ships in v1.
function pdpSizesFor(product) {
  const cat = (product && product.category) || '';
  if (/accessor|headwrap|clutch|bag|jewel/i.test(cat)) return ['One size'];
  return ['S', 'M', 'L', 'XL'];
}

/* --------------- grid: search input wiring --------------- */
function wireGridSearch(state) {
  const el = document.getElementById('sfSearch');
  if (!el) return;
  // Re-render in place on each keystroke; keep focus + caret position.
  el.addEventListener('input', () => {
    if (!state.storefront) state.storefront = { cart: [], customer: { name: '', phone: '' }, lastOrderCode: '', search: '' };
    state.storefront.search = el.value;
    render();
    // After render the new input needs focus + caret restored.
    const after = document.getElementById('sfSearch');
    if (after) {
      after.focus();
      const len = after.value.length;
      try { after.setSelectionRange(len, len); } catch (e) {}
    }
  });
}

window.Screens.storefront._clearSearch = function () {
  if (!state.storefront) return;
  state.storefront.search = '';
  render();
};

/* --------------- shared context --------------- */
function storefrontContext(state, slug) {
  const ob = state.onboarding || {};
  const m  = AppData.merchant;
  const storeName  = (ob.storeName  && ob.storeName.length)  ? ob.storeName  : m.storeName;
  const tagline    = (ob.tagline    && ob.tagline.length)    ? ob.tagline    : m.tagline;
  const brandColor = ob.brandColor || m.brandColor;
  const initial    = (storeName || 'S').trim()[0].toUpperCase();
  return { slug, storeName, tagline, brandColor, initial };
}

/* Brand-coloured storefront header — same shape across all sub-views.
   Compact mode (used on cart/checkout/done) skips the tagline + stat row. */
function storefrontHeader(ctx, { compact = false, title = null } = {}) {
  return `
    <header class="storefront-header" style="background:linear-gradient(135deg, ${ctx.brandColor} 0%, ${ctx.brandColor}DD 100%)">
      <button class="storefront-header-back" onclick="navigate('/store')" aria-label="Back">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div class="storefront-header-body">
        <div style="width:${compact ? 36 : 48}px;height:${compact ? 36 : 48}px;border-radius:${compact ? 12 : 14}px;background:rgba(255,255,255,0.22);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;font-size:${compact ? 16 : 22}px;font-weight:700;color:white;flex-shrink:0">
          ${ctx.initial}
        </div>
        <div style="min-width:0;flex:1">
          <p class="text-bold" style="margin:0;font-size:${compact ? 15 : 18}px;letter-spacing:-0.01em;color:white">${title || ctx.storeName}</p>
          ${!compact ? `<p style="margin:2px 0 0;font-size:13px;color:rgba(255,255,255,0.9)">${ctx.tagline || ''}</p>` : ''}
        </div>
      </div>
    </header>
  `;
}

/* --------------- helpers (cart math) --------------- */
function cartCount(state) {
  return state.storefront.cart.reduce((s, ln) => s + ln.qty, 0);
}
function cartLines(state) {
  return state.storefront.cart.map(ln => {
    const p = AppData.products.find(x => x.id === ln.productId);
    return p ? { ...ln, product: p, lineTotal: p.price * ln.qty } : null;
  }).filter(Boolean);
}
function cartSubtotal(state) {
  return cartLines(state).reduce((s, ln) => s + ln.lineTotal, 0);
}

/* --------------- view: products grid --------------- */
function renderGrid(state, ctx) {
  const search = (state.storefront && state.storefront.search) || '';
  const q = search.trim().toLowerCase();
  const all = AppData.products;
  const products = q
    ? all.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q))
    : all;
  const count = cartCount(state);

  const card = (p) => {
    const out = p.stock === 0;
    const imageInner = p.photoUrl
      ? `<img src="${p.photoUrl}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;display:block">
         ${out ? `<span class="storefront-card-out">Out of stock</span>` : ''}`
      : `<span style="font-size:36px;font-weight:700;color:white;opacity:0.9">${p.name[0]}</span>
         ${out ? `<span class="storefront-card-out">Out of stock</span>` : ''}`;
    const pdpRoute = `/storefront/${ctx.slug}/product/${p.id}`;
    return `
      <div class="storefront-card" data-out="${out}">
        <div class="storefront-card-image" style="background:${p.color};cursor:pointer"
             onclick="navigate('${pdpRoute}')" role="button" tabindex="0"
             aria-label="View ${p.name}">
          ${imageInner}
        </div>
        <div class="storefront-card-body">
          <p class="storefront-card-name" onclick="navigate('${pdpRoute}')"
             style="cursor:pointer">${p.name}</p>
          <p class="storefront-card-price">${AppData.helpers.money(p.price)}</p>
          <button class="btn btn-primary btn-block storefront-card-cta" ${out ? 'disabled' : ''}
                  onclick="Screens.storefront._add('${p.id}')">
            ${out ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </div>
    `;
  };

  return `
    <section class="screen storefront layout-stack">
      ${storefrontHeader(ctx)}

      <div class="screen-body app-container" style="padding-bottom:${count > 0 ? 96 : 24}px">

        <!-- Search — filters by product name or category -->
        <div class="field" style="margin:0">
          <div class="field-input" style="display:flex;align-items:center;gap:8px">
            <span class="text-subtle" style="font-size:16px">🔎</span>
            <input id="sfSearch" type="search" placeholder="Search ${ctx.storeName}…"
                   value="${(search || '').replace(/"/g,'&quot;')}"
                   style="flex:1;border:0;outline:0;background:transparent;font:inherit;color:var(--c-ink)">
            ${q ? `<button onclick="Screens.storefront._clearSearch()" aria-label="Clear search"
                          style="background:none;border:0;cursor:pointer;color:var(--c-ink-muted);font-size:18px;padding:0 4px">×</button>` : ''}
          </div>
        </div>

        <p class="text-sm text-muted" style="margin:6px 0 0">
          ${q
            ? (products.length === 0
                ? `No products match "${search}"`
                : `${products.length} match${products.length === 1 ? '' : 'es'} for "${search}"`)
            : `${all.length} item${all.length === 1 ? '' : 's'} available · tap to add to cart`}
        </p>

        ${products.length === 0 && q
          ? UI.empty({ title: 'Nothing matches', sub: 'Try a different word or clear the search.', icon: '🔎' })
          : `<div class="storefront-grid">${products.map(card).join('')}</div>`}

        <p class="text-xs text-subtle text-center" style="margin:24px 0 0;line-height:1.5">
          Powered by <span class="text-bold" style="color:var(--c-primary-dark)">urAfro</span> · Secure checkout
        </p>
      </div>

      ${count > 0 ? `
        <button class="storefront-cart-fab" onclick="navigate('/storefront/${ctx.slug}/cart')">
          <span class="storefront-cart-fab-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
            <span class="storefront-cart-fab-badge">${count}</span>
          </span>
          <span style="flex:1;text-align:left;margin-left:12px">View cart</span>
          <span>${AppData.helpers.money(cartSubtotal(state))}</span>
        </button>
      ` : ''}
    </section>
  `;
}

/* --------------- view: product detail page (PDP) ---------------
   Customer-facing product page reached by tapping an image / name on the
   storefront grid. Shows hero image, name, price, mock size selector, qty
   stepper, and a sticky Add-to-cart CTA. Out-of-stock products land here
   too but the CTA disables. */
function renderProductDetail(state, ctx, productId) {
  const product = AppData.products.find(p => p.id === productId);

  if (!product) {
    setTimeout(() => navigate(`/storefront/${ctx.slug}`), 0);
    return `<section class="screen storefront layout-stack">
      ${storefrontHeader(ctx, { compact: true, title: 'Product' })}
      <div class="screen-body app-container">${UI.empty({ title: 'Not found', sub: 'That product is no longer listed.', icon: '🔎' })}</div>
    </section>`;
  }

  const out          = product.stock === 0;
  const inCart       = state.storefront.cart.find(ln => ln.productId === productId);
  const cartQty      = inCart ? inCart.qty : 0;
  const sizes        = pdpSizesFor(product);
  // Selected size + draft qty live on state so chip taps survive re-render.
  state.storefront.pdp = state.storefront.pdp || {};
  if (state.storefront.pdp.productId !== productId) {
    state.storefront.pdp = { productId, size: sizes[0], qty: 1 };
  }
  const selSize      = state.storefront.pdp.size || sizes[0];
  const selQty       = Math.min(Math.max(1, state.storefront.pdp.qty || 1), Math.max(1, product.stock));

  const heroInner = product.photoUrl
    ? `<img src="${product.photoUrl}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;display:block">`
    : `<span style="font-size:80px;font-weight:700;color:white;opacity:0.9">${product.name[0]}</span>`;

  const sizeChip = (s) => `
    <button class="chip" aria-pressed="${selSize === s}"
            onclick="Screens.storefront._pickSize('${s.replace(/'/g,"\\'")}')">
      ${s}
    </button>`;

  const stockNote = out
    ? `<span style="color:var(--c-danger);font-weight:700">Out of stock</span>`
    : product.stock <= product.lowStockAt
      ? `<span style="color:var(--c-warning)">Only ${product.stock} left</span>`
      : `<span style="color:var(--c-success)">In stock</span>`;

  return `
    <section class="screen storefront layout-stack">
      ${storefrontHeader(ctx, { compact: true, title: product.name.length > 28 ? product.name.slice(0, 28) + '…' : product.name })}

      <div class="screen-body app-container" style="padding:0 0 168px;gap:0">

        <!-- Hero image -->
        <div style="background:${product.color};aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;overflow:hidden">
          ${heroInner}
        </div>

        <!-- Product info -->
        <div style="padding:18px 20px 0;display:flex;flex-direction:column;gap:12px">

          <div>
            <p class="text-bold" style="margin:0;font-size:20px;letter-spacing:-0.01em;line-height:1.3">${product.name}</p>
            <p class="text-bold" style="margin:6px 0 0;font-size:22px;color:var(--c-primary-dark);font-family:var(--font-mono);letter-spacing:-0.01em">${AppData.helpers.money(product.price)}</p>
            <p class="text-sm" style="margin:6px 0 0">${stockNote}${product.category ? ` <span class="text-subtle">· ${product.category}</span>` : ''}</p>
          </div>

          <p class="text-sm text-muted" style="margin:0;line-height:1.5">
            Handmade by ${ctx.storeName}. Tap the size that fits, pick your quantity, and add to cart — ${ctx.storeName} will message you to confirm and arrange delivery.
          </p>

          <!-- Size selector -->
          <div>
            <p class="section-label-title" style="margin:0 0 8px">Size</p>
            <div class="row row-sm" style="gap:8px;flex-wrap:wrap">
              ${sizes.map(sizeChip).join('')}
            </div>
          </div>

          <!-- Quantity stepper -->
          <div>
            <p class="section-label-title" style="margin:0 0 8px">Quantity</p>
            <div class="row" style="align-items:center;gap:12px">
              <div class="cart-line-stepper" style="margin:0">
                <button onclick="Screens.storefront._pdpQty(-1)" aria-label="Decrease quantity" ${selQty <= 1 ? 'disabled' : ''}>−</button>
                <span>${selQty}</span>
                <button onclick="Screens.storefront._pdpQty(1)" aria-label="Increase quantity" ${out || selQty >= product.stock ? 'disabled' : ''}>+</button>
              </div>
              ${out ? '' : `<span class="text-xs text-muted">${product.stock} available</span>`}
            </div>
          </div>

          ${cartQty > 0 ? `
            <p class="text-xs text-muted" style="margin:0">
              You already have <span class="text-bold" style="color:var(--c-ink)">${cartQty}</span> in your cart. Adding now will bring it to ${Math.min(cartQty + selQty, product.stock)}.
            </p>
          ` : ''}
        </div>
      </div>

      <footer class="screen-footer" style="position:fixed;left:0;right:0;bottom:0">
        <button class="btn btn-primary btn-block" ${out ? 'disabled' : ''}
                onclick="Screens.storefront._pdpAddToCart()">
          ${out ? 'Out of stock' : `Add ${selQty} to cart · ${AppData.helpers.money(product.price * selQty)}`}
        </button>
        <button class="btn btn-link" style="text-align:center"
                onclick="navigate('/storefront/${ctx.slug}')">
          ← Keep shopping
        </button>
      </footer>
    </section>
  `;
}

/* --------------- view: cart --------------- */
function renderCart(state, ctx) {
  const lines = cartLines(state);
  const subtotal = cartSubtotal(state);

  if (lines.length === 0) {
    return `
      <section class="screen storefront layout-stack">
        ${storefrontHeader(ctx, { compact: true, title: 'Your cart' })}
        <div class="screen-body app-container">
          ${UI.empty({ title: 'Your cart is empty', sub: 'Tap items in the storefront to add them here.', icon: '🛒' })}
          <button class="btn btn-primary btn-block" onclick="navigate('/storefront/${ctx.slug}')">Back to ${ctx.storeName}</button>
        </div>
      </section>
    `;
  }

  const line = (ln) => {
    const max = ln.product.stock;
    const thumb = ln.product.photoUrl
      ? `<img src="${ln.product.photoUrl}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:12px;flex-shrink:0">`
      : `<div class="list-item-icon" style="background:${ln.product.color};color:white;font-weight:700;width:48px;height:48px;font-size:20px;border-radius:12px">
           ${ln.product.name[0]}
         </div>`;
    return `
      <div class="cart-line">
        ${thumb}
        <div style="flex:1;min-width:0">
          <p class="text-bold" style="margin:0;font-size:14px">${ln.product.name}</p>
          <p class="text-sm text-muted" style="margin:2px 0 0">${AppData.helpers.money(ln.product.price)} each</p>
          <div class="cart-line-stepper">
            <button onclick="Screens.storefront._qty('${ln.productId}', -1)" aria-label="Decrease quantity">−</button>
            <span>${ln.qty}</span>
            <button onclick="Screens.storefront._qty('${ln.productId}', 1)" aria-label="Increase quantity" ${ln.qty >= max ? 'disabled' : ''}>+</button>
            ${ln.qty >= max ? `<span class="text-xs text-warning" style="margin-left:8px;color:var(--c-warning)">max ${max}</span>` : ''}
          </div>
        </div>
        <div style="text-align:right">
          <p class="text-bold" style="margin:0;font-size:14px">${AppData.helpers.money(ln.lineTotal)}</p>
          <button class="btn-link" style="font-size:12px;color:var(--c-danger);padding:4px 0"
                  onclick="Screens.storefront._remove('${ln.productId}')">Remove</button>
        </div>
      </div>
    `;
  };

  return `
    <section class="screen storefront layout-stack">
      ${storefrontHeader(ctx, { compact: true, title: 'Your cart' })}

      <div class="screen-body app-container" style="padding-bottom:120px">
        <div class="card" style="padding:8px">
          ${lines.map(line).join('<div class="divider" style="margin:0"></div>')}
        </div>

        <div class="card" style="padding:14px 16px">
          <div class="row row-between" style="margin-bottom:6px">
            <span class="text-sm text-muted">Subtotal</span>
            <span class="text-sm">${AppData.helpers.money(subtotal)}</span>
          </div>
          <div class="row row-between" style="margin-bottom:6px">
            <span class="text-sm text-muted">Delivery</span>
            <span class="text-sm">Arranged with seller</span>
          </div>
          <div class="divider"></div>
          <div class="row row-between" style="margin-top:10px">
            <span class="text-bold">Total</span>
            <span class="text-bold" style="font-size:18px">${AppData.helpers.money(subtotal)}</span>
          </div>
        </div>
      </div>

      <footer class="screen-footer">
        <button class="btn btn-primary btn-block" onclick="navigate('/storefront/${ctx.slug}/checkout')">
          Checkout · ${AppData.helpers.money(subtotal)}
        </button>
        <button class="btn btn-link" style="text-align:center" onclick="navigate('/storefront/${ctx.slug}')">
          ← Continue shopping
        </button>
      </footer>
    </section>
  `;
}

/* --------------- view: checkout --------------- */
function renderCheckout(state, ctx) {
  const lines = cartLines(state);
  if (lines.length === 0) {
    // Guard: navigated here with empty cart — bounce to grid
    setTimeout(() => navigate(`/storefront/${ctx.slug}`), 0);
    return `<section class="screen storefront layout-stack">${storefrontHeader(ctx, { compact: true, title: 'Checkout' })}<div class="screen-body app-container"></div></section>`;
  }
  const subtotal = cartSubtotal(state);
  const c = state.storefront.customer;

  return `
    <section class="screen storefront layout-stack">
      ${storefrontHeader(ctx, { compact: true, title: 'Checkout' })}

      <div class="screen-body app-container" style="padding-bottom:120px">
        <!-- Order summary -->
        <div class="card" style="padding:14px 16px">
          <p class="section-label-title" style="margin:0 0 8px">Order summary</p>
          ${lines.map(ln => `
            <div class="row row-between" style="padding:4px 0;font-size:13px">
              <span>${ln.product.name} <span class="text-muted">× ${ln.qty}</span></span>
              <span>${AppData.helpers.money(ln.lineTotal)}</span>
            </div>
          `).join('')}
          <div class="divider" style="margin:8px 0"></div>
          <div class="row row-between" style="font-size:15px;font-weight:600">
            <span>Total</span><span>${AppData.helpers.money(subtotal)}</span>
          </div>
        </div>

        <!-- Customer details -->
        <div class="stack stack-md">
          <div class="field">
            <label class="field-label" for="csName">Your name</label>
            <div class="field-input">
              <input id="csName" type="text" maxlength="40" placeholder="e.g. Tendai Moyo" value="${(c.name || '').replace(/"/g,'&quot;')}">
            </div>
          </div>

          <div class="field">
            <label class="field-label" for="csPhone">Phone number</label>
            <div class="field-input">
              <span class="field-input-prefix">+263</span>
              <input id="csPhone" type="tel" inputmode="numeric" placeholder="77 234 5678" maxlength="13" autocomplete="tel-national" value="${c.phone || ''}">
            </div>
            <p class="field-hint">${ctx.storeName} will message you to confirm and arrange delivery.</p>
          </div>
        </div>

        <!-- WABA caveat -->
        ${UI.wabaBanner()}
      </div>

      <footer class="screen-footer">
        <button id="csPlace" class="btn btn-primary btn-block" disabled
                onclick="Screens.storefront._place()">
          Place order · ${AppData.helpers.money(subtotal)}
        </button>
        <p class="text-xs text-subtle text-center" style="margin:0">
          By placing this order you agree to ${ctx.storeName}'s terms.
        </p>
      </footer>
    </section>
  `;
}

function wireCheckout(state) {
  const name  = document.getElementById('csName');
  const phone = document.getElementById('csPhone');
  const btn   = document.getElementById('csPlace');
  if (!name || !phone || !btn) return;

  const fmtPhone = (raw) => {
    const d = raw.replace(/\D/g, '').slice(0, 9);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0,2)} ${d.slice(2)}`;
    return `${d.slice(0,2)} ${d.slice(2,5)} ${d.slice(5)}`;
  };

  const refresh = () => {
    state.storefront.customer.name  = name.value.trim();
    state.storefront.customer.phone = phone.value;
    const validName  = state.storefront.customer.name.length >= 2;
    const validPhone = /^\d{2}\s\d{3}\s\d{4}$/.test(phone.value);
    btn.disabled = !(validName && validPhone);
  };

  name.addEventListener('input', refresh);
  phone.addEventListener('input', (e) => {
    const fmt = fmtPhone(e.target.value);
    e.target.value = fmt;
    refresh();
  });

  if (!name.value) name.focus();
  refresh();
}

/* --------------- view: done --------------- */
function renderDone(state, ctx) {
  const code = state.storefront.lastOrderCode || 'A-00000';

  return `
    <section class="screen storefront layout-stack">
      ${storefrontHeader(ctx, { compact: true, title: 'Order placed' })}

      <div class="screen-body app-container" style="text-align:center;padding-top:32px">
        <div class="stack stack-md" style="align-items:center">
          <div style="width:88px;height:88px;border-radius:24px;background:var(--c-success-bg);color:var(--c-success);display:flex;align-items:center;justify-content:center;margin-bottom:8px">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>

          <h2 style="margin:0;font-size:22px;font-weight:700">Thank you!</h2>
          <p class="text-sm text-muted" style="margin:0;max-width:280px">
            Your order has been sent to ${ctx.storeName}. They'll message you shortly to confirm.
          </p>

          <div class="card" style="padding:14px 16px;background:var(--c-primary-tint);border:1px solid var(--c-primary-soft);width:100%;margin-top:8px">
            <p class="text-xs text-muted" style="margin:0 0 4px;text-transform:uppercase;letter-spacing:0.06em;font-weight:600">Order code</p>
            <p class="text-bold" style="margin:0;font-family:var(--font-mono);font-size:20px;color:var(--c-primary-dark)">${code}</p>
            <p class="text-xs text-muted" style="margin:6px 0 0">Save this — quote it if you need to follow up.</p>
          </div>

          <button class="btn btn-secondary btn-block" style="margin-top:12px"
                  onclick="navigate('/storefront/${ctx.slug}')">
            Browse more from ${ctx.storeName}
          </button>

          <p class="text-xs text-subtle text-center" style="margin:8px 0 0;line-height:1.5;max-width:280px">
            <span class="text-bold">Demo merchant tip:</span> open the order inbox to see this order land in real time.
            <button class="btn-link" style="font-size:12px" onclick="navigate('/inbox')">Open inbox →</button>
          </p>
        </div>
      </div>
    </section>
  `;
}

/* =========================================================================
   PDP mutators — size / qty draft + Add-to-cart from the product page
   ========================================================================= */
window.Screens.storefront._pickSize = function (size) {
  state.storefront.pdp = state.storefront.pdp || {};
  state.storefront.pdp.size = size;
  render();
};

window.Screens.storefront._pdpQty = function (delta) {
  const pdp = state.storefront.pdp || {};
  const product = AppData.products.find(p => p.id === pdp.productId);
  if (!product) return;
  const next = Math.min(Math.max(1, (pdp.qty || 1) + delta), Math.max(1, product.stock));
  pdp.qty = next;
  state.storefront.pdp = pdp;
  render();
};

window.Screens.storefront._pdpAddToCart = function () {
  const pdp = state.storefront.pdp || {};
  const product = AppData.products.find(p => p.id === pdp.productId);
  if (!product || product.stock === 0) return;
  const cart = state.storefront.cart;
  const existing = cart.find(ln => ln.productId === pdp.productId);
  const desired = (pdp.qty || 1);
  if (existing) {
    existing.qty = Math.min(existing.qty + desired, product.stock);
  } else {
    cart.push({ productId: pdp.productId, qty: Math.min(desired, product.stock) });
  }
  // Reset draft + bounce back to the storefront grid so the cart FAB shows.
  const slug = state.route.args[0] || AppData.merchant.storeSlug;
  state.storefront.pdp = null;
  navigate(`/storefront/${slug}`);
};

/* =========================================================================
   Cart mutators (called from inline onclick) — render() afterwards
   ========================================================================= */
window.Screens.storefront._add = function (productId) {
  const cart = state.storefront.cart;
  const existing = cart.find(ln => ln.productId === productId);
  const product = AppData.products.find(p => p.id === productId);
  if (!product || product.stock === 0) return;
  if (existing) {
    if (existing.qty < product.stock) existing.qty += 1;
  } else {
    cart.push({ productId, qty: 1 });
  }
  render();
};

window.Screens.storefront._qty = function (productId, delta) {
  const cart = state.storefront.cart;
  const ln = cart.find(x => x.productId === productId);
  const product = AppData.products.find(p => p.id === productId);
  if (!ln || !product) return;
  const next = ln.qty + delta;
  if (next <= 0) {
    state.storefront.cart = cart.filter(x => x.productId !== productId);
  } else if (next <= product.stock) {
    ln.qty = next;
  }
  render();
};

window.Screens.storefront._remove = function (productId) {
  state.storefront.cart = state.storefront.cart.filter(x => x.productId !== productId);
  render();
};

window.Screens.storefront._place = function () {
  const lines = cartLines(state);
  if (lines.length === 0) return;
  const c = state.storefront.customer;
  if (!c.name || c.name.length < 2 || !/^\d{2}\s\d{3}\s\d{4}$/.test(c.phone)) return;

  const subtotal = cartSubtotal(state);
  const code     = `A-${Math.floor(20000 + Math.random() * 79999)}`;
  const id       = `ord_${Date.now().toString(36)}`;

  const order = {
    id,
    code,
    status: 'new',
    customerName:  c.name,
    customerPhone: '+263 ' + c.phone,
    items: lines.map(ln => ({
      productId: ln.productId,
      name:      ln.product.name,
      qty:       ln.qty,
      price:     ln.product.price,
    })),
    subtotal,
    total: subtotal,
    placedAt: new Date().toISOString(),
    channel:  'storefront',
  };

  // Push to FRONT so it appears first in /inbox
  AppData.orders.unshift(order);

  state.storefront.lastOrderCode = code;
  state.storefront.cart = [];
  // Don't clear customer — they may shop again from same device
  const slug = state.route.args[0] || AppData.merchant.storeSlug;
  navigate(`/storefront/${slug}/done`);
};

/* =========================================================================
   OB-01 — Guided onboarding (5 steps)
   Routes:
     /onboarding/1  Store name + tagline
     /onboarding/2  Brand colour + logo (initial-tile placeholder; photo
                    upload deferred to v1.1)
     /onboarding/3  Add up to 3 starter products (inline form per slot,
                    mirrors into AppData.products)
     /onboarding/4  Pick storefront slug
     /onboarding/5  Share to WhatsApp + finish (real wa.me share)
   ========================================================================= */

window.Screens.onboarding = {
  title: 'Set up your store',
  render(state) {
    const step = parseInt(state.route.args[0] || '1', 10);
    state.onboarding.step = isNaN(step) ? 1 : Math.min(Math.max(step, 1), 5);

    const stepFn = STEPS[state.onboarding.step] || STEPS[1];
    return stepFn.render(state);
  },
  init(state) {
    const step = state.onboarding.step;
    const stepFn = STEPS[step] || STEPS[1];
    if (stepFn.init) stepFn.init(state);
  },
};

/* --------------- Common chrome --------------- */
const STEP_LABELS = ['Name', 'Brand', 'Products', 'Link', 'Share'];

const CHECK_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

function progress(current) {
  const parts = [];
  for (let i = 0; i < STEP_LABELS.length; i++) {
    const n = i + 1;
    const state = n < current ? 'complete' : (n === current ? 'current' : 'upcoming');
    const inner = state === 'complete' ? CHECK_SVG : String(n);
    parts.push(`
      <div class="step-stage" data-state="${state}">
        <div class="step-circle">${inner}</div>
        <span class="step-label">${STEP_LABELS[i]}</span>
      </div>
    `);
    if (i < STEP_LABELS.length - 1) {
      // Connector line is "complete" once the LEFT stage is complete.
      const lineState = n < current ? 'complete' : 'upcoming';
      parts.push(`<div class="step-line" data-state="${lineState}"></div>`);
    }
  }
  return `<div class="step-indicator" role="progressbar" aria-valuenow="${current}" aria-valuemin="1" aria-valuemax="${STEP_LABELS.length}">${parts.join('')}</div>`;
}

function header(state, title) {
  const step = state.onboarding.step;
  const back = step === 1 ? '/auth' : `/onboarding/${step - 1}`;
  return `
    <header class="screen-header">
      <button class="screen-header-back" onclick="navigate('${back}')" aria-label="Back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h1>${title}</h1>
      <span class="text-sm text-muted text-bold">${step}/5</span>
    </header>
  `;
}

function footer(label, enabled, onclick) {
  return `
    <footer class="screen-footer">
      <button class="btn btn-primary btn-block" id="obNext" ${enabled ? '' : 'disabled'}
              onclick="${onclick}">${label}</button>
    </footer>
  `;
}

/* --------------- STEPS --------------- */
const STEPS = {

  /* ============ Step 1 — Store name + tagline ============ */
  1: {
    render(state) {
      const ob = state.onboarding;
      const ok = (ob.storeName || '').trim().length >= 2;
      return `
        <section class="screen">
          ${header(state, 'Name your store')}
          ${progress(1)}
          <div class="screen-body">
            <div class="stack stack-md">
              <p class="text-sm text-muted" style="margin:0">
                This is what customers will see. You can change it later.
              </p>

              <div class="field">
                <label class="field-label" for="obStoreName">Store name</label>
                <div class="field-input">
                  <input id="obStoreName" type="text" placeholder="e.g. Amara Fashion"
                         maxlength="40" value="${ob.storeName || ''}">
                </div>
              </div>

              <div class="field">
                <label class="field-label" for="obTagline">Tagline <span class="text-subtle">(optional)</span></label>
                <div class="field-input">
                  <input id="obTagline" type="text" placeholder="What do you sell?"
                         maxlength="60" value="${ob.tagline || ''}">
                </div>
                <p class="field-hint">A short line under your store name. Example: "Handmade ankara · Harare".</p>
              </div>
            </div>
          </div>
          ${footer('Continue', ok, "Screens.onboarding._save1();navigate('/onboarding/2')")}
        </section>
      `;
    },
    init(state) {
      const name = document.getElementById('obStoreName');
      const tag = document.getElementById('obTagline');
      const next = document.getElementById('obNext');
      if (!name || !next) return;

      const refresh = () => {
        next.disabled = (name.value.trim().length < 2);
      };
      name.addEventListener('input', () => {
        state.onboarding.storeName = name.value;
        refresh();
      });
      tag.addEventListener('input', () => { state.onboarding.tagline = tag.value; });
      name.focus();
    },
  },

  /* ============ Step 2 — Brand colour & logo ============ */
  2: {
    render(state) {
      const ob = state.onboarding;
      const colour = ob.brandColor || '#0D9488';
      const swatches = ['#0D9488', '#0F766E', '#0E7490', '#7C3AED', '#DB2777', '#EA580C', '#D97706', '#65A30D'];
      const initial = (ob.storeName || 'Store').trim()[0].toUpperCase();
      return `
        <section class="screen">
          ${header(state, 'Pick a look')}
          ${progress(2)}
          <div class="screen-body">
            <div class="stack stack-md">
              <p class="text-sm text-muted" style="margin:0">
                Your brand colour shows on your storefront, receipts, and customer notifications.
              </p>

              <div class="row row-center" style="padding:24px 0">
                <div style="width:96px;height:96px;border-radius:24px;background:${colour};display:flex;align-items:center;justify-content:center;color:white;font-size:42px;font-weight:700;box-shadow:var(--shadow-md)">
                  ${initial}
                </div>
              </div>

              <div>
                <p class="field-label" style="margin-bottom:8px">Brand colour</p>
                <div class="row row-sm" style="flex-wrap:wrap;gap:12px" id="obSwatches">
                  ${swatches.map(c => `
                    <button data-colour="${c}" aria-pressed="${c === colour}"
                            style="width:44px;height:44px;border-radius:50%;background:${c};border:3px solid ${c === colour ? 'var(--c-ink)' : 'transparent'};cursor:pointer;transition:transform 0.15s var(--ease-out)"
                            onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"></button>
                  `).join('')}
                </div>
              </div>

              <button class="btn btn-secondary btn-block" onclick="UI.toast('Photo upload arrives in v1.1 — your store initial works for now')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;vertical-align:-3px"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload a logo (optional)
              </button>
            </div>
          </div>
          ${footer('Continue', true, "navigate('/onboarding/3')")}
        </section>
      `;
    },
    init(state) {
      const wrap = document.getElementById('obSwatches');
      if (!wrap) return;
      wrap.querySelectorAll('button[data-colour]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.onboarding.brandColor = btn.dataset.colour;
          render();
        });
      });
    },
  },

  /* ============ Step 3 — Add starter products ============ */
  3: {
    render(state) {
      const ob = state.onboarding;
      if (!ob.products) ob.products = [];
      if (typeof ob.editingProductIdx !== 'number') ob.editingProductIdx = -1;
      const editingIdx = ob.editingProductIdx;
      const count = ob.products.length;
      const ctaLabel = count > 0 ? `Continue · ${count} added` : 'Skip for now';

      const renderSlot = (n) => {
        const idx = n - 1;
        const product = ob.products[idx];
        const isEditing = editingIdx === idx;

        if (isEditing) {
          const d = ob.productDraft || _emptyOBDraft();
          const valid = (d.name || '').trim().length >= 2
                     && !isNaN(parseFloat(d.price)) && parseFloat(d.price) > 0
                     && !isNaN(parseInt(d.stock, 10)) && parseInt(d.stock, 10) >= 0;
          const previewLetter = ((d.name || '?').trim()[0] || '?').toUpperCase();
          const previewTile = d.photoUrl
            ? `<img src="${d.photoUrl}" alt="Product photo" style="width:64px;height:64px;border-radius:14px;object-fit:cover;flex-shrink:0">`
            : `<div style="width:64px;height:64px;border-radius:14px;background:${d.color};color:white;font-weight:700;font-size:26px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${previewLetter}</div>`;
          return `
            <div class="card" style="padding:14px;border:1.5px solid var(--c-primary);background:var(--c-bg)">
              <div class="row row-between" style="margin-bottom:10px;align-items:center">
                <p class="text-bold" style="margin:0">${product ? 'Edit' : 'Add'} product ${n}</p>
                <button class="btn-link text-sm" style="background:none;border:0;cursor:pointer;color:var(--c-ink-muted);padding:4px 8px"
                        onclick="Screens.onboarding._cancelEdit()">Cancel</button>
              </div>

              <div class="stack stack-sm">

                <!-- Photo + preview tile + upload control -->
                <div class="row row-md" style="align-items:center;gap:12px">
                  ${previewTile}
                  <div style="flex:1;min-width:0">
                    <input type="file" id="obProdPhoto" accept="image/*" style="display:none">
                    <button class="btn btn-secondary" type="button" style="width:100%"
                            onclick="document.getElementById('obProdPhoto').click()">
                      ${d.photoUrl ? 'Change photo' : 'Add a photo'}
                    </button>
                    ${d.photoUrl ? `
                      <button class="btn-link text-xs" type="button" style="background:none;border:0;cursor:pointer;color:var(--c-danger);padding:6px 0 0"
                              onclick="Screens.onboarding._clearPhoto()">Remove photo</button>
                    ` : `
                      <p class="text-xs text-subtle" style="margin:6px 0 0">Optional. We'll use the colour swatch below if you skip.</p>
                    `}
                  </div>
                </div>

                <div class="field">
                  <label class="field-label" for="obProdName">Name</label>
                  <div class="field-input">
                    <input id="obProdName" type="text" maxlength="60"
                           value="${(d.name || '').replace(/"/g,'&quot;')}"
                           placeholder="e.g. Ankara wrap dress">
                  </div>
                </div>

                <div class="row row-sm" style="gap:10px">
                  <div class="field" style="flex:1;min-width:0">
                    <label class="field-label" for="obProdPrice">Price (USD)</label>
                    <div class="field-input">
                      <span class="field-input-prefix">$</span>
                      <input id="obProdPrice" type="number" inputmode="decimal" min="0" step="0.01"
                             value="${d.price}" placeholder="0">
                    </div>
                  </div>
                  <div class="field" style="flex:1;min-width:0">
                    <label class="field-label" for="obProdStock">Stock</label>
                    <div class="field-input">
                      <input id="obProdStock" type="number" inputmode="numeric" min="0" step="1"
                             value="${d.stock}" placeholder="0">
                    </div>
                  </div>
                </div>

                <div>
                  <p class="field-label" style="margin-bottom:6px">${d.photoUrl ? 'Fallback colour' : 'Thumbnail colour'} <span class="text-subtle text-xs">${d.photoUrl ? '(used if photo fails to load)' : ''}</span></p>
                  <div class="row row-sm" style="flex-wrap:wrap;gap:8px" id="obProdSwatches">
                    ${OB_PRODUCT_SWATCHES.map(c => `
                      <button data-colour="${c}" aria-pressed="${c === d.color}"
                              style="width:32px;height:32px;border-radius:50%;background:${c};border:3px solid ${c === d.color ? 'var(--c-ink)' : 'transparent'};cursor:pointer;padding:0"></button>
                    `).join('')}
                  </div>
                </div>

                <div class="row row-sm" style="gap:8px;margin-top:6px">
                  <button class="btn btn-primary" id="obProdSave" style="flex:1" ${valid ? '' : 'disabled'}
                          onclick="Screens.onboarding._saveProduct(${idx})">
                    ${product ? 'Update' : 'Add'}
                  </button>
                  ${product ? `<button class="btn btn-secondary" onclick="Screens.onboarding._removeProduct(${idx})">Remove</button>` : ''}
                </div>
              </div>
            </div>
          `;
        }

        if (product) {
          const thumb = product.photoUrl
            ? `<img src="${product.photoUrl}" alt="" class="list-item-icon" style="object-fit:cover;background:transparent">`
            : `<div class="list-item-icon" style="background:${product.color};color:white;font-weight:700">${product.name[0].toUpperCase()}</div>`;
          return `
            <div class="list-item" style="cursor:pointer" onclick="Screens.onboarding._editProduct(${idx})">
              ${thumb}
              <div class="list-item-body">
                <p class="list-item-title">${product.name}</p>
                <p class="list-item-sub">${AppData.helpers.money(product.price)} · ${product.stock} in stock</p>
              </div>
              <span class="text-subtle" aria-hidden="true">Edit ›</span>
            </div>
          `;
        }

        return `
          <div class="list-item" style="cursor:pointer" role="button" tabindex="0"
               onclick="Screens.onboarding._editProduct(${idx})"
               onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();Screens.onboarding._editProduct(${idx})}">
            <div class="list-item-icon" style="background:var(--c-bg-soft);color:var(--c-ink-muted);font-size:18px">${n}</div>
            <div class="list-item-body">
              <p class="list-item-title">Product ${n}</p>
              <p class="list-item-sub">Tap to add</p>
            </div>
            <span class="text-subtle" aria-hidden="true">+</span>
          </div>
        `;
      };

      return `
        <section class="screen">
          ${header(state, 'Add your first products')}
          ${progress(3)}
          <div class="screen-body">
            <div class="stack stack-md">
              <p class="text-sm text-muted" style="margin:0">
                Add 3 things you sell. You can add more later, and edit anything you put in here.
              </p>

              <div class="list">
                ${[1,2,3].map(renderSlot).join('')}
              </div>

              <p class="text-xs text-subtle text-center" style="margin:0">
                You'll be able to add more products on the Inventory screen after onboarding.
              </p>
            </div>
          </div>
          ${footer(ctaLabel, true, "Screens.onboarding._leaveStep3();navigate('/onboarding/4')")}
        </section>
      `;
    },
    init(state) {
      const ob = state.onboarding;
      const editingIdx = ob.editingProductIdx;
      if (typeof editingIdx !== 'number' || editingIdx < 0) return;
      if (!ob.productDraft) return;
      const d = ob.productDraft;

      const nameEl  = document.getElementById('obProdName');
      const priceEl = document.getElementById('obProdPrice');
      const stockEl = document.getElementById('obProdStock');
      const saveEl  = document.getElementById('obProdSave');
      const photoEl = document.getElementById('obProdPhoto');
      if (!nameEl) return;

      const refresh = () => {
        const valid = (d.name || '').trim().length >= 2
                   && !isNaN(parseFloat(d.price)) && parseFloat(d.price) > 0
                   && !isNaN(parseInt(d.stock, 10)) && parseInt(d.stock, 10) >= 0;
        if (saveEl) saveEl.disabled = !valid;
      };

      nameEl.addEventListener('input',  () => { d.name  = nameEl.value;  refresh(); });
      priceEl.addEventListener('input', () => { d.price = priceEl.value; refresh(); });
      stockEl.addEventListener('input', () => { d.stock = stockEl.value; refresh(); });

      if (photoEl) {
        photoEl.addEventListener('change', async (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          try {
            const url = await UI.readImageAsDataUrl(file);
            d.photoUrl = url;
            render();
          } catch (err) {
            UI.toast("Couldn't read that image. Try a JPG or PNG.");
          } finally {
            e.target.value = '';
          }
        });
      }

      const swatches = document.getElementById('obProdSwatches');
      if (swatches) {
        swatches.querySelectorAll('button[data-colour]').forEach(btn => {
          btn.addEventListener('click', () => {
            d.color = btn.dataset.colour;
            render();
          });
        });
      }

      if (!d.name) nameEl.focus();
    },
  },

  /* ============ Step 4 — Storefront slug ============ */
  4: {
    render(state) {
      const ob = state.onboarding;
      const suggested = (ob.storeName || 'your-store')
        .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'your-store';
      const slug = ob.slug || suggested;
      const valid = /^[a-z0-9][a-z0-9-]{1,29}$/.test(slug);
      return `
        <section class="screen">
          ${header(state, 'Your storefront link')}
          ${progress(4)}
          <div class="screen-body">
            <div class="stack stack-md">
              <p class="text-sm text-muted" style="margin:0">
                This is the link you'll share on WhatsApp. Customers tap it to see what you have.
              </p>

              <div class="field">
                <label class="field-label" for="obSlug">urafro.shop /</label>
                <div class="field-input">
                  <span class="field-input-prefix">urafro.shop/</span>
                  <input id="obSlug" type="text" placeholder="amara-fashion"
                         autocomplete="off" autocapitalize="off"
                         maxlength="30" value="${slug}">
                </div>
                <p class="field-hint">Letters, numbers, and dashes only. <span id="slugStatus"></span></p>
              </div>

              <div class="card" style="padding:14px 16px;background:var(--c-bg-soft);border:0">
                <p class="text-xs text-muted" style="margin:0 0 4px;text-transform:uppercase;letter-spacing:0.04em;font-weight:600">Preview</p>
                <p class="text-sm text-bold" style="margin:0;font-family:var(--font-mono);color:var(--c-primary-dark)">
                  https://urafro.shop/<span id="slugPreview">${slug}</span>
                </p>
              </div>
            </div>
          </div>
          ${footer('Looks good', valid, "Screens.onboarding._save4();navigate('/onboarding/5')")}
        </section>
      `;
    },
    init(state) {
      const input = document.getElementById('obSlug');
      const next = document.getElementById('obNext');
      const preview = document.getElementById('slugPreview');
      const status = document.getElementById('slugStatus');
      if (!input) return;

      const refresh = () => {
        const v = input.value.toLowerCase().replace(/[^a-z0-9-]+/g, '');
        if (v !== input.value) input.value = v;
        state.onboarding.slug = v;
        preview.textContent = v || 'your-store';
        const valid = /^[a-z0-9][a-z0-9-]{1,29}$/.test(v);
        next.disabled = !valid;
        status.innerHTML = valid
          ? '<span class="text-success text-bold">Available ✓</span>'
          : (v.length ? '<span class="text-danger">Use letters, numbers, dashes only</span>' : '');
      };

      input.addEventListener('input', refresh);
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
      refresh();
    },
  },

  /* ============ Step 5 — Share & finish ============ */
  5: {
    render(state) {
      const ob = state.onboarding;
      const url = `urafro.shop/${ob.slug || 'your-store'}`;
      return `
        <section class="screen">
          ${header(state, "You're all set")}
          ${progress(5)}
          <div class="screen-body" style="text-align:center;padding-top:32px">
            <div class="stack stack-md" style="align-items:center">
              <div style="width:88px;height:88px;border-radius:24px;background:var(--c-success-bg);color:var(--c-success);display:flex;align-items:center;justify-content:center;margin-bottom:8px">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>

              <h2 style="margin:0;font-size:22px;font-weight:700">${ob.storeName || 'Your store'} is live.</h2>
              <p class="text-sm text-muted" style="margin:0;max-width:280px">
                Share your link on WhatsApp status, your bio, anywhere — customers can browse and order.
              </p>

              <div class="card" style="margin-top:8px;padding:14px 16px;background:var(--c-primary-tint);border:1px solid var(--c-primary-soft);width:100%">
                <p class="text-sm text-bold" style="margin:0;font-family:var(--font-mono);color:var(--c-primary-dark)">
                  ${url}
                </p>
              </div>

              <button class="btn btn-accent btn-block" style="margin-top:8px"
                      onclick="UI.shareWhatsApp('${(ob.storeName || 'my store').replace(/'/g, "\\'")}', 'https://${url}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;vertical-align:-3px"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                Share to WhatsApp
              </button>

              <button class="btn btn-secondary btn-block" onclick="navigate('/inbox')">
                Open my dashboard
              </button>
            </div>
          </div>
        </section>
      `;
    },
  },
};

/* --------------- Persisters (called inline from buttons) --------------- */
window.Screens.onboarding._save1 = function () {
  const name = document.getElementById('obStoreName');
  const tag = document.getElementById('obTagline');
  if (name) state.onboarding.storeName = name.value.trim();
  if (tag) state.onboarding.tagline = tag.value.trim();
};

window.Screens.onboarding._save4 = function () {
  const input = document.getElementById('obSlug');
  if (input) state.onboarding.slug = input.value.trim();
};

/* --------------- Step 3 — product slot handlers --------------- */
const OB_PRODUCT_SWATCHES = [
  '#0D9488', '#0F766E', '#7C3AED', '#DB2777',
  '#EA580C', '#D97706', '#65A30D', '#E8826B',
  '#4A7C9E', '#D4A843',
];

function _emptyOBDraft() {
  return { name: '', price: '', stock: '', color: OB_PRODUCT_SWATCHES[0], photoUrl: null };
}

window.Screens.onboarding._editProduct = function (idx) {
  const ob = state.onboarding;
  if (!ob.products) ob.products = [];
  const existing = ob.products[idx];
  ob.editingProductIdx = idx;
  ob.productDraft = existing
    ? {
        name: existing.name,
        price: String(existing.price),
        stock: String(existing.stock),
        color: existing.color,
        photoUrl: existing.photoUrl || null,
      }
    : _emptyOBDraft();
  render();
};

window.Screens.onboarding._cancelEdit = function () {
  state.onboarding.editingProductIdx = -1;
  state.onboarding.productDraft = null;
  render();
};

window.Screens.onboarding._clearPhoto = function () {
  if (state.onboarding.productDraft) {
    state.onboarding.productDraft.photoUrl = null;
    render();
  }
};

window.Screens.onboarding._saveProduct = function (idx) {
  const ob = state.onboarding;
  const d = ob.productDraft;
  if (!d) return;
  const name  = (d.name || '').trim();
  const price = parseFloat(d.price);
  const stock = parseInt(d.stock, 10);
  if (name.length < 2 || isNaN(price) || price <= 0 || isNaN(stock) || stock < 0) return;

  if (!ob.products) ob.products = [];
  const existing = ob.products[idx];

  const product = {
    id:         existing ? existing.id : `p_ob_${Date.now().toString(36)}_${idx}`,
    name,
    price,
    stock,
    lowStockAt: existing ? existing.lowStockAt : 3,
    category:   existing ? (existing.category || '') : '',
    color:      d.color,
    photoUrl:   d.photoUrl || null,
  };

  ob.products[idx] = product;

  // Mirror into AppData.products so Inventory shows what the merchant added.
  const appIdx = AppData.products.findIndex(p => p.id === product.id);
  if (appIdx >= 0) {
    AppData.products[appIdx] = { ...AppData.products[appIdx], ...product };
  } else {
    AppData.products.push({ ...product });
  }

  ob.editingProductIdx = -1;
  ob.productDraft = null;
  render();
};

window.Screens.onboarding._removeProduct = function (idx) {
  const ob = state.onboarding;
  if (!ob.products) return;
  const existing = ob.products[idx];
  if (existing) {
    AppData.products = AppData.products.filter(p => p.id !== existing.id);
  }
  // Splice out the slot so subsequent slots compact upward — keeps the
  // 3-row layout meaningful (always shows next empty slot below filled ones).
  ob.products.splice(idx, 1);
  ob.editingProductIdx = -1;
  ob.productDraft = null;
  render();
};

// Called when leaving Step 3 — drop any in-flight edit so revisiting the step
// shows the slot list, not a stale form.
window.Screens.onboarding._leaveStep3 = function () {
  state.onboarding.editingProductIdx = -1;
  state.onboarding.productDraft = null;
};

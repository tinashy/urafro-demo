/* =========================================================================
   INV-03 + INV-01 — Inventory list & product editor
   Routes:
     /inventory             list of all products (low-stock first), tap to edit
     /product/new           empty form (add a new product)
     /product/<id>          edit an existing product

   State writes:
     - AppData.products (in-place mutation; no persistence layer)
     - state.inventory.sort        list ordering ('low-first' | 'a-z' | 'value')
     - state.inventory.flash       one-shot toast message for the next render
     - state.productDraft          form draft, persists across re-renders so
                                   colour-swatch clicks don't wipe the inputs

   Notes:
     - Overrides the placeholder registrations for keys 'inventory' and
       'product' (this file is included AFTER placeholder.js in index.html).
     - Form validates name (>= 2 chars) and price (> 0). Stock defaults to 0.
     - Saving navigates back to /inventory; deleting from edit-mode does too.
   ========================================================================= */

const SWATCHES = ['#0D9488', '#0F766E', '#0E7490', '#7C3AED', '#DB2777',
                  '#EA580C', '#D97706', '#65A30D', '#E8826B', '#4A7C9E',
                  '#E8DFCF', '#D4A843'];

/* --------------- helpers --------------- */
function sortProducts(list, mode) {
  const out = list.slice();
  if (mode === 'a-z') {
    out.sort((a, b) => a.name.localeCompare(b.name));
  } else if (mode === 'value') {
    out.sort((a, b) => (b.price * b.stock) - (a.price * a.stock));
  } else {
    // low-first: out-of-stock first, then low-stock, then in-stock; tiebreak by name
    const rank = (p) => p.stock === 0 ? 0 : (p.stock <= p.lowStockAt ? 1 : 2);
    out.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  }
  return out;
}

function emptyDraft() {
  return {
    id: null,                  // null = new product
    name: '',
    price: '',
    stock: '',
    lowStockAt: 3,
    category: '',
    color: SWATCHES[0],
    photoUrl: null,
  };
}

function draftFromProduct(p) {
  return {
    id: p.id,
    name: p.name,
    price: String(p.price),
    stock: String(p.stock),
    lowStockAt: p.lowStockAt,
    category: p.category || '',
    color: p.color || SWATCHES[0],
    photoUrl: p.photoUrl || null,
  };
}

function validateDraft(d) {
  const name = (d.name || '').trim();
  const price = parseFloat(d.price);
  const stock = parseInt(d.stock, 10);
  return {
    name: name.length >= 2,
    price: !isNaN(price) && price > 0,
    stock: !isNaN(stock) && stock >= 0,
    all() { return this.name && this.price && this.stock; },
  };
}

function flashBanner() {
  const f = state.inventory.flash;
  if (!f) return '';
  state.inventory.flash = null;
  return `<div class="flash-toast" role="status">${f}</div>`;
}

/* =========================================================================
   INV-03 — Inventory list
   ========================================================================= */
window.Screens.inventory = {
  title: 'Inventory',
  render(state) {
    const sort = state.inventory.sort || 'low-first';
    const products = sortProducts(AppData.products, sort);
    const total = products.length;
    const lowCount = products.filter(p => p.stock > 0 && p.stock <= p.lowStockAt).length;
    const outCount = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((s, p) => s + (p.price * p.stock), 0);

    const sortChip = (key, label) =>
      `<button class="chip" aria-pressed="${sort === key}" data-sort="${key}">${label}</button>`;

    const row = (p) => {
      const pill = AppData.helpers.stockPill(p.stock, p.lowStockAt);
      const thumb = p.photoUrl
        ? `<img src="${p.photoUrl}" alt="" class="list-item-icon" style="object-fit:cover;background:transparent">`
        : `<div class="list-item-icon" style="background:${p.color};color:white;font-weight:700">${p.name[0]}</div>`;
      return `
        <div class="list-item" onclick="navigate('/product/${p.id}')">
          ${thumb}
          <div class="list-item-body">
            <p class="list-item-title">${p.name}</p>
            <p class="list-item-sub">
              ${AppData.helpers.money(p.price)} · ${p.stock} in stock
              ${p.category ? ` · <span class="text-subtle">${p.category}</span>` : ''}
            </p>
          </div>
          <span class="pill ${pill.cls}">${pill.label}</span>
        </div>
      `;
    };

    const empty = `
      ${UI.empty({
        title: 'No products yet',
        sub: 'Add your first product to start taking orders.',
        icon: '📦',
      })}
      <div style="padding:0 20px"><button class="btn btn-primary btn-block" onclick="navigate('/product/new')">+ Add product</button></div>
    `;

    return `
      <section class="screen">
        ${UI.header({
          title: 'Inventory',
          back: '/inbox',
          action: { label: '+ Add', onClick: "navigate('/product/new')" },
        })}

        ${flashBanner()}

        <div class="screen-body" style="padding-bottom:88px">

          <!-- Top stats strip -->
          <div class="row row-sm" style="gap:8px">
            <div class="card" style="flex:1;padding:12px 14px">
              <p class="text-xs text-muted" style="margin:0">Products</p>
              <p class="text-lg text-bold" style="margin:2px 0 0">${total}</p>
            </div>
            <div class="card" style="flex:1;padding:12px 14px">
              <p class="text-xs text-muted" style="margin:0">Low / out</p>
              <p class="text-lg text-bold" style="margin:2px 0 0;color:${(lowCount + outCount) ? 'var(--c-warning)' : 'var(--c-ink)'}">
                ${lowCount + outCount}
              </p>
            </div>
            <div class="card" style="flex:1.4;padding:12px 14px">
              <p class="text-xs text-muted" style="margin:0">Stock value</p>
              <p class="text-lg text-bold" style="margin:2px 0 0">${AppData.helpers.money(totalValue)}</p>
            </div>
          </div>

          <!-- Sort chips -->
          <div class="row row-sm" style="gap:8px;flex-wrap:wrap" id="invSortChips">
            ${sortChip('low-first', 'Low stock first')}
            ${sortChip('a-z',       'A–Z')}
            ${sortChip('value',     'By value')}
          </div>

          <!-- Product list -->
          ${total === 0 ? empty : `<div class="list">${products.map(row).join('')}</div>`}

          ${total > 0 ? `
            <button class="btn btn-secondary btn-block" onclick="navigate('/product/new')" style="margin-top:8px">
              + Add another product
            </button>` : ''}
        </div>

        ${UI.tabBar('inventory')}
      </section>
    `;
  },
  init(state) {
    const wrap = document.getElementById('invSortChips');
    if (!wrap) return;
    wrap.querySelectorAll('button[data-sort]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.inventory.sort = btn.dataset.sort;
        render();
      });
    });
  },
};

/* =========================================================================
   INV-01 — Product editor (new + edit share the same form)
   ========================================================================= */
window.Screens.product = {
  title: 'Product',
  render(state) {
    const arg = state.route.args[0];
    const isNew = !arg || arg === 'new';

    // Seed draft if route changed
    if (!state.productDraft || state.productDraft._for !== arg) {
      if (isNew) {
        state.productDraft = { ...emptyDraft(), _for: 'new' };
      } else {
        const product = AppData.products.find(p => p.id === arg);
        state.productDraft = product
          ? { ...draftFromProduct(product), _for: arg }
          : { ...emptyDraft(), _for: arg };
      }
    }

    const d = state.productDraft;
    const v = validateDraft(d);
    const headerTitle = isNew ? 'Add product' : 'Edit product';

    return `
      <section class="screen">
        ${UI.header({ title: headerTitle, back: '/inventory' })}

        <div class="screen-body">
          <div class="stack stack-md">

            <!-- Live preview -->
            <div class="card" style="padding:16px;display:flex;align-items:center;gap:14px">
              ${d.photoUrl
                ? `<img src="${d.photoUrl}" alt="Product photo" style="width:56px;height:56px;border-radius:14px;object-fit:cover;flex-shrink:0">`
                : `<div class="list-item-icon" style="background:${d.color};color:white;font-weight:700;width:56px;height:56px;font-size:22px;border-radius:14px">
                     ${(d.name || '?').trim()[0]?.toUpperCase() || '?'}
                   </div>`}
              <div style="flex:1;min-width:0">
                <p class="text-bold" style="margin:0;font-size:15px">${d.name.trim() || 'Product name'}</p>
                <p class="text-sm text-muted" style="margin:2px 0 0">
                  ${d.price ? AppData.helpers.money(parseFloat(d.price) || 0) : '$ —'}
                  ${d.stock !== '' ? ` · ${parseInt(d.stock,10) || 0} in stock` : ''}
                </p>
              </div>
            </div>

            <!-- Photo upload -->
            <div class="field">
              <label class="field-label">Product photo <span class="text-subtle">(optional)</span></label>
              <input type="file" id="prPhoto" accept="image/*" style="display:none">
              <button class="btn btn-secondary" type="button" style="width:100%"
                      onclick="document.getElementById('prPhoto').click()">
                ${d.photoUrl ? 'Change photo' : 'Add a photo'}
              </button>
              ${d.photoUrl ? `
                <button class="btn-link text-xs" type="button" style="background:none;border:0;cursor:pointer;color:var(--c-danger);padding:8px 0 0"
                        onclick="Screens.product._clearPhoto()">Remove photo</button>
              ` : `
                <p class="field-hint">If skipped, the colour swatch below is used as the thumbnail.</p>
              `}
            </div>

            <div class="field">
              <label class="field-label" for="prName">Name</label>
              <div class="field-input">
                <input id="prName" type="text" maxlength="60" value="${d.name.replace(/"/g,'&quot;')}" placeholder="e.g. Ankara Wrap Dress — Sunset">
              </div>
            </div>

            <div class="row row-sm" style="gap:12px">
              <div class="field" style="flex:1">
                <label class="field-label" for="prPrice">Price (USD)</label>
                <div class="field-input">
                  <span class="field-input-prefix">$</span>
                  <input id="prPrice" type="number" inputmode="decimal" min="0" step="0.01" value="${d.price}" placeholder="0">
                </div>
              </div>
              <div class="field" style="flex:1">
                <label class="field-label" for="prStock">Stock</label>
                <div class="field-input">
                  <input id="prStock" type="number" inputmode="numeric" min="0" step="1" value="${d.stock}" placeholder="0">
                </div>
              </div>
            </div>

            <div class="field">
              <label class="field-label" for="prLow">Low-stock alert at</label>
              <div class="field-input">
                <input id="prLow" type="number" inputmode="numeric" min="0" step="1" value="${d.lowStockAt}">
                <span class="text-sm text-muted" style="padding-left:8px">left</span>
              </div>
              <p class="field-hint">We'll flag this product when stock drops to this number.</p>
            </div>

            <div class="field">
              <label class="field-label" for="prCat">Category <span class="text-subtle">(optional)</span></label>
              <div class="field-input">
                <input id="prCat" type="text" maxlength="30" value="${d.category.replace(/"/g,'&quot;')}" placeholder="e.g. Dresses, Knitwear">
              </div>
            </div>

            <div>
              <p class="field-label" style="margin-bottom:8px">${d.photoUrl ? 'Fallback colour' : 'Thumbnail colour'} <span class="text-subtle text-xs">${d.photoUrl ? '(used if photo fails to load)' : ''}</span></p>
              <div class="row row-sm" style="flex-wrap:wrap;gap:10px" id="prSwatches">
                ${SWATCHES.map(c => `
                  <button data-colour="${c}" aria-pressed="${c === d.color}"
                          style="width:38px;height:38px;border-radius:50%;background:${c};border:3px solid ${c === d.color ? 'var(--c-ink)' : 'transparent'};cursor:pointer;transition:transform 0.15s var(--ease-out)"
                          onmouseover="this.style.transform='scale(1.06)'" onmouseout="this.style.transform='scale(1)'"></button>
                `).join('')}
              </div>
            </div>

            ${!isNew ? `
              <button class="btn btn-link" style="color:var(--c-danger);align-self:flex-start;padding-top:8px"
                      onclick="Screens.product._delete('${d.id}')">
                Delete this product
              </button>
            ` : ''}
          </div>
        </div>

        <footer class="screen-footer">
          ${isNew ? `
            <button class="btn btn-primary btn-block" id="prSave" ${v.all() ? '' : 'disabled'}
                    onclick="Screens.product._save({addAnother:false})">Save product</button>
            <button class="btn btn-secondary btn-block" id="prSaveAnother" ${v.all() ? '' : 'disabled'}
                    onclick="Screens.product._save({addAnother:true})">Save and add another</button>
          ` : `
            <button class="btn btn-primary btn-block" id="prSave" ${v.all() ? '' : 'disabled'}
                    onclick="Screens.product._save({addAnother:false})">Save changes</button>
          `}
        </footer>
      </section>
    `;
  },
  init(state) {
    const d = state.productDraft;
    const name  = document.getElementById('prName');
    const price = document.getElementById('prPrice');
    const stock = document.getElementById('prStock');
    const low   = document.getElementById('prLow');
    const cat   = document.getElementById('prCat');
    const save  = document.getElementById('prSave');
    const saveAnother = document.getElementById('prSaveAnother');
    const photoEl = document.getElementById('prPhoto');
    if (!name) return;

    const refresh = () => {
      const v = validateDraft(d);
      if (save) save.disabled = !v.all();
      if (saveAnother) saveAnother.disabled = !v.all();
    };

    name.addEventListener('input',  () => { d.name       = name.value;        refresh(); });
    price.addEventListener('input', () => { d.price      = price.value;       refresh(); });
    stock.addEventListener('input', () => { d.stock      = stock.value;       refresh(); });
    low.addEventListener('input',   () => { d.lowStockAt = parseInt(low.value, 10) || 0; });
    cat.addEventListener('input',   () => { d.category   = cat.value; });

    // Colour swatches: re-render so the preview tile picks up the new colour.
    const wrap = document.getElementById('prSwatches');
    wrap.querySelectorAll('button[data-colour]').forEach(btn => {
      btn.addEventListener('click', () => {
        d.color = btn.dataset.colour;
        render();
      });
    });

    // Photo upload: read file → downscale → data URL, then re-render so the
    // preview tile and Change/Remove controls reflect the new photo.
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

    if (!d.name) name.focus();
  },
};

window.Screens.product._clearPhoto = function () {
  if (state.productDraft) {
    state.productDraft.photoUrl = null;
    render();
  }
};

/* --------------- product save / delete --------------- */
window.Screens.product._save = function ({ addAnother }) {
  const d = state.productDraft;
  const v = validateDraft(d);
  if (!v.all()) return;

  const clean = {
    name:       d.name.trim(),
    price:      parseFloat(d.price),
    stock:      parseInt(d.stock, 10),
    lowStockAt: parseInt(d.lowStockAt, 10) || 0,
    category:   d.category.trim(),
    color:      d.color,
    photoUrl:   d.photoUrl || null,
  };

  if (d.id) {
    // Edit
    const i = AppData.products.findIndex(p => p.id === d.id);
    if (i >= 0) AppData.products[i] = { ...AppData.products[i], ...clean };
    state.inventory.flash = `${clean.name} updated`;
  } else {
    // New
    const id = `p_${Date.now().toString(36)}`;
    AppData.products.push({ id, ...clean });
    state.inventory.flash = `${clean.name} added`;
  }

  // Reset draft so a subsequent /product/new gets a clean slate.
  state.productDraft = null;

  if (addAnother) {
    navigate('/product/new');
  } else {
    navigate('/inventory');
  }
};

window.Screens.product._delete = function (id) {
  const p = AppData.products.find(x => x.id === id);
  if (!p) { navigate('/inventory'); return; }
  if (!confirm(`Delete "${p.name}"? This can't be undone in the demo.`)) return;
  AppData.products = AppData.products.filter(x => x.id !== id);
  state.productDraft = null;
  state.inventory.flash = `${p.name} deleted`;
  navigate('/inventory');
};

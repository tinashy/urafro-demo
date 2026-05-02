/* =========================================================================
   Shared screen partials — building blocks every screen can import.
   Exposed on window.UI to keep usage concise inside screen files.
   Also initialises window.Screens so screen modules can register before
   app.js loads (app.js is last in the script order — see index.html).
   ========================================================================= */

window.Screens = window.Screens || {};

window.UI = {
  
  container(children = '', className = '') {
    return `<div class="app-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${className}">${children}</div>`;
  },

  section(children = '', className = '') {
    return `<section class="app-section py-12 sm:py-16 lg:py-20 ${className}">${children}</section>`;
  },

  card(children = '', className = '') {
    return `<div class="card p-4 sm:p-5 border border-stone-200 rounded-xl shadow-sm bg-white ${className}">${children}</div>`;
  },

  input(attrs = '', className = '') {
    return `<input class="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${className}" ${attrs}>`;
  },

  button(label, attrs = '', className = '') {
    return `<button class="btn inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 rounded-xl font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors ${className}" ${attrs}>${label}</button>`;
  },

  stack(children = '', rowOnDesktop = false, className = '') {
    const mode = rowOnDesktop ? 'layout-stack-lg-row' : 'layout-stack';
    return `<div class="${mode} ${className}">${children}</div>`;
  },
/** Standard screen header with back arrow + title + optional right action */
  header({ title, back = null, action = null }) {
    const backEl = back
      ? `<button class="screen-header-back" onclick="${typeof back === 'string' ? `navigate('${back}')` : back}" aria-label="Back">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
         </button>`
      : '<span style="width:40px"></span>';
    const actionEl = action
      ? `<button class="screen-header-action" onclick="${action.onClick}">${action.label}</button>`
      : '<span style="width:40px"></span>';
    return `<header class="screen-header px-4 sm:px-6 lg:px-8">${backEl}<h1>${title}</h1>${actionEl}</header>`;
  },

  /** Bottom tab bar — 4 slots. Pass current screen key to highlight. */
  tabBar(current) {
    const item = (key, label, path, icon) =>
      `<a href="#${path}" aria-current="${current === key ? 'page' : 'false'}">
         ${icon}<span>${label}</span>
       </a>`;

    const iconOrders   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`;
    const iconInv      = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`;
    const iconStore    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1-4h16l1 4"/><path d="M5 9v11h14V9"/><path d="M9 9a3 3 0 01-6 0"/><path d="M15 9a3 3 0 01-6 0"/><path d="M21 9a3 3 0 01-6 0"/></svg>`;
    const iconMore     = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>`;

    return `
      <nav class="tab-bar">
        ${item('inbox',     'Orders',    '/inbox',     iconOrders)}
        ${item('inventory', 'Inventory', '/inventory', iconInv)}
        ${item('store',     'Store',     '/store',     iconStore)}
        ${item('more',      'More',      '/more',      iconMore)}
      </nav>
    `;
  },

  /** Chip row — used above the /coming roadmap for the time filter.
   *  Calls render() directly (not navigate) so the chips re-render in place
   *  when the user is already on /coming. Navigating to the same hash skips
   *  the browser's hashchange event, so the screen would never refresh. */
  comingChips(activeKey = 'now') {
    const chip = (key, label) =>
      `<button class="chip" aria-pressed="${activeKey === key}" onclick="state.roadmapFilter='${key}';render()">${label}</button>`;
    return `
      <div class="chip-row flex flex-wrap gap-2">
        ${chip('now',      'Now')}
        ${chip('3mo',      '3 months')}
        ${chip('6mo',      '6 months')}
      </div>
    `;
  },

  /** WABA caveat banner — shown on screens where WABA approval is conditional */
  wabaBanner() {
    return `
      <div class="demo-badge-wa">
        <strong>Heads-up:</strong> WhatsApp notifications depend on WABA approval. If pending, we fall back to SMS in v1.
      </div>
    `;
  },

  /** Product thumbnail (colour swatch placeholder — no image assets in scaffold) */
  productThumb(product, size = 40) {
    return `<div class="list-item-icon" style="background:${product.color || '#CCFBF1'};color:white;width:${size}px;height:${size}px;font-size:${size*0.45}px">
              ${(product.name || '?').slice(0,1)}
            </div>`;
  },

  /** Empty state */
  empty({ title, sub, icon = '📭' }) {
    return `
      <div class="empty">
        <div style="font-size:40px">${icon}</div>
        <p class="empty-title">${title}</p>
        <p class="empty-sub">${sub || ''}</p>
      </div>
    `;
  },

  /** Full-screen placeholder for any screen not yet built */
  placeholderScreen({ title, note }) {
    return `
      <section class="screen flex flex-col min-h-full">
        ${UI.header({ title, back: '/coming' })}
        <div class="screen-body app-container app-section flex items-center justify-center text-center">
          <div style="width:72px;height:72px;border-radius:20px;background:var(--c-primary-soft);color:var(--c-primary-dark);display:flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px">🛠️</div>
          <h2 class="text-xl mb-2">${title}</h2>
          <p class="text-muted" style="max-width:280px">${note || "We're still building this one — see the roadmap for an ETA."}</p>
        </div>
      </section>
    `;
  },

  /** Small labelled row (key-value) used in order detail, etc */
  kv(label, value) {
    return `<div class="row row-between py-1.5">
              <span class="text-sm text-muted">${label}</span>
              <span class="text-sm text-bold">${value}</span>
            </div>`;
  },

  /** Transient, non-blocking message. Replaces alert() across the demo so
   *  features-not-yet-built communicate as roadmap UX, not as dev TODOs. */
  toast(message, kind = 'info') {
    let host = document.getElementById('uiToastHost');
    if (!host) {
      host = document.createElement('div');
      host.id = 'uiToastHost';
      host.className = 'toast-host';
      document.body.appendChild(host);
    }
    const el = document.createElement('div');
    el.className = `toast toast-${kind}`;
    el.textContent = message;
    el.setAttribute('role', 'status');
    host.appendChild(el);
    // Trigger entrance animation on the next frame
    requestAnimationFrame(() => el.classList.add('toast-in'));
    setTimeout(() => {
      el.classList.add('toast-out');
      setTimeout(() => el.remove(), 220);
    }, 2400);
  },

  /** Open WhatsApp's universal share sheet with a pre-filled storefront message. */
  shareWhatsApp(storeName, url) {
    const msg = `Hi! Here's my storefront for ${storeName} — browse and order: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  },

  /** Build the live storefront URL for a slug — uses the current deploy
   *  origin so the same code works on file://, localhost, and the deployed
   *  pages.dev / urafro.shop hostname. The path uses the hash router that
   *  app.js parses, so /#/storefront/<slug> lands a customer on the grid. */
  storefrontUrl(slug) {
    const origin = (typeof window !== 'undefined' && window.location && window.location.origin) || '';
    // Strip trailing index.html (file:// URLs include it) so the result is clean.
    const base = origin.replace(/\/index\.html$/, '');
    return `${base}/#/storefront/${slug}`;
  },

  /** Short, merchant-pretty version of the URL for display in copy/share UI.
   *  Keeps the host + slug, drops the protocol + any "/#/storefront/" plumbing
   *  so the merchant sees something that looks like a real storefront link. */
  storefrontDisplay(slug) {
    const url = UI.storefrontUrl(slug);
    return url.replace(/^https?:\/\//, '').replace('/#/storefront/', '/');
  },

  /** Open a direct WhatsApp chat to a specific phone number with a pre-filled message.
   *  `phone` accepts E.164 with or without leading "+"; non-digits are stripped for wa.me. */
  openWhatsApp(phone, message) {
    const digits = String(phone || '').replace(/\D/g, '');
    const text = encodeURIComponent(message || '');
    window.open(`https://wa.me/${digits}?text=${text}`, '_blank', 'noopener');
  },

  /** Read a File (image) into a downscaled JPEG data URL.
   *  Caps the long side at maxDim to keep in-memory thumbnails light.
   *  Returns a promise resolving to the data URL, or rejecting on error. */
  readImageAsDataUrl(file, { maxDim = 600, quality = 0.85 } = {}) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type || '')) {
        reject(new Error('Not an image file'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error || new Error('Read failed'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Image decode failed'));
        img.onload = () => {
          const longest = Math.max(img.width, img.height) || 1;
          const scale = Math.min(1, maxDim / longest);
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          try { resolve(canvas.toDataURL('image/jpeg', quality)); }
          catch (e) { reject(e); }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  },
};

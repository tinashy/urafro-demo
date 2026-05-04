/* =========================================================================
   STR-01 — Storefront preview (merchant control panel)
   Route: /store

   The merchant's view of their public storefront link. This is the
   "share-this-link" pitch screen — it's where they grab the URL, see
   how customers will see them, and (eventually) toggle store-wide
   settings.

   Reads:
     - state.onboarding.slug / storeName / brandColor / tagline (if user
       just finished onboarding) OR
     - AppData.merchant.* (the seeded fixture)
     - AppData.products (for the at-a-glance count)

   Writes: nothing (read-only screen).

   Notes:
     - "Copy link" tries the Clipboard API, falls back to a temporary
       textarea selection so it works on file:// previews.
     - "Share to WhatsApp" opens wa.me/?text=… in a new tab — the
       universal share link that prompts to pick a chat.
     - "Preview as customer" routes to /storefront/<slug> (built next as
       STR-02; placeholder will catch it until then).
   ========================================================================= */

window.Screens.store = {
  title: 'Your storefront',
  render(state) {
    // Prefer onboarding state if it's been filled in (fresh signup flow);
    // otherwise fall back to the Amara Fashion fixture.
    const ob = state.onboarding || {};
    const m  = AppData.merchant;
    const slug       = (ob.slug && ob.slug.length) ? ob.slug : m.storeSlug;
    const storeName  = (ob.storeName && ob.storeName.length) ? ob.storeName : m.storeName;
    const tagline    = (ob.tagline && ob.tagline.length) ? ob.tagline : m.tagline;
    const brandColor = ob.brandColor || m.brandColor;
    const initial    = (storeName || 'S').trim()[0].toUpperCase();

    const liveProducts   = AppData.products.length;
    const inStock        = AppData.products.filter(p => p.stock > 0).length;
    // Display string is intentionally short ("urafro-demo.pages.dev/amara-fashion");
    // the actual share/copy uses the full hash-routed URL so customers land
    // on the storefront grid wherever the demo is deployed.
    const url            = UI.storefrontDisplay(slug);
    const fullUrl        = UI.storefrontUrl(slug);

    return `
      <section class="screen">
        ${UI.header({
          title: 'Your storefront',
          back: '/inbox',
          action: { label: 'Settings', onClick: "UI.toast('More storefront settings land within 3 months')" },
        })}

        <div class="screen-body" style="padding-bottom:88px">

          <!-- Brand card: how customers see you at a glance -->
          <div class="card" style="padding:0;overflow:hidden;border:0;box-shadow:var(--shadow-md)">
            <div style="background:linear-gradient(135deg, ${brandColor} 0%, ${brandColor}DD 100%);padding:24px 20px 20px;color:white">
              <div class="row row-md" style="align-items:center;gap:14px">
                <div style="width:56px;height:56px;border-radius:16px;background:rgba(255,255,255,0.2);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;flex-shrink:0">
                  ${initial}
                </div>
                <div style="min-width:0;flex:1">
                  <p class="text-bold" style="margin:0;font-size:18px;letter-spacing:-0.01em">${storeName}</p>
                  <p style="margin:2px 0 0;font-size:13px;opacity:0.9">${tagline || 'Your storefront'}</p>
                </div>
              </div>
              <div class="row row-sm" style="gap:16px;margin-top:18px;font-size:13px">
                <span><span class="text-bold">${liveProducts}</span> products</span>
                <span style="opacity:0.7">·</span>
                <span><span class="text-bold">${inStock}</span> in stock</span>
                <span style="opacity:0.7">·</span>
                <span><span class="pill" style="background:rgba(255,255,255,0.22);color:white;padding:2px 8px;font-size:11px">Live</span></span>
              </div>
            </div>
          </div>

          <!-- Link block — the actual deliverable of this whole product -->
          <div>
            <p class="section-label-title" style="padding:0 4px 8px">Your shareable link</p>
            <div class="card" style="padding:14px 14px 14px 16px;display:flex;align-items:center;gap:10px">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary-dark)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
              <p class="text-bold" style="margin:0;font-family:var(--font-mono);color:var(--c-primary-dark);font-size:14px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${url}</p>
            </div>

            <div class="row row-sm" style="gap:10px;margin-top:10px">
              <button class="btn btn-secondary" style="flex:1" id="storeCopyBtn"
                      onclick="Screens.store._copy('${fullUrl}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                <span id="storeCopyLabel">Copy link</span>
              </button>
              <button class="btn btn-accent" style="flex:1" onclick="Screens.store._shareWhatsApp('${storeName.replace(/'/g, "\\'")}', '${fullUrl}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right:6px">
                  <path d="M20.52 3.48A12 12 0 003.48 20.52L2 22l1.5-.4A12 12 0 1020.52 3.48zM12 21.5a9.45 9.45 0 01-4.85-1.33l-.35-.21-3.59.94.96-3.5-.23-.37A9.5 9.5 0 1112 21.5zm5.27-7.1c-.29-.14-1.7-.84-1.97-.94-.26-.1-.45-.14-.64.14-.19.29-.74.94-.91 1.13-.17.19-.34.21-.62.07-.29-.14-1.21-.45-2.31-1.42-.85-.76-1.43-1.7-1.6-1.99-.17-.29-.02-.45.13-.59.13-.13.29-.34.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.55-.88-2.12-.23-.55-.46-.48-.64-.49-.17-.01-.36-.01-.55-.01s-.5.07-.76.36c-.26.29-1 .98-1 2.39s1.02 2.77 1.17 2.96c.14.19 2.02 3.09 4.9 4.34.69.3 1.22.48 1.64.62.69.22 1.32.19 1.81.12.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34z"/>
                </svg>
                Share to WhatsApp
              </button>
            </div>

            <p class="text-xs text-muted" style="margin:10px 4px 0;line-height:1.5">
              Paste this link in your WhatsApp status, your bio, or DM it to a customer.
              When they tap it, they'll see your storefront and can place an order — no app needed on their side.
            </p>
          </div>

          <!-- Preview as customer — the most important reassurance button -->
          <div>
            <p class="section-label-title" style="padding:0 4px 8px">See what customers see</p>
            <button class="btn btn-secondary btn-block" onclick="navigate('/storefront/${slug}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Preview as customer
            </button>
            <p class="text-xs text-muted" style="margin:8px 4px 0;line-height:1.5">
              Opens your storefront the way a customer would see it. Tap any product, fill the cart, and you'll see what arrives in your order inbox.
            </p>
          </div>

          <!-- Storefront polish (Sunday static — placeholder for now) -->
          <div>
            <p class="section-label-title" style="padding:0 4px 8px">Make it yours</p>
            <div class="list">
              <div class="list-item" onclick="UI.toast('Brand colour locks in at signup. A re-edit screen lands within 3 months.')">
                <div class="list-item-icon" style="background:${brandColor};color:white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 010 18"/></svg>
                </div>
                <div class="list-item-body">
                  <p class="list-item-title">Brand colour</p>
                  <p class="list-item-sub" style="font-family:var(--font-mono);font-size:12px">${brandColor.toUpperCase()}</p>
                </div>
                <span class="text-subtle">›</span>
              </div>

              <div class="list-item" onclick="UI.toast('Custom domains arrive within 6 months')">
                <div class="list-item-icon" style="background:var(--c-info-bg);color:var(--c-info)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                </div>
                <div class="list-item-body">
                  <p class="list-item-title">Custom domain</p>
                  <p class="list-item-sub">Use your own URL · within 6 months</p>
                </div>
                <span class="text-subtle">›</span>
              </div>

              <div class="list-item" onclick="UI.toast('Layout options arrive within 3 months')">
                <div class="list-item-icon" style="background:var(--c-warning-bg);color:var(--c-warning)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                </div>
                <div class="list-item-body">
                  <p class="list-item-title">Layout & display</p>
                  <p class="list-item-sub">Grid, prices, contact card</p>
                </div>
                <span class="text-subtle">›</span>
              </div>
            </div>
          </div>
        </div>

        ${UI.tabBar('store')}
      </section>
    `;
  },
};

/* --------------- copy + share helpers --------------- */
window.Screens.store._copy = async function (url) {
  const label = document.getElementById('storeCopyLabel');
  let ok = false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      ok = true;
    } else {
      // Fallback for file:// previews + older browsers
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      ok = document.execCommand('copy');
      document.body.removeChild(ta);
    }
  } catch (e) { ok = false; }

  if (label) {
    const original = label.textContent;
    label.textContent = ok ? 'Copied ✓' : 'Copy failed';
    setTimeout(() => { label.textContent = original; }, 1600);
  }
};

window.Screens.store._shareWhatsApp = function (storeName, url) {
  UI.shareWhatsApp(storeName, url);
};

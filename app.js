/* =========================================================================
   urAfro demo — router + bootstrap
   Hash-based router. Every screen registers itself on window.Screens[key]
   with { title, render(state) => htmlString, init?(state) }.
   =========================================================================
   Route format: #/<screen>/<arg1>/<arg2>
   Examples:
     #/auth                    → auth screen
     #/onboarding/2            → onboarding step 2
     #/product/p_001           → product detail for p_001
     #/order/ord_003           → order detail for ord_003
   ========================================================================= */

window.Screens = window.Screens || {};

// Global in-memory state. Mutate freely from screens; call render() after.
window.state = {
  route: { screen: 'auth', args: [] },
  auth: { phoneDraft: '', otp: '' },
  onboarding: { step: 1, storeName: '', tagline: '', slug: '', products: [], editingProductIdx: -1, productDraft: null },
  inbox: { filter: 'all' }, // all | new | confirmed | fulfilled | cancelled
  inventory: {
    sort: 'low-first',
    search: '',           // free-text product search
    stockFilter: 'all',   // all | low | out | in
    selectMode: false,    // bulk-select mode on/off
    selected: [],         // product ids in current bulk selection
  },
  storefront: { cart: [], customer: { name: '', phone: '' }, lastOrderCode: '', search: '' },
  roadmapFilter: 'now',    // for "What's coming" chip filter
};

const app = () => document.getElementById('app');

function parseRoute() {
  const raw = (location.hash || '#/auth').replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean);
  return { screen: parts[0] || 'auth', args: parts.slice(1) };
}

function setDesktopMeta(title) {
  const el = document.getElementById('desktopMetaScreen');
  if (el) el.textContent = title || '—';
}

function render() {
  const route = parseRoute();
  window.state.route = route;

  const screen = window.Screens[route.screen] || window.Screens._placeholder;
  const html = screen.render(window.state);
  app().innerHTML = html;

  setDesktopMeta(screen.title || route.screen);

  // Tab-bar layout: each screen still emits its <nav class="tab-bar"> as the
  // last child of <section class="screen">. The app shell expects the tab
  // bar to live OUTSIDE the scrolling .app-surface (#app), as a flex sibling
  // of #app inside .phone-screen — that way the bar stays put while #app
  // scrolls. We promote it after every render. Stale tab bars from previous
  // renders are removed first.
  const phoneScreen = document.querySelector('.phone-screen');
  if (phoneScreen) {
    phoneScreen.querySelectorAll(':scope > .tab-bar').forEach(el => el.remove());
    const renderedBar = app().querySelector(':scope > section > .tab-bar')
                     || app().querySelector('.tab-bar');
    if (renderedBar) phoneScreen.appendChild(renderedBar);
  }

  // Let screens wire event handlers after DOM insertion.
  if (screen.init) screen.init(window.state);

  // Scroll the (now internal) app surface back to top on every route change.
  const surface = app();
  if (surface) surface.scrollTop = 0;
  if (typeof window !== 'undefined' && window.scrollTo) window.scrollTo(0, 0);
}

// Simple navigation helper — screens call navigate('inbox') or go('inbox/ord_001')
window.navigate = (path) => {
  if (!path.startsWith('/')) path = '/' + path;
  location.hash = '#' + path;
};

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);

/* =========================================================================
   Tab-bar scroll controller — modern mobile-app behaviour.
   - Hide the bottom .tab-bar when the user is scrolling DOWN past a small
     threshold (so it's out of the way while reading).
   - Show the .tab-bar the moment the user scrolls UP (so it's reachable
     when the merchant wants to navigate).
   - Always visible when the scroll position is at the top.
   In the new app-shell layout, .app-surface (#app) is the only thing that
   scrolls. The listener attaches there — body itself doesn't scroll, so
   window scroll events would never fire.
   ========================================================================= */
(function setupTabBarController() {
  const HIDE_THRESHOLD = 12;
  const TOP_REVEAL     = 24;
  let lastY = 0;
  let ticking = false;

  function scrollContainer() {
    return document.getElementById('app');
  }
  function getScrollY() {
    const c = scrollContainer();
    return c ? c.scrollTop : 0;
  }
  function tabBars() {
    return document.querySelectorAll('.tab-bar');
  }

  function update() {
    ticking = false;
    const y = getScrollY();
    const delta = y - lastY;

    if (y < TOP_REVEAL) {
      tabBars().forEach(el => el.classList.remove('tab-bar--hidden'));
    } else if (delta > HIDE_THRESHOLD) {
      tabBars().forEach(el => el.classList.add('tab-bar--hidden'));
    } else if (delta < -HIDE_THRESHOLD) {
      tabBars().forEach(el => el.classList.remove('tab-bar--hidden'));
    }

    lastY = y;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  // Wire the listener once #app exists.
  function attach() {
    const c = scrollContainer();
    if (c) c.addEventListener('scroll', onScroll, { passive: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach);
  } else {
    attach();
  }

  // Reset the hidden state on every render so a new screen always lands
  // with the tab bar visible. We watch .phone-screen (where app.js moves
  // the bar to) AND #app (where screens render their content).
  const observer = new MutationObserver(() => {
    lastY = getScrollY();
    tabBars().forEach(el => el.classList.remove('tab-bar--hidden'));
  });
  function startObserver() {
    const phoneScreen = document.querySelector('.phone-screen');
    const appEl = document.getElementById('app');
    if (phoneScreen) observer.observe(phoneScreen, { childList: true });
    if (appEl) observer.observe(appEl, { childList: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
})();

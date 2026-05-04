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

  // Let screens wire event handlers after DOM insertion.
  if (screen.init) screen.init(window.state);

  // Scroll to top on every route change. Belt-and-braces: the app surface
  // scrolls on desktop (phone-frame view), the document scrolls on mobile,
  // so reset all three so the merchant always lands at the top of the new
  // screen regardless of device.
  const surface = app();
  if (surface) surface.scrollTop = 0;
  if (typeof window !== 'undefined' && window.scrollTo) window.scrollTo(0, 0);
  if (typeof document !== 'undefined') {
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }
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
   - Hide the bottom .tab-bar when the user is scrolling DOWN past a
     small threshold (so it's out of the way while reading).
   - Show the .tab-bar the moment the user scrolls UP (so it's reachable
     when they want to navigate).
   - Always visible at the very top of the page.
   The listener attaches to whichever scroll container is actually used:
     • On mobile the document/body scrolls.
     • On the desktop phone-frame, .app-surface scrolls.
   ========================================================================= */
(function setupTabBarController() {
  const HIDE_THRESHOLD = 12;   // pixels of down-scroll before hiding
  const TOP_REVEAL     = 24;   // always show when within this many px of the top
  let lastY = 0;
  let ticking = false;

  function getScrollY() {
    // Prefer document scroll (mobile); fall back to .app-surface (desktop).
    if (typeof window !== 'undefined' && typeof window.scrollY === 'number' && window.scrollY > 0) {
      return window.scrollY;
    }
    const surface = document.getElementById('app');
    return (surface && surface.scrollTop) || 0;
  }

  function tabBars() {
    return document.querySelectorAll('.tab-bar');
  }

  function update() {
    ticking = false;
    const y = getScrollY();
    const delta = y - lastY;

    if (y < TOP_REVEAL) {
      // Near the top — always visible.
      tabBars().forEach(el => el.classList.remove('tab-bar--hidden'));
    } else if (delta > HIDE_THRESHOLD) {
      // Scrolling DOWN — hide.
      tabBars().forEach(el => el.classList.add('tab-bar--hidden'));
    } else if (delta < -HIDE_THRESHOLD) {
      // Scrolling UP — reveal.
      tabBars().forEach(el => el.classList.remove('tab-bar--hidden'));
    }

    lastY = y;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  // Catch both the document scroll (mobile) AND the in-frame scroll
  // (desktop phone preview, where .app-surface is the scroll container).
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('DOMContentLoaded', () => {
    const surface = document.getElementById('app');
    if (surface) surface.addEventListener('scroll', onScroll, { passive: true });
  });

  // After every render() the .tab-bar is a brand-new DOM node; reset its
  // hidden state so navigating to a new screen always lands with the bar
  // visible (matches the scroll-to-top behaviour).
  const _origRender = window.render;
  // render is declared above with `function render()`, so it's already on
  // the implicit global. We don't replace it — just observe via a MutationObserver.
  const observer = new MutationObserver(() => {
    lastY = getScrollY();
    tabBars().forEach(el => el.classList.remove('tab-bar--hidden'));
  });
  document.addEventListener('DOMContentLoaded', () => {
    const appEl = document.getElementById('app');
    if (appEl) observer.observe(appEl, { childList: true });
  });
})();

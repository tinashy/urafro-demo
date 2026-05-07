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

  // Tab-bar layout: each screen still emits its <nav class="tab-bar"> as
  // the last child of <section class="screen">. We promote it AFTER each
  // render so position:fixed (mobile) / position:absolute (desktop) work
  // reliably without containing-block surprises:
  //   • Mobile (<56.25rem):  move to <body> as a direct child. Pinning to
  //     viewport via position:fixed is bullet-proof at that level —
  //     nothing in between with overflow:hidden / transform / contain.
  //   • Desktop (≥56.25rem): move to .phone-screen so it sits inside the
  //     visual phone frame via position:absolute (phone-screen is
  //     position:relative on desktop).
  const renderedBar = app().querySelector('.tab-bar');
  // Always remove stale tab bars from both mount points first.
  document.querySelectorAll('body > .tab-bar').forEach(el => el.remove());
  const phoneScreen = document.querySelector('.phone-screen');
  if (phoneScreen) {
    phoneScreen.querySelectorAll(':scope > .tab-bar').forEach(el => el.remove());
  }
  if (renderedBar) {
    const isDesktop = typeof window.matchMedia === 'function'
      && window.matchMedia('(min-width: 56.25rem)').matches;
    const target = (isDesktop && phoneScreen) ? phoneScreen : document.body;
    target.appendChild(renderedBar);
  }

  // Let screens wire event handlers after DOM insertion.
  if (screen.init) screen.init(window.state);

  // Scroll to top on every route change. Belt-and-braces: body scrolls on
  // mobile, .app-surface scrolls on desktop, so reset all three.
  if (typeof window !== 'undefined' && window.scrollTo) window.scrollTo(0, 0);
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
   - Hide the .tab-bar when scrolling DOWN past a small threshold.
   - Reveal it the moment the user scrolls UP.
   - Always visible when within ~24px of the top.
   We listen on whichever container actually scrolls:
     • Mobile: the document/body. window.scrollY is the truth.
     • Desktop phone-frame: .app-surface (#app) scrolls internally.
   Both listeners are attached; whichever fires updates state.
   ========================================================================= */
(function setupTabBarController() {
  const HIDE_THRESHOLD = 12;
  const TOP_REVEAL     = 24;
  let lastY = 0;
  let ticking = false;

  function getScrollY() {
    const wScroll = (typeof window !== 'undefined' && typeof window.scrollY === 'number')
      ? window.scrollY : 0;
    if (wScroll > 0) return wScroll;
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

  // Catch both document scroll (mobile) AND in-frame scroll (desktop).
  window.addEventListener('scroll', onScroll, { passive: true });
  function attachInner() {
    const surface = document.getElementById('app');
    if (surface) surface.addEventListener('scroll', onScroll, { passive: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachInner);
  } else {
    attachInner();
  }

  // Reset hidden state on every render so a new screen always lands with
  // the tab bar visible. Watch both possible mount points (body for mobile,
  // .phone-screen for desktop) plus #app where screens render.
  const observer = new MutationObserver(() => {
    lastY = getScrollY();
    tabBars().forEach(el => el.classList.remove('tab-bar--hidden'));
  });
  function startObserver() {
    const appEl = document.getElementById('app');
    const phoneScreen = document.querySelector('.phone-screen');
    if (appEl) observer.observe(appEl, { childList: true });
    if (phoneScreen) observer.observe(phoneScreen, { childList: true });
    if (document.body) observer.observe(document.body, { childList: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
})();

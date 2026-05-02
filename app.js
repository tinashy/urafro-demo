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

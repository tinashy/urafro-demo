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
  inventory: { sort: 'low-first' },
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

  // Scroll the app surface to top on route change.
  const surface = app();
  surface.scrollTop = 0;
}

// Simple navigation helper — screens call navigate('inbox') or go('inbox/ord_001')
window.navigate = (path) => {
  if (!path.startsWith('/')) path = '/' + path;
  location.hash = '#' + path;
};

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);

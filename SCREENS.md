# Demo screens — build checklist

Tracks the 20 screens from the build spec. Tick as you go. Stay in build order — earlier screens are dependencies for later ones (state, navigation, data shape).

Build budget: ~17.5 hrs across the weekend per the Sprint 0 tracker Demo workstream tab.

---

## Friday Apr 24 (done — bootstrap)

- [x] Project scaffold (index.html, app.js, styles.css)
- [x] Design system (teal primary, stone neutrals, 8px grid, type scale)
- [x] Phone-frame chrome (desktop only) + app surface
- [x] Hash-based router + `window.state`
- [x] Fixture data — Amara Fashion, 6 products, 4 orders, 4 customers, metrics
- [x] UI helpers — header, tab bar, chip row, WABA banner, product thumb, kv row
- [x] AUTH-01 — phone signup, OTP entry, validation, autofocus, paste handling
- [x] OB-01 — 5-step wizard with state persistence
- [x] Placeholder fallback for every not-yet-built screen (build-spec tagged)
- [x] README, DEPLOY, SCREENS docs

---

## Saturday Apr 25 — Tier 1 interactive (~8 hrs)

Build order is the natural merchant flow: signup is done, now we set up inventory, then look at the storefront customers see, then take orders.

### Inventory

- [x] **INV-01** — Add product (`/product/new`)
  - Form: name, price (USD), stock, category, colour swatch picker
  - "Add another" / "Save and close"
  - Push into `AppData.products`, route back to `/inventory`
- [x] **INV-03** — View + edit inventory (`/inventory`)
  - List sorted by stock (low first), pill shows OK / Low / Out
  - Tap product → detail view (reuse INV-01 form pre-filled)
  - "+ Add product" floating button → `/product/new`

### Storefront

- [x] **STR-01** — Storefront preview (`/store`)
  - Merchant view: shareable link banner, "Preview as customer" button
  - "Copy link" + "Share to WhatsApp" buttons
- [x] **STR-02** — Customer storefront (`/storefront/:slug`)
  - Public view: store name, products grid, tap to add to cart
  - Cart screen: items, total, name + phone fields, "Place order"
  - On submit: thank-you + order code + push order into `AppData.orders` with status `new`
  - Mark notification step "Sent via WhatsApp if approved; SMS otherwise"

### Orders

- [x] **ORD-01** — Order inbox (`/inbox`)
  - Tabs: New / Confirmed / Fulfilled / Cancelled (with counts)
  - List: customer name, items, total, time-ago, status pill
  - Tap order → `/order/:id`
  - Subtle "ding" animation when a new order lands (manual trigger button OK for demo)
- [x] **ORD-02** — Process order (`/order/:id`)
  - Header: order code, customer, status pill
  - Body: line items, total, deposit (if any), customer notes
  - Action footer: Confirm / Mark fulfilled / Cancel (changes per status)
  - Tap action → status updates + auto-message preview shows
- [x] **ORD-03** — Auto stock deduction (`/stock-how`)
  - Built as a "How stock works" explainer screen — before/after cards with confirm-arrow.
  - Live in v1 (we promoted it from "within 3 months" — ORD-02 implements stock decrement live).
  - Linked from inventory; reachable as `/stock-how`.

### Saturday checkpoint (end of day)

- [x] Walk the full happy path: signup → onboard → add product → preview store → simulate customer order → process order → see stock drop. Verified end-to-end via `smoke_happy_path.js` (45/45 checks green, no console errors).
- [x] If broken: cut scope. Push ORD-02 actions to static mockup, drop INV-01 add-another flow, simplify storefront. *(Not needed — all interactive Tier 1 screens shipped.)*

---

## Sunday Apr 26 — static mockups + deploy (~6 hrs)

11 static screens. Single-mockup-per-feature. Use the `_placeholder.js` template as a starting point — copy it, swap the body, delete the "not built yet" framing.

Each static screen needs: title in header, kind-tag (v1.1 or Tier 2), a realistic-looking visual mockup of the feature, and a one-line caption with the timing (Within 3 months / Within 6 months).

### v1.1 — Within 3 months

- [ ] **OFF-01** — Works offline (`/offline`)
  - Show all four sync pill states on one screen: Synced ✓ / Syncing… / Offline / Error
  - Caption: "Take orders during ZESA outages. Syncs in <30s when you're back online."
- [ ] **REC-01** — PDF receipts (`/receipts`)
  - Mockup of a branded receipt card (logo, line items, total, REC-2026-000042 format)
  - Three buttons: Share via WhatsApp / Email / Download
- [ ] **INV-02** — Low-stock alerts (`/low-stock`)
  - Mockup of an in-app notification banner: "Ankara Wrap Dress — Sunset is low (2 left)"
  - Toggle for optional WhatsApp push notification
- [ ] **INV-04** — Barcode scanning (`/barcode`)
  - Mockup of camera viewfinder with barcode reticle
  - Caption: "Within 3 months, if merchants ask for it"

### Tier 2 — Within 6 months

- [ ] **CRM-01** — Customers (`/customers`)
  - List of customers from `AppData.customers`, sorted by spend
  - Each row: name, phone, order count, total spend
- [ ] **CRM-02** — Broadcasts (`/broadcasts`)
  - Form mockup: segment picker (Top 20% / Recent / Inactive), message textarea, preview, send
  - WABA caveat banner at top
- [ ] **ANL-01** — Sales dashboard (`/dashboard`)
  - Today / Week / Month revenue cards
  - Top 5 products list
  - 30-day trend (faked with inline SVG sparkline)
- [ ] **ANL-02** — End-of-day snapshot (`/end-of-day`)
  - Mockup of a notification: "Today: $121 from 2 orders. Top: Ankara Wrap Dress — Sunset"
- [ ] **EXP-01** — Expenses + P&L (`/expenses`)
  - Form: amount + category + save
  - Below: Revenue $2410 − Expenses $640 = Profit $1770 (use realistic numbers)
- [ ] **CUR-01** — USD + ZiG (`/currency`)
  - Toggle: Show prices in USD / ZiG / Both
  - Caption: "Within 6 months, if merchants accept ZiG (Sprint 0 finding)"
- [ ] **REC-02** — VAT invoices (`/vat`)
  - Mockup of a ZIMRA-compatible VAT invoice
  - Caption: "Within 6 months — for VAT-registered merchants only"

### Roadmap landing

- [ ] **What's coming** (`/coming`)
  - Chip filter at top: Now / 3 months / 6 months
  - List of all features in the active band, each with: name, one-line description, "Preview →"
  - Tapping a feature routes to its mockup screen

### Sunday checkpoint — deploy + dry run

- [ ] Deploy to Cloudflare Pages → confirm live URL works on a real phone
- [ ] Add WABA caveat banner ("if WABA approves") to STR-02, ORD-02, CRM-02, INV-02, REC-01
- [ ] Disclaimed-features footer note on every screen: "We don't auto-reply to customers, do your taxes, or know what they want before they tell you."
- [ ] 15-min dry-run with one friendly merchant on their actual phone (no leading questions)
- [ ] Apply dry-run fixes → final deploy → save the live URL somewhere obvious

---

## Monday Apr 27 morning

- [ ] Smoke test the live URL on phone before Interview 4 starts
- [ ] If broken: revert to last working commit / redeploy. Do not delay interviews.

---

## Cuts list (use freely if running over)

Drop these in order — the demo still works without them:

1. STR-02 cart UX (let customer view be browse-only, "Place order" goes to a thank-you)
2. ORD-02 deposit flow (just confirm/fulfil/cancel, no deposit option)
3. INV-04 mockup (skip entirely if VALIDATE-9 hasn't surfaced barcode use)
4. ANL-02 (single-line notification)
5. EXP-01 form interaction (just show the P&L numbers)
6. The dry-run with a friendly merchant (replace with self-walkthrough on phone)

Don't cut: AUTH/OB (it's the hook), ORD-01 (the activation moment), STR-01 (the share-link pitch), the "What's coming" filter (the pricing-question framing).

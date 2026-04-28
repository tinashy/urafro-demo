# urAfro — Sprint 0 demo

Mobile-first clickable prototype for Sprint 0 merchant interviews. Vanilla HTML / CSS / JS — no build step, no dependencies, no backend.

**Goal:** by Monday Apr 28 morning Harare time, have a live URL that walks a Zimbabwean shop owner through urAfro's Phase 1 in ~5 minutes.

## What's in this folder

```
demo/
├── index.html          App shell + script loading order
├── styles.css          Design system (teal primary, stone neutrals)
├── app.js              Hash-based router + global state
├── data.js             Amara Fashion fixture (1 store, 6 products, 4 orders)
├── screens/
│   ├── _shared.js      UI helpers: header, tab bar, chips, banners
│   ├── auth.js         AUTH-01 — phone signup (working end-to-end)
│   ├── onboarding.js   OB-01 — 5-step setup wizard
│   └── placeholder.js  Fallback for any not-yet-built screen
├── README.md           This file
├── DEPLOY.md           Cloudflare Pages / Vercel / Netlify instructions
└── SCREENS.md          Build checklist — 9 interactive + 11 static
```

## Run it locally

```bash
cd demo
open index.html         # macOS — opens in default browser
# or
python3 -m http.server  # then http://localhost:8000
```

No npm install. No build step. Edit a file, refresh the browser.

The demo opens at `#/auth`. On desktop you'll see a phone frame with quick-jump links in the side panel. On a real phone or narrow window, it goes full-bleed.

## Demo flow (the merchant journey)

1. Open URL → land on **AUTH-01** (phone signup)
2. Enter any 9-digit number → tap "Send code"
3. On OTP screen, type **123456** (shown on the screen as the demo code) → "Verify"
4. **OB-01** 5-step onboarding: name → colour → 3 products → slug → finish
5. Tap "Open my dashboard" → land on order inbox
6. From there, the bottom tab bar exposes Inventory / Store / More
7. The "What's coming" panel surfaces the v1.1 + Tier 2 mockups

## Design choices

- **Single primary colour** (teal `#0D9488`) — modern, distinctive, not the urAfro v2.1 navy. Creative freedom per founder direction.
- **Stone neutrals** instead of cool greys — warmer, slightly more African in feel without being literal.
- **8px spacing grid** throughout. Large touch targets (44px min).
- **Phone-frame chrome on desktop only** — fake status bar + notch + home indicator. Hidden on mobile.
- **No images** — products use coloured letter swatches. Real photos can come later; they aren't worth the asset wrangling for a 72-hour-use artefact.

## What's working today (Apr 25, 2026 morning)

- ✅ Phone signup → OTP → onboarding (full flow)
- ✅ 5-step onboarding with state persistence between steps
- ✅ Brand colour picker (8 swatches)
- ✅ Storefront slug input with live preview + validation
- ✅ Router + back/forward navigation
- ✅ Fallback screens for everything not yet built (with build-spec tags)
- ✅ Bottom tab bar component (visual only — none of the destinations are built)

## What's left (this weekend)

See `SCREENS.md` for the full checklist with build order.

**Saturday Apr 25** — 8 Tier 1 interactive screens after AUTH/OB:
INV-01, INV-03, STR-01, STR-02, ORD-01, ORD-02, plus ORD-03 static.

**Sunday Apr 26** — 11 static mockups:
v1.1 (OFF-01, REC-01, INV-02, INV-04) + Tier 2 (CRM-01/02, ANL-01/02, EXP-01, CUR-01, REC-02), the "What's coming" filter chip wired up, deploy, dry-run with one merchant, final deploy.

**Monday Apr 27 morning** — smoke test before Interview 4.

## Anti-scope-creep rules

Pulled from `urafro_demo_buildspec.docx`, listed here so they're hard to ignore:

- **No real backend.** No API calls, no auth tokens, no database.
- **Hardcoded merchant.** All content lives in `data.js`. One store, one set of products, one set of orders.
- **One data file.** Don't fragment fixture data across multiple modules.
- **90-minute rule.** If a feature takes more than 90 minutes to make interactive, downgrade it to a static mockup.
- **No analytics, no error tracking, no service worker.** This is a 72-hour-use artefact.

## Dev notes

- Router state lives at `window.state`. Mutate freely; call `render()` afterwards.
- Every screen registers itself on `window.Screens[key]` with `{ title, render(state), init?(state) }`.
- `render()` is called on hash change AND on initial DOMContentLoaded.
- `init()` is called after `render()` has inserted HTML — wire event handlers there.
- Use `navigate('/inbox')` to programmatically route. Use `<a href="#/inbox">` from HTML.
- Persist between renders by writing to `window.state` (not DOM attributes — they get wiped).

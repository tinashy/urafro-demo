# Deploy

Static site, no build step. Three deploy paths in order of preference. Pick the first that works — switching costs nothing.

## Option 1 — Cloudflare Pages (recommended)

Free, fast, Africa-friendly edge presence. Live in ~2 minutes.

**One-time setup:**

```bash
npm install -g wrangler
wrangler login
```

**Deploy:**

```bash
cd demo
wrangler pages deploy . --project-name urafro-demo --branch main
```

You'll get a URL like `https://urafro-demo.pages.dev`. Subsequent deploys reuse the project name and overwrite. Custom domain optional via Cloudflare dashboard.

**To update:** edit files, run the `wrangler pages deploy` command again.

## Option 2 — Vercel

Use if Cloudflare bounces or you already have a Vercel account.

```bash
npm install -g vercel
cd demo
vercel --prod
```

Follow prompts (project name, scope). URL printed at the end.

**To update:** `vercel --prod` again from the same folder.

## Option 3 — Netlify drop

Drag-and-drop, no CLI needed. Useful from a phone or unfamiliar machine.

1. Open https://app.netlify.com/drop
2. Drag the `demo/` folder onto the page
3. URL is printed instantly (e.g. `https://random-name-123.netlify.app`)
4. Optional: rename the site under Site settings

**To update:** drop the folder again, replacing the previous deploy.

## Pre-deploy checklist (do these once before first deploy)

- [ ] Open `index.html` locally, walk through AUTH → onboarding → "Open my dashboard" — confirm no JS errors in browser console.
- [ ] Test on a real phone: tether it to your laptop via `python3 -m http.server` and the laptop's local IP, or use `ngrok http 8000`.
- [ ] Resize browser to ~390px width — confirm the phone-frame chrome disappears and the app goes full-bleed.
- [ ] Hardcoded OTP `123456` is shown on the verify screen for the demo. Leave it visible — interview merchants will need it.
- [ ] Quick-jump links in the desktop side panel all resolve (no white screens).

## Post-deploy verification

After deploying, open the live URL on:

1. The laptop browser (Chrome).
2. An actual Android phone (low-end if available — Tecno, Samsung A-series).
3. The mobile browser on the laptop's dev tools (iPhone 13 Pro preset).

Tap through AUTH → OTP → onboarding → "Open my dashboard" on each. If any step breaks on the phone but works on desktop, fix before Sprint 0 starts Monday.

## Custom domain (optional, post-Sprint-0)

If you want `demo.urafro.com` instead of `urafro-demo.pages.dev`:

- **Cloudflare:** Pages project → Custom domains → Add. Cloudflare DNS auto-configures.
- **Vercel:** Project → Settings → Domains → Add. Update DNS at your registrar.

Skip this for the Apr 28 demo. The pages.dev / vercel.app URL is fine — merchants won't bookmark it.

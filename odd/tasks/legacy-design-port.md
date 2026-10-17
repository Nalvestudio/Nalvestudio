# Feature: legacy-design-port

## Objective
Port the visual design and all screens of the legacy store (`../sticker-shop/public`, same markup as `../Nahuelalvarez`) into the Next.js app at `apps/web`, keeping the look identical.

## Problem / Why
`nalv-next` has the new backend foundation (Prisma, shared pricing) but only a demo page. The owner wants the general template and every screen available in the new stack before the backend features are ported.

## Scope
- Shared shell: global CSS (legacy `style.css` reused as-is), fonts, images/media, root layout with header/footer/cart.
- Pages: `/` (index), `/stickers`, `/remeras`, `/checkout`, `/cuenta`, `/seguimiento`, `/admin`.
- Client-only behavior that needs no backend (navigation, cart in localStorage, hero/background video, UI toggles) ported to React client components.

## Out of scope
- Backend-bound flows (order submission, login, tracking lookup, admin data, uploads, background removal). Screens render; those actions stay stubbed with a clear TODO.

## Constraints
- Design must match legacy pixel-for-pixel where possible: reuse legacy CSS and class names.
- Keep `/api/*` routes and `Calculator.tsx` working (`/` demo page is replaced by the real home; calculator may move to `/calculadora`).
- TypeScript strict; `npm run typecheck` and `next build` must pass.

## Delivery
- Strategy: `exception-ok` — local repo without remote; PR slicing not applicable. Work-unit commits on `feat/legacy-design-port`.
- Forecast: >400 authored lines (mostly markup ported to JSX + copied CSS).

## Tasks
- [x] T1 Shell: copy assets (css, fonts, img, fondo, trabajos) to `apps/web/public`, global CSS, root layout with shared header/footer/cart components. Route: delegated (writer trigger: 2+ non-trivial files).
- [x] T2 Home page `/` ported from `index.html` (+ hero/fondo/galeria/trabajos client behavior). Route: delegated.
- [x] T3 `/stickers` and `/remeras` pages. Route: delegated.
- [x] T4 `/checkout`, `/cuenta`, `/seguimiento` pages. Route: delegated.
- [x] T5 `/admin` page (markup only). Route: delegated.
- [x] T6 Verification: `npm install`, `npm run typecheck`, `npm run build -w web`, `npm test`. Route: delegated with writer.

## Acceptance criteria
- Every legacy screen has a matching route rendering the same markup and styles.
- Typecheck and build pass; existing shared tests pass.

## Checks
- `npm run typecheck -w web`, `npm run build -w web`, `npm test` (root).
- Test-first exception: markup/design port has no meaningful deterministic RED; structural checks (typecheck/build, route list) apply.

## Progress
- T0 git baseline: `f6eaf85` on `main`; feature branch `feat/legacy-design-port`.

- T1 shell: assets copied to `apps/web/public` (fonts, img, fondo, trabajos); legacy `style.css` imported byte-identical as `src/app/globals.css` (no `public/css` copy, avoids two sources of truth); shared components in `src/components/{cart,site}`; calculator demo moved to `/calculadora`. Checks: typecheck pass, build pass. Commit: `feat(web): add legacy shell layout, assets and shared components` `1f716c8`.
- T2 home `/`: markup ported from `index.html` (HTML→JSX conversion keeps class names/structure); working client behavior: mode tabs, single-sticker mode (upload preview, ruler, size chips, qty, live price via `@nalv/shared`, add to cart), use-size chips, size guide from `SIZE_GUIDE`, hero art SVGs (garments port in `src/lib/garments.ts`), background video rotation, trabajos gallery with paging + lightbox, cart drawer, scroll ruler, TONY bot UI. Stubbed (TODO(backend)): sheet builder/nesting, design-upload, sticker library, packs, bot answers, account name, app version. Checks: typecheck pass, build pass. Commit: `feat(web): port legacy home page with client-side configurator` `b6f62f3`.
- T3 `/stickers` + `/remeras`: stickers gallery renders its empty state (TODO(backend): `/api/galeria`, suggest form). Remeras designer works client-side: garment picker, colors, size scale, real-scale SVG with dims, print options + tier table and live price via `@nalv/shared`, design upload with width slider/nudge buttons, add to cart, size chart. Stubbed: drag/resize on canvas, recommended sizes, trim, background removal, original upload. Checks: typecheck pass, build pass. Commit: `feat(web): port legacy stickers gallery and garment designer pages` `c6ceff8`.
- T4 `/checkout`, `/cuenta`, `/seguimiento`: legacy page `<style>` blocks kept verbatim in route-local `styles.ts` and rendered as page-scoped `<style>` (no global leak). Checkout works client-side: cart summary, pickup/shipping toggle, provinces and live shipping quote via `@nalv/shared` (`weightKg`/`quote`), empty-cart state. Cuenta: guest login/register tabs. Seguimiento: form with `?c=` and saved-phone prefill. Stubbed (TODO(backend)): order submission + confirmation, account auth/profile/orders, tracking lookup — each shows a Spanish "Próximamente" message. Checks: typecheck pass, build pass. Commit: `feat(web): port legacy checkout, account and tracking pages` `d5b1dcc`.
- T5 `/admin`: full legacy markup + `<style>` block ported; login card shown by default (submit shows a "Próximamente" message); panel layout previewable with `/admin?preview=1` (deviation from legacy, added for design review); tab switching works; forms are inert and `/admin/api/*` download links are disabled anchors (TODO(backend)). Checks: typecheck pass, build pass. Commit: `feat(web): port legacy admin panel markup` `287c8fa`.
- T6 verification: `npm install` ok (lockfile synced root devDependencies); `npm run typecheck -w web` pass; `npm run build -w web` pass (routes /, /admin, /calculadora, /checkout, /cuenta, /remeras, /seguimiento, /stickers + api routes); `npm test` pass (6 + 5 tests). Smoke test with `next start`: all 8 pages and sample assets (fonts, fondo, trabajos, img) return 200. Pending: visual/hydration check in a real browser (browser tooling unavailable). Commit: `chore(web): sync lockfile and record legacy port verification`.

## Next step
Visual comparison against the legacy store in a browser; then port backend-bound flows (sheet builder, orders, accounts, tracking, admin data).

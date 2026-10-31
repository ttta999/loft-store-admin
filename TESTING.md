# Functional verification

The cross-application browser suite lives in `ttta999/loft-store/e2e`. Run from the store checkout with `LOFT_ADMIN_ROOT` pointing at this admin checkout:

```sh
LOFT_ADMIN_ROOT=/path/to/loft-store-admin npm run test:all
```

On 2026-10-31, 44 mobile/desktop Chrome checks and 32 combined Node tests passed, with 8 PostgreSQL rollback suites and successful builds of both apps. See the storefront `TESTING.md` for the coverage matrix, findings and limitations.

Admin-specific Node tests cover MFA, cache behavior, notification authorization/recipient restrictions, and confirmed revenue. Run `npm test` here to execute them.

Verified fixes include consistent confirmed revenue (pending/cancelled/unconfirmed legacy payments excluded), notification recipient fallback for new orders, and responsive product/dashboard/brand layouts. Telegram message text was preserved. Real customers received no test messages.

# Admin caching

All protected page caches share one bounded in-memory cache. It clears when the authenticated user changes or signs out, and after successful Data API writes or mutating RPCs. Authentication RPCs and writes are never cached. No order/customer data is persisted in localStorage.

| Data | Lifetime |
| --- | --- |
| Orders | 15 seconds |
| Special requests and product variants | 30 seconds |
| Analytics by period, settings, dashboard counts | 60 seconds |
| Products, brands, categories/subcategories and product colors | 5 minutes |
| Notification list | 30 seconds |

Reading a cache entry does not extend its lifetime. Empty lists are cached; failed requests are not. Pending HTTP reads are shared across loaders and use an authorization-specific key. Forced refresh bypasses page and HTTP data caches. Transactional payment/cancellation RPCs invalidate dependent data just like regular writes. Notification read markers are stored separately for each administrator.

Analytics ignores a late response for an earlier selected period. Top products use the current catalog image with an order image fallback; private special-request photos retain signed access. Missing/broken images display a regular product icon.

Vite's versioned JS/CSS use immutable browser caching; the SPA HTML revalidates on every route. Missing asset paths return 404. Run `npm test` and `npm run build`; the storefront deployment smoke script verifies both sites' cache headers.

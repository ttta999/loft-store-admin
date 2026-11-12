# Graph Report - loft-admin-badge  (2026-11-12)

## Corpus Check
- 69 files · ~44,036 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 496 nodes · 1008 edges · 22 communities (16 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a1f7faf1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Зависимости и инструменты
- cache.ts
- Иконки и справочники
- Вход и оболочка
- Сервер и уведомления
- cache.ts
- OrdersPage.tsx
- Настройки оплаты
- Маршруты и анимации
- Браузерные проверки
- ResourceCache
- Типы клиентского кода
- Типы инструментов сборки
- Типы серверного кода
- Настройки TypeScript
- Иконка джинсов
- Публикация и заголовки
- Security architecture — 6 November 2026
- React + TypeScript + Vite
- TESTING.md
- AGENTS.md
- CACHING.md

## God Nodes (most connected - your core abstractions)
1. `react` - 25 edges
2. `OrdersPage()` - 18 edges
3. `supabase` - 17 edges
4. `compilerOptions` - 17 edges
5. `compilerOptions` - 16 edges
6. `react-router-dom` - 16 edges
7. `App()` - 15 edges
8. `lucide-react` - 15 edges
9. `sonner` - 14 edges
10. `RefundDetail()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `handler()` --calls--> `exchangeRate()`  [EXTRACTED]
  api/getExchangeRate.ts → server/exchangeRate.ts
- `RefundDetail()` --calls--> `formatMoney()`  [EXTRACTED]
  src/pages/RefundsPage.tsx → src/lib/orderState.ts
- `RefundDetail()` --calls--> `formatOrderMoney()`  [EXTRACTED]
  src/pages/RefundsPage.tsx → src/lib/orderState.ts
- `refundAmount()` --calls--> `formatMoney()`  [EXTRACTED]
  src/pages/RefundsPage.tsx → src/lib/orderState.ts
- `NotificationBell()` --calls--> `formatOrderMoney()`  [EXTRACTED]
  src/components/NotificationBell.tsx → src/lib/orderState.ts

## Import Cycles
- None detected.

## Communities (22 total, 6 thin omitted)

### Community 0 - "Зависимости и инструменты"
Cohesion: 0.06
Nodes (49): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-dom@^19.2.6, react-icons@^5.7.0, @supabase/supabase-js@2.108.1, devDependencies, eslint@^10.3.0 (+41 more)

### Community 1 - "cache.ts"
Cohesion: 0.10
Nodes (42): AdminNotification, NotificationBell(), seenStorageKey(), chinaCacheApi, dashboardCountsCacheApi, invalidateAllCaches(), createDataFetch(), orderStatus() (+34 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.05
Nodes (53): CategoryIcon(), CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPicker(), IconPickerProps (+45 more)

### Community 3 - "Вход и оболочка"
Cohesion: 0.10
Nodes (32): sonner@^2.0.7, react, sonner, App(), ProtectedRoute(), AppToaster(), readTheme(), subscribe() (+24 more)

### Community 4 - "Сервер и уведомления"
Cohesion: 0.09
Nodes (11): handler(), handler(), typescript@~6.0.2, @supabase/supabase-js, typescript, CachedRate, exchangeRate(), valid() (+3 more)

### Community 5 - "cache.ts"
Cohesion: 0.07
Nodes (42): analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, BrandStat, categoryRowsCacheApi, CategoryStat, colorsCacheApi, DailyStatsEntry (+34 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.09
Nodes (33): CancelOrderModal(), ordersCacheApi, refundsCacheApi, cancellationNeedsReview(), canClientCancel(), canManagerCancel(), formatMoney(), formatOrderMoney() (+25 more)

### Community 7 - "Настройки оплаты"
Cohesion: 0.14
Nodes (21): PaymentCardsSettings(), SettingsPageResource, formatCardNumber(), parsePaymentCards(), PaymentCard, PaymentCards, PaymentCurrency, AdminTheme (+13 more)

### Community 8 - "Маршруты и анимации"
Cohesion: 0.15
Nodes (22): react-router-dom@7.18.2, react-router-dom, AnimatedRoutes(), RouteFrame(), getSavedPositions(), ScrollRestoration(), captureAdminHeader(), card() (+14 more)

### Community 9 - "Браузерные проверки"
Cohesion: 0.17
Nodes (13): ADMIN, catalog(), Harness, install(), jwt(), now(), productId, session() (+5 more)

### Community 11 - "Типы клиентского кода"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 12 - "Типы инструментов сборки"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 13 - "Типы серверного кода"
Cohesion: 0.13
Nodes (14): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, noUnusedLocals, noUnusedParameters (+6 more)

### Community 15 - "Настройки TypeScript"
Cohesion: 0.40
Nodes (4): compilerOptions, rewriteRelativeImportExtensions, files, references

### Community 18 - "Security architecture — 6 November 2026"
Cohesion: 0.29
Nodes (6): Deployment order, Inventory and payments, Notifications and monitoring, Security architecture — 6 November 2026, Sessions, registration and files, Validation and limits

### Community 19 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

## Knowledge Gaps
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Вход и оболочка` to `Зависимости и инструменты`, `cache.ts`, `Иконки и справочники`, `cache.ts`, `OrdersPage.tsx`, `Настройки оплаты`, `Маршруты и анимации`?**
  _High betweenness centrality (0.214) - this node is a cross-community bridge._
- **Should `Зависимости и инструменты` be split into smaller, more focused modules?**
  _Cohesion score 0.05580693815987934 - nodes in this community are weakly interconnected._
- **Why does `@supabase/supabase-js` connect `Сервер и уведомления` to `Зависимости и инструменты`, `cache.ts`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `cache.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10087082728592163 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Браузерные проверки` to `Зависимости и инструменты`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.05499735589635114 - nodes in this community are weakly interconnected._
- **Should `Вход и оболочка` be split into smaller, more focused modules?**
  _Cohesion score 0.10121951219512196 - nodes in this community are weakly interconnected._
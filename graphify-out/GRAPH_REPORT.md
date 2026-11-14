# Graph Report - loft-admin-badge  (2026-11-13)

## Corpus Check
- 79 files · ~46,854 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 545 nodes · 1206 edges · 24 communities (19 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `33e6537c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Зависимости и инструменты
- supabase.ts
- Иконки и справочники
- Вход и оболочка
- Сервер и уведомления
- cache.ts
- OrdersPage.tsx
- Настройки оплаты
- CategoriesPage.tsx
- Браузерные проверки
- react-router-dom
- Типы клиентского кода
- Типы инструментов сборки
- Типы серверного кода
- ChinaPage.tsx
- Настройки TypeScript
- Иконка джинсов
- Публикация и заголовки
- Security architecture — 6 November 2026
- React + TypeScript + Vite
- TESTING.md
- AGENTS.md
- CACHING.md
- CampaignsPage.tsx

## God Nodes (most connected - your core abstractions)
1. `react` - 33 edges
2. `useAdminRefresh()` - 29 edges
3. `supabase` - 24 edges
4. `OrdersPage()` - 21 edges
5. `lucide-react` - 21 edges
6. `react-router-dom` - 19 edges
7. `App()` - 18 edges
8. `compilerOptions` - 17 edges
9. `sonner` - 17 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `handler()` --calls--> `exchangeRate()`  [EXTRACTED]
  api/getExchangeRate.ts → server/exchangeRate.ts
- `AdminLiveBridge()` --calls--> `useAdminLive()`  [EXTRACTED]
  src/App.tsx → src/lib/adminLive.ts
- `App()` --calls--> `AnimatedRoutes()`  [EXTRACTED]
  src/App.tsx → src/components/AnimatedRoutes.tsx
- `App()` --calls--> `DashboardPage()`  [EXTRACTED]
  src/App.tsx → src/pages/DashboardPage.tsx
- `App()` --calls--> `SizeChartsPage()`  [EXTRACTED]
  src/App.tsx → src/pages/SizeChartsPage.tsx

## Import Cycles
- None detected.

## Communities (24 total, 5 thin omitted)

### Community 0 - "Зависимости и инструменты"
Cohesion: 0.05
Nodes (51): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-dom@^19.2.6, react-icons@^5.7.0, react-router-dom@7.18.2, sonner@^2.0.7, @supabase/supabase-js@2.108.1 (+43 more)

### Community 1 - "supabase.ts"
Cohesion: 0.09
Nodes (47): groups, ManagerTasks(), names, AdminNotification, NotificationBell(), seenStorageKey(), labels, SpecialOrderPhoto() (+39 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.07
Nodes (38): CategoryIcon(), CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPicker(), IconPickerProps (+30 more)

### Community 3 - "Вход и оболочка"
Cohesion: 0.10
Nodes (35): react, sonner, AdminLiveBridge(), App(), ProtectedRoute(), AppToaster(), readTheme(), subscribe() (+27 more)

### Community 4 - "Сервер и уведомления"
Cohesion: 0.09
Nodes (10): handler(), handler(), @supabase/supabase-js, typescript, CachedRate, exchangeRate(), valid(), VercelRequest (+2 more)

### Community 5 - "cache.ts"
Cohesion: 0.06
Nodes (46): lucide-react, RecommendationPicker(), Recommendations, analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, BrandStat, categoryRowsCacheApi (+38 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.11
Nodes (32): CancelOrderModal(), labels, OrderHistory(), ordersCacheApi, cancellationNeedsReview(), canClientCancel(), canManagerCancel(), formatMoney() (+24 more)

### Community 7 - "Настройки оплаты"
Cohesion: 0.09
Nodes (23): PaymentCardsSettings(), ReminderSettings(), SettingsPageResource, formatCardNumber(), parsePaymentCards(), PaymentCard, PaymentCards, PaymentCurrency (+15 more)

### Community 8 - "CategoriesPage.tsx"
Cohesion: 0.23
Nodes (15): categoriesCacheApi, CategoryRow, CategoryTree, fetchCategoriesTree(), invalidateCategoriesCache(), logCategoryChange(), slugify(), SubcategoryRow (+7 more)

### Community 9 - "Браузерные проверки"
Cohesion: 0.17
Nodes (13): ADMIN, catalog(), Harness, install(), jwt(), now(), productId, session() (+5 more)

### Community 10 - "react-router-dom"
Cohesion: 0.16
Nodes (21): react-router-dom, AnimatedRoutes(), RouteFrame(), getSavedPositions(), ScrollRestoration(), captureAdminHeader(), card(), clearDashboardTransition() (+13 more)

### Community 11 - "Типы клиентского кода"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 12 - "Типы инструментов сборки"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 13 - "Типы серверного кода"
Cohesion: 0.13
Nodes (14): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, noUnusedLocals, noUnusedParameters (+6 more)

### Community 14 - "ChinaPage.tsx"
Cohesion: 0.23
Nodes (13): chinaCacheApi, catalogMoney(), displayMoney(), MoneyCurrency, moneyNumber(), roundUsd(), ChinaPageResource, getChinaRequests() (+5 more)

### Community 15 - "Настройки TypeScript"
Cohesion: 0.40
Nodes (4): compilerOptions, rewriteRelativeImportExtensions, files, references

### Community 18 - "Security architecture — 6 November 2026"
Cohesion: 0.29
Nodes (6): Deployment order, Inventory and payments, Notifications and monitoring, Security architecture — 6 November 2026, Sessions, registration and files, Validation and limits

### Community 19 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 23 - "CampaignsPage.tsx"
Cohesion: 0.20
Nodes (12): CampaignContent, campaignMessage(), escape(), CampaignsResource, blank(), CampaignsPage(), date(), Draft (+4 more)

## Knowledge Gaps
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Вход и оболочка` to `Зависимости и инструменты`, `supabase.ts`, `Иконки и справочники`, `cache.ts`, `OrdersPage.tsx`, `Настройки оплаты`, `CategoriesPage.tsx`, `react-router-dom`, `ChinaPage.tsx`, `CampaignsPage.tsx`?**
  _High betweenness centrality (0.212) - this node is a cross-community bridge._
- **Should `Зависимости и инструменты` be split into smaller, more focused modules?**
  _Cohesion score 0.05241090146750524 - nodes in this community are weakly interconnected._
- **Why does `@supabase/supabase-js` connect `Сервер и уведомления` to `Зависимости и инструменты`, `supabase.ts`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Should `supabase.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09114183307731695 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Браузерные проверки` to `Зависимости и инструменты`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.06553911205073996 - nodes in this community are weakly interconnected._
- **Should `Вход и оболочка` be split into smaller, more focused modules?**
  _Cohesion score 0.09513742071881606 - nodes in this community are weakly interconnected._
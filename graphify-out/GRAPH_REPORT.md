# Graph Report - loft-admin-badge  (2026-11-12)

## Corpus Check
- 70 files · ~44,215 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 498 nodes · 1016 edges · 22 communities (17 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3b227ac5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Зависимости и инструменты
- DashboardPage.tsx
- Иконки и справочники
- Вход и оболочка
- Сервер и уведомления
- cache.ts
- OrdersPage.tsx
- Настройки оплаты
- CategoriesPage.tsx
- Браузерные проверки
- lucide-react
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
1. `react` - 26 edges
2. `OrdersPage()` - 19 edges
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
- `AnalyticsPage()` --indirect_call--> `isConfirmedRevenue()`  [INFERRED]
  src/pages/AnalyticsPage.tsx → src/lib/revenue.ts
- `AnalyticsPage()` --calls--> `privateFile()`  [EXTRACTED]
  src/pages/AnalyticsPage.tsx → src/lib/supabase.ts
- `getOrders()` --calls--> `readAll()`  [EXTRACTED]
  src/lib/supabase.ts → src/lib/readAll.ts
- `OrdersPage()` --calls--> `getOrders()`  [EXTRACTED]
  src/pages/OrdersPage.tsx → src/lib/supabase.ts

## Import Cycles
- None detected.

## Communities (22 total, 5 thin omitted)

### Community 0 - "Зависимости и инструменты"
Cohesion: 0.07
Nodes (41): devDependencies, eslint@^10.3.0, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.6.0, tailwindcss@^4.3.0, @tailwindcss/vite@^4.3.0 (+33 more)

### Community 1 - "DashboardPage.tsx"
Cohesion: 0.14
Nodes (20): chinaCacheApi, dashboardCountsCacheApi, invalidateAllCaches(), ChinaPageResource, warmPage(), confirmedRevenue(), isConfirmedRevenue(), revenueStatuses (+12 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.07
Nodes (36): CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPickerProps, BackpackIcon, BeanieIcon (+28 more)

### Community 3 - "Вход и оболочка"
Cohesion: 0.08
Nodes (46): react-dom@^19.2.6, react-router-dom@7.18.2, react, react-dom, react-router-dom, App(), ProtectedRoute(), AnimatedRoutes() (+38 more)

### Community 4 - "Сервер и уведомления"
Cohesion: 0.09
Nodes (10): handler(), handler(), @supabase/supabase-js, typescript, CachedRate, exchangeRate(), valid(), VercelRequest (+2 more)

### Community 5 - "cache.ts"
Cohesion: 0.08
Nodes (37): analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, BrandStat, categoryRowsCacheApi, CategoryStat, colorsCacheApi, DailyStatsEntry (+29 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.07
Nodes (59): CancelOrderModal(), AdminNotification, NotificationBell(), seenStorageKey(), SpecialOrderPhoto(), ordersCacheApi, refundsCacheApi, cancellationNeedsReview() (+51 more)

### Community 7 - "Настройки оплаты"
Cohesion: 0.10
Nodes (24): PaymentCardsSettings(), createDataFetch(), SettingsPageResource, formatCardNumber(), parsePaymentCards(), PaymentCard, PaymentCards, PaymentCurrency (+16 more)

### Community 8 - "CategoriesPage.tsx"
Cohesion: 0.21
Nodes (17): CategoryIcon(), IconPicker(), categoriesCacheApi, CategoryRow, CategoryTree, fetchCategoriesTree(), invalidateCategoriesCache(), logCategoryChange() (+9 more)

### Community 9 - "Браузерные проверки"
Cohesion: 0.17
Nodes (13): ADMIN, catalog(), Harness, install(), jwt(), now(), productId, session() (+5 more)

### Community 10 - "lucide-react"
Cohesion: 0.13
Nodes (17): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-icons@^5.7.0, sonner@^2.0.7, @supabase/supabase-js@2.108.1, lucide-react, react-icons (+9 more)

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
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Вход и оболочка` to `Зависимости и инструменты`, `DashboardPage.tsx`, `Иконки и справочники`, `cache.ts`, `OrdersPage.tsx`, `Настройки оплаты`, `CategoriesPage.tsx`, `lucide-react`?**
  _High betweenness centrality (0.215) - this node is a cross-community bridge._
- **Should `Зависимости и инструменты` be split into smaller, more focused modules?**
  _Cohesion score 0.06659619450317125 - nodes in this community are weakly interconnected._
- **Why does `@supabase/supabase-js` connect `Сервер и уведомления` to `Зависимости и инструменты`, `lucide-react`, `OrdersPage.tsx`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `DashboardPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14492753623188406 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Браузерные проверки` to `Зависимости и инструменты`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.06736353077816493 - nodes in this community are weakly interconnected._
- **Should `Вход и оболочка` be split into smaller, more focused modules?**
  _Cohesion score 0.07662337662337662 - nodes in this community are weakly interconnected._
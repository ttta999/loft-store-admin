# Graph Report - loft-admin-badge  (2026-11-14)

## Corpus Check
- 91 files · ~58,535 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 589 nodes · 1657 edges · 23 communities (19 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c82d85a8`
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
- theme.ts
- useAdminLanguage
- Браузерные проверки
- react-router-dom
- Типы клиентского кода
- Типы инструментов сборки
- Типы серверного кода
- DashboardPage.tsx
- Настройки TypeScript
- i18n.ts
- Публикация и заголовки
- Security architecture — 6 November 2026
- React + TypeScript + Vite
- TESTING.md
- AGENTS.md
- CACHING.md

## God Nodes (most connected - your core abstractions)
1. `useAdminLanguage()` - 88 edges
2. `t()` - 66 edges
3. `tx()` - 64 edges
4. `uiError()` - 38 edges
5. `react` - 36 edges
6. `useAdminRefresh()` - 29 edges
7. `OrdersPage()` - 28 edges
8. `lucide-react` - 26 edges
9. `PageSkeleton()` - 24 edges
10. `supabase` - 24 edges

## Surprising Connections (you probably didn't know these)
- `AnalyticsPage()` --indirect_call--> `isConfirmedRevenue()`  [INFERRED]
  src/pages/AnalyticsPage.tsx → src/lib/revenue.ts
- `handler()` --calls--> `exchangeRate()`  [EXTRACTED]
  api/getExchangeRate.ts → server/exchangeRate.ts
- `PaymentCardsSettings()` --calls--> `formatCardNumber()`  [EXTRACTED]
  src/components/PaymentCardsSettings.tsx → src/lib/paymentCards.ts
- `PaymentCardsSettings()` --calls--> `parsePaymentCards()`  [EXTRACTED]
  src/components/PaymentCardsSettings.tsx → src/lib/paymentCards.ts
- `OrdersPage()` --calls--> `confirmPayment()`  [EXTRACTED]
  src/pages/OrdersPage.tsx → src/lib/payments.ts

## Import Cycles
- None detected.

## Communities (23 total, 4 thin omitted)

### Community 0 - "Зависимости и инструменты"
Cohesion: 0.05
Nodes (50): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-dom@^19.2.6, react-icons@^5.7.0, sonner@^2.0.7, @supabase/supabase-js@2.108.1, devDependencies (+42 more)

### Community 1 - "supabase.ts"
Cohesion: 0.07
Nodes (33): react, groups, names, labels, labels, DataTopic, dependencies, listeners (+25 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.07
Nodes (36): CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPickerProps, BackpackIcon, BeanieIcon (+28 more)

### Community 3 - "Вход и оболочка"
Cohesion: 0.11
Nodes (32): App(), ProtectedLayout(), AppToaster(), readTheme(), subscribe(), invalidateTopics(), useAdminLive(), getCurrentUser() (+24 more)

### Community 4 - "Сервер и уведомления"
Cohesion: 0.08
Nodes (11): handler(), handler(), typescript@~6.0.2, @supabase/supabase-js, typescript, CachedRate, exchangeRate(), valid() (+3 more)

### Community 5 - "cache.ts"
Cohesion: 0.14
Nodes (19): RecommendationPicker(), Recommendations, ProductsPageResource, LETTER_ORDER, sizeSortKey(), sortSizes(), sortSizeStrings(), Brand (+11 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.07
Nodes (52): AdminNotification, NotificationBell(), seenStorageKey(), ProtectedFile(), SpecialOrderPhoto(), ordersCacheApi, refundsCacheApi, getAdminLocale() (+44 more)

### Community 7 - "theme.ts"
Cohesion: 0.29
Nodes (8): AdminTheme, applyThemeToDom(), currentTheme, getTheme(), listeners, setTheme(), subscribe(), useTheme()

### Community 8 - "useAdminLanguage"
Cohesion: 0.09
Nodes (60): lucide-react, AdminLanguagePicker(), AdminMenuPage(), MenuEntry, CancelOrderModal(), CategoryIcon(), Collapse(), IconPicker() (+52 more)

### Community 9 - "Браузерные проверки"
Cohesion: 0.17
Nodes (13): ADMIN, catalog(), Harness, install(), jwt(), now(), productId, session() (+5 more)

### Community 10 - "react-router-dom"
Cohesion: 0.16
Nodes (21): react-router-dom@7.18.2, react-router-dom, AnimatedRoutes(), RouteFrame(), getSavedPositions(), ScrollRestoration(), captureAdminHeader(), card() (+13 more)

### Community 11 - "Типы клиентского кода"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 12 - "Типы инструментов сборки"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 13 - "Типы серверного кода"
Cohesion: 0.13
Nodes (14): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, noUnusedLocals, noUnusedParameters (+6 more)

### Community 14 - "DashboardPage.tsx"
Cohesion: 0.08
Nodes (42): AdminMenuRows(), analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, BrandStat, categoryRowsCacheApi, CategoryStat, chinaCacheApi (+34 more)

### Community 15 - "Настройки TypeScript"
Cohesion: 0.40
Nodes (4): compilerOptions, rewriteRelativeImportExtensions, files, references

### Community 16 - "i18n.ts"
Cohesion: 0.21
Nodes (11): AdminLanguage, getAdminLanguage(), interpolate(), language, listeners, publish(), saved(), setLanguageScope() (+3 more)

### Community 18 - "Security architecture — 6 November 2026"
Cohesion: 0.29
Nodes (6): Deployment order, Inventory and payments, Notifications and monitoring, Security architecture — 6 November 2026, Sessions, registration and files, Validation and limits

### Community 19 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `supabase.ts` to `Зависимости и инструменты`, `Иконки и справочники`, `Вход и оболочка`, `cache.ts`, `OrdersPage.tsx`, `theme.ts`, `useAdminLanguage`, `react-router-dom`, `DashboardPage.tsx`, `i18n.ts`?**
  _High betweenness centrality (0.162) - this node is a cross-community bridge._
- **Should `Зависимости и инструменты` be split into smaller, more focused modules?**
  _Cohesion score 0.054426705370101594 - nodes in this community are weakly interconnected._
- **Why does `useAdminLanguage()` connect `useAdminLanguage` to `supabase.ts`, `Иконки и справочники`, `Вход и оболочка`, `cache.ts`, `OrdersPage.tsx`, `react-router-dom`, `DashboardPage.tsx`, `i18n.ts`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Should `supabase.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0734006734006734 - nodes in this community are weakly interconnected._
- **Why does `@supabase/supabase-js` connect `Сервер и уведомления` to `Зависимости и инструменты`, `supabase.ts`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.06736353077816493 - nodes in this community are weakly interconnected._
- **Should `Вход и оболочка` be split into smaller, more focused modules?**
  _Cohesion score 0.10512820512820513 - nodes in this community are weakly interconnected._
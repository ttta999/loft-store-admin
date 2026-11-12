# Graph Report - loft-admin-badge  (2026-11-12)

## Corpus Check
- 65 files · ~42,269 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 463 nodes · 888 edges · 23 communities (17 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e2efbae1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Зависимости и инструменты
- Аналитика и кэш
- Иконки и справочники
- Вход и оболочка
- Сервер и уведомления
- Заявки и колокольчик
- Заказы и предоплата
- Настройки оплаты
- Маршруты и анимации
- Браузерные проверки
- Категории и редактор
- Типы клиентского кода
- Типы инструментов сборки
- Типы серверного кода
- Кэш ресурсов
- Настройки TypeScript
- Иконка джинсов
- Публикация и заголовки
- Security architecture — 6 November 2026
- React + TypeScript + Vite
- TESTING.md
- AGENTS.md
- CACHING.md

## God Nodes (most connected - your core abstractions)
1. `react` - 23 edges
2. `compilerOptions` - 17 edges
3. `compilerOptions` - 16 edges
4. `react-router-dom` - 15 edges
5. `OrdersPage()` - 15 edges
6. `lucide-react` - 14 edges
7. `App()` - 14 edges
8. `supabase` - 14 edges
9. `compilerOptions` - 13 edges
10. `sonner` - 12 edges

## Surprising Connections (you probably didn't know these)
- `handler()` --calls--> `exchangeRate()`  [EXTRACTED]
  api/getExchangeRate.ts → server/exchangeRate.ts
- `App()` --calls--> `AnimatedRoutes()`  [EXTRACTED]
  src/App.tsx → src/components/AnimatedRoutes.tsx
- `App()` --calls--> `DashboardPage()`  [EXTRACTED]
  src/App.tsx → src/pages/DashboardPage.tsx
- `IconPicker()` --calls--> `selectedIcon()`  [EXTRACTED]
  src/components/IconPicker.tsx → src/lib/iconRegistry.ts
- `DashboardPage()` --calls--> `logout()`  [EXTRACTED]
  src/pages/DashboardPage.tsx → src/lib/auth.ts

## Import Cycles
- None detected.

## Communities (23 total, 6 thin omitted)

### Community 0 - "Зависимости и инструменты"
Cohesion: 0.07
Nodes (41): devDependencies, eslint@^10.3.0, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.6.0, tailwindcss@^4.3.0, @tailwindcss/vite@^4.3.0 (+33 more)

### Community 1 - "Аналитика и кэш"
Cohesion: 0.07
Nodes (44): analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, brandsCacheApi, BrandStat, categoryRowsCacheApi, CategoryStat, colorsCacheApi (+36 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.07
Nodes (36): CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPickerProps, BackpackIcon, BeanieIcon (+28 more)

### Community 3 - "Вход и оболочка"
Cohesion: 0.08
Nodes (39): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-dom@^19.2.6, react-icons@^5.7.0, sonner@^2.0.7, @supabase/supabase-js@2.108.1, lucide-react (+31 more)

### Community 4 - "Сервер и уведомления"
Cohesion: 0.09
Nodes (10): handler(), handler(), @supabase/supabase-js, typescript, CachedRate, exchangeRate(), valid(), VercelRequest (+2 more)

### Community 5 - "Заявки и колокольчик"
Cohesion: 0.15
Nodes (23): AdminNotification, NotificationBell(), seenStorageKey(), chinaCacheApi, invalidateAllCaches(), createDataFetch(), ChinaPageResource, warmPage() (+15 more)

### Community 6 - "Заказы и предоплата"
Cohesion: 0.13
Nodes (25): ordersCacheApi, OrdersPageResource, confirmPayment(), nextSpecialStatuses(), SPECIAL_DELIVERY, SPECIAL_PICKUP, specialStatusTone(), usesSpecialFulfillment() (+17 more)

### Community 7 - "Настройки оплаты"
Cohesion: 0.14
Nodes (21): PaymentCardsSettings(), SettingsPageResource, formatCardNumber(), parsePaymentCards(), PaymentCard, PaymentCards, PaymentCurrency, AdminTheme (+13 more)

### Community 8 - "Маршруты и анимации"
Cohesion: 0.15
Nodes (22): react-router-dom@7.18.2, react-router-dom, AnimatedRoutes(), RouteFrame(), getSavedPositions(), ScrollRestoration(), captureAdminHeader(), card() (+14 more)

### Community 9 - "Браузерные проверки"
Cohesion: 0.17
Nodes (13): ADMIN, catalog(), Harness, install(), jwt(), now(), productId, session() (+5 more)

### Community 10 - "Категории и редактор"
Cohesion: 0.20
Nodes (18): CategoryIcon(), IconPicker(), categoriesCacheApi, CategoryRow, CategoryTree, fetchCategoriesTree(), invalidateCategoriesCache(), logCategoryChange() (+10 more)

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

- **Why does `react` connect `Вход и оболочка` to `Зависимости и инструменты`, `Аналитика и кэш`, `Иконки и справочники`, `Заявки и колокольчик`, `Заказы и предоплата`, `Настройки оплаты`, `Маршруты и анимации`, `Категории и редактор`?**
  _High betweenness centrality (0.216) - this node is a cross-community bridge._
- **Should `Зависимости и инструменты` be split into smaller, more focused modules?**
  _Cohesion score 0.06659619450317125 - nodes in this community are weakly interconnected._
- **Why does `@supabase/supabase-js` connect `Сервер и уведомления` to `Зависимости и инструменты`, `Вход и оболочка`, `Заявки и колокольчик`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Should `Аналитика и кэш` be split into smaller, more focused modules?**
  _Cohesion score 0.06509803921568627 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Браузерные проверки` to `Зависимости и инструменты`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.06736353077816493 - nodes in this community are weakly interconnected._
- **Should `Вход и оболочка` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
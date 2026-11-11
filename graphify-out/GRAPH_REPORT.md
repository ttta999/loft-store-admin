# Graph Report - loft-admin-cache  (2026-11-11)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 445 nodes · 875 edges · 18 communities (15 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `52cd199f`
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

## God Nodes (most connected - your core abstractions)
1. `react` - 23 edges
2. `compilerOptions` - 17 edges
3. `compilerOptions` - 16 edges
4. `OrdersPage()` - 15 edges
5. `react-router-dom` - 15 edges
6. `App()` - 14 edges
7. `lucide-react` - 14 edges
8. `supabase` - 14 edges
9. `compilerOptions` - 13 edges
10. `sonner` - 12 edges

## Surprising Connections (you probably didn't know these)
- `handler()` --calls--> `exchangeRate()`  [EXTRACTED]
  api/getExchangeRate.ts → server/exchangeRate.ts
- `DashboardPage()` --calls--> `confirmedRevenue()`  [EXTRACTED]
  src/pages/DashboardPage.tsx → src/lib/revenue.ts
- `AnalyticsPage()` --indirect_call--> `isConfirmedRevenue()`  [INFERRED]
  src/pages/AnalyticsPage.tsx → src/lib/revenue.ts
- `AnalyticsPage()` --calls--> `readAll()`  [EXTRACTED]
  src/pages/AnalyticsPage.tsx → src/lib/readAll.ts
- `AnalyticsPage()` --calls--> `privateFile()`  [EXTRACTED]
  src/pages/AnalyticsPage.tsx → src/lib/supabase.ts

## Import Cycles
- None detected.

## Communities (18 total, 3 thin omitted)

### Зависимости и инструменты - "Зависимости и инструменты"
Cohesion: 0.05
Nodes (50): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-dom@^19.2.6, react-icons@^5.7.0, @supabase/supabase-js@2.108.1, devDependencies, eslint@^10.3.0 (+42 more)

### Аналитика и кэш - "Аналитика и кэш"
Cohesion: 0.07
Nodes (42): analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, BrandStat, categoryRowsCacheApi, CategoryStat, colorsCacheApi, DailyStatsEntry (+34 more)

### Иконки и справочники - "Иконки и справочники"
Cohesion: 0.07
Nodes (36): CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPickerProps, BackpackIcon, BeanieIcon (+28 more)

### Вход и оболочка - "Вход и оболочка"
Cohesion: 0.11
Nodes (29): react, App(), ProtectedRoute(), AppToaster(), readTheme(), subscribe(), getCurrentUser(), login() (+21 more)

### Сервер и уведомления - "Сервер и уведомления"
Cohesion: 0.09
Nodes (10): handler(), handler(), @supabase/supabase-js, typescript, CachedRate, exchangeRate(), valid(), VercelRequest (+2 more)

### Заявки и колокольчик - "Заявки и колокольчик"
Cohesion: 0.15
Nodes (24): AdminNotification, NotificationBell(), seenStorageKey(), chinaCacheApi, dashboardCountsCacheApi, invalidateAllCaches(), createDataFetch(), ChinaPageResource (+16 more)

### Заказы и предоплата - "Заказы и предоплата"
Cohesion: 0.13
Nodes (25): ordersCacheApi, OrdersPageResource, confirmPayment(), nextSpecialStatuses(), SPECIAL_DELIVERY, SPECIAL_PICKUP, specialStatusTone(), usesSpecialFulfillment() (+17 more)

### Настройки оплаты - "Настройки оплаты"
Cohesion: 0.12
Nodes (23): sonner@^2.0.7, sonner, PaymentCardsSettings(), SettingsPageResource, formatCardNumber(), parsePaymentCards(), PaymentCard, PaymentCards (+15 more)

### Маршруты и анимации - "Маршруты и анимации"
Cohesion: 0.15
Nodes (22): react-router-dom@7.18.2, react-router-dom, AnimatedRoutes(), RouteFrame(), getSavedPositions(), ScrollRestoration(), captureAdminHeader(), card() (+14 more)

### Браузерные проверки - "Браузерные проверки"
Cohesion: 0.17
Nodes (13): ADMIN, catalog(), Harness, install(), jwt(), now(), productId, session() (+5 more)

### Категории и редактор - "Категории и редактор"
Cohesion: 0.20
Nodes (18): CategoryIcon(), IconPicker(), categoriesCacheApi, CategoryRow, CategoryTree, fetchCategoriesTree(), invalidateCategoriesCache(), logCategoryChange() (+10 more)

### Типы клиентского кода - "Типы клиентского кода"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Типы инструментов сборки - "Типы инструментов сборки"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Типы серверного кода - "Типы серверного кода"
Cohesion: 0.13
Nodes (14): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, noUnusedLocals, noUnusedParameters (+6 more)

### Настройки TypeScript - "Настройки TypeScript"
Cohesion: 0.40
Nodes (4): compilerOptions, rewriteRelativeImportExtensions, files, references

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Вход и оболочка` to `Зависимости и инструменты`, `Аналитика и кэш`, `Иконки и справочники`, `Заявки и колокольчик`, `Заказы и предоплата`, `Настройки оплаты`, `Маршруты и анимации`, `Категории и редактор`?**
  _High betweenness centrality (0.234) - this node is a cross-community bridge._
- **Should `Зависимости и инструменты` be split into smaller, more focused modules?**
  _Cohesion score 0.054426705370101594 - nodes in this community are weakly interconnected._
- **Why does `@supabase/supabase-js` connect `Сервер и уведомления` to `Зависимости и инструменты`, `Заявки и колокольчик`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Should `Аналитика и кэш` be split into smaller, more focused modules?**
  _Cohesion score 0.06802721088435375 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Браузерные проверки` to `Зависимости и инструменты`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.06736353077816493 - nodes in this community are weakly interconnected._
- **Should `Вход и оболочка` be split into smaller, more focused modules?**
  _Cohesion score 0.11095305832147938 - nodes in this community are weakly interconnected._
## Область индексации

Только локальный структурный анализ кода, без внешней модели и без семантической индексации документов и изображений. SQL-миграции включают исторические определения функций; актуальное поведение базы нужно сверять с последними миграциями и действующими функциями. Файлы без объявлений могут быть представлены только файловым узлом. Стоимость внешних модельных вызовов: 0 токенов.

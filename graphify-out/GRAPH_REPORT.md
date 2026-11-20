# Graph Report - loft-admin-final  (2026-11-20)

## Corpus Check
- 113 files · ~65,479 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 706 nodes · 2155 edges · 22 communities (20 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c7e3fbb5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Зависимости и инструменты
- AnalyticsPage.tsx
- Иконки и справочники
- pagePreload.ts
- supabase.ts
- useAdminLanguage
- OrdersPage.tsx
- DESIGN_SYSTEM.md
- ResourceCache
- Браузерные проверки
- getExchangeRate.ts
- Типы клиентского кода
- Типы инструментов сборки
- Типы серверного кода
- ProductsPage.tsx
- Настройки TypeScript
- LOFT Admin — продукт и рабочие процессы менеджера
- CampaignsPage.tsx
- Security architecture — 6 November 2026
- DashboardPage.tsx
- TESTING.md
- CACHING.md

## God Nodes (most connected - your core abstractions)
1. `useAdminLanguage()` - 90 edges
2. `tx()` - 71 edges
3. `t()` - 69 edges
4. `react` - 43 edges
5. `uiError()` - 38 edges
6. `useLocalTimeZone()` - 31 edges
7. `OrdersPage()` - 31 edges
8. `lucide-react` - 30 edges
9. `useAdminRefresh()` - 30 edges
10. `supabase` - 24 edges

## Surprising Connections (you probably didn't know these)
- `Компоненты и точки переиспользования` --references--> `AdminDialog()`  [INFERRED]
  docs/DESIGN_SYSTEM.md → src/components/AdminDialog.tsx
- `8. Время, локализация и аналитика` --references--> `adminDateTime()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/adminDateTime.ts
- `7. Кеш и Realtime` --references--> `useAdminRefresh()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/adminLive.ts
- `3. Маршруты и состояние` --references--> `parentRoute()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/adminNavigation.ts
- `3. Маршруты и состояние` --references--> `getCurrentUser()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/auth.ts

## Import Cycles
- None detected.

## Communities (22 total, 2 thin omitted)

### Community 0 - "Зависимости и инструменты"
Cohesion: 0.05
Nodes (50): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-dom@^19.2.6, react-icons@^5.7.0, react-router-dom@7.18.2, sonner@^2.0.7, @supabase/supabase-js@2.108.1 (+42 more)

### Community 1 - "AnalyticsPage.tsx"
Cohesion: 0.10
Nodes (35): adminDate(), adminTime(), analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, BrandStat, CategoryStat, DailyStatsEntry (+27 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.07
Nodes (36): CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPickerProps, BackpackIcon, BeanieIcon (+28 more)

### Community 3 - "pagePreload.ts"
Cohesion: 0.06
Nodes (51): App(), ProtectedLayout(), AnimatedRoutes(), content(), header(), RouteFrame(), section(), AppToaster() (+43 more)

### Community 4 - "supabase.ts"
Cohesion: 0.10
Nodes (17): typescript@~6.0.2, typescript, LoftSwitch(), labels, ReminderSettings(), createDataFetch(), dataCache, AdminNotice (+9 more)

### Community 5 - "useAdminLanguage"
Cohesion: 0.07
Nodes (79): 8. Время, локализация и аналитика, Компоненты и точки переиспользования, lucide-react, react-router-dom, AdminAddButton(), AdminLanguagePicker(), AdminMenuPage(), MenuEntry (+71 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.08
Nodes (64): AdminNotification, NotificationBell(), seenStorageKey(), labels, OrderHistory(), adminDateTime(), DataTopic, dependencies (+56 more)

### Community 7 - "DESIGN_SYSTEM.md"
Cohesion: 0.05
Nodes (39): 10. Развёртывание и проверки, 1. Общая схема и граница репозитория, 2. Технологии и структура, 3. Маршруты и состояние, 4. Данные, RPC и Storage, 5. Авторизация и серверный endpoint, 6. Реальные направления операций, 9. Фоновые задачи и рассылки (+31 more)

### Community 8 - "ResourceCache"
Cohesion: 0.14
Nodes (9): Telegram и рассылки, Данные и безопасность, Интерфейс и состояние, Контекст перед задачей, Правила работы с LOFT Admin, Проверки и отчёт, 7. Кеш и Realtime, invalidateTopics() (+1 more)

### Community 9 - "Браузерные проверки"
Cohesion: 0.17
Nodes (13): ADMIN, catalog(), Harness, install(), jwt(), now(), productId, session() (+5 more)

### Community 10 - "getExchangeRate.ts"
Cohesion: 0.13
Nodes (9): handler(), handler(), @supabase/supabase-js, CachedRate, exchangeRate(), valid(), VercelRequest, VercelResponse (+1 more)

### Community 11 - "Типы клиентского кода"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 12 - "Типы инструментов сборки"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 13 - "Типы серверного кода"
Cohesion: 0.13
Nodes (14): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, noUnusedLocals, noUnusedParameters (+6 more)

### Community 14 - "ProductsPage.tsx"
Cohesion: 0.11
Nodes (26): RecommendationPicker(), Recommendations, categoryRowsCacheApi, colorsCacheApi, productsCacheApi, subcategoriesCacheApi, variantsCacheApi, PANTS_SIZE_GRID (+18 more)

### Community 15 - "Настройки TypeScript"
Cohesion: 0.40
Nodes (4): compilerOptions, rewriteRelativeImportExtensions, files, references

### Community 16 - "LOFT Admin — продукт и рабочие процессы менеджера"
Cohesion: 0.17
Nodes (12): LOFT Admin — продукт и рабочие процессы менеджера, Аналитика и деньги, Заказы: принятие, деньги и выполнение, Заявки на спецзаказ, Колокольчик, задачи, напоминания, Назначение и роли, Настройки и границы развития, Отмены и возвраты (+4 more)

### Community 17 - "CampaignsPage.tsx"
Cohesion: 0.14
Nodes (24): react, AdminDialog(), stack, Collapse(), SizeChartEditor(), CampaignContent, campaignMessage(), campaignVersion() (+16 more)

### Community 18 - "Security architecture — 6 November 2026"
Cohesion: 0.29
Nodes (6): Deployment order, Inventory and payments, Notifications and monitoring, Security architecture — 6 November 2026, Sessions, registration and files, Validation and limits

### Community 19 - "DashboardPage.tsx"
Cohesion: 0.18
Nodes (21): sonner, AdminMenuRows(), chinaCacheApi, invalidateAllCaches(), catalogMoney(), displayMoney(), MoneyCurrency, moneyNumber() (+13 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `CampaignsPage.tsx` to `Зависимости и инструменты`, `AnalyticsPage.tsx`, `Иконки и справочники`, `pagePreload.ts`, `supabase.ts`, `useAdminLanguage`, `OrdersPage.tsx`, `DESIGN_SYSTEM.md`, `ProductsPage.tsx`, `DashboardPage.tsx`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Should `Зависимости и инструменты` be split into smaller, more focused modules?**
  _Cohesion score 0.05370101596516691 - nodes in this community are weakly interconnected._
- **Why does `useAdminLanguage()` connect `useAdminLanguage` to `AnalyticsPage.tsx`, `Иконки и справочники`, `pagePreload.ts`, `supabase.ts`, `OrdersPage.tsx`, `DESIGN_SYSTEM.md`, `ProductsPage.tsx`, `CampaignsPage.tsx`, `DashboardPage.tsx`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Should `AnalyticsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10077519379844961 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Браузерные проверки` to `Зависимости и инструменты`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.06736353077816493 - nodes in this community are weakly interconnected._
- **Should `pagePreload.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06009615384615385 - nodes in this community are weakly interconnected._
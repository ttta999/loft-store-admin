# Graph Report - loft-admin-final  (2026-11-22)

## Corpus Check
- 113 files · ~65,724 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 705 nodes · 2158 edges · 23 communities (21 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `42c4ba54`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Зависимости и инструменты
- AnalyticsPage.tsx
- Иконки и справочники
- pagePreload.ts
- ReminderSettings.tsx
- useAdminLanguage
- OrdersPage.tsx
- DESIGN_SYSTEM.md
- LOFT Admin — техническая архитектура
- Браузерные проверки
- SizeChartEditor.tsx
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
- theme.ts
- CACHING.md

## God Nodes (most connected - your core abstractions)
1. `useAdminLanguage()` - 90 edges
2. `tx()` - 71 edges
3. `t()` - 69 edges
4. `react` - 43 edges
5. `uiError()` - 38 edges
6. `AdminPageHeader()` - 34 edges
7. `useLocalTimeZone()` - 31 edges
8. `OrdersPage()` - 31 edges
9. `lucide-react` - 30 edges
10. `useAdminRefresh()` - 30 edges

## Surprising Connections (you probably didn't know these)
- `Компоненты и точки переиспользования` --references--> `AdminDialog()`  [INFERRED]
  docs/DESIGN_SYSTEM.md → src/components/AdminDialog.tsx
- `7. Кеш и Realtime` --references--> `useAdminRefresh()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/adminLive.ts
- `3. Маршруты и состояние` --references--> `parentRoute()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/adminNavigation.ts
- `8. Время, локализация и аналитика` --references--> `t()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/i18n.ts
- `8. Время, локализация и аналитика` --references--> `tx()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/i18n.ts

## Import Cycles
- None detected.

## Communities (23 total, 2 thin omitted)

### Community 0 - "Зависимости и инструменты"
Cohesion: 0.05
Nodes (51): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-dom@^19.2.6, react-icons@^5.7.0, react-router-dom@7.18.2, sonner@^2.0.7, @supabase/supabase-js@2.108.1 (+43 more)

### Community 1 - "AnalyticsPage.tsx"
Cohesion: 0.09
Nodes (38): adminDate(), adminTime(), analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, BrandStat, CategoryStat, DailyStatsEntry (+30 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.07
Nodes (37): CategoryIcon(), CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPickerProps, BackpackIcon (+29 more)

### Community 3 - "pagePreload.ts"
Cohesion: 0.09
Nodes (37): 3. Маршруты и состояние, App(), ProtectedLayout(), AppToaster(), readTheme(), subscribe(), useAdminLive(), getCurrentUser() (+29 more)

### Community 4 - "ReminderSettings.tsx"
Cohesion: 0.16
Nodes (13): LoftSwitch(), labels, ReminderSettings(), ResourceCache, clock(), instant(), localWorkClock(), Parts (+5 more)

### Community 5 - "useAdminLanguage"
Cohesion: 0.10
Nodes (42): Компоненты и точки переиспользования, lucide-react, AdminLanguagePicker(), AdminMenuPage(), MenuEntry, AdminBackButton(), AdminPageHeader(), JeansIcon() (+34 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.08
Nodes (54): 8. Время, локализация и аналитика, CancelOrderModal(), OrderHistory(), adminDateTime(), cancellationNeedsReview(), canClientCancel(), canManagerCancel(), formatMoney() (+46 more)

### Community 7 - "DESIGN_SYSTEM.md"
Cohesion: 0.07
Nodes (36): Telegram и рассылки, Данные и безопасность, Контекст перед задачей, Правила работы с LOFT Admin, Проверки и отчёт, LOFT Admin — действующая дизайн-система, Адаптивность и доступность, Анимации: точные значения и отличия от клиента (+28 more)

### Community 8 - "LOFT Admin — техническая архитектура"
Cohesion: 0.12
Nodes (16): 10. Развёртывание и проверки, 1. Общая схема и граница репозитория, 2. Технологии и структура, 5. Авторизация и серверный endpoint, 6. Реальные направления операций, 7. Кеш и Realtime, 9. Фоновые задачи и рассылки, LOFT Admin — техническая архитектура (+8 more)

### Community 9 - "Браузерные проверки"
Cohesion: 0.17
Nodes (13): ADMIN, catalog(), Harness, install(), jwt(), now(), productId, session() (+5 more)

### Community 10 - "SizeChartEditor.tsx"
Cohesion: 0.07
Nodes (19): handler(), handler(), typescript@~6.0.2, @supabase/supabase-js, typescript, CachedRate, exchangeRate(), valid() (+11 more)

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
Cohesion: 0.07
Nodes (49): AdminAddButton(), IconPicker(), Recommendations, brandsCacheApi, categoriesCacheApi, categoryRowsCacheApi, colorsCacheApi, productsCacheApi (+41 more)

### Community 15 - "Настройки TypeScript"
Cohesion: 0.40
Nodes (4): compilerOptions, rewriteRelativeImportExtensions, files, references

### Community 16 - "LOFT Admin — продукт и рабочие процессы менеджера"
Cohesion: 0.17
Nodes (12): LOFT Admin — продукт и рабочие процессы менеджера, Аналитика и деньги, Заказы: принятие, деньги и выполнение, Заявки на спецзаказ, Колокольчик, задачи, напоминания, Назначение и роли, Настройки и границы развития, Отмены и возвраты (+4 more)

### Community 17 - "CampaignsPage.tsx"
Cohesion: 0.11
Nodes (33): Интерфейс и состояние, 4. Данные, RPC и Storage, react, AdminDialog(), stack, Collapse(), groups, names (+25 more)

### Community 18 - "Security architecture — 6 November 2026"
Cohesion: 0.29
Nodes (6): Deployment order, Inventory and payments, Notifications and monitoring, Security architecture — 6 November 2026, Sessions, registration and files, Validation and limits

### Community 19 - "DashboardPage.tsx"
Cohesion: 0.17
Nodes (26): AdminMenuRows(), ManagerTasks(), NotificationBell(), useAdminRefresh(), chinaCacheApi, invalidateAllCaches(), tx(), catalogMoney() (+18 more)

### Community 21 - "theme.ts"
Cohesion: 0.29
Nodes (8): AdminTheme, applyThemeToDom(), currentTheme, getTheme(), listeners, setTheme(), subscribe(), useTheme()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `CampaignsPage.tsx` to `Зависимости и инструменты`, `AnalyticsPage.tsx`, `Иконки и справочники`, `pagePreload.ts`, `ReminderSettings.tsx`, `useAdminLanguage`, `OrdersPage.tsx`, `DESIGN_SYSTEM.md`, `SizeChartEditor.tsx`, `ProductsPage.tsx`, `DashboardPage.tsx`, `theme.ts`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Should `Зависимости и инструменты` be split into smaller, more focused modules?**
  _Cohesion score 0.053109713487071976 - nodes in this community are weakly interconnected._
- **Why does `useAdminLanguage()` connect `useAdminLanguage` to `AnalyticsPage.tsx`, `Иконки и справочники`, `pagePreload.ts`, `ReminderSettings.tsx`, `OrdersPage.tsx`, `SizeChartEditor.tsx`, `ProductsPage.tsx`, `CampaignsPage.tsx`, `DashboardPage.tsx`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `AnalyticsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08973172987974098 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Браузерные проверки` to `Зависимости и инструменты`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.0664451827242525 - nodes in this community are weakly interconnected._
- **Should `pagePreload.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08888888888888889 - nodes in this community are weakly interconnected._
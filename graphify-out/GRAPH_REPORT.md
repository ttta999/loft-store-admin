# Graph Report - loft-admin-final  (2026-11-23)

## Corpus Check
- 114 files · ~66,452 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 715 nodes · 2128 edges · 20 communities (18 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7fd0de8d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Зависимости и инструменты
- AnalyticsPage.tsx
- Иконки и справочники
- DashboardPage.tsx
- ReminderSettings.tsx
- useAdminLanguage
- OrdersPage.tsx
- DESIGN_SYSTEM.md
- PaymentCardsSettings.tsx
- Браузерные проверки
- SizeChartEditor.tsx
- Типы клиентского кода
- Типы инструментов сборки
- Типы серверного кода
- Настройки TypeScript
- LOFT Admin — продукт и рабочие процессы менеджера
- Security architecture — 6 November 2026
- TESTING.md
- theme.ts
- CACHING.md

## God Nodes (most connected - your core abstractions)
1. `useAdminLanguage()` - 85 edges
2. `tx()` - 70 edges
3. `t()` - 65 edges
4. `react` - 44 edges
5. `uiError()` - 38 edges
6. `OrdersPage()` - 32 edges
7. `useLocalTimeZone()` - 31 edges
8. `useAdminRefresh()` - 30 edges
9. `lucide-react` - 29 edges
10. `DashboardPage()` - 24 edges

## Surprising Connections (you probably didn't know these)
- `3. Маршруты и состояние` --references--> `parentRoute()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/adminNavigation.ts
- `Интерфейс и состояние` --references--> `ResourceCache`  [INFERRED]
  AGENTS.md → src/lib/resourceCache.ts
- `Компоненты и точки переиспользования` --references--> `ContentSkeleton()`  [INFERRED]
  docs/DESIGN_SYSTEM.md → src/components/PageSkeleton.tsx
- `4. Данные, RPC и Storage` --references--> `privateFile()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/supabase.ts
- `8. Время, локализация и аналитика` --references--> `adminDateTime()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/adminDateTime.ts

## Import Cycles
- None detected.

## Communities (20 total, 2 thin omitted)

### Community 0 - "Зависимости и инструменты"
Cohesion: 0.06
Nodes (42): react-icons@^5.7.0, devDependencies, eslint@^10.3.0, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.6.0, tailwindcss@^4.3.0 (+34 more)

### Community 1 - "AnalyticsPage.tsx"
Cohesion: 0.05
Nodes (56): Recommendations, adminTime(), analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, brandsCacheApi, BrandStat, categoryRowsCacheApi (+48 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.07
Nodes (37): CategoryIcon(), CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPickerProps, BackpackIcon (+29 more)

### Community 3 - "DashboardPage.tsx"
Cohesion: 0.06
Nodes (68): 3. Маршруты и состояние, dependencies, lucide-react@^1.17.0, react@^19.2.6, react-router-dom@7.18.2, sonner@^2.0.7, lucide-react, react-router-dom (+60 more)

### Community 4 - "ReminderSettings.tsx"
Cohesion: 0.29
Nodes (12): LoftSwitch(), labels, ReminderSettings(), clock(), instant(), localWorkClock(), Parts, parts() (+4 more)

### Community 5 - "useAdminLanguage"
Cohesion: 0.07
Nodes (71): 8. Время, локализация и аналитика, AdminAddButton(), AdminLanguagePicker(), AdminHeaderActions(), CancelOrderModal(), IconPicker(), JeansIcon(), JeansIconProps (+63 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.05
Nodes (84): Интерфейс и состояние, react, Collapse(), groups, names, AdminNotification, NotificationBell(), seenStorageKey() (+76 more)

### Community 7 - "DESIGN_SYSTEM.md"
Cohesion: 0.06
Nodes (48): Telegram и рассылки, Данные и безопасность, Контекст перед задачей, Правила работы с LOFT Admin, Проверки и отчёт, LOFT Admin — действующая дизайн-система, Адаптивность и доступность, Анимации: точные значения и отличия от клиента (+40 more)

### Community 8 - "PaymentCardsSettings.tsx"
Cohesion: 0.07
Nodes (29): 10. Развёртывание и проверки, 1. Общая схема и граница репозитория, 2. Технологии и структура, 4. Данные, RPC и Storage, 5. Авторизация и серверный endpoint, 6. Реальные направления операций, 7. Кеш и Realtime, 9. Фоновые задачи и рассылки (+21 more)

### Community 9 - "Браузерные проверки"
Cohesion: 0.17
Nodes (13): ADMIN, catalog(), Harness, install(), jwt(), now(), productId, session() (+5 more)

### Community 10 - "SizeChartEditor.tsx"
Cohesion: 0.08
Nodes (13): handler(), handler(), @supabase/supabase-js@2.108.1, typescript@~6.0.2, @supabase/supabase-js, typescript, CachedRate, exchangeRate() (+5 more)

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

### Community 16 - "LOFT Admin — продукт и рабочие процессы менеджера"
Cohesion: 0.17
Nodes (12): LOFT Admin — продукт и рабочие процессы менеджера, Аналитика и деньги, Заказы: принятие, деньги и выполнение, Заявки на спецзаказ, Колокольчик, задачи, напоминания, Назначение и роли, Настройки и границы развития, Отмены и возвраты (+4 more)

### Community 18 - "Security architecture — 6 November 2026"
Cohesion: 0.29
Nodes (6): Deployment order, Inventory and payments, Notifications and monitoring, Security architecture — 6 November 2026, Sessions, registration and files, Validation and limits

### Community 21 - "theme.ts"
Cohesion: 0.29
Nodes (8): AdminTheme, applyThemeToDom(), currentTheme, getTheme(), listeners, setTheme(), subscribe(), useTheme()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `OrdersPage.tsx` to `Зависимости и инструменты`, `AnalyticsPage.tsx`, `Иконки и справочники`, `DashboardPage.tsx`, `ReminderSettings.tsx`, `useAdminLanguage`, `DESIGN_SYSTEM.md`, `PaymentCardsSettings.tsx`, `theme.ts`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Should `Зависимости и инструменты` be split into smaller, more focused modules?**
  _Cohesion score 0.06464646464646465 - nodes in this community are weakly interconnected._
- **Why does `useAdminLanguage()` connect `useAdminLanguage` to `AnalyticsPage.tsx`, `Иконки и справочники`, `DashboardPage.tsx`, `ReminderSettings.tsx`, `OrdersPage.tsx`, `DESIGN_SYSTEM.md`, `PaymentCardsSettings.tsx`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Should `AnalyticsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05311676909569798 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Браузерные проверки` to `Зависимости и инструменты`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.0664451827242525 - nodes in this community are weakly interconnected._
- **Should `DashboardPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.056022408963585436 - nodes in this community are weakly interconnected._
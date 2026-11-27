# Graph Report - loft-security-admin  (2026-11-27)

## Corpus Check
- 119 files · ~69,781 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 770 nodes · 2304 edges · 29 communities (26 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `43e084e2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- AnalyticsPage.tsx
- Иконки и справочники
- react
- ReminderSettings.tsx
- useAdminLanguage
- OrdersPage.tsx
- AnimatedRoutes.tsx
- LOFT Admin — техническая архитектура
- Браузерные проверки
- SizeChartEditor.tsx
- Типы клиентского кода
- Типы инструментов сборки
- Типы серверного кода
- App.tsx
- Настройки TypeScript
- LOFT Admin — продукт и рабочие процессы менеджера
- DashboardPage.tsx
- Security architecture — 6 November 2026
- CampaignsPage.tsx
- TESTING.md
- theme.ts
- CACHING.md
- react-router-dom
- i18n.ts
- PaymentCardsSettings.tsx
- AdminDialog.tsx
- LOFT Admin
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `useAdminLanguage()` - 85 edges
2. `tx()` - 71 edges
3. `t()` - 65 edges
4. `react` - 45 edges
5. `uiError()` - 38 edges
6. `OrdersPage()` - 32 edges
7. `useLocalTimeZone()` - 31 edges
8. `useAdminRefresh()` - 30 edges
9. `lucide-react` - 29 edges
10. `DashboardPage()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `7. Кеш и Realtime` --references--> `ResourceCache`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/resourceCache.ts
- `Компоненты и точки переиспользования` --references--> `ContentSkeleton()`  [INFERRED]
  docs/DESIGN_SYSTEM.md → src/components/PageSkeleton.tsx
- `Интерфейс и состояние` --references--> `useAdminViewState()`  [INFERRED]
  AGENTS.md → src/lib/useAdminViewState.ts
- `7. Кеш и Realtime` --references--> `invalidateTopics()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/adminLive.ts
- `8. Время, локализация и аналитика` --references--> `tx()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/i18n.ts

## Import Cycles
- None detected.

## Communities (29 total, 3 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (50): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-icons@^5.7.0, react-router-dom@7.18.2, sonner@^2.0.7, @supabase/supabase-js@2.108.1, devDependencies (+42 more)

### Community 1 - "AnalyticsPage.tsx"
Cohesion: 0.10
Nodes (34): adminDate(), adminTime(), analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, BrandStat, CategoryStat, DailyStatsEntry (+26 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.07
Nodes (30): CategoryIconProps, ICON_MAP, BackpackIcon, BeanieIcon, BeltIcon, BLOCK_ICONS, BootIcon, CapIcon (+22 more)

### Community 3 - "react"
Cohesion: 0.26
Nodes (4): lucide-react, react, groups, names

### Community 4 - "ReminderSettings.tsx"
Cohesion: 0.29
Nodes (12): LoftSwitch(), labels, ReminderSettings(), clock(), instant(), localWorkClock(), Parts, parts() (+4 more)

### Community 5 - "useAdminLanguage"
Cohesion: 0.06
Nodes (89): sonner, AdminAddButton(), AdminLanguagePicker(), AdminHeaderActions(), AppToaster(), readTheme(), subscribe(), CancelOrderModal() (+81 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.06
Nodes (74): 4. Данные, RPC и Storage, 8. Время, локализация и аналитика, AdminNotification, NotificationBell(), seenStorageKey(), labels, OrderHistory(), ProtectedFile() (+66 more)

### Community 7 - "AnimatedRoutes.tsx"
Cohesion: 0.14
Nodes (20): AnimatedRoutes(), captureOutgoingPage(), content(), RouteFrame(), section(), PageSkeleton(), RouteErrorBoundary, getSavedPositions() (+12 more)

### Community 8 - "LOFT Admin — техническая архитектура"
Cohesion: 0.11
Nodes (20): 10. Развёртывание и проверки, 1. Общая схема и граница репозитория, 2. Технологии и структура, 5. Авторизация и серверный endpoint, 6. Реальные направления операций, 7. Кеш и Realtime, 9. Фоновые задачи и рассылки, LOFT Admin — техническая архитектура (+12 more)

### Community 9 - "Браузерные проверки"
Cohesion: 0.11
Nodes (23): card(), heading(), live(), Motion, MotionWindow, openCatalog(), recordCount(), routeCases (+15 more)

### Community 10 - "SizeChartEditor.tsx"
Cohesion: 0.07
Nodes (20): handler(), handler(), typescript@~6.0.2, @supabase/supabase-js, typescript, CachedRate, exchangeRate(), valid() (+12 more)

### Community 11 - "Типы клиентского кода"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 12 - "Типы инструментов сборки"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 13 - "Типы серверного кода"
Cohesion: 0.13
Nodes (14): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, noUnusedLocals, noUnusedParameters (+6 more)

### Community 14 - "App.tsx"
Cohesion: 0.15
Nodes (21): App(), ProtectedLayout(), invalidateAllCaches(), AnalyticsPage, BrandsPage, BrandsPageResource, CampaignsPage, CategoriesPage (+13 more)

### Community 15 - "Настройки TypeScript"
Cohesion: 0.40
Nodes (4): compilerOptions, rewriteRelativeImportExtensions, files, references

### Community 16 - "LOFT Admin — продукт и рабочие процессы менеджера"
Cohesion: 0.17
Nodes (12): LOFT Admin — продукт и рабочие процессы менеджера, Аналитика и деньги, Заказы: принятие, деньги и выполнение, Заявки на спецзаказ, Колокольчик, задачи, напоминания, Назначение и роли, Настройки и границы развития, Отмены и возвраты (+4 more)

### Community 17 - "DashboardPage.tsx"
Cohesion: 0.06
Nodes (64): 3. Маршруты и состояние, AdminMenuRows(), AdminHeaderShell(), DashboardHeaderActions(), HeaderSlot, pageIcons, settingsIcons, dashboardActionClass (+56 more)

### Community 18 - "Security architecture — 6 November 2026"
Cohesion: 0.29
Nodes (6): Deployment order, Inventory and payments, Notifications and monitoring, Security architecture — 6 November 2026, Sessions, registration and files, Validation and limits

### Community 19 - "CampaignsPage.tsx"
Cohesion: 0.07
Nodes (31): Telegram и рассылки, Данные и безопасность, Интерфейс и состояние, Контекст перед задачей, Правила работы с LOFT Admin, Проверки и отчёт, LOFT Admin — действующая дизайн-система, Адаптивность и доступность (+23 more)

### Community 21 - "theme.ts"
Cohesion: 0.29
Nodes (8): AdminTheme, applyThemeToDom(), currentTheme, getTheme(), listeners, setTheme(), subscribe(), useTheme()

### Community 23 - "react-router-dom"
Cohesion: 0.36
Nodes (6): react-router-dom, AdminMenuPage(), MenuEntry, SettingsPageResource, CatalogMenuPage(), SettingsPage()

### Community 24 - "i18n.ts"
Cohesion: 0.23
Nodes (10): AdminLanguage, interpolate(), language, listeners, publish(), saved(), setLanguageScope(), UiKey (+2 more)

### Community 25 - "PaymentCardsSettings.tsx"
Cohesion: 0.46
Nodes (6): PaymentCardsSettings(), formatCardNumber(), parsePaymentCards(), PaymentCard, PaymentCards, PaymentCurrency

### Community 26 - "AdminDialog.tsx"
Cohesion: 0.50
Nodes (3): react-dom@^19.2.6, react-dom, stack

### Community 27 - "LOFT Admin"
Cohesion: 0.50
Nodes (4): Documentation, Expanding the ESLint configuration, LOFT Admin, React Compiler

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `package.json`, `AnalyticsPage.tsx`, `Иконки и справочники`, `ReminderSettings.tsx`, `useAdminLanguage`, `OrdersPage.tsx`, `AnimatedRoutes.tsx`, `LOFT Admin — техническая архитектура`, `SizeChartEditor.tsx`, `App.tsx`, `DashboardPage.tsx`, `CampaignsPage.tsx`, `theme.ts`, `react-router-dom`, `i18n.ts`, `PaymentCardsSettings.tsx`, `AdminDialog.tsx`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05241090146750524 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `package.json` to `Браузерные проверки`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `AnalyticsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10220673635307782 - nodes in this community are weakly interconnected._
- **Why does `useAdminLanguage()` connect `useAdminLanguage` to `AnalyticsPage.tsx`, `Иконки и справочники`, `react`, `ReminderSettings.tsx`, `OrdersPage.tsx`, `SizeChartEditor.tsx`, `App.tsx`, `DashboardPage.tsx`, `CampaignsPage.tsx`, `react-router-dom`, `i18n.ts`, `PaymentCardsSettings.tsx`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.07394957983193277 - nodes in this community are weakly interconnected._
- **Should `useAdminLanguage` be split into smaller, more focused modules?**
  _Cohesion score 0.0564240790655885 - nodes in this community are weakly interconnected._
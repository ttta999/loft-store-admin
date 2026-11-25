# Graph Report - loft33-admin  (2026-11-25)

## Corpus Check
- 117 files · ~68,607 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 743 nodes · 2256 edges · 34 communities (30 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f69f820b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- AnalyticsPage.tsx
- Иконки и справочники
- DashboardPage.tsx
- server-packaging.test.ts
- ProductsPage.tsx
- OrdersPage.tsx
- DESIGN_SYSTEM.md
- LOFT Admin — техническая архитектура
- Браузерные проверки
- getExchangeRate.ts
- Типы клиентского кода
- Типы инструментов сборки
- Типы серверного кода
- NotificationBell.tsx
- Настройки TypeScript
- LOFT Admin — действующая дизайн-система
- RefundsPage.tsx
- Security architecture — 6 November 2026
- useAdminLanguage
- TESTING.md
- adminLive.ts
- CACHING.md
- supabase.ts
- workHours.ts
- LOFT Admin — продукт и рабочие процессы менеджера
- orderState.ts
- i18n.ts
- sonner
- devDependencies
- SizeChartEditor.tsx
- @tailwindcss/vite
- scripts
- overrides

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
10. `DashboardPage()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `7. Кеш и Realtime` --references--> `useAdminRefresh()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/adminLive.ts
- `3. Маршруты и состояние` --references--> `getCurrentUser()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/auth.ts
- `4. Данные, RPC и Storage` --references--> `readAll()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/readAll.ts
- `Интерфейс и состояние` --references--> `ResourceCache`  [INFERRED]
  AGENTS.md → src/lib/resourceCache.ts
- `4. Данные, RPC и Storage` --references--> `privateFile()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/supabase.ts

## Import Cycles
- None detected.

## Communities (34 total, 4 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.14
Nodes (16): eslint@^10.3.0, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.6.0, typescript-eslint@^8.59.2, name, private (+8 more)

### Community 1 - "AnalyticsPage.tsx"
Cohesion: 0.09
Nodes (38): adminDate(), adminTime(), analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, BrandStat, CategoryStat, DailyStatsEntry (+30 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.07
Nodes (37): CategoryIcon(), CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPickerProps, BackpackIcon (+29 more)

### Community 3 - "DashboardPage.tsx"
Cohesion: 0.06
Nodes (63): react, App(), ProtectedLayout(), AdminMenuPage(), AdminMenuRows(), MenuEntry, DashboardHeaderActions(), HeaderSlot (+55 more)

### Community 5 - "ProductsPage.tsx"
Cohesion: 0.06
Nodes (43): lucide-react, RecommendationPicker(), Recommendations, brandsCacheApi, categoriesCacheApi, categoryRowsCacheApi, colorsCacheApi, productsCacheApi (+35 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.13
Nodes (19): ordersCacheApi, OrdersPageResource, confirmPayment(), nextSpecialStatuses(), SPECIAL_DELIVERY, SPECIAL_PICKUP, specialOrderIds(), specialStatusTone() (+11 more)

### Community 7 - "DESIGN_SYSTEM.md"
Cohesion: 0.06
Nodes (45): Telegram и рассылки, Данные и безопасность, Контекст перед задачей, Правила работы с LOFT Admin, Проверки и отчёт, 3. Маршруты и состояние, Documentation, Expanding the ESLint configuration (+37 more)

### Community 8 - "LOFT Admin — техническая архитектура"
Cohesion: 0.11
Nodes (20): 10. Развёртывание и проверки, 1. Общая схема и граница репозитория, 2. Технологии и структура, 4. Данные, RPC и Storage, 5. Авторизация и серверный endpoint, 6. Реальные направления операций, 9. Фоновые задачи и рассылки, LOFT Admin — техническая архитектура (+12 more)

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

### Community 14 - "NotificationBell.tsx"
Cohesion: 0.23
Nodes (13): AdminNotification, NotificationBell(), seenStorageKey(), dashboardActionClass, DashboardSnapshot, readAll(), getRefundDetail(), getRefunds() (+5 more)

### Community 15 - "Настройки TypeScript"
Cohesion: 0.40
Nodes (4): compilerOptions, rewriteRelativeImportExtensions, files, references

### Community 16 - "LOFT Admin — действующая дизайн-система"
Cohesion: 0.29
Nodes (7): LOFT Admin — действующая дизайн-система, Адаптивность и доступность, Анимации: точные значения и отличия от клиента, Палитра и тема, Типографика, отступы, названия, Уточнение сетки брюк и джинсов — 19.11.2026, Чек-лист нового экрана

### Community 17 - "RefundsPage.tsx"
Cohesion: 0.26
Nodes (14): formatMoney(), orderStatus(), RefundsPageResource, refundAction(), uploadRefundProof(), sendClientNotification(), actions, cancellationSource() (+6 more)

### Community 18 - "Security architecture — 6 November 2026"
Cohesion: 0.29
Nodes (6): Deployment order, Inventory and payments, Notifications and monitoring, Security architecture — 6 November 2026, Sessions, registration and files, Validation and limits

### Community 19 - "useAdminLanguage"
Cohesion: 0.09
Nodes (71): Интерфейс и состояние, 8. Время, локализация и аналитика, Компоненты и точки переиспользования, AdminAddButton(), AdminDialog(), stack, AdminHeaderActions(), CancelOrderModal() (+63 more)

### Community 21 - "adminLive.ts"
Cohesion: 0.15
Nodes (7): 7. Кеш и Realtime, DataTopic, dependencies, invalidateTopics(), listeners, useAdminLive(), ResourceCache

### Community 23 - "supabase.ts"
Cohesion: 0.36
Nodes (3): labels, createDataFetch(), dataCache

### Community 24 - "workHours.ts"
Cohesion: 0.40
Nodes (9): clock(), instant(), localWorkClock(), Parts, parts(), SHOP_TIME_ZONE, validClock(), wall() (+1 more)

### Community 25 - "LOFT Admin — продукт и рабочие процессы менеджера"
Cohesion: 0.17
Nodes (12): LOFT Admin — продукт и рабочие процессы менеджера, Аналитика и деньги, Заказы: принятие, деньги и выполнение, Заявки на спецзаказ, Колокольчик, задачи, напоминания, Назначение и роли, Настройки и границы развития, Отмены и возвраты (+4 more)

### Community 26 - "orderState.ts"
Cohesion: 0.20
Nodes (9): canClientCancel(), canManagerCancel(), formatOrderMoney(), hasSpecialItems(), moneyAmount(), nextOrdinaryStatuses(), OrderLike, REFUND_STATUSES (+1 more)

### Community 27 - "i18n.ts"
Cohesion: 0.10
Nodes (27): AdminLanguagePicker(), getCurrentUser(), login(), LoginResult, logout(), MfaStep, prepareSecondFactor(), requireAuth() (+19 more)

### Community 28 - "sonner"
Cohesion: 0.18
Nodes (11): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-dom@^19.2.6, react-icons@^5.7.0, react-router-dom@7.18.2, sonner@^2.0.7, @supabase/supabase-js@2.108.1 (+3 more)

### Community 29 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, tailwindcss@^4.3.0, @types/node@^24.12.3, @types/react@^19.2.14, @types/react-dom@^19.2.3, typescript@~6.0.2, tailwindcss, @types/node (+2 more)

### Community 30 - "SizeChartEditor.tsx"
Cohesion: 0.47
Nodes (6): blankChart(), ChartDraft, chartError(), chartPayload(), ChartScope, chartTemplates

### Community 31 - "@tailwindcss/vite"
Cohesion: 0.29
Nodes (6): @tailwindcss/vite@^4.3.0, vite@^8.0.12, @vitejs/plugin-react@^6.0.1, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 32 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, preview, test, test:e2e

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `DashboardPage.tsx` to `package.json`, `AnalyticsPage.tsx`, `Иконки и справочники`, `ProductsPage.tsx`, `OrdersPage.tsx`, `DESIGN_SYSTEM.md`, `LOFT Admin — техническая архитектура`, `NotificationBell.tsx`, `RefundsPage.tsx`, `useAdminLanguage`, `adminLive.ts`, `supabase.ts`, `i18n.ts`, `sonner`, `SizeChartEditor.tsx`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1437908496732026 - nodes in this community are weakly interconnected._
- **Why does `useAdminLanguage()` connect `useAdminLanguage` to `AnalyticsPage.tsx`, `Иконки и справочники`, `DashboardPage.tsx`, `ProductsPage.tsx`, `OrdersPage.tsx`, `DESIGN_SYSTEM.md`, `NotificationBell.tsx`, `RefundsPage.tsx`, `supabase.ts`, `i18n.ts`, `SizeChartEditor.tsx`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Should `AnalyticsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08973172987974098 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Браузерные проверки` to `package.json`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.0664451827242525 - nodes in this community are weakly interconnected._
- **Should `DashboardPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06293706293706294 - nodes in this community are weakly interconnected._
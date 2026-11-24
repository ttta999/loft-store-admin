# Graph Report - loft24-release-admin  (2026-11-24)

## Corpus Check
- 114 files · ~66,634 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 715 nodes · 2156 edges · 20 communities (18 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b5fa2670`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Зависимости и инструменты
- ProductsPage.tsx
- Иконки и справочники
- DashboardPage.tsx
- supabase.ts
- useAdminLanguage
- RefundsPage.tsx
- App.tsx
- OrdersPage.tsx
- Браузерные проверки
- getExchangeRate.ts
- Типы клиентского кода
- Типы инструментов сборки
- Типы серверного кода
- Настройки TypeScript
- DESIGN_SYSTEM.md
- Security architecture — 6 November 2026
- TESTING.md
- i18n.ts
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
10. `DashboardPage()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `4. Данные, RPC и Storage` --references--> `readAll()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/readAll.ts
- `7. Кеш и Realtime` --references--> `useAdminRefresh()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/adminLive.ts
- `8. Время, локализация и аналитика` --references--> `adminDateTime()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/adminDateTime.ts
- `8. Время, локализация и аналитика` --references--> `t()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/i18n.ts
- `8. Время, локализация и аналитика` --references--> `tx()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/i18n.ts

## Import Cycles
- None detected.

## Communities (20 total, 2 thin omitted)

### Community 0 - "Зависимости и инструменты"
Cohesion: 0.06
Nodes (42): react-icons@^5.7.0, devDependencies, eslint@^10.3.0, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.6.0, tailwindcss@^4.3.0 (+34 more)

### Community 1 - "ProductsPage.tsx"
Cohesion: 0.05
Nodes (55): Recommendations, analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, brandsCacheApi, BrandStat, categoriesCacheApi, categoryRowsCacheApi (+47 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.07
Nodes (37): CategoryIcon(), CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPickerProps, BackpackIcon (+29 more)

### Community 3 - "DashboardPage.tsx"
Cohesion: 0.10
Nodes (31): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-router-dom@7.18.2, sonner@^2.0.7, lucide-react, react, react-router-dom (+23 more)

### Community 4 - "supabase.ts"
Cohesion: 0.07
Nodes (25): 7. Кеш и Realtime, typescript@~6.0.2, typescript, labels, DataTopic, dependencies, invalidateTopics(), listeners (+17 more)

### Community 5 - "useAdminLanguage"
Cohesion: 0.10
Nodes (63): Интерфейс и состояние, Компоненты и точки переиспользования, AdminAddButton(), AdminDialog(), stack, AdminHeaderActions(), CancelOrderModal(), Collapse() (+55 more)

### Community 6 - "RefundsPage.tsx"
Cohesion: 0.08
Nodes (51): AdminNotification, NotificationBell(), seenStorageKey(), labels, adminDate(), adminDateTime(), adminTime(), refundsCacheApi (+43 more)

### Community 7 - "App.tsx"
Cohesion: 0.06
Nodes (53): 3. Маршруты и состояние, react-dom@^19.2.6, react-dom, App(), ProtectedLayout(), AdminHeaderShell(), HeaderSlot, pageIcons (+45 more)

### Community 8 - "OrdersPage.tsx"
Cohesion: 0.06
Nodes (42): 10. Развёртывание и проверки, 1. Общая схема и граница репозитория, 2. Технологии и структура, 4. Данные, RPC и Storage, 5. Авторизация и серверный endpoint, 6. Реальные направления операций, 8. Время, локализация и аналитика, 9. Фоновые задачи и рассылки (+34 more)

### Community 9 - "Браузерные проверки"
Cohesion: 0.17
Nodes (13): ADMIN, catalog(), Harness, install(), jwt(), now(), productId, session() (+5 more)

### Community 10 - "getExchangeRate.ts"
Cohesion: 0.13
Nodes (10): handler(), handler(), @supabase/supabase-js@2.108.1, @supabase/supabase-js, CachedRate, exchangeRate(), valid(), VercelRequest (+2 more)

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

### Community 16 - "DESIGN_SYSTEM.md"
Cohesion: 0.06
Nodes (36): Telegram и рассылки, Данные и безопасность, Контекст перед задачей, Правила работы с LOFT Admin, Проверки и отчёт, LOFT Admin — действующая дизайн-система, Адаптивность и доступность, Анимации: точные значения и отличия от клиента (+28 more)

### Community 18 - "Security architecture — 6 November 2026"
Cohesion: 0.29
Nodes (6): Deployment order, Inventory and payments, Notifications and monitoring, Security architecture — 6 November 2026, Sessions, registration and files, Validation and limits

### Community 21 - "i18n.ts"
Cohesion: 0.08
Nodes (35): AdminLanguagePicker(), login(), LoginResult, logout(), MfaStep, prepareSecondFactor(), verifySecondFactor(), AdminLanguage (+27 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `DashboardPage.tsx` to `Зависимости и инструменты`, `ProductsPage.tsx`, `Иконки и справочники`, `supabase.ts`, `useAdminLanguage`, `RefundsPage.tsx`, `App.tsx`, `OrdersPage.tsx`, `DESIGN_SYSTEM.md`, `i18n.ts`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Should `Зависимости и инструменты` be split into smaller, more focused modules?**
  _Cohesion score 0.06464646464646465 - nodes in this community are weakly interconnected._
- **Why does `useAdminLanguage()` connect `useAdminLanguage` to `ProductsPage.tsx`, `Иконки и справочники`, `DashboardPage.tsx`, `supabase.ts`, `RefundsPage.tsx`, `App.tsx`, `OrdersPage.tsx`, `DESIGN_SYSTEM.md`, `i18n.ts`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `ProductsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.050921861281826165 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Браузерные проверки` to `Зависимости и инструменты`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.0664451827242525 - nodes in this community are weakly interconnected._
- **Should `DashboardPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10452961672473868 - nodes in this community are weakly interconnected._
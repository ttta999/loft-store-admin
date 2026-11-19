# Graph Report - loft-admin-final  (2026-11-19)

## Corpus Check
- 113 files · ~65,583 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 714 nodes · 2168 edges · 20 communities (18 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4f4cafa6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Зависимости и инструменты
- CampaignsPage.tsx
- Иконки и справочники
- pagePreload.ts
- supabase.ts
- useAdminLanguage
- OrdersPage.tsx
- DESIGN_SYSTEM.md
- LOFT Admin — техническая архитектура
- Браузерные проверки
- getExchangeRate.ts
- Типы клиентского кода
- Типы инструментов сборки
- Типы серверного кода
- ProductsPage.tsx
- Настройки TypeScript
- LOFT Admin — продукт и рабочие процессы менеджера
- Security architecture — 6 November 2026
- TESTING.md
- CACHING.md

## God Nodes (most connected - your core abstractions)
1. `useAdminLanguage()` - 93 edges
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
- `7. Кеш и Realtime` --references--> `invalidateTopics()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/adminLive.ts
- `7. Кеш и Realtime` --references--> `useAdminRefresh()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/adminLive.ts
- `3. Маршруты и состояние` --references--> `parentRoute()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/adminNavigation.ts
- `3. Маршруты и состояние` --references--> `getCurrentUser()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/auth.ts
- `8. Время, локализация и аналитика` --references--> `t()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/i18n.ts

## Import Cycles
- None detected.

## Communities (20 total, 2 thin omitted)

### Community 0 - "Зависимости и инструменты"
Cohesion: 0.06
Nodes (48): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-icons@^5.7.0, react-router-dom@7.18.2, sonner@^2.0.7, @supabase/supabase-js@2.108.1, devDependencies (+40 more)

### Community 1 - "CampaignsPage.tsx"
Cohesion: 0.09
Nodes (39): Collapse(), LoftSwitch(), labels, ReminderSettings(), adminDate(), adminTime(), CampaignContent, campaignMessage() (+31 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.07
Nodes (37): CategoryIcon(), CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPickerProps, BackpackIcon (+29 more)

### Community 3 - "pagePreload.ts"
Cohesion: 0.06
Nodes (54): react-dom@^19.2.6, react-dom, react-router-dom, App(), ProtectedLayout(), AnimatedRoutes(), RouteFrame(), RouteErrorBoundary (+46 more)

### Community 4 - "supabase.ts"
Cohesion: 0.06
Nodes (41): typescript@~6.0.2, typescript, AdminMenuRows(), groups, ManagerTasks(), names, getCurrentUser(), login() (+33 more)

### Community 5 - "useAdminLanguage"
Cohesion: 0.08
Nodes (71): Компоненты и точки переиспользования, lucide-react, react, sonner, AdminAddButton(), AdminDialog(), stack, AdminLanguagePicker() (+63 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.07
Nodes (66): 8. Время, локализация и аналитика, AdminNotification, NotificationBell(), seenStorageKey(), labels, OrderHistory(), adminDateTime(), DataTopic (+58 more)

### Community 7 - "DESIGN_SYSTEM.md"
Cohesion: 0.08
Nodes (29): LOFT Admin — действующая дизайн-система, Адаптивность и доступность, Анимации: точные значения и отличия от клиента, Палитра и тема, Типографика, отступы, названия, Уточнение сетки брюк и джинсов — 19.11.2026, Чек-лист нового экрана, Documentation (+21 more)

### Community 8 - "LOFT Admin — техническая архитектура"
Cohesion: 0.07
Nodes (23): Telegram и рассылки, Данные и безопасность, Интерфейс и состояние, Контекст перед задачей, Правила работы с LOFT Admin, Проверки и отчёт, 10. Развёртывание и проверки, 1. Общая схема и граница репозитория (+15 more)

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
Cohesion: 0.05
Nodes (51): 4. Данные, RPC и Storage, Recommendations, analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, brandsCacheApi, BrandStat, categoriesCacheApi (+43 more)

### Community 15 - "Настройки TypeScript"
Cohesion: 0.40
Nodes (4): compilerOptions, rewriteRelativeImportExtensions, files, references

### Community 16 - "LOFT Admin — продукт и рабочие процессы менеджера"
Cohesion: 0.17
Nodes (12): LOFT Admin — продукт и рабочие процессы менеджера, Аналитика и деньги, Заказы: принятие, деньги и выполнение, Заявки на спецзаказ, Колокольчик, задачи, напоминания, Назначение и роли, Настройки и границы развития, Отмены и возвраты (+4 more)

### Community 18 - "Security architecture — 6 November 2026"
Cohesion: 0.29
Nodes (6): Deployment order, Inventory and payments, Notifications and monitoring, Security architecture — 6 November 2026, Sessions, registration and files, Validation and limits

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `useAdminLanguage` to `Зависимости и инструменты`, `CampaignsPage.tsx`, `Иконки и справочники`, `pagePreload.ts`, `supabase.ts`, `OrdersPage.tsx`, `DESIGN_SYSTEM.md`, `ProductsPage.tsx`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **Should `Зависимости и инструменты` be split into smaller, more focused modules?**
  _Cohesion score 0.05568627450980392 - nodes in this community are weakly interconnected._
- **Why does `useAdminLanguage()` connect `useAdminLanguage` to `CampaignsPage.tsx`, `Иконки и справочники`, `pagePreload.ts`, `supabase.ts`, `OrdersPage.tsx`, `DESIGN_SYSTEM.md`, `ProductsPage.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Should `CampaignsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09098639455782313 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Браузерные проверки` to `Зависимости и инструменты`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.0664451827242525 - nodes in this community are weakly interconnected._
- **Should `pagePreload.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06151062867480778 - nodes in this community are weakly interconnected._
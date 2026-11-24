# Graph Report - loft24-release-admin  (2026-11-24)

## Corpus Check
- 114 files · ~66,905 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 716 nodes · 2160 edges · 20 communities (18 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5860b327`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Зависимости и инструменты
- ProductsPage.tsx
- Иконки и справочники
- displayMoney
- ref_node_assert
- useAdminLanguage
- OrdersPage.tsx
- App.tsx
- LOFT Admin — техническая архитектура
- Браузерные проверки
- BrandsPage.tsx
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
- `Переход от возврата к заказу` --references--> `useOrderFocus()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/useOrderFocus.ts
- `4. Данные, RPC и Storage` --references--> `readAll()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/readAll.ts
- `4. Данные, RPC и Storage` --references--> `privateFile()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/supabase.ts
- `7. Кеш и Realtime` --references--> `invalidateTopics()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/adminLive.ts
- `7. Кеш и Realtime` --references--> `useAdminRefresh()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/adminLive.ts

## Import Cycles
- None detected.

## Communities (20 total, 2 thin omitted)

### Community 0 - "Зависимости и инструменты"
Cohesion: 0.06
Nodes (48): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-icons@^5.7.0, react-router-dom@7.18.2, sonner@^2.0.7, devDependencies, eslint@^10.3.0 (+40 more)

### Community 1 - "ProductsPage.tsx"
Cohesion: 0.07
Nodes (38): Recommendations, analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, brandsCacheApi, BrandStat, categoryRowsCacheApi, CategoryStat (+30 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.05
Nodes (56): AdminAddButton(), CategoryIcon(), CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPicker() (+48 more)

### Community 3 - "displayMoney"
Cohesion: 0.48
Nodes (5): catalogMoney(), displayMoney(), MoneyCurrency, moneyNumber(), roundUsd()

### Community 4 - "ref_node_assert"
Cohesion: 0.07
Nodes (21): handler(), handler(), @supabase/supabase-js@2.108.1, typescript@~6.0.2, @supabase/supabase-js, typescript, CachedRate, exchangeRate() (+13 more)

### Community 5 - "useAdminLanguage"
Cohesion: 0.10
Nodes (66): Интерфейс и состояние, 8. Время, локализация и аналитика, Компоненты и точки переиспользования, AdminDialog(), stack, AdminHeaderActions(), CancelOrderModal(), Collapse() (+58 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.06
Nodes (72): react, groups, names, AdminNotification, seenStorageKey(), labels, ProtectedFile(), SpecialOrderPhoto() (+64 more)

### Community 7 - "App.tsx"
Cohesion: 0.07
Nodes (51): 3. Маршруты и состояние, react-dom@^19.2.6, react-dom, react-router-dom, App(), ProtectedLayout(), AdminHeaderShell(), HeaderSlot (+43 more)

### Community 8 - "LOFT Admin — техническая архитектура"
Cohesion: 0.08
Nodes (18): 10. Развёртывание и проверки, 1. Общая схема и граница репозитория, 2. Технологии и структура, 4. Данные, RPC и Storage, 5. Авторизация и серверный endpoint, 6. Реальные направления операций, 7. Кеш и Realtime, 9. Фоновые задачи и рассылки (+10 more)

### Community 9 - "Браузерные проверки"
Cohesion: 0.17
Nodes (13): ADMIN, catalog(), Harness, install(), jwt(), now(), productId, session() (+5 more)

### Community 10 - "BrandsPage.tsx"
Cohesion: 0.15
Nodes (22): adminDate(), adminTime(), createLocalDateKey(), dateLocale(), dateTimeOptions, formatLocalDate(), formatLocalDateTime(), formatLocalTime() (+14 more)

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
Cohesion: 0.06
Nodes (48): lucide-react, AdminLanguagePicker(), AdminMenuPage(), AdminMenuRows(), MenuEntry, PaymentCardsSettings(), login(), LoginResult (+40 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `OrdersPage.tsx` to `Зависимости и инструменты`, `ProductsPage.tsx`, `Иконки и справочники`, `useAdminLanguage`, `App.tsx`, `BrandsPage.tsx`, `DESIGN_SYSTEM.md`, `i18n.ts`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Should `Зависимости и инструменты` be split into smaller, more focused modules?**
  _Cohesion score 0.05647058823529412 - nodes in this community are weakly interconnected._
- **Why does `useAdminLanguage()` connect `useAdminLanguage` to `ProductsPage.tsx`, `Иконки и справочники`, `OrdersPage.tsx`, `App.tsx`, `BrandsPage.tsx`, `DESIGN_SYSTEM.md`, `i18n.ts`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `ProductsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Браузерные проверки` to `Зависимости и инструменты`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.05223880597014925 - nodes in this community are weakly interconnected._
- **Should `ref_node_assert` be split into smaller, more focused modules?**
  _Cohesion score 0.06748911465892599 - nodes in this community are weakly interconnected._
# Graph Report - loft-security-admin  (2026-11-26)

## Corpus Check
- 119 files · ~69,671 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 760 nodes · 2288 edges · 23 communities (21 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `39461ef8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- AnalyticsPage.tsx
- Иконки и справочники
- DashboardPage.tsx
- supabase.ts
- ProductsPage.tsx
- OrdersPage.tsx
- DESIGN_SYSTEM.md
- LOFT Admin — техническая архитектура
- Браузерные проверки
- getExchangeRate.ts
- Типы клиентского кода
- Типы инструментов сборки
- Типы серверного кода
- supabase.ts
- Настройки TypeScript
- DESIGN_SYSTEM.md
- DashboardPage.tsx
- Security architecture — 6 November 2026
- CampaignsPage.tsx
- TESTING.md
- CACHING.md
- i18n.ts

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
- `3. Маршруты и состояние` --references--> `getCurrentUser()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/auth.ts
- `Интерфейс и состояние` --references--> `ResourceCache`  [INFERRED]
  AGENTS.md → src/lib/resourceCache.ts
- `4. Данные, RPC и Storage` --references--> `readAll()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/readAll.ts
- `7. Кеш и Realtime` --references--> `useAdminRefresh()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/adminLive.ts
- `8. Время, локализация и аналитика` --references--> `tx()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/i18n.ts

## Import Cycles
- None detected.

## Communities (23 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (50): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-dom@^19.2.6, react-icons@^5.7.0, react-router-dom@7.18.2, sonner@^2.0.7, @supabase/supabase-js@2.108.1 (+42 more)

### Community 1 - "AnalyticsPage.tsx"
Cohesion: 0.08
Nodes (42): adminDate(), adminTime(), analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, BrandStat, categoryRowsCacheApi, CategoryStat (+34 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.07
Nodes (36): CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPickerProps, BackpackIcon, BeanieIcon (+28 more)

### Community 3 - "DashboardPage.tsx"
Cohesion: 0.14
Nodes (20): Telegram и рассылки, Данные и безопасность, Интерфейс и состояние, Контекст перед задачей, Правила работы с LOFT Admin, Проверки и отчёт, catalogMoney(), displayMoney() (+12 more)

### Community 4 - "supabase.ts"
Cohesion: 0.07
Nodes (25): 7. Кеш и Realtime, typescript@~6.0.2, typescript, labels, ReminderSettings(), DataTopic, dependencies, invalidateTopics() (+17 more)

### Community 5 - "ProductsPage.tsx"
Cohesion: 0.08
Nodes (42): AdminAddButton(), CategoryIcon(), IconPicker(), JeansIcon(), JeansIconProps, RecommendationPicker(), Recommendations, categoriesCacheApi (+34 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.07
Nodes (64): 4. Данные, RPC и Storage, 8. Время, локализация и аналитика, NotificationBell(), labels, OrderHistory(), ProtectedFile(), SpecialOrderPhoto(), adminDateTime() (+56 more)

### Community 7 - "DESIGN_SYSTEM.md"
Cohesion: 0.08
Nodes (42): react, App(), AdminHeaderShell(), AnimatedRoutes(), captureOutgoingPage(), content(), RouteFrame(), section() (+34 more)

### Community 8 - "LOFT Admin — техническая архитектура"
Cohesion: 0.11
Nodes (20): 10. Развёртывание и проверки, 1. Общая схема и граница репозитория, 2. Технологии и структура, 3. Маршруты и состояние, 5. Авторизация и серверный endpoint, 6. Реальные направления операций, 9. Фоновые задачи и рассылки, LOFT Admin — техническая архитектура (+12 more)

### Community 9 - "Браузерные проверки"
Cohesion: 0.15
Nodes (15): catalogSections, sections, ADMIN, catalog(), Harness, install(), jwt(), now() (+7 more)

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

### Community 14 - "supabase.ts"
Cohesion: 0.10
Nodes (35): sonner, ProtectedLayout(), CancelOrderModal(), PageSkeleton(), getCurrentUser(), login(), LoginResult, logout() (+27 more)

### Community 15 - "Настройки TypeScript"
Cohesion: 0.40
Nodes (4): compilerOptions, rewriteRelativeImportExtensions, files, references

### Community 16 - "DESIGN_SYSTEM.md"
Cohesion: 0.07
Nodes (27): LOFT Admin — действующая дизайн-система, Адаптивность и доступность, Анимации: точные значения и отличия от клиента, Палитра и тема, Типографика, отступы, названия, Уточнение сетки брюк и джинсов — 19.11.2026, Чек-лист нового экрана, LOFT Admin — продукт и рабочие процессы менеджера (+19 more)

### Community 17 - "DashboardPage.tsx"
Cohesion: 0.11
Nodes (37): AdminMenuRows(), DashboardHeaderActions(), HeaderSlot, pageIcons, settingsIcons, ManagerTasks(), AdminNotification, seenStorageKey() (+29 more)

### Community 18 - "Security architecture — 6 November 2026"
Cohesion: 0.29
Nodes (6): Deployment order, Inventory and payments, Notifications and monitoring, Security architecture — 6 November 2026, Sessions, registration and files, Validation and limits

### Community 19 - "CampaignsPage.tsx"
Cohesion: 0.13
Nodes (29): Компоненты и точки переиспользования, AdminDialog(), stack, AdminHeaderActions(), Collapse(), LoftSwitch(), ContentSkeleton(), SizeChartEditor() (+21 more)

### Community 24 - "i18n.ts"
Cohesion: 0.07
Nodes (40): lucide-react, react-router-dom, AdminLanguagePicker(), AdminMenuPage(), MenuEntry, PaymentCardsSettings(), AdminLanguage, getAdminLocale() (+32 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `DESIGN_SYSTEM.md` to `package.json`, `AnalyticsPage.tsx`, `Иконки и справочники`, `DashboardPage.tsx`, `supabase.ts`, `ProductsPage.tsx`, `OrdersPage.tsx`, `LOFT Admin — техническая архитектура`, `supabase.ts`, `DESIGN_SYSTEM.md`, `DashboardPage.tsx`, `CampaignsPage.tsx`, `i18n.ts`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05370101596516691 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Браузерные проверки` to `package.json`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `AnalyticsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07918367346938776 - nodes in this community are weakly interconnected._
- **Why does `useAdminLanguage()` connect `CampaignsPage.tsx` to `AnalyticsPage.tsx`, `Иконки и справочники`, `DashboardPage.tsx`, `supabase.ts`, `ProductsPage.tsx`, `OrdersPage.tsx`, `DESIGN_SYSTEM.md`, `supabase.ts`, `DESIGN_SYSTEM.md`, `DashboardPage.tsx`, `i18n.ts`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.06736353077816493 - nodes in this community are weakly interconnected._
- **Should `DashboardPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14130434782608695 - nodes in this community are weakly interconnected._
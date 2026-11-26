# Graph Report - loft-security-admin  (2026-11-26)

## Corpus Check
- 117 files · ~68,717 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 745 nodes · 2258 edges · 21 communities (19 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1f519823`
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
- App.tsx
- LOFT Admin — техническая архитектура
- Браузерные проверки
- getExchangeRate.ts
- Типы клиентского кода
- Типы инструментов сборки
- Типы серверного кода
- Настройки TypeScript
- DESIGN_SYSTEM.md
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
10. `DashboardPage()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `4. Данные, RPC и Storage` --references--> `readAll()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/readAll.ts
- `Интерфейс и состояние` --references--> `useAdminDialogRoute()`  [INFERRED]
  AGENTS.md → src/lib/useAdminDialogRoute.ts
- `3. Маршруты и состояние` --references--> `getCurrentUser()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/auth.ts
- `4. Данные, RPC и Storage` --references--> `privateFile()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/supabase.ts
- `Интерфейс и состояние` --references--> `useAdminViewState()`  [INFERRED]
  AGENTS.md → src/lib/useAdminViewState.ts

## Import Cycles
- None detected.

## Communities (21 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.06
Nodes (42): react-icons@^5.7.0, devDependencies, eslint@^10.3.0, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.6.0, tailwindcss@^4.3.0 (+34 more)

### Community 1 - "AnalyticsPage.tsx"
Cohesion: 0.08
Nodes (43): adminDate(), adminTime(), analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, brandsCacheApi, BrandStat, CategoryStat (+35 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.07
Nodes (37): CategoryIcon(), CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPickerProps, BackpackIcon (+29 more)

### Community 3 - "DashboardPage.tsx"
Cohesion: 0.09
Nodes (44): AdminMenuRows(), DashboardHeaderActions(), HeaderSlot, pageIcons, settingsIcons, dashboardActionClass, DASHBOARD_FRESH_FOR, DASHBOARD_REFRESH (+36 more)

### Community 4 - "supabase.ts"
Cohesion: 0.09
Nodes (20): typescript@~6.0.2, typescript, LoftSwitch(), labels, ReminderSettings(), DataTopic, dependencies, listeners (+12 more)

### Community 5 - "ProductsPage.tsx"
Cohesion: 0.07
Nodes (38): AdminAddButton(), Recommendations, categoriesCacheApi, categoryRowsCacheApi, colorsCacheApi, productsCacheApi, subcategoriesCacheApi, variantsCacheApi (+30 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.07
Nodes (84): 8. Время, локализация и аналитика, CancelOrderModal(), IconPicker(), JeansIcon(), JeansIconProps, ManagerTasks(), AdminNotification, NotificationBell() (+76 more)

### Community 7 - "App.tsx"
Cohesion: 0.07
Nodes (47): react-dom@^19.2.6, react-dom, App(), ProtectedLayout(), AdminHeaderShell(), AnimatedRoutes(), captureOutgoingPage(), content() (+39 more)

### Community 8 - "LOFT Admin — техническая архитектура"
Cohesion: 0.06
Nodes (30): Telegram и рассылки, Данные и безопасность, Интерфейс и состояние, Контекст перед задачей, Правила работы с LOFT Admin, Проверки и отчёт, 10. Развёртывание и проверки, 1. Общая схема и граница репозитория (+22 more)

### Community 9 - "Браузерные проверки"
Cohesion: 0.15
Nodes (15): catalogSections, sections, ADMIN, catalog(), Harness, install(), jwt(), now() (+7 more)

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
Cohesion: 0.07
Nodes (27): LOFT Admin — действующая дизайн-система, Адаптивность и доступность, Анимации: точные значения и отличия от клиента, Палитра и тема, Типографика, отступы, названия, Уточнение сетки брюк и джинсов — 19.11.2026, Чек-лист нового экрана, LOFT Admin — продукт и рабочие процессы менеджера (+19 more)

### Community 18 - "Security architecture — 6 November 2026"
Cohesion: 0.29
Nodes (6): Deployment order, Inventory and payments, Notifications and monitoring, Security architecture — 6 November 2026, Sessions, registration and files, Validation and limits

### Community 19 - "CampaignsPage.tsx"
Cohesion: 0.13
Nodes (28): Компоненты и точки переиспользования, react, AdminDialog(), stack, AdminHeaderActions(), Collapse(), ContentSkeleton(), SizeChartEditor() (+20 more)

### Community 24 - "i18n.ts"
Cohesion: 0.06
Nodes (55): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-router-dom@7.18.2, sonner@^2.0.7, lucide-react, react-router-dom, sonner (+47 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `CampaignsPage.tsx` to `package.json`, `AnalyticsPage.tsx`, `Иконки и справочники`, `DashboardPage.tsx`, `supabase.ts`, `ProductsPage.tsx`, `OrdersPage.tsx`, `App.tsx`, `LOFT Admin — техническая архитектура`, `DESIGN_SYSTEM.md`, `i18n.ts`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06464646464646465 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Браузерные проверки` to `package.json`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `AnalyticsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07764876632801161 - nodes in this community are weakly interconnected._
- **Why does `useAdminLanguage()` connect `OrdersPage.tsx` to `AnalyticsPage.tsx`, `Иконки и справочники`, `DashboardPage.tsx`, `supabase.ts`, `ProductsPage.tsx`, `App.tsx`, `DESIGN_SYSTEM.md`, `CampaignsPage.tsx`, `i18n.ts`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.0664451827242525 - nodes in this community are weakly interconnected._
- **Should `DashboardPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09200603318250378 - nodes in this community are weakly interconnected._
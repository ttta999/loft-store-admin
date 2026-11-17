# Graph Report - loft-admin-final  (2026-11-17)

## Corpus Check
- 108 files · ~60,329 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 662 nodes · 2005 edges · 23 communities (19 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7b3eda4e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Зависимости и инструменты
- CampaignsPage.tsx
- Иконки и справочники
- pagePreload.ts
- ReminderSettings.tsx
- useAdminLanguage
- OrdersPage.tsx
- SettingsForms.tsx
- tx
- Браузерные проверки
- ref_node_assert
- Типы клиентского кода
- Типы инструментов сборки
- Типы серверного кода
- ProductsPage.tsx
- Настройки TypeScript
- Публикация и заголовки
- Security architecture — 6 November 2026
- React + TypeScript + Vite
- TESTING.md
- AGENTS.md
- CACHING.md
- SizeChartsPage.tsx

## God Nodes (most connected - your core abstractions)
1. `useAdminLanguage()` - 93 edges
2. `tx()` - 70 edges
3. `t()` - 68 edges
4. `react` - 43 edges
5. `uiError()` - 38 edges
6. `OrdersPage()` - 31 edges
7. `useLocalTimeZone()` - 30 edges
8. `lucide-react` - 30 edges
9. `useAdminRefresh()` - 29 edges
10. `supabase` - 24 edges

## Surprising Connections (you probably didn't know these)
- `handler()` --calls--> `exchangeRate()`  [EXTRACTED]
  api/getExchangeRate.ts → server/exchangeRate.ts
- `AdminBackButton()` --calls--> `useAdminBack()`  [EXTRACTED]
  src/components/AdminPageHeader.tsx → src/lib/adminNavigation.ts
- `AdminBackButton()` --calls--> `useAdminLanguage()`  [EXTRACTED]
  src/components/AdminPageHeader.tsx → src/lib/i18n.ts
- `AdminHeaderRow()` --calls--> `useAdminLanguage()`  [EXTRACTED]
  src/components/AdminPageHeader.tsx → src/lib/i18n.ts
- `AnalyticsPage()` --calls--> `AdminHeaderRow()`  [EXTRACTED]
  src/pages/AnalyticsPage.tsx → src/components/AdminPageHeader.tsx

## Import Cycles
- None detected.

## Communities (23 total, 4 thin omitted)

### Community 0 - "Зависимости и инструменты"
Cohesion: 0.05
Nodes (50): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-dom@^19.2.6, react-icons@^5.7.0, react-router-dom@7.18.2, sonner@^2.0.7, devDependencies (+42 more)

### Community 1 - "CampaignsPage.tsx"
Cohesion: 0.12
Nodes (29): AdminDialog(), stack, Collapse(), adminDate(), adminTime(), CampaignContent, campaignMessage(), campaignVersion() (+21 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.07
Nodes (37): CategoryIcon(), CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPickerProps, BackpackIcon (+29 more)

### Community 3 - "pagePreload.ts"
Cohesion: 0.06
Nodes (57): react, react-dom, App(), ProtectedLayout(), AnimatedRoutes(), RouteFrame(), AppToaster(), readTheme() (+49 more)

### Community 4 - "ReminderSettings.tsx"
Cohesion: 0.29
Nodes (12): LoftSwitch(), labels, ReminderSettings(), clock(), instant(), localWorkClock(), Parts, parts() (+4 more)

### Community 5 - "useAdminLanguage"
Cohesion: 0.10
Nodes (40): lucide-react, react-router-dom, AdminLanguagePicker(), AdminMenuPage(), MenuEntry, AdminPageHeader(), JeansIcon(), JeansIconProps (+32 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.07
Nodes (70): CancelOrderModal(), groups, names, AdminNotification, NotificationBell(), seenStorageKey(), labels, OrderHistory() (+62 more)

### Community 7 - "SettingsForms.tsx"
Cohesion: 0.29
Nodes (8): AdminTheme, applyThemeToDom(), currentTheme, getTheme(), listeners, setTheme(), subscribe(), useTheme()

### Community 8 - "tx"
Cohesion: 0.15
Nodes (28): AdminAddButton(), AdminBackButton(), AdminHeaderRow(), IconPicker(), categoriesCacheApi, CategoryRow, CategoryTree, fetchCategoriesTree() (+20 more)

### Community 9 - "Браузерные проверки"
Cohesion: 0.18
Nodes (12): ADMIN, catalog(), Harness, install(), jwt(), now(), productId, session() (+4 more)

### Community 10 - "ref_node_assert"
Cohesion: 0.06
Nodes (14): handler(), handler(), @supabase/supabase-js@2.108.1, typescript@~6.0.2, @supabase/supabase-js, typescript, CachedRate, exchangeRate() (+6 more)

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
Nodes (65): AdminMenuRows(), ManagerTasks(), Recommendations, analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, brandsCacheApi, BrandStat (+57 more)

### Community 15 - "Настройки TypeScript"
Cohesion: 0.40
Nodes (4): compilerOptions, rewriteRelativeImportExtensions, files, references

### Community 18 - "Security architecture — 6 November 2026"
Cohesion: 0.29
Nodes (6): Deployment order, Inventory and payments, Notifications and monitoring, Security architecture — 6 November 2026, Sessions, registration and files, Validation and limits

### Community 19 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 23 - "SizeChartsPage.tsx"
Cohesion: 0.18
Nodes (18): SizeChartEditor(), allowed, Origin, Page, parentRoute(), read(), rememberAdminOrigin(), safe() (+10 more)

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `pagePreload.ts` to `Зависимости и инструменты`, `CampaignsPage.tsx`, `Иконки и справочники`, `ReminderSettings.tsx`, `useAdminLanguage`, `OrdersPage.tsx`, `SettingsForms.tsx`, `tx`, `ProductsPage.tsx`, `SizeChartsPage.tsx`?**
  _High betweenness centrality (0.162) - this node is a cross-community bridge._
- **Should `Зависимости и инструменты` be split into smaller, more focused modules?**
  _Cohesion score 0.05370101596516691 - nodes in this community are weakly interconnected._
- **Why does `useAdminLanguage()` connect `useAdminLanguage` to `CampaignsPage.tsx`, `Иконки и справочники`, `pagePreload.ts`, `ReminderSettings.tsx`, `OrdersPage.tsx`, `tx`, `ProductsPage.tsx`, `SizeChartsPage.tsx`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Should `CampaignsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11746031746031746 - nodes in this community are weakly interconnected._
- **Why does `@supabase/supabase-js` connect `ref_node_assert` to `Зависимости и инструменты`, `OrdersPage.tsx`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.0664451827242525 - nodes in this community are weakly interconnected._
- **Should `pagePreload.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06126331811263318 - nodes in this community are weakly interconnected._
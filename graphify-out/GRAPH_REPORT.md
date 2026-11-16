# Graph Report - loft-admin-badge  (2026-11-16)

## Corpus Check
- 107 files · ~60,029 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 660 nodes · 1981 edges · 22 communities (18 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `257e3f3e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Зависимости и инструменты
- useAdminLanguage
- Иконки и справочники
- pagePreload.ts
- Сервер и уведомления
- ChinaPage.tsx
- OrdersPage.tsx
- theme.ts
- useAdminLanguage
- Браузерные проверки
- supabase.ts
- Типы клиентского кода
- Типы инструментов сборки
- Типы серверного кода
- AnalyticsPage.tsx
- Настройки TypeScript
- Публикация и заголовки
- Security architecture — 6 November 2026
- React + TypeScript + Vite
- TESTING.md
- AGENTS.md
- CACHING.md

## God Nodes (most connected - your core abstractions)
1. `useAdminLanguage()` - 93 edges
2. `t()` - 68 edges
3. `tx()` - 68 edges
4. `react` - 42 edges
5. `uiError()` - 38 edges
6. `OrdersPage()` - 31 edges
7. `useLocalTimeZone()` - 30 edges
8. `useAdminRefresh()` - 29 edges
9. `lucide-react` - 29 edges
10. `supabase` - 24 edges

## Surprising Connections (you probably didn't know these)
- `handler()` --calls--> `exchangeRate()`  [EXTRACTED]
  api/getExchangeRate.ts → server/exchangeRate.ts
- `ProtectedLayout()` --calls--> `PageSkeleton()`  [EXTRACTED]
  src/App.tsx → src/components/PageSkeleton.tsx
- `ProtectedLayout()` --calls--> `useAdminLive()`  [EXTRACTED]
  src/App.tsx → src/lib/adminLive.ts
- `ProtectedLayout()` --calls--> `setLanguageScope()`  [EXTRACTED]
  src/App.tsx → src/lib/i18n.ts
- `ProtectedLayout()` --calls--> `useAdminLanguage()`  [EXTRACTED]
  src/App.tsx → src/lib/i18n.ts

## Import Cycles
- None detected.

## Communities (22 total, 4 thin omitted)

### Community 0 - "Зависимости и инструменты"
Cohesion: 0.05
Nodes (50): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-dom@^19.2.6, react-icons@^5.7.0, react-router-dom@7.18.2, sonner@^2.0.7, devDependencies (+42 more)

### Community 1 - "useAdminLanguage"
Cohesion: 0.08
Nodes (50): lucide-react, react-router-dom, AdminDialog(), stack, AdminMenuPage(), MenuEntry, AdminBackButton(), AdminHeaderRow() (+42 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.07
Nodes (37): CategoryIcon(), CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPickerProps, BackpackIcon (+29 more)

### Community 3 - "pagePreload.ts"
Cohesion: 0.07
Nodes (47): react, react-dom, App(), ProtectedLayout(), AnimatedRoutes(), RouteFrame(), AppToaster(), readTheme() (+39 more)

### Community 4 - "Сервер и уведомления"
Cohesion: 0.13
Nodes (10): handler(), handler(), @supabase/supabase-js@2.108.1, @supabase/supabase-js, CachedRate, exchangeRate(), valid(), VercelRequest (+2 more)

### Community 5 - "ChinaPage.tsx"
Cohesion: 0.16
Nodes (22): AdminMenuRows(), chinaCacheApi, dashboardCountsCacheApi, invalidateAllCaches(), catalogMoney(), displayMoney(), MoneyCurrency, moneyNumber() (+14 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.08
Nodes (58): AdminNotification, NotificationBell(), seenStorageKey(), labels, OrderHistory(), adminDateTime(), useAdminRefresh(), canClientCancel() (+50 more)

### Community 7 - "theme.ts"
Cohesion: 0.19
Nodes (15): getAdminLocale(), AdminTheme, applyThemeToDom(), currentTheme, getTheme(), listeners, setTheme(), subscribe() (+7 more)

### Community 8 - "useAdminLanguage"
Cohesion: 0.07
Nodes (54): AdminLanguagePicker(), CancelOrderModal(), IconPicker(), JeansIcon(), JeansIconProps, ManagerTasks(), PaymentCardsSettings(), ProtectedFile() (+46 more)

### Community 9 - "Браузерные проверки"
Cohesion: 0.18
Nodes (12): ADMIN, catalog(), Harness, install(), jwt(), now(), productId, session() (+4 more)

### Community 10 - "supabase.ts"
Cohesion: 0.07
Nodes (25): typescript@~6.0.2, typescript, groups, names, labels, ReminderSettings(), DataTopic, dependencies (+17 more)

### Community 11 - "Типы клиентского кода"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 12 - "Типы инструментов сборки"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 13 - "Типы серверного кода"
Cohesion: 0.13
Nodes (14): compilerOptions, allowImportingTsExtensions, lib, module, moduleResolution, noEmit, noUnusedLocals, noUnusedParameters (+6 more)

### Community 14 - "AnalyticsPage.tsx"
Cohesion: 0.06
Nodes (59): RecommendationPicker(), Recommendations, adminDate(), adminTime(), analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, brandsCacheApi (+51 more)

### Community 15 - "Настройки TypeScript"
Cohesion: 0.40
Nodes (4): compilerOptions, rewriteRelativeImportExtensions, files, references

### Community 18 - "Security architecture — 6 November 2026"
Cohesion: 0.29
Nodes (6): Deployment order, Inventory and payments, Notifications and monitoring, Security architecture — 6 November 2026, Sessions, registration and files, Validation and limits

### Community 19 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `pagePreload.ts` to `Зависимости и инструменты`, `useAdminLanguage`, `Иконки и справочники`, `ChinaPage.tsx`, `OrdersPage.tsx`, `theme.ts`, `useAdminLanguage`, `supabase.ts`, `AnalyticsPage.tsx`?**
  _High betweenness centrality (0.162) - this node is a cross-community bridge._
- **Should `Зависимости и инструменты` be split into smaller, more focused modules?**
  _Cohesion score 0.05370101596516691 - nodes in this community are weakly interconnected._
- **Why does `useAdminLanguage()` connect `useAdminLanguage` to `Иконки и справочники`, `pagePreload.ts`, `ChinaPage.tsx`, `OrdersPage.tsx`, `theme.ts`, `useAdminLanguage`, `supabase.ts`, `AnalyticsPage.tsx`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Should `useAdminLanguage` be split into smaller, more focused modules?**
  _Cohesion score 0.08184143222506395 - nodes in this community are weakly interconnected._
- **Why does `@supabase/supabase-js` connect `Сервер и уведомления` to `Зависимости и инструменты`, `supabase.ts`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.0664451827242525 - nodes in this community are weakly interconnected._
- **Should `pagePreload.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06949152542372881 - nodes in this community are weakly interconnected._
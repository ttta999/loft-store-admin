# Graph Report - loft-admin-badge  (2026-11-16)

## Corpus Check
- 95 files · ~59,158 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 610 nodes · 1759 edges · 22 communities (17 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5fccb88f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Зависимости и инструменты
- supabase.ts
- Иконки и справочники
- pagePreload.ts
- Сервер и уведомления
- ChinaPage.tsx
- OrdersPage.tsx
- theme.ts
- useAdminLanguage
- Браузерные проверки
- .load
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
1. `useAdminLanguage()` - 88 edges
2. `t()` - 66 edges
3. `tx()` - 64 edges
4. `uiError()` - 38 edges
5. `react` - 37 edges
6. `OrdersPage()` - 29 edges
7. `useAdminRefresh()` - 29 edges
8. `useLocalTimeZone()` - 28 edges
9. `lucide-react` - 26 edges
10. `supabase` - 24 edges

## Surprising Connections (you probably didn't know these)
- `useLocalTimeZone()` --indirect_call--> `getDeviceTimeZone()`  [INFERRED]
  src/lib/useLocalTimeZone.ts → src/lib/dateTime.ts
- `handler()` --calls--> `exchangeRate()`  [EXTRACTED]
  api/getExchangeRate.ts → server/exchangeRate.ts
- `NotificationBell()` --calls--> `useAdminRefresh()`  [EXTRACTED]
  src/components/NotificationBell.tsx → src/lib/adminLive.ts
- `NotificationBell()` --calls--> `timestampDate()`  [EXTRACTED]
  src/components/NotificationBell.tsx → src/lib/dateTime.ts
- `NotificationBell()` --calls--> `t()`  [EXTRACTED]
  src/components/NotificationBell.tsx → src/lib/i18n.ts

## Import Cycles
- None detected.

## Communities (22 total, 5 thin omitted)

### Community 0 - "Зависимости и инструменты"
Cohesion: 0.06
Nodes (48): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-dom@^19.2.6, react-icons@^5.7.0, sonner@^2.0.7, devDependencies, eslint@^10.3.0 (+40 more)

### Community 1 - "supabase.ts"
Cohesion: 0.12
Nodes (29): react, Collapse(), groups, names, AdminNotification, labels, labels, DataTopic (+21 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.06
Nodes (54): CategoryIcon(), CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPicker(), IconPickerProps (+46 more)

### Community 3 - "pagePreload.ts"
Cohesion: 0.08
Nodes (45): react-router-dom@7.18.2, react-dom, react-router-dom, App(), ProtectedLayout(), AnimatedRoutes(), RouteFrame(), AppToaster() (+37 more)

### Community 4 - "Сервер и уведомления"
Cohesion: 0.08
Nodes (12): handler(), handler(), @supabase/supabase-js@2.108.1, typescript@~6.0.2, @supabase/supabase-js, typescript, CachedRate, exchangeRate() (+4 more)

### Community 5 - "ChinaPage.tsx"
Cohesion: 0.23
Nodes (13): chinaCacheApi, catalogMoney(), displayMoney(), MoneyCurrency, moneyNumber(), roundUsd(), ChinaPageResource, getChinaRequests() (+5 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.08
Nodes (58): CancelOrderModal(), NotificationBell(), seenStorageKey(), OrderHistory(), adminDateTime(), ordersCacheApi, refundsCacheApi, cancellationNeedsReview() (+50 more)

### Community 7 - "theme.ts"
Cohesion: 0.29
Nodes (8): AdminTheme, applyThemeToDom(), currentTheme, getTheme(), listeners, setTheme(), subscribe(), useTheme()

### Community 8 - "useAdminLanguage"
Cohesion: 0.08
Nodes (60): lucide-react, AdminLanguagePicker(), AdminMenuPage(), AdminMenuRows(), MenuEntry, JeansIcon(), JeansIconProps, LoftSwitch() (+52 more)

### Community 9 - "Браузерные проверки"
Cohesion: 0.17
Nodes (13): ADMIN, catalog(), Harness, install(), jwt(), now(), productId, session() (+5 more)

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
Cohesion: 0.05
Nodes (64): Recommendations, adminDate(), adminTime(), analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, brandsCacheApi, BrandStat (+56 more)

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
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `supabase.ts` to `Зависимости и инструменты`, `Иконки и справочники`, `pagePreload.ts`, `ChinaPage.tsx`, `OrdersPage.tsx`, `theme.ts`, `useAdminLanguage`, `AnalyticsPage.tsx`?**
  _High betweenness centrality (0.160) - this node is a cross-community bridge._
- **Should `Зависимости и инструменты` be split into smaller, more focused modules?**
  _Cohesion score 0.05647058823529412 - nodes in this community are weakly interconnected._
- **Why does `useAdminLanguage()` connect `useAdminLanguage` to `supabase.ts`, `Иконки и справочники`, `pagePreload.ts`, `ChinaPage.tsx`, `OrdersPage.tsx`, `AnalyticsPage.tsx`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Should `supabase.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11522198731501057 - nodes in this community are weakly interconnected._
- **Why does `@supabase/supabase-js` connect `Сервер и уведомления` to `Зависимости и инструменты`, `supabase.ts`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.055299539170506916 - nodes in this community are weakly interconnected._
- **Should `pagePreload.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07744107744107744 - nodes in this community are weakly interconnected._
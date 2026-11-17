# Graph Report - loft-admin-final  (2026-11-17)

## Corpus Check
- 107 files · ~60,062 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 660 nodes · 1997 edges · 24 communities (20 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `aca96016`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Зависимости и инструменты
- CampaignsPage.tsx
- Иконки и справочники
- pagePreload.ts
- Сервер и уведомления
- i18n.ts
- OrdersPage.tsx
- SettingsForms.tsx
- useAdminLanguage
- Браузерные проверки
- supabase.ts
- Типы клиентского кода
- Типы инструментов сборки
- Типы серверного кода
- ProductsPage.tsx
- Настройки TypeScript
- dashboardTransition.ts
- Публикация и заголовки
- Security architecture — 6 November 2026
- React + TypeScript + Vite
- TESTING.md
- AGENTS.md
- CACHING.md
- SizeChartEditor.tsx

## God Nodes (most connected - your core abstractions)
1. `useAdminLanguage()` - 93 edges
2. `t()` - 68 edges
3. `tx()` - 68 edges
4. `react` - 42 edges
5. `uiError()` - 38 edges
6. `OrdersPage()` - 31 edges
7. `useLocalTimeZone()` - 30 edges
8. `lucide-react` - 29 edges
9. `useAdminRefresh()` - 29 edges
10. `supabase` - 24 edges

## Surprising Connections (you probably didn't know these)
- `handler()` --calls--> `exchangeRate()`  [EXTRACTED]
  api/getExchangeRate.ts → server/exchangeRate.ts
- `AnalyticsPage()` --indirect_call--> `isConfirmedRevenue()`  [INFERRED]
  src/pages/AnalyticsPage.tsx → src/lib/revenue.ts
- `ProtectedLayout()` --calls--> `useAdminLive()`  [EXTRACTED]
  src/App.tsx → src/lib/adminLive.ts
- `ProtectedLayout()` --calls--> `getCurrentUser()`  [EXTRACTED]
  src/App.tsx → src/lib/auth.ts
- `ProtectedLayout()` --calls--> `setLanguageScope()`  [EXTRACTED]
  src/App.tsx → src/lib/i18n.ts

## Import Cycles
- None detected.

## Communities (24 total, 4 thin omitted)

### Community 0 - "Зависимости и инструменты"
Cohesion: 0.05
Nodes (53): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-dom@^19.2.6, react-icons@^5.7.0, react-router-dom@7.18.2, sonner@^2.0.7, devDependencies (+45 more)

### Community 1 - "CampaignsPage.tsx"
Cohesion: 0.12
Nodes (28): Collapse(), adminDate(), adminTime(), CampaignContent, campaignMessage(), campaignVersion(), escape(), dateLocale() (+20 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.05
Nodes (50): CategoryIcon(), CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPickerProps, categoriesCacheApi (+42 more)

### Community 3 - "pagePreload.ts"
Cohesion: 0.07
Nodes (58): lucide-react, react, react-dom, react-router-dom, App(), ProtectedLayout(), AdminDialog(), stack (+50 more)

### Community 4 - "Сервер и уведомления"
Cohesion: 0.13
Nodes (10): handler(), handler(), @supabase/supabase-js@2.108.1, @supabase/supabase-js, CachedRate, exchangeRate(), valid(), VercelRequest (+2 more)

### Community 5 - "i18n.ts"
Cohesion: 0.22
Nodes (11): AdminLanguage, interpolate(), language, listeners, publish(), saved(), setAdminLanguage(), setLanguageScope() (+3 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.08
Nodes (58): AdminNotification, NotificationBell(), seenStorageKey(), labels, OrderHistory(), adminDateTime(), useAdminRefresh(), canClientCancel() (+50 more)

### Community 7 - "SettingsForms.tsx"
Cohesion: 0.19
Nodes (15): getAdminLocale(), AdminTheme, applyThemeToDom(), currentTheme, getTheme(), listeners, setTheme(), subscribe() (+7 more)

### Community 8 - "useAdminLanguage"
Cohesion: 0.10
Nodes (49): AdminLanguagePicker(), AdminMenuRows(), CancelOrderModal(), IconPicker(), JeansIcon(), JeansIconProps, ManagerTasks(), ProtectedFile() (+41 more)

### Community 9 - "Браузерные проверки"
Cohesion: 0.18
Nodes (12): ADMIN, catalog(), Harness, install(), jwt(), now(), productId, session() (+4 more)

### Community 10 - "supabase.ts"
Cohesion: 0.06
Nodes (32): typescript@~6.0.2, typescript, LoftSwitch(), groups, names, PaymentCardsSettings(), labels, ReminderSettings() (+24 more)

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
Cohesion: 0.06
Nodes (44): RecommendationPicker(), Recommendations, analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, brandsCacheApi, BrandStat, categoryRowsCacheApi (+36 more)

### Community 15 - "Настройки TypeScript"
Cohesion: 0.40
Nodes (4): compilerOptions, rewriteRelativeImportExtensions, files, references

### Community 16 - "dashboardTransition.ts"
Cohesion: 0.26
Nodes (12): card(), content(), frames, header(), mark(), Origin, origins, Page (+4 more)

### Community 18 - "Security architecture — 6 November 2026"
Cohesion: 0.29
Nodes (6): Deployment order, Inventory and payments, Notifications and monitoring, Security architecture — 6 November 2026, Sessions, registration and files, Validation and limits

### Community 19 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 23 - "SizeChartEditor.tsx"
Cohesion: 0.44
Nodes (7): SizeChartEditor(), blankChart(), ChartDraft, chartError(), chartPayload(), ChartScope, chartTemplates

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `pagePreload.ts` to `Зависимости и инструменты`, `CampaignsPage.tsx`, `Иконки и справочники`, `i18n.ts`, `OrdersPage.tsx`, `SettingsForms.tsx`, `useAdminLanguage`, `supabase.ts`, `ProductsPage.tsx`, `SizeChartEditor.tsx`?**
  _High betweenness centrality (0.162) - this node is a cross-community bridge._
- **Should `Зависимости и инструменты` be split into smaller, more focused modules?**
  _Cohesion score 0.05012531328320802 - nodes in this community are weakly interconnected._
- **Why does `useAdminLanguage()` connect `useAdminLanguage` to `Зависимости и инструменты`, `CampaignsPage.tsx`, `Иконки и справочники`, `pagePreload.ts`, `i18n.ts`, `OrdersPage.tsx`, `SettingsForms.tsx`, `supabase.ts`, `ProductsPage.tsx`, `SizeChartEditor.tsx`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Should `CampaignsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1226890756302521 - nodes in this community are weakly interconnected._
- **Why does `@supabase/supabase-js` connect `Сервер и уведомления` to `Зависимости и инструменты`, `supabase.ts`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.054354178842782 - nodes in this community are weakly interconnected._
- **Should `pagePreload.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06867088607594937 - nodes in this community are weakly interconnected._
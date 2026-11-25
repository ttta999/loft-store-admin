# Graph Report - loft24-release-admin  (2026-11-25)

## Corpus Check
- 116 files · ~68,090 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 741 nodes · 2240 edges · 23 communities (21 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1ca9dc67`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- AnalyticsPage.tsx
- Иконки и справочники
- DashboardPage.tsx
- supabase.ts
- useAdminLanguage
- OrdersPage.tsx
- AdminPageHeader.tsx
- LOFT Admin — техническая архитектура
- Браузерные проверки
- getExchangeRate.ts
- Типы клиентского кода
- Типы инструментов сборки
- Типы серверного кода
- Настройки TypeScript
- LOFT Admin — действующая дизайн-система
- theme.ts
- Security architecture — 6 November 2026
- CampaignsPage.tsx
- TESTING.md
- CACHING.md
- lucide-react
- LoginPage.tsx

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
- `Переход от возврата к заказу` --references--> `useOrderFocus()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/useOrderFocus.ts
- `Компоненты и точки переиспользования` --references--> `AdminDialog()`  [INFERRED]
  docs/DESIGN_SYSTEM.md → src/components/AdminDialog.tsx
- `4. Данные, RPC и Storage` --references--> `readAll()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/readAll.ts
- `Интерфейс и состояние` --references--> `useAdminDialogRoute()`  [INFERRED]
  AGENTS.md → src/lib/useAdminDialogRoute.ts
- `3. Маршруты и состояние` --references--> `getCurrentUser()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/auth.ts

## Import Cycles
- None detected.

## Communities (23 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.07
Nodes (40): devDependencies, eslint@^10.3.0, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.6.0, tailwindcss@^4.3.0, @tailwindcss/vite@^4.3.0 (+32 more)

### Community 1 - "AnalyticsPage.tsx"
Cohesion: 0.09
Nodes (37): adminDate(), adminTime(), analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, BrandStat, CategoryStat, DailyStatsEntry (+29 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.07
Nodes (36): CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPickerProps, BackpackIcon, BeanieIcon (+28 more)

### Community 3 - "DashboardPage.tsx"
Cohesion: 0.09
Nodes (49): App(), ProtectedLayout(), AdminMenuRows(), DashboardHeaderActions(), useAdminLive(), invalidateAllCaches(), refundsCacheApi, DASHBOARD_FRESH_FOR (+41 more)

### Community 4 - "supabase.ts"
Cohesion: 0.08
Nodes (23): typescript@~6.0.2, typescript, DataTopic, dependencies, listeners, chinaCacheApi, createDataFetch(), catalogMoney() (+15 more)

### Community 5 - "useAdminLanguage"
Cohesion: 0.05
Nodes (96): AdminAddButton(), AdminLanguagePicker(), AdminHeaderActions(), AppToaster(), readTheme(), subscribe(), CancelOrderModal(), CategoryIcon() (+88 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.07
Nodes (55): 8. Время, локализация и аналитика, AdminNotification, NotificationBell(), seenStorageKey(), ProtectedFile(), SpecialOrderPhoto(), adminDateTime(), dashboardActionClass (+47 more)

### Community 7 - "AdminPageHeader.tsx"
Cohesion: 0.06
Nodes (48): 3. Маршруты и состояние, LOFT Admin — продукт и рабочие процессы менеджера, Аналитика и деньги, Заказы: принятие, деньги и выполнение, Заявки на спецзаказ, Колокольчик, задачи, напоминания, Назначение и роли, Настройки и границы развития (+40 more)

### Community 8 - "LOFT Admin — техническая архитектура"
Cohesion: 0.07
Nodes (25): Telegram и рассылки, Данные и безопасность, Интерфейс и состояние, Контекст перед задачей, Правила работы с LOFT Admin, Проверки и отчёт, 10. Развёртывание и проверки, 1. Общая схема и граница репозитория (+17 more)

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

### Community 16 - "LOFT Admin — действующая дизайн-система"
Cohesion: 0.25
Nodes (8): LOFT Admin — действующая дизайн-система, Адаптивность и доступность, Анимации: точные значения и отличия от клиента, Компоненты и точки переиспользования, Палитра и тема, Типографика, отступы, названия, Уточнение сетки брюк и джинсов — 19.11.2026, Чек-лист нового экрана

### Community 17 - "theme.ts"
Cohesion: 0.29
Nodes (8): AdminTheme, applyThemeToDom(), currentTheme, getTheme(), listeners, setTheme(), subscribe(), useTheme()

### Community 18 - "Security architecture — 6 November 2026"
Cohesion: 0.29
Nodes (6): Deployment order, Inventory and payments, Notifications and monitoring, Security architecture — 6 November 2026, Sessions, registration and files, Validation and limits

### Community 19 - "CampaignsPage.tsx"
Cohesion: 0.12
Nodes (27): react, AdminDialog(), stack, Collapse(), SizeChartEditor(), CampaignContent, campaignMessage(), campaignVersion() (+19 more)

### Community 24 - "lucide-react"
Cohesion: 0.13
Nodes (24): lucide-react, AdminMenuPage(), MenuEntry, LoftSwitch(), PaymentCardsSettings(), labels, ReminderSettings(), SettingsPageResource (+16 more)

### Community 27 - "LoginPage.tsx"
Cohesion: 0.15
Nodes (18): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-icons@^5.7.0, react-router-dom@7.18.2, sonner@^2.0.7, react-icons, sonner (+10 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `CampaignsPage.tsx` to `package.json`, `AnalyticsPage.tsx`, `Иконки и справочники`, `DashboardPage.tsx`, `supabase.ts`, `useAdminLanguage`, `OrdersPage.tsx`, `AdminPageHeader.tsx`, `theme.ts`, `lucide-react`, `LoginPage.tsx`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06866002214839424 - nodes in this community are weakly interconnected._
- **Why does `useAdminLanguage()` connect `useAdminLanguage` to `AnalyticsPage.tsx`, `Иконки и справочники`, `DashboardPage.tsx`, `supabase.ts`, `OrdersPage.tsx`, `AdminPageHeader.tsx`, `CampaignsPage.tsx`, `lucide-react`, `LoginPage.tsx`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `AnalyticsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09178743961352658 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Браузерные проверки` to `package.json`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.06736353077816493 - nodes in this community are weakly interconnected._
- **Should `DashboardPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08897243107769423 - nodes in this community are weakly interconnected._
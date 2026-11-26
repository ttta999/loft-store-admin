# Graph Report - loft-security-admin  (2026-11-26)

## Corpus Check
- 117 files · ~68,688 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 744 nodes · 2257 edges · 22 communities (20 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5eae1b38`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- AnalyticsPage.tsx
- Иконки и справочники
- DashboardPage.tsx
- theme.ts
- ProductsPage.tsx
- OrdersPage.tsx
- DESIGN_SYSTEM.md
- LOFT Admin — техническая архитектура
- Браузерные проверки
- getExchangeRate.ts
- Типы клиентского кода
- Типы инструментов сборки
- Типы серверного кода
- Настройки TypeScript
- LOFT Admin — действующая дизайн-система
- Security architecture — 6 November 2026
- CampaignsPage.tsx
- TESTING.md
- CACHING.md
- lucide-react
- App.tsx

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
- `4. Данные, RPC и Storage` --references--> `privateFile()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/supabase.ts
- `Компоненты и точки переиспользования` --references--> `AdminDialog()`  [INFERRED]
  docs/DESIGN_SYSTEM.md → src/components/AdminDialog.tsx
- `Компоненты и точки переиспользования` --references--> `ContentSkeleton()`  [INFERRED]
  docs/DESIGN_SYSTEM.md → src/components/PageSkeleton.tsx
- `8. Время, локализация и аналитика` --references--> `adminDateTime()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/adminDateTime.ts

## Import Cycles
- None detected.

## Communities (22 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (51): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-dom@^19.2.6, react-icons@^5.7.0, react-router-dom@7.18.2, sonner@^2.0.7, devDependencies (+43 more)

### Community 1 - "AnalyticsPage.tsx"
Cohesion: 0.08
Nodes (43): AdminNotification, NotificationBell(), seenStorageKey(), adminDate(), adminDateTime(), adminTime(), dashboardActionClass, analyticsCacheApi (+35 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.07
Nodes (37): CategoryIcon(), CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPickerProps, BackpackIcon (+29 more)

### Community 3 - "DashboardPage.tsx"
Cohesion: 0.07
Nodes (61): ProtectedLayout(), AdminMenuRows(), DashboardHeaderActions(), HeaderSlot, pageIcons, settingsIcons, ManagerTasks(), DataTopic (+53 more)

### Community 4 - "theme.ts"
Cohesion: 0.29
Nodes (8): AdminTheme, applyThemeToDom(), currentTheme, getTheme(), listeners, setTheme(), subscribe(), useTheme()

### Community 5 - "ProductsPage.tsx"
Cohesion: 0.06
Nodes (79): AdminAddButton(), AdminLanguagePicker(), AdminHeaderActions(), IconPicker(), JeansIcon(), JeansIconProps, ContentSkeleton(), PageSkeleton() (+71 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.08
Nodes (54): CancelOrderModal(), labels, OrderHistory(), useAdminRefresh(), ordersCacheApi, cancellationNeedsReview(), canClientCancel(), canManagerCancel() (+46 more)

### Community 7 - "DESIGN_SYSTEM.md"
Cohesion: 0.06
Nodes (45): 3. Маршруты и состояние, LOFT Admin — продукт и рабочие процессы менеджера, Аналитика и деньги, Заказы: принятие, деньги и выполнение, Заявки на спецзаказ, Колокольчик, задачи, напоминания, Назначение и роли, Настройки и границы развития (+37 more)

### Community 8 - "LOFT Admin — техническая архитектура"
Cohesion: 0.06
Nodes (29): Telegram и рассылки, Данные и безопасность, Интерфейс и состояние, Контекст перед задачей, Правила работы с LOFT Admin, Проверки и отчёт, 10. Развёртывание и проверки, 1. Общая схема и граница репозитория (+21 more)

### Community 9 - "Браузерные проверки"
Cohesion: 0.16
Nodes (14): catalogSections, ADMIN, catalog(), Harness, install(), jwt(), now(), productId (+6 more)

### Community 10 - "getExchangeRate.ts"
Cohesion: 0.08
Nodes (11): handler(), handler(), @supabase/supabase-js@2.108.1, @supabase/supabase-js, typescript, CachedRate, exchangeRate(), valid() (+3 more)

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

### Community 18 - "Security architecture — 6 November 2026"
Cohesion: 0.29
Nodes (6): Deployment order, Inventory and payments, Notifications and monitoring, Security architecture — 6 November 2026, Sessions, registration and files, Validation and limits

### Community 19 - "CampaignsPage.tsx"
Cohesion: 0.13
Nodes (26): react, AdminDialog(), stack, Collapse(), SizeChartEditor(), CampaignContent, campaignMessage(), campaignVersion() (+18 more)

### Community 24 - "lucide-react"
Cohesion: 0.13
Nodes (24): lucide-react, AdminMenuPage(), MenuEntry, LoftSwitch(), PaymentCardsSettings(), labels, ReminderSettings(), SettingsPageResource (+16 more)

### Community 27 - "App.tsx"
Cohesion: 0.11
Nodes (29): App(), AppToaster(), readTheme(), subscribe(), getCurrentUser(), login(), LoginResult, logout() (+21 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `CampaignsPage.tsx` to `package.json`, `AnalyticsPage.tsx`, `Иконки и справочники`, `DashboardPage.tsx`, `theme.ts`, `ProductsPage.tsx`, `OrdersPage.tsx`, `DESIGN_SYSTEM.md`, `LOFT Admin — техническая архитектура`, `lucide-react`, `App.tsx`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.053109713487071976 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Браузерные проверки` to `package.json`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `AnalyticsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08490566037735849 - nodes in this community are weakly interconnected._
- **Why does `useAdminLanguage()` connect `ProductsPage.tsx` to `AnalyticsPage.tsx`, `Иконки и справочники`, `DashboardPage.tsx`, `OrdersPage.tsx`, `DESIGN_SYSTEM.md`, `CampaignsPage.tsx`, `lucide-react`, `App.tsx`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.0664451827242525 - nodes in this community are weakly interconnected._
- **Should `DashboardPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0710868079289132 - nodes in this community are weakly interconnected._
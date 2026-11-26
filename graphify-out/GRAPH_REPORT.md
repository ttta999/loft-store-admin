# Graph Report - loft-security-admin  (2026-11-26)

## Corpus Check
- 119 files · ~69,626 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 759 nodes · 2286 edges · 23 communities (21 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `17b8ee9f`
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
- lucide-react
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
- `4. Данные, RPC и Storage` --references--> `privateFile()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/supabase.ts
- `Интерфейс и состояние` --references--> `ResourceCache`  [INFERRED]
  AGENTS.md → src/lib/resourceCache.ts
- `Компоненты и точки переиспользования` --references--> `AdminDialog()`  [INFERRED]
  docs/DESIGN_SYSTEM.md → src/components/AdminDialog.tsx
- `Компоненты и точки переиспользования` --references--> `ContentSkeleton()`  [INFERRED]
  docs/DESIGN_SYSTEM.md → src/components/PageSkeleton.tsx

## Import Cycles
- None detected.

## Communities (23 total, 2 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.05
Nodes (52): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-icons@^5.7.0, react-router-dom@7.18.2, sonner@^2.0.7, @supabase/supabase-js@2.108.1, devDependencies (+44 more)

### Community 1 - "AnalyticsPage.tsx"
Cohesion: 0.09
Nodes (37): adminDate(), adminTime(), analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, BrandStat, CategoryStat, DailyStatsEntry (+29 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.07
Nodes (37): CategoryIcon(), CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPickerProps, BackpackIcon (+29 more)

### Community 3 - "DashboardPage.tsx"
Cohesion: 0.14
Nodes (27): AdminMenuRows(), chinaCacheApi, DashboardSnapshot, saveDashboardSnapshot(), catalogMoney(), displayMoney(), MoneyCurrency, moneyNumber() (+19 more)

### Community 4 - "supabase.ts"
Cohesion: 0.08
Nodes (14): 7. Кеш и Realtime, typescript@~6.0.2, typescript, DataTopic, dependencies, invalidateTopics(), listeners, useAdminLive() (+6 more)

### Community 5 - "ProductsPage.tsx"
Cohesion: 0.07
Nodes (51): AdminAddButton(), AdminHeaderActions(), IconPicker(), PageSkeleton(), Recommendations, brandsCacheApi, categoriesCacheApi, categoryRowsCacheApi (+43 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.08
Nodes (74): 8. Время, локализация и аналитика, CancelOrderModal(), JeansIcon(), JeansIconProps, ManagerTasks(), AdminNotification, NotificationBell(), seenStorageKey() (+66 more)

### Community 7 - "DESIGN_SYSTEM.md"
Cohesion: 0.07
Nodes (39): Telegram и рассылки, Данные и безопасность, Интерфейс и состояние, Контекст перед задачей, Правила работы с LOFT Admin, Проверки и отчёт, Documentation, Expanding the ESLint configuration (+31 more)

### Community 8 - "LOFT Admin — техническая архитектура"
Cohesion: 0.10
Nodes (21): 10. Развёртывание и проверки, 1. Общая схема и граница репозитория, 2. Технологии и структура, 3. Маршруты и состояние, 4. Данные, RPC и Storage, 5. Авторизация и серверный endpoint, 6. Реальные направления операций, 9. Фоновые задачи и рассылки (+13 more)

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
Cohesion: 0.06
Nodes (59): react-dom@^19.2.6, react-dom, App(), ProtectedLayout(), DashboardHeaderActions(), HeaderSlot, pageIcons, settingsIcons (+51 more)

### Community 15 - "Настройки TypeScript"
Cohesion: 0.40
Nodes (4): compilerOptions, rewriteRelativeImportExtensions, files, references

### Community 16 - "DESIGN_SYSTEM.md"
Cohesion: 0.09
Nodes (20): LOFT Admin — действующая дизайн-система, Адаптивность и доступность, Анимации: точные значения и отличия от клиента, Компоненты и точки переиспользования, Палитра и тема, Типографика, отступы, названия, Уточнение сетки брюк и джинсов — 19.11.2026, Чек-лист нового экрана (+12 more)

### Community 17 - "lucide-react"
Cohesion: 0.13
Nodes (24): lucide-react, AdminMenuPage(), MenuEntry, LoftSwitch(), PaymentCardsSettings(), labels, ReminderSettings(), SettingsPageResource (+16 more)

### Community 18 - "Security architecture — 6 November 2026"
Cohesion: 0.29
Nodes (6): Deployment order, Inventory and payments, Notifications and monitoring, Security architecture — 6 November 2026, Sessions, registration and files, Validation and limits

### Community 19 - "CampaignsPage.tsx"
Cohesion: 0.12
Nodes (26): react, AdminDialog(), stack, Collapse(), SizeChartEditor(), CampaignContent, campaignMessage(), campaignVersion() (+18 more)

### Community 24 - "i18n.ts"
Cohesion: 0.10
Nodes (27): AdminLanguagePicker(), AdminLanguage, getAdminLocale(), interpolate(), language, listeners, publish(), saved() (+19 more)

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `CampaignsPage.tsx` to `package.json`, `AnalyticsPage.tsx`, `Иконки и справочники`, `DashboardPage.tsx`, `supabase.ts`, `ProductsPage.tsx`, `OrdersPage.tsx`, `DESIGN_SYSTEM.md`, `LOFT Admin — техническая архитектура`, `supabase.ts`, `lucide-react`, `i18n.ts`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.0512987012987013 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Браузерные проверки` to `package.json`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `AnalyticsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0927536231884058 - nodes in this community are weakly interconnected._
- **Why does `useAdminLanguage()` connect `OrdersPage.tsx` to `package.json`, `AnalyticsPage.tsx`, `Иконки и справочники`, `DashboardPage.tsx`, `ProductsPage.tsx`, `DESIGN_SYSTEM.md`, `supabase.ts`, `lucide-react`, `CampaignsPage.tsx`, `i18n.ts`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.0664451827242525 - nodes in this community are weakly interconnected._
- **Should `DashboardPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14112903225806453 - nodes in this community are weakly interconnected._
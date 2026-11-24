# Graph Report - loft24-release-admin  (2026-11-24)

## Corpus Check
- 116 files · ~67,476 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .css 2, (none) 1)

## Summary
- 738 nodes · 2233 edges · 34 communities (29 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2964b5e6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- devDependencies
- AnalyticsPage.tsx
- Иконки и справочники
- DashboardPage.tsx
- server-packaging.test.ts
- useAdminLanguage
- OrdersPage.tsx
- App.tsx
- LOFT Admin — техническая архитектура
- Браузерные проверки
- getExchangeRate.ts
- Типы клиентского кода
- Типы инструментов сборки
- Типы серверного кода
- LOFT Admin — продукт и рабочие процессы менеджера
- Настройки TypeScript
- LOFT Admin — действующая дизайн-система
- theme.ts
- Security architecture — 6 November 2026
- SizeChartEditor.tsx
- TESTING.md
- i18n.ts
- CACHING.md
- ProductsPage.tsx
- lucide-react
- package.json
- workHours.ts
- sonner
- DESIGN_SYSTEM.md
- @tailwindcss/vite
- scripts
- Правила работы с LOFT Admin
- LOFT Admin
- vercel.json

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
10. `DashboardPage()` - 28 edges

## Surprising Connections (you probably didn't know these)
- `Интерфейс и состояние` --references--> `ResourceCache`  [INFERRED]
  AGENTS.md → src/lib/resourceCache.ts
- `7. Кеш и Realtime` --references--> `useAdminRefresh()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/adminLive.ts
- `4. Данные, RPC и Storage` --references--> `readAll()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/readAll.ts
- `4. Данные, RPC и Storage` --references--> `privateFile()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/supabase.ts
- `Переход от возврата к заказу` --references--> `useOrderFocus()`  [INFERRED]
  docs/ARCHITECTURE.md → src/lib/useOrderFocus.ts

## Import Cycles
- None detected.

## Communities (34 total, 5 thin omitted)

### Community 0 - "devDependencies"
Cohesion: 0.17
Nodes (15): devDependencies, eslint@^10.3.0, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.6.0, tailwindcss@^4.3.0, typescript-eslint@^8.59.2 (+7 more)

### Community 1 - "AnalyticsPage.tsx"
Cohesion: 0.09
Nodes (37): adminDate(), adminTime(), analyticsCacheApi, AnalyticsCacheEntry, AnalyticsPeriod, BrandStat, CategoryStat, DailyStatsEntry (+29 more)

### Community 2 - "Иконки и справочники"
Cohesion: 0.07
Nodes (37): CategoryIcon(), CategoryIconProps, ICON_MAP, resolveCategoryIcon(), GROUP_LABELS, GROUP_ORDER, IconPickerProps, BackpackIcon (+29 more)

### Community 3 - "DashboardPage.tsx"
Cohesion: 0.09
Nodes (42): ProtectedLayout(), AdminMenuRows(), DashboardHeaderActions(), HeaderSlot, pageIcons, settingsIcons, dashboardActionClass, chinaCacheApi (+34 more)

### Community 5 - "useAdminLanguage"
Cohesion: 0.08
Nodes (75): Интерфейс и состояние, 8. Время, локализация и аналитика, Компоненты и точки переиспользования, AdminAddButton(), AdminDialog(), stack, AdminLanguagePicker(), AdminHeaderActions() (+67 more)

### Community 6 - "OrdersPage.tsx"
Cohesion: 0.05
Nodes (63): 7. Кеш и Realtime, groups, names, AdminNotification, seenStorageKey(), labels, DataTopic, dependencies (+55 more)

### Community 7 - "App.tsx"
Cohesion: 0.07
Nodes (52): 3. Маршруты и состояние, react, react-router-dom, App(), AdminHeaderShell(), AnimatedRoutes(), content(), RouteFrame() (+44 more)

### Community 8 - "LOFT Admin — техническая архитектура"
Cohesion: 0.11
Nodes (20): 10. Развёртывание и проверки, 1. Общая схема и граница репозитория, 2. Технологии и структура, 4. Данные, RPC и Storage, 5. Авторизация и серверный endpoint, 6. Реальные направления операций, 9. Фоновые задачи и рассылки, LOFT Admin — техническая архитектура (+12 more)

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

### Community 14 - "LOFT Admin — продукт и рабочие процессы менеджера"
Cohesion: 0.17
Nodes (12): LOFT Admin — продукт и рабочие процессы менеджера, Аналитика и деньги, Заказы: принятие, деньги и выполнение, Заявки на спецзаказ, Колокольчик, задачи, напоминания, Назначение и роли, Настройки и границы развития, Отмены и возвраты (+4 more)

### Community 15 - "Настройки TypeScript"
Cohesion: 0.40
Nodes (4): compilerOptions, rewriteRelativeImportExtensions, files, references

### Community 16 - "LOFT Admin — действующая дизайн-система"
Cohesion: 0.29
Nodes (7): LOFT Admin — действующая дизайн-система, Адаптивность и доступность, Анимации: точные значения и отличия от клиента, Палитра и тема, Типографика, отступы, названия, Уточнение сетки брюк и джинсов — 19.11.2026, Чек-лист нового экрана

### Community 17 - "theme.ts"
Cohesion: 0.29
Nodes (8): AdminTheme, applyThemeToDom(), currentTheme, getTheme(), listeners, setTheme(), subscribe(), useTheme()

### Community 18 - "Security architecture — 6 November 2026"
Cohesion: 0.29
Nodes (6): Deployment order, Inventory and payments, Notifications and monitoring, Security architecture — 6 November 2026, Sessions, registration and files, Validation and limits

### Community 19 - "SizeChartEditor.tsx"
Cohesion: 0.47
Nodes (6): blankChart(), ChartDraft, chartError(), chartPayload(), ChartScope, chartTemplates

### Community 21 - "i18n.ts"
Cohesion: 0.22
Nodes (11): AdminLanguage, interpolate(), language, listeners, publish(), saved(), setAdminLanguage(), setLanguageScope() (+3 more)

### Community 23 - "ProductsPage.tsx"
Cohesion: 0.07
Nodes (35): Recommendations, categoriesCacheApi, categoryRowsCacheApi, colorsCacheApi, productsCacheApi, subcategoriesCacheApi, variantsCacheApi, CategoryRow (+27 more)

### Community 24 - "lucide-react"
Cohesion: 0.23
Nodes (12): lucide-react, AdminMenuPage(), MenuEntry, PaymentCardsSettings(), SettingsPageResource, formatCardNumber(), parsePaymentCards(), PaymentCard (+4 more)

### Community 25 - "package.json"
Cohesion: 0.15
Nodes (12): @types/node@^24.12.3, @types/react@^19.2.14, @types/react-dom@^19.2.3, name, overrides, minimatch, private, type (+4 more)

### Community 26 - "workHours.ts"
Cohesion: 0.40
Nodes (9): clock(), instant(), localWorkClock(), Parts, parts(), SHOP_TIME_ZONE, validClock(), wall() (+1 more)

### Community 27 - "sonner"
Cohesion: 0.20
Nodes (10): dependencies, lucide-react@^1.17.0, react@^19.2.6, react-dom@^19.2.6, react-icons@^5.7.0, react-router-dom@7.18.2, sonner@^2.0.7, react-dom (+2 more)

### Community 29 - "@tailwindcss/vite"
Cohesion: 0.29
Nodes (6): @tailwindcss/vite@^4.3.0, vite@^8.0.12, @vitejs/plugin-react@^6.0.1, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 30 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, preview, test, test:e2e

### Community 31 - "Правила работы с LOFT Admin"
Cohesion: 0.40
Nodes (5): Telegram и рассылки, Данные и безопасность, Контекст перед задачей, Правила работы с LOFT Admin, Проверки и отчёт

### Community 32 - "LOFT Admin"
Cohesion: 0.50
Nodes (4): Documentation, Expanding the ESLint configuration, LOFT Admin, React Compiler

## Knowledge Gaps
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `AnalyticsPage.tsx`, `Иконки и справочники`, `DashboardPage.tsx`, `useAdminLanguage`, `OrdersPage.tsx`, `LOFT Admin — техническая архитектура`, `theme.ts`, `SizeChartEditor.tsx`, `i18n.ts`, `ProductsPage.tsx`, `lucide-react`, `package.json`, `sonner`, `DESIGN_SYSTEM.md`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Should `AnalyticsPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0927536231884058 - nodes in this community are weakly interconnected._
- **Why does `useAdminLanguage()` connect `useAdminLanguage` to `AnalyticsPage.tsx`, `Иконки и справочники`, `DashboardPage.tsx`, `OrdersPage.tsx`, `App.tsx`, `SizeChartEditor.tsx`, `i18n.ts`, `ProductsPage.tsx`, `lucide-react`, `DESIGN_SYSTEM.md`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `Иконки и справочники` be split into smaller, more focused modules?**
  _Cohesion score 0.0664451827242525 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `Браузерные проверки` to `package.json`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Should `DashboardPage.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09013605442176871 - nodes in this community are weakly interconnected._
- **Should `useAdminLanguage` be split into smaller, more focused modules?**
  _Cohesion score 0.08439450686641697 - nodes in this community are weakly interconnected._
# LOFT Admin — действующая дизайн-система

Сверено 17.11.2026 с `7355765`. Цель — новые рабочие экраны в существующем стиле, без подмены админки клиентским Mini App. [PRD](PRD.md), [архитектура](ARCHITECTURE.md), [клиентская система](https://github.com/ttta999/loft-store/blob/main/docs/DESIGN_SYSTEM.md).

## Палитра и тема

[index.css](../src/index.css) содержит `@theme` и class-based `.dark`. Светлые значения часто заданы непосредственно Tailwind-классами, единой переменной `--surface` нет.

| Роль | Светлая | Тёмная |
|---|---|---|
| Фон | `#F5F1E8` | `--color-dark-bg: #0b111e` |
| Карточка | `#FBF9F4` | `--color-dark-card: #151f33` |
| Вложенная/активная поверхность | `#F5F1E8`, `#E8E2D5` | `--color-dark-accent: #22304a` |
| Граница | `#E8E2D5` | `--color-dark-border: #31415f` |
| Основной текст | `#1B2A4A` | Белый |
| Второстепенный текст | `#8A8275` | `text-gray-300` |
| Акцент | `#C9A961` | `--color-gold: #c9a961` |
| Основная кнопка | Navy/white | Gold/navy |

[theme.ts](../src/lib/theme.ts) сохраняет `light/dark/system` под `loft_admin_theme`, применяет тему при импорте и слушает системную. Общая смена цветов — 300 ms `ease`. Не связывать тему с backend-полем заказа.

Sonner [AppToaster](../src/components/AppToaster.tsx) использует переменные `.loft-toaster` из CSS, радиус 16 px:

| Состояние | Light bg / text / border | Dark bg / text / border |
|---|---|---|
| normal | `#fbf9f4 / #1b2a4a / #e8e2d5` | `#151f33 / #f3f4f6 / #31415f` |
| success | `#edf7ee / #22613a / #c3dfc9` | `#142e29 / #a7e3bd / #2f5c4c` |
| info | `#edf2fa / #294a78 / #ccd9ed` | `#172940 / #b9d7ff / #345574` |
| warning | `#fff6e5 / #815a18 / #ebd5a8` | `#342a19 / #ecd49a / #665331` |
| error | `#fff0f0 / #9b3b3b / #ecc5c5` | `#351f2a / #f4b8bf / #6b3949` |

Badges в заказах/заявках/возвратах используют локальные Tailwind green/blue/yellow/purple/red классы с dark opacity. Финансовое значение статуса определяет сервер, не цвет. Не вводить новый цвет для того же состояния без проверки существующего экрана.

## Типографика, отступы, названия

Системный шрифт: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`. Native controls наследуют font-family. `:focus-visible` имеет gold outline 2 px, offset 3 px.

| Роль | Действующее оформление |
|---|---|
| Шапка страницы | `text-sm` mobile, `sm:text-xl`, `font-bold`, `leading-tight` |
| Название карточки/раздела | Обычно `text-lg/text-xl`, bold |
| Основной текст | `text-sm/text-base` |
| Подписи/метаданные | `text-xs/text-sm`, второстепенный цвет |
| Поля | `text-base sm:text-sm` в современных редакторах |
| Основная кнопка добавления | `text-sm font-bold`, полная подпись без переноса |

Карточки обычно `rounded-2xl`, поля и кнопки `rounded-xl`; иконки в круглых `rounded-full` поверхностях. `p-4`, на desktop `sm:p-6`, `gap-2/3/4`. Основная область часто `max-w-6xl mx-auto`.

Шапка использует `minmax(0,1fr)`, `min-w-0`, `[overflow-wrap:anywhere]`; названия должны переноситься без горизонтального переполнения. Табличные колонки/пользовательский текст не превращать в микрошрифт ради размещения. Для кнопок добавления `whitespace-nowrap`, достаточно ширины и перенос **строки действий**, а не слова.

## Компоненты и точки переиспользования

| Задача | Компонент / файл | Обязательное поведение |
|---|---|---|
| Общая шапка, назад | [AdminPageHeader](../src/components/AdminPageHeader.tsx) | `AdminHeaderRow`, `AdminBackButton`; route-aware подпись/родитель; sticky header |
| Основное добавление | [AdminAddButton](../src/components/AdminAddButton.tsx) | Plus 18 px/stroke 2 слева; `min-h-11`, `px-4 py-3`, radius xl; navy/gold; полные RU/UZ подписи |
| Меню разделов | [AdminMenu](../src/components/AdminMenu.tsx), [CatalogMenuPage](../src/pages/CatalogMenuPage.tsx) | Источник внутренней навигации и существующие карточки |
| Диалог нового редактора | [AdminDialog](../src/components/AdminDialog.tsx) | Portal, фон, закрытие, focus containment/Escape, scroll lock, exit до unmount |
| Раскрытие | [Collapse](../src/components/Collapse.tsx) | Grid `0fr/1fr`, одна поверхность, содержимое inert в закрытом состоянии |
| Switch | [LoftSwitch](../src/components/LoftSwitch.tsx) | Использовать существующий доступный переключатель |
| Loading | [PageSkeleton](../src/components/PageSkeleton.tsx) | Заголовок по маршруту и `ContentSkeleton`; без подмены загрузки пустым списком |
| Route error | [RouteErrorBoundary](../src/components/RouteErrorBoundary.tsx) | Восстановление интерфейса, существующие действия ошибки |
| Toast | [AppToaster](../src/components/AppToaster.tsx) | Общая палитра и локализация UI-сообщений |
| Колокольчик | [NotificationBell](../src/components/NotificationBell.tsx) | Собственная вход/выход анимация; unread и действия не подменяются декоративным badge |
| Список задач | [ManagerTasks](../src/components/ManagerTasks.tsx) | Реальные задачи, сроки и переходы к сущности |
| Чеки/закрытые фото | [ProtectedFile](../src/components/ProtectedFile.tsx), [SpecialOrderPhoto](../src/components/SpecialOrderPhoto.tsx) | Signed URL, явная обработка отсутствия/ошибки |
| Отмена | [CancelOrderModal](../src/components/CancelOrderModal.tsx) | Причина и ручное согласование по состоянию |
| История | [OrderHistory](../src/components/OrderHistory.tsx) | Различать факты, акторов и неизвестное legacy-событие |
| Размерная таблица | [SizeChartEditor](../src/components/SizeChartEditor.tsx) | RU/UZ, матрица, scope, preview, явно заданные соответствия |
| Рекомендации | [RecommendationPicker](../src/components/RecommendationPicker.tsx) | Существующий поиск и тип связи |
| Иконки | [CategoryIcon](../src/components/CategoryIcon.tsx), [IconPicker](../src/components/IconPicker.tsx), [iconRegistry](../src/lib/iconRegistry.ts) | Общий смысл с клиентом; не emoji и не публичный технический id |
| Настройки | [PaymentCardsSettings](../src/components/PaymentCardsSettings.tsx), [ReminderSettings](../src/components/ReminderSettings.tsx) | Сохранение текущего контракта/ошибок, не новые поля зоны времени |

В админке нет единого общего `EmptyState`/`Input`/`Button` для всех исторических страниц. Empty/error/card разметку брать из ближайшего действующего раздела (`RefundsPage`, `SizeChartsPage`, `OrdersPage`). Не создавать несколько новых одинаковых обёрток. Современный `AdminDialog` ещё не покрывает все legacy-модалки, например часть форм брендов/категорий остаётся ручной разметкой. Не приписывать ей автоматически focus trap этого компонента.

## Анимации: точные значения и отличия от клиента

| Сценарий | Источник и значения |
|---|---|
| Страница → раздел → назад | [AnimatedRoutes](../src/components/AnimatedRoutes.tsx): встречный горизонтальный сдвиг, 340 ms, `cubic-bezier(0.4,0,0.2,1)` |
| Обычный fallback маршрута | [AnimatedRoutes](../src/components/AnimatedRoutes.tsx): направленный вход, 340 ms, та же кривая |
| Современный `AdminDialog` | 220 ms open / 150 ms close, `cubic-bezier(.22,1,.36,1)`; 8 px + scale .98 на входе, 4 px + .99 на выходе |
| `Collapse` | `grid-template-rows`, 200 ms `cubic-bezier(.22,1,.36,1)` |
| Колокольчик | 250 ms open / 150 ms close, `cubic-bezier(0.22,1,0.36,1)` |
| Общие кнопки | 200 ms release, press scale .98 / 80 ms |
| `AdminAddButton` | Локальный `duration-150` для background/transform и `active:scale-[0.98]`; общий press CSS тоже применим |
| Переключение темы | 300 ms `ease` |

Админка не использует клиентский Framer Motion `motionTiming`; сходство палитры не делает код/длительности идентичными. Общий контейнер шапки живёт вне сменяемой страницы и остаётся отдельным неподвижным слоем. Шапка определяет заголовок и кнопку «Назад» по показанному маршруту. Страницы передают через портал только дополнительные действия. Оба снимка занимают одинаковый viewport и включают фильтры вместе с содержимым. Для браузеров без View Transition API применяется направленный вход.

Нельзя анимировать transform предка sticky/fixed chrome ради page transition. URL диалога той же страницы не должен запускать повторную анимацию всей страницы. Закрытие должно завершаться до удаления визуальной поверхности, с восстановлением фокуса и прокрутки. [ScrollRestoration](../src/components/ScrollRestoration.tsx), [useAdminDialogRoute](../src/lib/useAdminDialogRoute.ts).

`prefers-reduced-motion`: CSS 0.01 ms, media-query проверки маршрутов и диалогов, `motion-reduce:!transition-none` у Collapse. Новая анимация обязана сохранять эту ветку и корректный мгновенную навигацию при уменьшении движения.

## Адаптивность и доступность

- Шапка: `max-w-6xl`, 72 px на desktop и две строки по 48 px на mobile. Заголовок с иконкой центрируется независимо от действий. Поиск, фильтры и показатели идут после шапки. На узком экране действия занимают отдельную строку, включая основное «Добавить …».
- Диалоги ограничивают высоту (`dvh` в современных редакторах), footer действий остаётся доступным, длинные таблицы прокручиваются внутри.
- На телефоне проверять keyboard/focus-zoom и доступность кнопки сохранения; не снижать размер полей ниже существующего mobile `text-base`.
- У админки нет клиентского фиксированного нижнего navbar/Telegram Back. Используются browser Back, `AdminBackButton`, parent-route fallback и dirty-form guard.
- Остров «LOFT Админ Панель» сохраняет центральный слот общей шапки. На десктопе действия находятся справа независимо от ширины заголовка. На узких экранах три действия занимают отдельную строку.
- Единой явной safe-area модели в общих admin shell-компонентах не найдено. Проверять реальный браузер, клавиатуру и системные зоны; не объявлять поддержку всех iPhone доказанной desktop-снимком.
- Новые icon-only действия должны иметь доступное имя, keyboard/focus и disabled-state; не прятать error под empty и не показывать успех до ответа сервера. Старые формы неоднородны, полного аудита WCAG этот документ не заменяет.

## Чек-лист нового экрана

- Прочитать относящийся PRD/workflow и найти соседний образец страницы.
- Использовать `AdminPageHeader`, `AdminAddButton`, существующий диалог/раскрытие и иконки.
- Сохранить light/dark, RU/UZ и контраст; новые UI-ключи внести в оба словаря.
- Сохранить origin-aware Back, URL редактора, scroll/filter state и dirty-form guard.
- Loading, cached, empty, error/retry и busy-состояния должны быть различимы.
- Запись выполняется текущим RPC/RLS-контрактом; после ответа — штатная инвалидация.
- Проверить длинные названия, мобильную ширину, desktop, фокус, Escape и reduced motion.
- Не изменять Telegram-шаблоны, финансовую семантику и посторонние страницы в визуальной задаче.

## Уточнение сетки брюк и джинсов — 19.11.2026

Редактор категорий показывает «Числовая (36–56)» для брюк и джинсов. Список сохраняет существующее оформление. Legacy-размеры в редакторе товара доступны вместе с новыми числовыми значениями; спокойное пояснение предупреждает о ручном сопоставлении, не скрывая реальные остатки. Другие категории, тема и основные анимации не изменяются.

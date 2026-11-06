# Карточки главной, иконки категорий и внутренние коды — 6 ноября 2026

Семь карточек главной связаны с видимой поверхностью своего раздела через View Transitions. Границы меняются за 340 мс с cubic-bezier(0.4, 0, 0.2, 1), как общая фотография товара в магазине; содержимое старой/новой поверхности спокойно сменяется за 120/180 мс. Шапка остаётся отдельным неподвижным слоем. Возврат через историю или кнопку главной приводит к той же карточке с исходным scrollY. Повторное нажатие/прокрутка прерывает движение; временные инертные копии, имена и флаги очищаются. Модули готовятся при наведении, касании или фокусе. Если данные не успели дать готовую поверхность за 180 мс, переход пропускается и остаётся обычная загрузка; нет длительной заморозки native callback. Прямые ссылки без источника и reduced motion не создают пространственного раскрытия.

Мобильный Chrome выявил отмену View Transition из-за изменения viewport: некоторые шапки превышали ширину экрана. Ниже 768 px элементы шапок переносятся; настольное расположение сохранено. Горизонтальная область ограничена во время перехода, сенсорные устройства используют системную полосу прокрутки вместо принудительной ширины 8 px. Проверяется сохранение ширины окна и в тёмной теме.

Контурные SVG и карта значений скопированы из магазина (customIcons.tsx проверен побайтовым сравнением). Категории и подкатегории, включая старые поддерживаемые значения, рисуются теми же компонентами; выбор предлагает только поддерживаемые магазином ключи с человеческими названиями. В списке, формах и подсказках выбора скрытых технических полей больше нет: ID/slug и строки ключей иконок удалены из интерфейса. При создании внутренний ID формируется из названия, занятый получает свободный числовой суффикс. При редактировании исходный ID и связи товаров сохраняются. Размеры, тип сетки, названия и статусы остаются доступны.

Итог: 42/42 браузерные проверки (14 сценариев × настольный Chrome, мобильный Chrome и WebKit), 7/7 существующих серверных/модульных тестов, production-сборка и git diff --check прошли. Проверены семь разделов в обе стороны, возврат по кнопке и истории, прокрутка, геометрия/кривая, различимость иконок, создание категории/подкатегории с совпавшим внутренним кодом, сохранение ID при переименовании, быстрый Back, медленный ответ, прямой вход и reduced motion. Промежуточный кадр раскрытия категории просмотрен в Chrome. Предыдущий прогон обнаружил реальные мобильные переполнения; итоговый полный прогон выполнен после их исправления.

Новый набор запускается в этом репозитории: npm run test:e2e. Нужны установленный Chrome и браузер WebKit для Playwright (npx playwright install webkit). Fixture-сервер на 4174 принудительно использует тестовый URL Supabase, вся сеть подменена, проверки создания не пишут в рабочую БД. Настоящие клиенты не получают сообщений. Playwright добавлен только в devDependencies, версия закреплена; runtime-зависимости не менялись. Физические устройства/FPS не проверялись. Вход/MFA, разрешения, API, схема БД и тексты Telegram-уведомлений не менялись. Код и публикация приложения магазина не затронуты. Сохранилось существующее предупреждение Vite о большом начальном чанке.

---

# Functional verification

The cross-application browser suite lives in `ttta999/loft-store/e2e`. Run from the store checkout with `LOFT_ADMIN_ROOT` pointing at this admin checkout:

```sh
LOFT_ADMIN_ROOT=/path/to/loft-store-admin npm run test:all
```

On 2026-10-31, 44 mobile/desktop Chrome checks and 32 combined Node tests passed, with 8 PostgreSQL rollback suites and successful builds of both apps. See the storefront `TESTING.md` for the coverage matrix, findings and limitations.

Admin-specific Node tests cover MFA, cache behavior, notification authorization/recipient restrictions, and confirmed revenue. Run `npm test` here to execute them.

Verified fixes include consistent confirmed revenue (pending/cancelled/unconfirmed legacy payments excluded), notification recipient fallback for new orders, and responsive product/dashboard/brand layouts. Telegram message text was preserved. Real customers received no test messages.

2026-11-02: page modules are split on demand, cached order/request/dashboard data renders immediately, notification cache reuses its initial last-seen value, and shared transitions use 280 ms directional slides with spring-like button presses. Cross-app motion/cache regressions are in storefront `e2e/motion.spec.ts`. Telegram message templates and database schema are unchanged.

Premium-motion revision (2026-11-02): admin navigation now fades only page content for 200 ms; fixed headers no longer receive document snapshots or sideways travel. Press feedback is 98% without bounce. Prepared page modules render synchronously. Storefront `e2e/premium.spec.ts` adds shared-photo, gallery, panel, Telegram Back and flight-success checks.

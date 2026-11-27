import { test, expect, ADMIN } from './fixture'
import type { Page } from '@playwright/test'

type Motion = { direction: string; duration: number; easing: string; header: string }
type MotionWindow = Window & { adminMotions: Motion[] }

async function observeMotion(page: Page) {
  await page.addInitScript(() => {
    const records: Motion[] = (window as MotionWindow).adminMotions = []
    const native = document.startViewTransition?.bind(document)
    window.addEventListener('loft:admin-live-header', event => {
      const root = document.documentElement
      const { animations } = (event as CustomEvent<{ animations: Animation[] }>).detail
      const timing = animations[0].effect!.getTiming()
      records.push({ direction: root.dataset.adminMotion!, duration: Number(timing.duration), easing: timing.easing,
        header: getComputedStyle(document.querySelector('[data-admin-header]')!).viewTransitionName })
    })
    if (native) {
      document.startViewTransition = callback => {
        const root = document.documentElement
        const direction = root.dataset.adminMotion!
        const transition = native(callback)
        void transition.ready.then(() => {
          const incoming = getComputedStyle(root, '::view-transition-new(root)')
          records.push({ direction, duration: parseFloat(incoming.animationDuration) * 1000,
            easing: incoming.animationTimingFunction,
            header: getComputedStyle(root, '::view-transition-group(loft-admin-header)').animationName })
        }).catch(() => {})
        return transition
      }
    } else {
      const animate = Element.prototype.animate
      Element.prototype.animate = function (...args: Parameters<Element['animate']>) {
        const root = document.documentElement
        const animation = animate.call(this, ...args)
        if (root.dataset.adminMotion && !root.dataset.adminLiveHeader && this.hasAttribute('data-loft-content')) {
          const timing = animation.effect!.getTiming()
          records.push({ direction: root.dataset.adminMotion, duration: Number(timing.duration), easing: timing.easing, header: 'none' })
        }
        return animation
      }
    }
  })
}

const card = (page: Page, path: string) => page.locator(`[data-admin-card="${path}"]`)
const heading = (page: Page, title: string) => page.locator('[data-admin-header]').getByRole('heading', { name: title, exact: true })
const back = (page: Page) => page.locator('[data-admin-back]')
const live = (page: Page) => page.locator('[data-admin-page] [data-loft-content]')
const recordCount = (page: Page) => page.evaluate(() => (window as MotionWindow).adminMotions.length)

async function settled(page: Page) {
  await expect(page.locator('html')).not.toHaveAttribute('data-admin-motion')
  await expect(page.locator('[data-admin-page-copy], [data-admin-frame], [data-admin-hidden]')).toHaveCount(0)
}

async function verifyMotion(page: Page, index: number, direction: 'forward' | 'back') {
  await expect.poll(() => recordCount(page)).toBe(index + 1)
  expect(await page.evaluate(i => (window as MotionWindow).adminMotions[i], index)).toEqual({
    direction, duration: 340, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', header: 'none',
  })
  await settled(page)
  await expect(live(page)).toHaveCount(1)
  await expect(live(page)).toBeVisible()
}

async function openCatalog(page: Page) {
  await card(page, '/catalog').click()
  await expect(heading(page, 'Каталог')).toBeVisible()
  await settled(page)
}

const routeCases = [
  ['/orders', 'Заказы', false], ['/china', 'Спецзаказы', false],
  ['/products', 'Товары', true], ['/categories', 'Категории', true],
  ['/analytics', 'Аналитика', false], ['/settings', 'Настройки', false],
  ['/brands', 'Бренды', true],
] as const
for (const [index, [path, title, nested]] of routeCases.entries()) {
  test(`главная → ${path} → главная: направленный переход и точный возврат`, async ({ page }) => {
    await observeMotion(page)
    await page.goto(ADMIN)
    if (nested) await openCatalog(page)
    const source = card(page, path)
    await expect(source).toBeVisible()
    await source.scrollIntoViewIfNeeded()
    const before = await source.boundingBox()
    const { width, scroll } = await page.evaluate(() => ({ width: innerWidth, scroll: scrollY }))
    const beforeOpen = await recordCount(page)
    await source.click()
    await expect(page).toHaveURL(ADMIN + path)
    await expect(heading(page, title)).toBeVisible()
    await verifyMotion(page, beforeOpen, 'forward')
    expect(await page.evaluate(() => innerWidth)).toBe(width)
    const beforeReturn = await recordCount(page)
    if (index % 2) await page.goBack()
    else await back(page).click()
    await expect(page).toHaveURL(ADMIN + (nested ? '/catalog' : '/'))
    await expect(heading(page, nested ? 'Каталог' : 'LOFT Админ Панель')).toBeVisible()
    await verifyMotion(page, beforeReturn, 'back')
    await expect(source).toBeVisible()
    expect(await page.evaluate(() => scrollY)).toBe(scroll)
    expect(Math.abs((await source.boundingBox())!.y - before!.y)).toBeLessThan(1)
    if (nested) {
      await back(page).click()
      await expect(heading(page, 'LOFT Админ Панель')).toBeVisible()
      await settled(page)
    }
  })
}

test('иконки категорий контурные, различаются по назначению; технических кодов нет', async ({ page, harness }) => {
  harness.db.categories = [{ ...harness.db.categories[0], id: 'clothes', name_ru: 'Одежда', icon: 'clothes' }]
  const names = [['tshirts', 'Футболки'], ['shirts', 'Рубашки'], ['sweaters', 'Джемперы'], ['trousers', 'Брюки'], ['jeans', 'Джинсы'], ['tracksuits', 'Костюмы'], ['outerwear', 'Верхняя одежда']]
  harness.db.subcategories = names.map(([id, name]) => ({ ...harness.db.subcategories[0], id, category_id: 'clothes', name_ru: name, icon: id }))
  await page.goto(ADMIN + '/categories')
  await expect(page.locator('[data-category-row="clothes"]')).toBeVisible()
  const shapes: string[] = []
  for (const [id] of names) {
    const icon = page.locator(`[data-subcategory-row="${id}"] > div`).first().locator('svg')
    await expect(icon).toHaveAttribute('fill', 'none')
    await expect(icon).toHaveAttribute('stroke-width', '1.5')
    shapes.push(await icon.innerHTML())
  }
  expect(new Set(shapes).size).toBe(names.length)
  await expect(page.getByText(/ID:|· clothes|· tshirts|· shirts/)).toHaveCount(0)
  await page.locator('[data-category-row="clothes"]').getByRole('button', { name: 'Редактировать', exact: true }).first().click()
  const modal = page.locator('.loft-modal')
  await expect(modal.getByText(/ID|slug/)).toHaveCount(0)
  await modal.getByRole('button', { name: 'Рубашки', exact: true }).click()
  await expect(modal.getByText('Выбрано: Рубашки')).toBeVisible()
  await expect(modal.getByText('shirts', { exact: true })).toHaveCount(0)
  await modal.getByRole('button', { name: 'Отмена', exact: true }).click()
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await test.info().attach('Контурные иконки категорий в тёмной теме', { body: await page.screenshot(), contentType: 'image/png' })
})

test('категория создаётся без поля ID, повтор имени получает свободный внутренний код; редактирование сохраняет связи', async ({ page, harness }) => {
  harness.db.categories.push({ ...harness.db.categories[0], id: 'novaya', name_ru: 'Существующая' })
  await page.goto(ADMIN + '/categories')
  await page.getByRole('button', { name: 'Добавить категорию', exact: true }).click()
  const modal = page.locator('.loft-modal')
  await expect(modal.getByText(/ID|slug/)).toHaveCount(0)
  await modal.getByPlaceholder('Например: Обувь').fill('Новая')
  await modal.getByRole('button', { name: 'Одежда', exact: true }).click()
  await modal.getByRole('button', { name: 'Добавить', exact: true }).click()
  await expect(modal).toHaveCount(0)
  expect(harness.db.categories.find(c => c.name_ru === 'Новая')).toMatchObject({ id: 'novaya-2', icon: 'clothes' })
  await page.locator('[data-category-row="shoes"]').getByRole('button', { name: 'Редактировать', exact: true }).first().click()
  await modal.getByPlaceholder('Например: Обувь').fill('Обновлённая обувь')
  await modal.getByRole('button', { name: 'Сохранить', exact: true }).click()
  await expect(modal).toHaveCount(0)
  expect(harness.db.categories.find(c => c.name_ru === 'Обновлённая обувь')?.id).toBe('shoes')
  expect(harness.db.products[0].category).toBe('shoes')
})

test('подкатегория создаётся без технических полей и сохраняет выбранную иконку магазина', async ({ page, harness }) => {
  harness.db.subcategories.push({ ...harness.db.subcategories[0], id: 'krossovki' })
  await page.goto(ADMIN + '/categories')
  await page.getByRole('button', { name: 'Добавить подкатегорию', exact: true }).click()
  const modal = page.locator('.loft-modal')
  await expect(modal.getByText(/ID|slug/)).toHaveCount(0)
  await modal.getByPlaceholder('Например: Кроссовки').fill('Кроссовки')
  await modal.getByRole('button', { name: 'Кроссовки', exact: true }).click()
  await modal.getByRole('button', { name: 'Добавить', exact: true }).last().click()
  await expect(modal).toHaveCount(0)
  expect(harness.db.subcategories.find(s => s.id === 'krossovki-2')).toMatchObject({ category_id: 'shoes', icon: 'sneakers' })
})

test('быстрый возврат и уменьшение движения не оставляют слой над интерфейсом', async ({ page }) => {
  await observeMotion(page)
  await page.goto(ADMIN)
  await openCatalog(page)
  const categories = card(page, '/categories')
  await categories.click()
  await page.goBack()
  await expect(categories).toBeVisible()
  await settled(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const before = await recordCount(page)
  await categories.click()
  await expect(heading(page, 'Категории')).toBeVisible()
  await settled(page)
  expect(await recordCount(page)).toBe(before)
})

test('прямой вход в раздел не создаёт выдуманную исходную карточку', async ({ page }) => {
  await observeMotion(page)
  await page.goto(ADMIN + '/categories')
  await expect(heading(page, 'Категории')).toBeVisible()
  expect(await recordCount(page)).toBe(0)
  await back(page).click()
  await expect(page).toHaveURL(ADMIN + '/catalog')
  await expect(card(page, '/categories')).toBeVisible()
  await settled(page)
})

test('медленный ответ не замораживает native-переход и не оставляет скрытой страницу', async ({ page }) => {
  let release!: () => void
  const held = new Promise<void>(resolve => { release = resolve })
  await page.route('https://fixture.supabase.co/rest/v1/categories?*', async route => { await held; await route.fallback() })
  await observeMotion(page)
  await page.goto(ADMIN)
  await openCatalog(page)
  const before = await recordCount(page)
  try {
    await card(page, '/categories').click()
    await expect(heading(page, 'Категории')).toBeVisible()
    await verifyMotion(page, before, 'forward')
    await expect(live(page).getByRole('status', { name: 'Загрузка' })).toBeVisible()
  } finally {
    release()
  }
  await expect(live(page).locator('[data-category-row="shoes"]')).toBeVisible()
  await expect(live(page)).toHaveCSS('opacity', '1')
})

test('тёмная тема: раскрытие и закрытие сохраняют ширину окна и неподвижную шапку', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await observeMotion(page)
  await page.goto(ADMIN)
  await openCatalog(page)
  await expect(page.locator('html')).toHaveClass(/dark/)
  const width = await page.evaluate(() => innerWidth)
  const shell = page.locator('[data-admin-header]')
  const before = await shell.boundingBox()
  const beforeOpen = await recordCount(page)
  await card(page, '/categories').click()
  await expect(heading(page, 'Категории')).toBeVisible()
  await verifyMotion(page, beforeOpen, 'forward')
  expect(await page.evaluate(() => innerWidth)).toBe(width)
  expect((await shell.boundingBox())!.y).toBe(before!.y)
  const beforeReturn = await recordCount(page)
  await page.goBack()
  await expect(heading(page, 'Каталог')).toBeVisible()
  await verifyMotion(page, beforeReturn, 'back')
  expect(await page.evaluate(() => innerWidth)).toBe(width)
  expect((await shell.boundingBox())!.y).toBe(before!.y)
})

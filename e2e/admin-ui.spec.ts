import { test, expect, ADMIN } from './fixture'
import type { Page } from '@playwright/test'

async function track(page: Page) {
  await page.evaluate(() => {
    const native = document.startViewTransition.bind(document)
    ;(window as any).adminRecords = []
    document.startViewTransition = callback => {
      const source = document.querySelector<HTMLElement>('[style*="loft-admin-surface"]')!
      const rect = source.getBoundingClientRect()
      const record: any = { source: rect.toJSON(), sourceCard: source.dataset.adminCard, sourceFrame: source.hasAttribute('data-admin-frame') }
      ;(window as any).adminRecords.push(record)
      const transition = native(callback)
      ;(window as any).adminTransition = transition
      transition.ready.then(() => {
        const target = document.querySelector<HTMLElement>('[style*="loft-admin-surface"]')!
        const style = getComputedStyle(document.documentElement, '::view-transition-group(loft-admin-surface)')
        record.target = target.getBoundingClientRect().toJSON()
        record.targetCard = target.dataset.adminCard
        record.targetFrame = target.hasAttribute('data-admin-frame')
        record.duration = style.animationDuration
        record.easing = style.animationTimingFunction
        record.header = getComputedStyle(document.documentElement, '::view-transition-group(loft-admin-header)').animationName
      }).catch((error: Error) => { record.error = error.message })
      return transition
    }
  })
}
async function done(page: Page) {
  await page.waitForFunction(() => !!(window as any).adminTransition)
  await page.evaluate(() => (window as any).adminTransition.finished)
  const record = await page.evaluate(() => (window as any).adminRecords.at(-1))
  expect(record.error).toBeUndefined()
  expect(record.duration).toBe('0.34s')
  expect(record.easing).toBe('cubic-bezier(0.4, 0, 0.2, 1)')
  expect(record.header).toBe('none')
  await expect(page.locator('[data-admin-frame], [data-admin-shared], [data-admin-chrome], [data-admin-hidden]')).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveAttribute('data-admin-motion')
  return record
}
for (const [index, path] of ['/orders', '/china', '/products', '/categories', '/analytics', '/settings', '/brands'].entries()) {
  test(`главная → ${path} → главная: общая карточка и точный возврат`, async ({ page, browserName }) => {
    await page.goto(ADMIN)
    const card = page.locator(`[data-admin-card="${path}"]`)
    await expect(card).toBeVisible()
    await card.scrollIntoViewIfNeeded()
    const viewportWidth = await page.evaluate(() => innerWidth)
    const scroll = await page.evaluate(() => scrollY)
    const before = (await card.boundingBox())!
    await track(page)
    await card.click()
    await expect(page).toHaveURL(ADMIN + path)
    await page.waitForFunction(() => !!(window as any).adminTransition)
    await expect(page.locator('[data-loft-content]')).toBeVisible()
    if (path === '/categories' && browserName === 'chromium') {
      await page.evaluate(async () => {
        await (window as any).adminTransition.ready
        for (const animation of document.getAnimations()) if (animation.playState === 'running' && animation.effect?.getTiming().iterations !== Infinity) { animation.pause(); animation.currentTime = 170 }
      })
      const file = test.info().outputPath('dashboard-category-midpoint.png')
      await page.screenshot({ path: file })
      await test.info().attach('Карточка главной раскрывается в раздел', { path: file, contentType: 'image/png' })
      await page.evaluate(() => { for (const animation of document.getAnimations()) if (animation.playState === 'paused') animation.play() })
    }
    const opening = await done(page)
    expect(await page.evaluate(() => innerWidth)).toBe(viewportWidth)
    expect(opening.sourceCard).toBe(path)
    expect(opening.targetFrame).toBe(true)
    expect(Math.abs(opening.source.y - before.y)).toBeLessThan(1)
    expect(opening.target.width).toBeGreaterThan(before.width)
    if (index % 2) await page.goBack()
    else await page.locator('.sticky.top-0 button:has(svg.lucide-arrow-left)').first().click()
    await expect(card).toBeVisible()
    const closing = await done(page)
    expect(closing.sourceFrame).toBe(true)
    expect(closing.targetCard).toBe(path)
    expect(await page.evaluate(() => scrollY)).toBe(scroll)
    expect(Math.abs((await card.boundingBox())!.y - before.y)).toBeLessThan(1)
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
  await page.getByRole('button', { name: 'Категория', exact: true }).click()
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
  await page.goto(ADMIN)
  const card = page.locator('[data-admin-card="/categories"]')
  await expect(card).toBeVisible()
  await card.click()
  await page.goBack()
  await expect(card).toBeVisible()
  await expect(page.locator('[data-admin-frame], [data-admin-hidden]')).toHaveCount(0)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.evaluate(() => { document.startViewTransition = () => { throw Error('Reduced motion must skip shared projection') } })
  await card.click()
  await expect(page.getByRole('heading', { name: 'Категории', exact: true, level: 1 })).toBeVisible()
  await expect(page.locator('[data-admin-frame], [data-admin-hidden]')).toHaveCount(0)
})

test('прямой вход в раздел не создаёт выдуманную исходную карточку', async ({ page }) => {
  await page.goto(ADMIN + '/categories')
  await expect(page.getByRole('heading', { name: 'Категории', exact: true, level: 1 })).toBeVisible()
  await page.evaluate(() => { document.startViewTransition = () => { throw Error('No dashboard origin on a direct link') } })
  await page.locator('.sticky.top-0 button:has(svg.lucide-arrow-left)').first().click()
  await expect(page.locator('[data-admin-card="/categories"]')).toBeVisible()
  await expect(page.locator('[data-admin-frame], [data-admin-hidden]')).toHaveCount(0)
})

test('медленный ответ не замораживает native-переход и не оставляет скрытой страницу', async ({ page }) => {
  let release!: () => void
  const held = new Promise<void>(resolve => { release = resolve })
  await page.route('https://fixture.supabase.co/rest/v1/categories?*', async route => { await held; await route.fallback() })
  await page.goto(ADMIN)
  const card = page.locator('[data-admin-card="/categories"]')
  await expect(card).toBeVisible()
  await track(page)
  await card.click()
  await page.waitForFunction(() => !!(window as any).adminTransition)
  await page.evaluate(() => (window as any).adminTransition.finished)
  await expect(page.locator('[data-admin-frame], [data-admin-hidden], [data-admin-chrome]')).toHaveCount(0)
  await expect(page.getByText('Загрузка категорий...', { exact: true })).toBeVisible()
  release()
  await expect(page.getByRole('heading', { name: 'Категории', exact: true, level: 1 })).toBeVisible()
  await expect(page.locator('[data-loft-content]')).toHaveCSS('opacity', '1')
})

test('тёмная тема: раскрытие и закрытие сохраняют ширину окна и неподвижную шапку', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto(ADMIN)
  const card = page.locator('[data-admin-card="/categories"]')
  await expect(card).toBeVisible()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await card.scrollIntoViewIfNeeded()
  const width = await page.evaluate(() => innerWidth)
  await track(page)
  await card.click()
  await done(page)
  expect(await page.evaluate(() => innerWidth)).toBe(width)
  await page.goBack()
  await expect(card).toBeVisible()
  await done(page)
  expect(await page.evaluate(() => innerWidth)).toBe(width)
})

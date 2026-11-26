import { test, expect, ADMIN } from './fixture'

const catalogSections = new Set(['/products', '/categories', '/brands'])
const sections = [
  ['/orders', 'Заказы'],
  ['/china', 'Спецзаказы'],
  ['/products', 'Товары'],
  ['/categories', 'Категории'],
  ['/settings', 'Настройки'],
  ['/brands', 'Бренды'],
] as const

for (const [path, title] of sections) {
  test(`кэш ${path}: повторное открытие не загружает данные заново`, async ({ page, harness }) => {
    await page.goto(ADMIN)
    const parent = catalogSections.has(path) ? '/catalog' : '/'
    if (parent === '/catalog') {
      await page.locator('[data-admin-card="/catalog"]').click()
      await expect(page).toHaveURL(ADMIN + parent)
    }
    const open = async () => {
      await page.locator(`[data-admin-card="${path}"]`).click()
      await expect(page).toHaveURL(ADMIN + path)
      await expect(page.locator('[data-admin-header]').getByRole('heading', { name: title, exact: true })).toBeVisible()
      await expect(page.locator('html')).not.toHaveAttribute('data-admin-motion')
      const content = page.locator('[data-admin-page] [data-loft-content]')
      await expect(content).toHaveCount(1)
      await expect(content).toBeVisible()
    }
    await open()
    await page.locator('[data-admin-back]').click()
    await expect(page).toHaveURL(ADMIN + parent)
    await expect(page.locator(`[data-admin-card="${path}"]`)).toBeVisible()
    await page.waitForFunction(() => !document.documentElement.hasAttribute('data-admin-motion'))
    const reads = () => harness.calls.filter(c => c.path.startsWith('/rest/v1/') && !c.path.includes('store_is_admin') && !c.path.includes('store_admin_auth_state')).length
    const before = reads()
    await page.evaluate(() => {
      ;(window as any).loadingFlashed = false
      const observer = new MutationObserver(() => {
        if (document.querySelector('[aria-label="Загрузка"], .min-h-screen.flex.items-center.justify-center')) (window as any).loadingFlashed = true
      })
      observer.observe(document.getElementById('root')!, { childList: true, subtree: true })
    })
    await open()
    expect(reads()).toBe(before)
    expect(await page.evaluate(() => (window as any).loadingFlashed)).toBe(false)
  })
}

test('Analytics renders cached totals while exactly one refresh runs in the background', async ({ page, harness }) => {
  const order = harness.db.orders[0]
  Object.assign(order, { total_price_usd: 633, payment_status: 'paid', paid_at: new Date().toISOString() })
  await page.goto(ADMIN + '/analytics')
  await expect(page.getByText('$633', { exact: true }).first()).toBeVisible()
  await page.locator('[data-admin-back]').click()
  await expect(page.locator('[data-admin-island]')).toBeVisible()
  await expect(page.locator('html')).not.toHaveAttribute('data-admin-motion')

  let release = () => {}
  const pending = new Promise<void>(resolve => { release = resolve })
  const reads: string[] = []
  await page.route('**/rest/v1/**', async route => {
    const url = new URL(route.request().url())
    const projection = url.searchParams.get('select')
    if (url.pathname === '/rest/v1/orders' && projection?.startsWith('id,total_price_usd,status')) {
      reads.push('orders')
      await pending
    }
    if (url.pathname === '/rest/v1/products' && projection === 'id,category,brand,images') reads.push('products')
    await route.fallback()
  })
  try {
    order.total_price_usd = 740
    await page.locator('[data-admin-card="/analytics"]').click()
    await expect(page.locator('[data-admin-header]').getByRole('heading', { name: 'Аналитика' })).toBeVisible()
    await expect(page.locator('[data-admin-page] [data-loft-content]').getByText('$633', { exact: true }).first()).toBeVisible()
    await expect.poll(() => [...reads].sort()).toEqual(['orders', 'products'])
    await expect(page.locator('[data-admin-page] [data-loft-content]').getByText('$740', { exact: true })).toHaveCount(0)
    await expect(page.locator('[data-admin-page] [data-loft-content] [aria-label="Загрузка"]')).toHaveCount(0)
  } finally {
    release()
  }
  await expect(page.getByText('$740', { exact: true }).first()).toBeVisible()
  expect([...reads].sort()).toEqual(['orders', 'products'])
})

for (const link of ['', '   ', 'https://example.test/courier/123']) {
  test(`курьер: сохранение ${link.trim() ? 'со ссылкой' : JSON.stringify(link) + ' без ссылки'}`, async ({ page, harness }) => {
    Object.assign(harness.db.orders[0], { delivery_method: 'delivery', status: 'Готов' })
    await page.goto(ADMIN + '/orders')
    await page.getByRole('button', { name: /Заказ №1001/ }).click()
    await page.getByRole('button', { name: 'Передан курьеру' }).click()
    const modal = page.locator('.loft-modal')
    await modal.getByPlaceholder('https://...').fill(link)
    await modal.getByRole('button', { name: 'Сохранить', exact: true }).click()
    await expect(modal).toHaveCount(0)
    await expect.poll(() => harness.db.orders[0].status).toBe('Выдан')
    const call = harness.calls.find(c => c.path.endsWith('/rpc/store_admin_order_status'))!
    expect(call.body).toEqual({
      p_id: harness.db.orders[0].id,
      p_status: 'Выдан',
      p_courier: link.trim() || null,
    })
  })
}

test('курьер: заполненная некорректная ссылка не меняет статус', async ({ page, harness }) => {
  Object.assign(harness.db.orders[0], { delivery_method: 'delivery', status: 'Готов' })
  await page.goto(ADMIN + '/orders')
  await page.getByRole('button', { name: /Заказ №1001/ }).click()
  await page.getByRole('button', { name: 'Передан курьеру' }).click()
  const modal = page.locator('.loft-modal')
  await modal.getByPlaceholder('https://...').fill('javascript:alert(1)')
  await modal.getByRole('button', { name: 'Сохранить', exact: true }).click()
  await expect(page.getByText('Ссылка должна начинаться с http:// или https://')).toBeVisible()
  expect(harness.db.orders[0].status).toBe('Готов')
  expect(harness.calls.filter(c => c.path.endsWith('/rpc/store_admin_order_status'))).toHaveLength(0)
})


test('обновление товаров не стирает кэш заказов, а ошибка загрузки не кэшируется как пустой список', async ({ page, harness }) => {
  await page.goto(ADMIN)
  await page.locator('[data-admin-card="/catalog"]').click()
  await page.locator('[data-admin-card="/products"]').click()
  await expect(page.locator('h3:visible').filter({ hasText: 'Тестовые кроссовки' }).first()).toBeVisible()
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-admin-motion'))
  const variantReads = harness.calls.filter(c => c.path.endsWith('/rpc/store_admin_variants')).length
  await page.getByRole('button', { name: 'Обновить' }).click()
  await expect.poll(() => harness.calls.filter(c => c.path.endsWith('/rpc/store_admin_variants')).length).toBeGreaterThan(variantReads)
  expect(await page.evaluate(async () => {
    const { ordersCacheApi } = await import('/src/lib/cache.ts')
    return ordersCacheApi.get()?.length
  })).toBe(1)
  harness.failTable = 'orders'
  await page.evaluate(async () => {
    const { ordersCacheApi } = await import('/src/lib/cache.ts')
    ordersCacheApi.invalidate()
  })
  await page.locator('[data-admin-back]').click()
  await expect(page).toHaveURL(ADMIN + '/catalog')
  await page.locator('[data-admin-back]').click()
  await expect(page.locator('[data-admin-card="/orders"]')).toBeVisible()
  await page.locator('[data-admin-card="/orders"]').click()
  await expect(page.getByText('Ошибка загрузки заказов', { exact: true }).first()).toBeVisible({ timeout: 15000 })
  expect(await page.evaluate(async () => {
    const { ordersCacheApi } = await import('/src/lib/cache.ts')
    return ordersCacheApi.get()
  })).toBeNull()
  harness.failTable = null
  await page.getByRole('button', { name: 'Обновить' }).click()
  await expect(page.getByRole('button', { name: /Заказ №1001/ })).toBeVisible()
})

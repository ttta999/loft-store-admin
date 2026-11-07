import { test, expect, ADMIN } from './fixture'

for (const path of ['/orders', '/china', '/products', '/categories', '/analytics', '/settings', '/brands']) {
  test(`кэш ${path}: повторное открытие не загружает данные заново`, async ({ page, harness }) => {
    await page.goto(ADMIN)
    const open = async () => {
      await page.locator(`[data-admin-card="${path}"]`).click()
      await expect(page).toHaveURL(ADMIN + path)
      await expect(page.locator('[data-loft-content]')).toBeVisible()
      await page.waitForFunction(() => !document.documentElement.hasAttribute('data-admin-motion'))
    }
    await open()
    await page.locator('.sticky.top-0 button:has(svg.lucide-arrow-left)').first().click()
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
    expect(call.body.p_courier ?? null).toBe(link.trim() || null)
    const expected = '🚀 Передан курьеру: Ваш заказ №1001 передан курьеру и уже в пути к вам!' + (link.trim() ? `\n\n🔗 Отследить курьера: ${link.trim()}` : '')
    expect(call.body.p_notice.message).toBe(expected)
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
  await page.locator('.sticky.top-0 button:has(svg.lucide-arrow-left)').first().click()
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

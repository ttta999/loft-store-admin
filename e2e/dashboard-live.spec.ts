import { test, expect, ADMIN } from './fixture'

test('Dashboard runs each section transition below its live sticky header', async ({ page }) => {
  await page.addInitScript(() => {
    window.addEventListener('loft:admin-live-header', event => {
      const { animations } = (event as CustomEvent<{ animations: Animation[] }>).detail
      const header = document.querySelector<HTMLElement>('[data-admin-header]')!
      const island = header.querySelector<HTMLElement>('[data-admin-island]')!
      const { x, y, width, height } = island.getBoundingClientRect()
      document.documentElement.dataset.testAdminFrame = JSON.stringify({
        direction: document.documentElement.dataset.adminMotion,
        duration: animations.map(animation => animation.effect?.getTiming().duration),
        live: getComputedStyle(header).viewTransitionName === 'none' &&
          island.contains(document.elementFromPoint(x + width / 2, y + height / 2)),
        height: header.offsetHeight,
        actions: header.querySelector('.admin-header-actions')?.querySelectorAll('button').length,
        back: Boolean(header.querySelector('[data-admin-back]')),
      })
    })
  })

  await page.goto(ADMIN)
  const html = page.locator('html')
  const header = page.locator('[data-admin-header]')
  const height = await header.evaluate(node => node.clientHeight + 1)
  for (const path of ['/catalog', '/analytics', '/settings', '/orders', '/china', '/refunds', '/campaigns']) {
    await page.locator(`[data-admin-card="${path}"]`).click()
    await expect(page).toHaveURL(ADMIN + path)
    await expect(html).toHaveAttribute('data-test-admin-frame', new RegExp(`"direction":"forward".*"duration":\\[340,340\\].*"live":true.*"height":${height}.*"back":true`))
    await expect(html).not.toHaveAttribute('data-admin-motion')
    await page.locator('[data-admin-back]').click()
    await expect(page).toHaveURL(ADMIN + '/')
    await expect(html).toHaveAttribute('data-test-admin-frame', new RegExp(`"direction":"back".*"duration":\\[340,340\\].*"live":true.*"height":${height}.*"actions":3.*"back":false`))
    await expect(header.getByRole('heading')).toHaveText('LOFT Админ Панель')
    await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(page.locator('[data-admin-outgoing]')).toHaveCount(0)
  }
})

for (const [language, countLabel] of [
  ['ru', (count: number) => `${count} ${count === 1 ? 'требует' : 'требуют'} обработки`],
  ['uz', (count: number) => `${count} ta ishlov kutmoqda`],
] as const) {
  test(`Dashboard refresh updates its refund label without changing row geometry in ${language}`, async ({ page, harness }) => {
    await page.setViewportSize({ width: 320, height: 844 })
    await page.addInitScript(lang => {
      localStorage.setItem('loft-admin-language:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', lang)
    }, language)
    harness.db.products = Array.from({ length: 22 }, () => harness.db.products[0])
    harness.db.brands = Array.from({ length: 20 }, () => harness.db.brands[0])
    const setRefundCount = (count: number) => {
      const order = harness.db.orders[0]
      harness.db.refunds = [
        ...Array.from({ length: count }, (_, index) => ({
          id: index + 1,
          order_id: order.id,
          status: index % 2 ? 'Проверка платежа' : 'Ожидает возврата',
        })),
        { id: 99, order_id: order.id, status: 'Возврат выполнен' },
      ]
    }
    setRefundCount(2)
    await page.goto(ADMIN)
    const rows = page.locator('[data-admin-card="/catalog"], [data-admin-card="/refunds"], [data-admin-card="/analytics"], [data-admin-card="/campaigns"], [data-admin-card="/settings"]')
    const refunds = page.locator('[data-admin-card="/refunds"]')
    const counter = refunds.getByText(countLabel(2), { exact: true })
    await expect(counter).toBeVisible()
    await expect(page.getByText('22 · 20', { exact: true })).toHaveCount(0)
    const measure = () => rows.evaluateAll(nodes => nodes.map(row => {
      const bounds = row.getBoundingClientRect()
      return [bounds.height, row.firstElementChild!.getBoundingClientRect().x, row.lastElementChild!.getBoundingClientRect().x]
    }))
    const original = await measure()
    expect(await counter.evaluate(node => {
      const box = node.getBoundingClientRect()
      const label = node.previousElementSibling!.getBoundingClientRect()
      const arrow = node.nextElementSibling!.getBoundingClientRect()
      return box.left >= label.right && box.right < arrow.left && node.scrollHeight === node.clientHeight
    })).toBe(true)

    const refresh = page.locator('button[data-dashboard-refresh]')
    for (const count of [1, 5, 0]) {
      setRefundCount(count)
      await refresh.click()
      await expect(refunds.getByText(countLabel(count), { exact: true })).toBeVisible()
      expect(await measure()).toEqual(original)
    }
    await expect(refresh).toHaveAttribute('data-dashboard-refresh', 'success')
    await expect(page.locator('#dashboard-refresh-info')).toContainText(/\d{2}:\d{2}/)
  })
}

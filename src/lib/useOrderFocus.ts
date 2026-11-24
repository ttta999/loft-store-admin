import { useLayoutEffect } from 'react'

/** An explicit order link wins over cached list scroll, once per history entry. */
export function useOrderFocus(orderId: string | null, locationKey: string) {
  useLayoutEffect(() => {
    if (!orderId) return
    const order = document.getElementById('admin-order-' + orderId)
    if (!order) return
    const summary = order.querySelector<HTMLElement>('[data-order-summary]')
    const header = document.querySelector<HTMLElement>('[data-admin-header]')
    const list = order.closest<HTMLElement>('[data-order-list]')
    if (!summary || !list) return

    let frame = 0
    let previous: number[] | undefined
    let done = false
    const visual = window.visualViewport
    const observe = new ResizeObserver(schedule)
    function stop() {
      done = true
      cancelAnimationFrame(frame)
      observe.disconnect()
      window.removeEventListener('loft:admin-transition-end', schedule)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
      window.removeEventListener('keydown', stop)
    }
    function schedule() {
      if (!done && !frame) frame = requestAnimationFrame(measure)
    }
    function measure() {
      frame = 0
      if (document.documentElement.dataset.adminMotion) return
      const viewportTop = visual?.offsetTop ?? 0
      const top = Math.max(viewportTop, header?.getBoundingClientRect().bottom ?? 0)
      const bottom = viewportTop + (visual?.height ?? innerHeight)
      const center = (top + bottom) / 2
      const card = order!.getBoundingClientRect()
      const anchor = card.height <= bottom - top ? card : summary!.getBoundingClientRect()
      const geometry = [anchor.top + window.scrollY, anchor.height, center]
      if (!previous || geometry.some((value, i) => Math.abs(value - previous![i]) > 0.5)) {
        previous = geometry
        schedule()
        return
      }

      const destination = Math.max(0, geometry[0] + anchor.height / 2 - center)
      const maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight
      list!.style.setProperty('--order-focus-space', `${Math.max(0, Math.ceil(destination - maxScroll))}px`)
      window.dispatchEvent(new Event('loft:admin-order-focus'))
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
      summary!.focus({ preventScroll: true })
      order!.dataset.orderHighlight = 'true'
      window.scrollTo({ top: destination, behavior: reduced ? 'instant' : 'smooth' })
      stop()
    }
    observe.observe(order)
    observe.observe(list)
    window.addEventListener('loft:admin-transition-end', schedule)
    window.addEventListener('wheel', stop, { passive: true })
    window.addEventListener('touchstart', stop, { passive: true })
    window.addEventListener('keydown', stop)
    schedule()
    return () => {
      stop()
      list.style.removeProperty('--order-focus-space')
      delete order.dataset.orderHighlight
    }
  }, [orderId, locationKey])
}

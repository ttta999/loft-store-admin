type Page = { key: string; pathname: string }
type Origin = { path: string; scroll: number }
const origins = new Map<string, Origin>()
const sections = new Set(['/campaigns', '/orders', '/china', '/products', '/categories', '/analytics', '/settings', '/brands', '/refunds'])
const name = 'loft-admin-surface'
const frames = new Set<HTMLElement>()
const header = () => document.querySelector<HTMLElement>('.sticky.top-0')
const content = () => document.querySelector<HTMLElement>('[data-loft-content]')
const card = (path: string) => Array.from(document.querySelectorAll<HTMLElement>('[data-admin-card]')).find(element => element.dataset.adminCard === path)
function visible(element?: HTMLElement | null): element is HTMLElement {
  if (!element?.isConnected) return false
  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0 && rect.bottom > (header()?.getBoundingClientRect().bottom || 0) && rect.top < innerHeight
}
function mark(element: HTMLElement) {
  element.dataset.adminShared = 'true'
  element.getBoundingClientRect()
  element.style.viewTransitionName = name
}
export function clearDashboardTransition() {
  frames.forEach(frame => frame.remove()); frames.clear()
  document.querySelectorAll<HTMLElement>('[data-admin-shared], [data-admin-chrome]').forEach(element => {
    element.style.removeProperty('view-transition-name')
    delete element.dataset.adminShared
    delete element.dataset.adminChrome
  })
  document.querySelectorAll('[data-admin-hidden]').forEach(element => element.removeAttribute('data-admin-hidden'))
  delete document.documentElement.dataset.adminMotion
}
export function captureAdminHeader() {
  document.querySelectorAll<HTMLElement>('[data-admin-chrome]').forEach(element => { element.style.removeProperty('view-transition-name'); delete element.dataset.adminChrome })
  const element = header()
  if (element) { element.dataset.adminChrome = 'true'; element.style.viewTransitionName = 'loft-admin-header' }
}
function snapshot(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const top = Math.max(0, rect.top, header()?.getBoundingClientRect().bottom || 0)
  const bottom = Math.min(innerHeight, rect.bottom)
  if (!rect.width || bottom <= top) return null
  const frame = document.createElement('div')
  frame.dataset.adminFrame = 'true'
  frame.inert = true
  frame.setAttribute('aria-hidden', 'true')
  Object.assign(frame.style, { position: 'fixed', top: `${top}px`, left: `${rect.left}px`, width: `${rect.width}px`, height: `${bottom - top}px`, borderRadius: '16px', overflow: 'hidden', pointerEvents: 'none', zIndex: '1000', background: getComputedStyle(document.body).backgroundColor })
  const clone = element.cloneNode(true) as HTMLElement
  for (const node of [clone, ...clone.querySelectorAll<HTMLElement>('*')]) {
    node.removeAttribute('id')
    for (const attribute of [...node.attributes]) if (attribute.name.startsWith('data-')) node.removeAttribute(attribute.name)
    node.style.removeProperty('view-transition-name')
  }
  Object.assign(clone.style, { position: 'absolute', top: `${rect.top - top}px`, left: '0px', width: `${rect.width}px`, height: `${rect.height}px`, margin: '0', opacity: '1', transition: 'none' })
  frame.append(clone); document.body.append(frame); frames.add(frame)
  element.dataset.adminHidden = 'true'
  return frame
}
function readyContent(valid: () => boolean) {
  if (content()) return Promise.resolve(content())
  return new Promise<HTMLElement | null>(resolve => {
    const finish = (element: HTMLElement | null) => { clearTimeout(timer); observer.disconnect(); resolve(element) }
    const observer = new MutationObserver(() => { if (!valid()) finish(null); else if (content()) finish(content()) })
    const timer = setTimeout(() => finish(null), 180)
    observer.observe(document.getElementById('root')!, { childList: true, subtree: true })
  })
}
/** The selected dashboard tile becomes the section's visible surface and returns
 * to the same tile. Bounds/easing match the storefront's shared product photo. */
export function prepareDashboardTransition(from: Page, to: Page) {
  const forward = from.pathname === '/' && sections.has(to.pathname)
  const origin = forward ? { path: to.pathname, scroll: scrollY } : origins.get(from.key)
  const returning = to.pathname === '/' && sections.has(from.pathname) && !!origin
  if (!origin || (!forward && !returning)) return null
  const source = forward ? card(to.pathname) : content()
  if (!visible(source)) return null
  const surface = forward ? source : snapshot(source)
  if (!surface) return null
  mark(surface)
  if (forward) { origins.set(to.key, origin); while (origins.size > 40) origins.delete(origins.keys().next().value!) }
  return {
    async finish(valid: () => boolean) {
      const body = await readyContent(valid)
      if (!valid() || !body) return false
      // The outgoing copy is no longer needed once the browser captured it.
      frames.forEach(frame => frame.remove()); frames.clear()
      document.querySelectorAll('[data-admin-hidden]').forEach(element => element.removeAttribute('data-admin-hidden'))
      if (returning) window.scrollTo(0, origin.scroll)
      const target = forward ? snapshot(body) : card(origin.path)
      if (!target || !visible(target)) return false
      mark(target)
      return true
    },
  }
}

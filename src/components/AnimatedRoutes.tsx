import { AdminHeaderShell } from './AdminPageHeader'
import RouteErrorBoundary from './RouteErrorBoundary'
import { rememberAdminOrigin, hasDirtyAdminForms, captureAdminScroll } from '../lib/adminNavigation'
import PageSkeleton from './PageSkeleton'
import { t, tx } from '../lib/i18n'
import { preloadPage } from '../lib/pagePreload'
import { Suspense, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { Outlet, Route, Routes, useLocation, useNavigate, useNavigationType, type NavigationType } from 'react-router-dom'
import ScrollRestoration from './ScrollRestoration'

function RouteFrame({ navigationType }: { navigationType: NavigationType }) {
  const location = useLocation()
  return <><ScrollRestoration navigationType={navigationType} /><RouteErrorBoundary path={location.pathname} search={location.search}><Suspense fallback={<PageSkeleton />}><Outlet /></Suspense></RouteErrorBoundary></>
}

const content = () => document.querySelector<HTMLElement>('[data-loft-content]')
const section = (search: string) => new URLSearchParams(search).get('section')

export default function AnimatedRoutes({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const navigationType = useNavigationType()
  const historyIndex = useRef(Number(history.state?.idx) || 0)
  const [frame, setFrame] = useState({ location, navigationType })
  const displayed = frame.location
  const commit = () => {
    captureAdminScroll(displayed.key)
    setFrame({ location, navigationType })
  }

  useLayoutEffect(() => {
    if (displayed === location) return

    const previousUrl = displayed.pathname + displayed.search
    const nextUrl = location.pathname + location.search
    const index = Number(history.state?.idx) || 0
    const backwards = navigationType === 'POP'
      ? index < historyIndex.current
      : (location.state as { adminBack?: boolean } | null)?.adminBack === true

    if (previousUrl !== nextUrl && hasDirtyAdminForms() && !confirm(tx(t('Есть несохранённые изменения. Покинуть раздел без сохранения?')))) {
      if (navigationType === 'POP' && historyIndex.current !== index) window.history.go(historyIndex.current - index)
      else if (navigationType === 'PUSH') navigate(-1)
      else navigate(previousUrl, { replace: true })
      return
    }

    rememberAdminOrigin(displayed, location, navigationType, index)
    historyIndex.current = index
    const samePage = displayed.pathname === location.pathname &&
      (location.pathname !== '/settings' || section(displayed.search) === section(location.search))
    if (samePage || location.pathname === '/login' || displayed.pathname === '/login' ||
        matchMedia('(prefers-reduced-motion: reduce)').matches) {
      commit()
      return
    }

    void preloadPage(location.pathname).catch(() => {})
    const root = document.documentElement
    let active = true
    let applied = false
    let transition: ViewTransition | undefined
    let fallback: Animation | undefined
    const interrupt = () => { transition?.skipTransition(); fallback?.cancel() }
    const cleanup = () => {
      delete root.dataset.adminMotion
      delete root.dataset.adminDashboardReturn
      window.removeEventListener('pointerdown', interrupt)
      window.removeEventListener('wheel', interrupt)
      window.dispatchEvent(new Event('loft:admin-transition-end'))
    }
    const apply = () => {
      if (!active || applied) return
      applied = true
      flushSync(commit)
    }

    // Commit the destination with its existing Suspense skeleton. Neither module
    // preloading nor data fetching is awaited by the snapshot callback.
    queueMicrotask(() => {
      if (!active) return
      root.dataset.adminMotion = backwards ? 'back' : 'forward'
      if (location.pathname === '/') root.dataset.adminDashboardReturn = 'true'
      window.addEventListener('pointerdown', interrupt, { passive: true })
      window.addEventListener('wheel', interrupt, { passive: true })
      if (typeof document.startViewTransition === 'function') {
        try {
          transition = document.startViewTransition(apply)
          void transition.ready.catch(() => {})
          void transition.updateCallbackDone.catch(apply)
          void transition.finished.catch(() => {}).then(() => { if (active) cleanup() })
          return
        } catch { /* The current browser could not capture the route. */ }
      }
      apply()
      fallback = content()?.animate(
        [{ translate: backwards ? '-100vw 0' : '100vw 0' }, { translate: '0px 0' }],
        { duration: 340, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      )
      if (fallback) void fallback.finished.catch(() => {}).then(() => { if (active) cleanup() })
      else cleanup()
    })

    return () => { active = false; interrupt(); cleanup() }
    // The displayed route changes inside the transition, not in response to itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])
  return <AdminHeaderShell location={displayed}>
    <div data-admin-page={displayed.pathname === '/login' ? undefined : ''}>
      <Routes location={displayed}><Route element={<RouteFrame navigationType={frame.navigationType} />}>{children}</Route></Routes>
    </div>
  </AdminHeaderShell>
}

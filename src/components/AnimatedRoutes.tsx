import PageSkeleton from './PageSkeleton'
import {t,tx,useAdminLanguage} from '../lib/i18n'
import { clearDashboardTransition, captureAdminHeader, prepareDashboardTransition } from '../lib/dashboardTransition'
import { preloadPage } from '../lib/pagePreload'
import { Suspense, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { Outlet, Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import ScrollRestoration from './ScrollRestoration'
function RouteFrame() {
 useAdminLanguage()

  return <><ScrollRestoration /><Suspense fallback={<PageSkeleton/>}><Outlet /></Suspense></>
}
export default function AnimatedRoutes({ children }: { children: ReactNode }) {
 useAdminLanguage()

  const location = useLocation(),navigate=useNavigate(),navigationType=useNavigationType()
  const historyIndex=useRef(Number(history.state?.idx)||0)
  const [displayed, setDisplayed] = useState(location)
  const generation = useRef(0)
  useLayoutEffect(() => {
    if (displayed === location) return
    const current = ++generation.current
    const previousUrl=displayed.pathname+displayed.search,nextUrl=location.pathname+location.search
    const index=Number(history.state?.idx)||0
    if(previousUrl!==nextUrl&&document.querySelector('[data-loft-dirty="true"]')&&!confirm(tx(t("Есть несохранённые изменения. Покинуть раздел без сохранения?")))){
      if(navigationType==='POP'&&historyIndex.current!==index)window.history.go(historyIndex.current-index)
      else if(navigationType==='PUSH')navigate(-1)
      else navigate(previousUrl,{replace:true})
      return
    }
    historyIndex.current=index
    let transition: ViewTransition | undefined
    const interrupt = () => transition?.skipTransition()
    const stopListening = () => {
      window.removeEventListener('pointerdown', interrupt)
      window.removeEventListener('touchstart', interrupt)
      window.removeEventListener('wheel', interrupt)
    }
    let applied = false
    const apply = () => { if (generation.current === current && !applied) { applied = true; flushSync(() => setDisplayed(location)) } }
    let frame = 0
    let animations: Animation[] = []
    if (location.pathname === '/login' || displayed.pathname === '/login' || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayed(location)
      return
    }
    void preloadPage(location.pathname).catch(() => {}).then(() => {
      if (generation.current !== current) return
      const shared = typeof document.startViewTransition === 'function' ? prepareDashboardTransition(displayed, location) : null
      if (shared) {
        captureAdminHeader()
        document.documentElement.dataset.adminMotion = 'surface'
        transition = document.startViewTransition(async () => {
          apply()
          const matched = await shared.finish(() => generation.current === current)
          if (generation.current === current) captureAdminHeader()
          if (!matched) transition?.skipTransition()
        })
        window.addEventListener('pointerdown', interrupt, { passive: true })
        window.addEventListener('touchstart', interrupt, { passive: true })
        window.addEventListener('wheel', interrupt, { passive: true })
        void transition.ready.catch(() => {})
        void transition.updateCallbackDone.catch(apply)
        void transition.finished.finally(() => { stopListening(); if (generation.current === current) clearDashboardTransition() }).catch(() => {})
        return
      }
      apply()
      frame = requestAnimationFrame(() => {
        animations = Array.from(document.querySelectorAll<HTMLElement>('[data-loft-content]')).map(element => element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }))
      })
    })
    return () => { generation.current++; transition?.skipTransition(); stopListening(); clearDashboardTransition(); cancelAnimationFrame(frame); animations.forEach(animation => animation.cancel()) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])
  return <Routes location={displayed}><Route element={<RouteFrame />}>{children}</Route></Routes>
}

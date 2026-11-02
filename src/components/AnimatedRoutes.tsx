import { preloadPage } from '../lib/pagePreload'
import { Suspense, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import ScrollRestoration from './ScrollRestoration'
function RouteFrame() {
  return <><ScrollRestoration /><Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center" role="status" aria-label="Загрузка"><div className="w-8 h-8 rounded-full border-2 border-current border-t-transparent animate-spin" /></div>}><Outlet /></Suspense></>
}
export default function AnimatedRoutes({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [displayed, setDisplayed] = useState(location)
  const generation = useRef(0)
  useLayoutEffect(() => {
    if (displayed === location) return
    const current = ++generation.current
    let frame = 0
    let animations: Animation[] = []
    if (location.pathname === '/login' || displayed.pathname === '/login' || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayed(location)
      return
    }
    void preloadPage(location.pathname).catch(() => {}).then(() => {
      if (generation.current !== current) return
      flushSync(() => setDisplayed(location))
      frame = requestAnimationFrame(() => {
        animations = Array.from(document.querySelectorAll<HTMLElement>('[data-loft-content]')).map(element => element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }))
      })
    })
    return () => { generation.current++; cancelAnimationFrame(frame); animations.forEach(animation => animation.cancel()) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])
  return <Routes location={displayed}><Route element={<RouteFrame />}>{children}</Route></Routes>
}

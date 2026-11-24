import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, type NavigationType } from 'react-router-dom'
import { consumeAdminScroll } from '../lib/adminNavigation'

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

const STORAGE_KEY = 'loft-scroll-positions'
const getSavedPositions = (): Record<string, number> => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export default function ScrollRestoration({ navigationType }: { navigationType: NavigationType }) {
  const location = useLocation()
  
  // Храним актуальный скролл вне зависимости от циклов рендера
  const scrollPosRef = useRef(0)
  const prevLocRef = useRef(location)

  // 1. Непрерывно трекаем скролл (самое точное значение)
  useEffect(() => {
    const handleScroll = () => {
      scrollPosRef.current = window.scrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 2. СИНХРОННО обрабатываем смену URL до отрисовки интерфейса (до Paint)
  useLayoutEffect(() => {
    const prev = prevLocRef.current
    
    // Если URL изменился
    if (prev.key !== location.key) {
      // СОХРАНЯЕМ позицию старой страницы до того, как сбросим её
      const positions = getSavedPositions()
      positions[prev.key] = consumeAdminScroll(prev.key) ?? scrollPosRef.current
      const keys=Object.keys(positions);for(const key of keys.slice(0,Math.max(0,keys.length-60)))delete positions[key]
      try{sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions))}catch{/* Storage limits must not block navigation. */}

      // A dialog belongs to the current list and keeps its window position.
      if (prev.pathname === location.pathname && (new URLSearchParams(prev.search).has('dialog') || new URLSearchParams(location.search).has('dialog'))) {
        prevLocRef.current = location
        return
      }

      // ВОССТАНАВЛИВАЕМ или СБРАСЫВАЕМ для новой страницы
      if (navigationType === 'POP') {
        const saved = positions[location.key]
        
        if (saved !== undefined && saved > 0) {
          // Применяем скролл
          window.scrollTo({top:saved,behavior:'instant'})

          // Страховка для списков, которые рендерятся асинхронно
          const observer = new ResizeObserver(() => {
            if (document.documentElement.scrollHeight >= saved + window.innerHeight) {
              window.scrollTo({top:saved,behavior:'instant'})
              observer.disconnect()
            }
          })
          // Stop restoring as soon as the user starts scrolling themselves.
          const stop = () => observer.disconnect()
          window.addEventListener('loft:admin-order-focus', stop, { once: true })
          window.addEventListener('wheel', stop, { passive: true, once: true })
          window.addEventListener('touchstart', stop, { passive: true, once: true })
          window.addEventListener('keydown', stop, { once: true })
          window.addEventListener('pointerdown', stop, { passive: true, once: true })
          if (document.documentElement.scrollHeight >= saved + window.innerHeight) observer.disconnect()
          else {
            const page = document.querySelector('[data-admin-page]')
            if (page) observer.observe(page)
          }
          
          prevLocRef.current = location
          return () => {
            observer.disconnect()
            window.removeEventListener('loft:admin-order-focus', stop)
            window.removeEventListener('wheel', stop)
            window.removeEventListener('touchstart', stop)
            window.removeEventListener('keydown', stop)
            window.removeEventListener('pointerdown', stop)
          }
        } else {
          window.scrollTo({top:0,behavior:'instant'})
        }
      } else {
        // Если это PUSH (переход вперед) - всегда наверх
        window.scrollTo({top:0,behavior:'instant'})
      }
    }
    
    prevLocRef.current = location
  }, [location, navigationType])

  return null
}
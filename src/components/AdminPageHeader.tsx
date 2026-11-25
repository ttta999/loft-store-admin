import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Package, Globe, ShoppingBag, Layers, Tag, Ruler, Undo2, BarChart3, Send, Settings, Bell, Truck, Monitor, DollarSign, RefreshCw, LogOut, Check, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import { dashboardActionClass } from '../lib/adminHeaderStyles'
import { DASHBOARD_FRESH_FOR, DASHBOARD_REFRESH, setDashboardRefresh, setDashboardSession, useDashboardRefreshState, useDashboardSession, useDashboardUpdatedAt } from '../lib/dashboardSession'
import { adminTime } from '../lib/adminDateTime'
import { invalidateAllCaches } from '../lib/cache'
import { logout } from '../lib/auth'
import { tx, useAdminLanguage } from '../lib/i18n'
import { routeTitle, useAdminBack, type AdminLocation } from '../lib/adminNavigation'

const HeaderSlot = createContext<HTMLDivElement | null>(null)
const pageIcons = {
  '/orders': Package, '/china': Globe, '/catalog': ShoppingBag, '/products': Package,
  '/categories': Layers, '/brands': Tag, '/size-charts': Ruler, '/refunds': Undo2,
  '/analytics': BarChart3, '/campaigns': Send,
}
const settingsIcons = { payments: Truck, prices: DollarSign, sale: Tag, reminders: Bell, theme: Monitor }

function DashboardHeaderActions() {
  const grant = useDashboardSession()
  const refresh = useDashboardRefreshState()
  const updatedAt = useDashboardUpdatedAt()
  const [expiredAt, setExpiredAt] = useState(() => Date.now() - updatedAt >= DASHBOARD_FRESH_FOR ? updatedAt : 0)
  const refreshing = refresh === 'busy'
  const expired = updatedAt !== 0 && expiredAt === updatedAt
  const warning = refresh === 'error' || expired
  useEffect(() => {
    if (!updatedAt || expiredAt === updatedAt) return
    const remaining = updatedAt + DASHBOARD_FRESH_FOR - Date.now()
    const timer = window.setTimeout(() => setExpiredAt(updatedAt), Math.max(0, remaining))
    return () => clearTimeout(timer)
  }, [updatedAt, expiredAt])
  useEffect(() => {
    if (refresh !== 'success') return
    const timer = window.setTimeout(() => setDashboardRefresh(grant, 'idle'), 850)
    return () => clearTimeout(timer)
  }, [grant, refresh])
  const navigate = useNavigate()
  const signOut = async () => {
    setDashboardSession(null)
    invalidateAllCaches()
    await logout()
    navigate('/login')
  }

  return <>
    <NotificationBell key={grant?.id ?? 'pending'} enabled={Boolean(grant)} />
    <div className="group relative">
      <button type="button" aria-label={tx('Обновить')} aria-describedby="dashboard-refresh-info"
        data-dashboard-refresh={refresh} aria-busy={refreshing} aria-disabled={!grant || refreshing}
        className={dashboardActionClass}
        onKeyDown={event => { if (event.key === 'Escape') event.currentTarget.blur() }}
        onClick={event => {
          if (!grant) return
          event.currentTarget.focus({ preventScroll: true })
          if (!refreshing) window.dispatchEvent(new Event(DASHBOARD_REFRESH))
        }}>
        {refresh === 'success' ? <Check size={18} className="dashboard-refresh-success" />
          : refresh === 'error' ? <AlertTriangle size={18} className="text-[#9B3B3B] dark:text-red-300" />
          : <RefreshCw size={18} className={refreshing ? 'motion-safe:animate-spin' : ''} />}
        {expired && refresh !== 'error' && <span aria-hidden="true" className="absolute right-0.5 top-0.5 size-2 rounded-full bg-gold" />}
      </button>
      <div id="dashboard-refresh-info" role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-max max-w-60 rounded-xl border border-[#E8E2D5] bg-[#FBF9F4] px-3 py-2 text-xs shadow-md opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 dark:border-dark-border dark:bg-dark-card">
        {updatedAt ? <p>{tx('Последнее обновление:')} {adminTime(updatedAt)}</p> : <p>{tx('Обновить данные')}</p>}
        {warning && <p className="mt-1 text-[#9B3B3B] dark:text-red-300" data-dashboard-stale>
          {tx(refresh === 'error'
            ? updatedAt ? 'Не удалось обновить. Показаны последние данные.' : 'Ошибка загрузки данных панели'
            : 'Данные могут быть устаревшими.')}
        </p>}
      </div>
      <span className="sr-only" role="status">
        {refresh === 'success' ? tx('Данные обновлены') : expired && refresh !== 'error' ? tx('Данные могут быть устаревшими.') : ''}
      </span>
    </div>
    <button type="button" title={tx('Выйти')} aria-label={tx('Выйти')}
      disabled={!grant} className={dashboardActionClass} onClick={signOut}>
      <LogOut size={18} className="text-[#9B3B3B] dark:text-red-300" />
    </button>
  </>
}

export function AdminHeaderShell({ location, children }: { location: AdminLocation; children: ReactNode }) {
  useAdminLanguage()
  const { pathname, search } = location
  const { back, label } = useAdminBack(location)
  const [slot, setSlot] = useState<HTMLDivElement | null>(null)
  const home = pathname === '/'
  const section = new URLSearchParams(search).get('section') as keyof typeof settingsIcons | null
  const Icon = pathname === '/settings'
    ? section && Object.hasOwn(settingsIcons, section) ? settingsIcons[section] : Settings
    : pageIcons[pathname as keyof typeof pageIcons] || Settings

  return <HeaderSlot.Provider value={home ? null : slot}>
    {pathname !== '/login' && <header data-admin-header className={`sticky top-0 z-20 border-b px-4 sm:px-6 ${home
      ? 'border-transparent bg-transparent shadow-none'
      : 'border-[#E8E2D5] bg-[#F5F1E8] dark:border-dark-border dark:bg-dark-bg'}`}>
      <div data-admin-heading className="admin-header-grid mx-auto max-w-6xl items-center text-[#1B2A4A] dark:text-white">
        {!home && <div className="admin-header-back min-w-0">
          <button data-admin-back onClick={back} className="inline-flex min-w-0 items-center gap-2 text-sm font-bold text-[#1B2A4A] dark:text-white min-h-11">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[#E8E2D5] bg-[#FBF9F4] dark:border-dark-border dark:bg-dark-card"><ArrowLeft size={18}/></span>
            <span className="sr-only md:not-sr-only md:truncate">{tx(label)}</span>
          </button>
        </div>}
        <div data-admin-island className={home
          ? "admin-header-title mx-auto w-full max-w-sm rounded-full border border-[#E8E2D5] bg-[#FBF9F4] px-3 py-2.5 text-center shadow-sm dark:border-dark-border dark:bg-dark-card sm:py-3"
          : "admin-header-title flex min-w-0 items-center justify-center gap-2 text-center"}>
          <h1 className={`line-clamp-2 text-sm font-bold leading-tight sm:text-xl ${home ? 'tracking-wide select-none' : ''}`}>
            {home ? 'LOFT Админ Панель' : tx(routeTitle(pathname, search))}
          </h1>
          {!home && <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[#E8E2D5] bg-[#FBF9F4] text-[#C9A961] dark:border-dark-border dark:bg-dark-card sm:size-10"><Icon size={18}/></span>}
        </div>
        <div className="admin-header-actions flex min-w-0 items-center justify-end gap-2" ref={home ? undefined : setSlot}>{home && <DashboardHeaderActions />}</div>
      </div>
    </header>}
    {children}
  </HeaderSlot.Provider>
}

export default function AdminHeaderActions({ actions }: { actions: ReactNode }) {
  const slot = useContext(HeaderSlot)
  return slot ? createPortal(actions, slot) : null
}

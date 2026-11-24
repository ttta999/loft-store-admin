import { createContext, useContext, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Package, Globe, ShoppingBag, Layers, Tag, Ruler, Undo2, BarChart3, Send, Settings, Bell, Truck, Monitor, DollarSign } from 'lucide-react'
import { tx, useAdminLanguage } from '../lib/i18n'
import { routeTitle, useAdminBack, type AdminLocation } from '../lib/adminNavigation'

const HeaderSlot = createContext<HTMLDivElement | null>(null)
const pageIcons = {
  '/orders': Package, '/china': Globe, '/catalog': ShoppingBag, '/products': Package,
  '/categories': Layers, '/brands': Tag, '/size-charts': Ruler, '/refunds': Undo2,
  '/analytics': BarChart3, '/campaigns': Send,
}
const settingsIcons = { payments: Truck, prices: DollarSign, sale: Tag, reminders: Bell, theme: Monitor }

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

  return <HeaderSlot.Provider value={slot}>
    {pathname !== '/login' && <header data-admin-header className="sticky top-0 z-20 border-b border-[#E8E2D5] bg-[#F5F1E8] px-4 dark:border-dark-border dark:bg-dark-bg sm:px-6">
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
          <h1 className={`line-clamp-2 text-sm font-bold leading-tight sm:text-xl ${home ? 'tracking-wide' : ''}`}>
            {home ? 'LOFT Админ Панель' : tx(routeTitle(pathname, search))}
          </h1>
          {!home && <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[#E8E2D5] bg-[#FBF9F4] text-[#C9A961] dark:border-dark-border dark:bg-dark-card sm:size-10"><Icon size={18}/></span>}
        </div>
        <div className="admin-header-actions flex min-w-0 items-center justify-end gap-2" ref={setSlot} />
      </div>
    </header>}
    {children}
  </HeaderSlot.Provider>
}

export default function AdminHeaderActions({ actions }: { actions: ReactNode }) {
  const slot = useContext(HeaderSlot)
  return slot ? createPortal(actions, slot) : null
}

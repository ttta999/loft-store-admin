import { ContentSkeleton } from '../components/PageSkeleton'
import {t,tx,uiError,useAdminLanguage} from '../lib/i18n'
import {AdminMenuRows} from '../components/AdminMenu'
import ManagerTasks from '../components/ManagerTasks'
import { cachedStoreExchangeRate, loadStoreExchangeRate } from '../lib/storeExchangeRate'
import { displayMoney } from '../lib/money'
import { useAdminRefresh } from '../lib/adminLive'
import {getRefunds} from '../lib/refunds'
import {refundsCacheApi} from '../lib/cache'
import { adminTime } from '../lib/adminDateTime'
import { DASHBOARD_FRESH_FOR, DASHBOARD_REFRESH, getDashboardSession, saveDashboardSnapshot, setDashboardRefreshing, type DashboardSnapshot } from '../lib/dashboardSession'
import { confirmedRevenue, WORK_STATUSES } from '../lib/revenue'
import { startTransition, useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, getChinaRequests, getAdminCacheScope, supabase } from '../lib/supabase'
import {
  ordersCacheApi,
  chinaCacheApi,
  dashboardCountsCacheApi,
} from '../lib/cache'
import {
  Bell,
  Undo2,
  Package,
  Globe,
  TrendingUp,
  ShoppingBag,
  BarChart3,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { warmPage } from '../lib/pagePreload'

// ✅ KPI-карточка в стиле страницы заказа (десктоп)
function KpiCard({ icon, label, value, subtitle, secondaryValue, accent = false }: {
  icon: React.ReactNode
  label: string
  value: string
  subtitle: string
  secondaryValue?: string
  accent?: boolean
}) {
 useAdminLanguage()

  return (
    <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border border-[#E8E2D5] dark:border-dark-border ${
        accent ? 'bg-[#C9A961]/10 dark:bg-gold/20' : 'bg-[#F5F1E8] dark:bg-dark-accent'
      }`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[#8A8275] dark:text-gray-300 truncate">{tx(label)}</p>
        <p className={`text-3xl font-bold truncate mt-0.5 ${
          accent ? 'text-[#C9A961]' : 'text-[#1B2A4A] dark:text-white'
        }`}>{value}</p>
        {secondaryValue && <p className="mt-0.5 text-sm font-medium text-[#1B2A4A] dark:text-gray-300">{secondaryValue}</p>}
        <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5 truncate">{tx(subtitle)}</p>
      </div>
    </div>
  )
}

// ✅ Карточка-ссылка на раздел (десктоп)
function NavCard({ icon, title, description, count, destination, onClick }: {
  icon: React.ReactNode
  title: string
  description: string
  count?: string
  destination: string
  onClick: () => void
}) {
 useAdminLanguage()

  return (
    <button
      data-admin-card={destination}
      onPointerEnter={() => warmPage(destination)}
      onPointerDown={() => warmPage(destination)}
      onFocus={() => warmPage(destination)}
      onClick={onClick}
      className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-5 text-left hover:shadow-md hover:border-[#C9A961] dark:hover:border-gold transition-all group"
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border border-[#E8E2D5] dark:border-dark-border bg-[#F5F1E8] dark:bg-dark-accent">
          {icon}
        </div>
        <ChevronRight size={18} className="text-[#8A8275] dark:text-gray-300 group-hover:text-[#C9A961] dark:group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
      </div>
      <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white">{tx(title)}</h2>
      <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-1">{description}</p>
      {count !== undefined && (
        <span className="inline-block mt-3 px-2.5 py-1 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-xs font-bold text-[#1B2A4A] dark:text-white">
          {count}
        </span>
      )}
    </button>
  )
}

const fetchCounts = async () => {
  const [products, brands] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('brands').select('*', { count: 'exact', head: true }),
  ])
  if (products.error || brands.error) throw products.error || brands.error
  return [products.count ?? 0, brands.count ?? 0]
}

function readDashboardResources() {
  return {
    orders: ordersCacheApi.get(),
    china: chinaCacheApi.get(),
    counts: dashboardCountsCacheApi.get(),
    refunds: refundsCacheApi.get(),
  }
}

function dashboardExpired(view?: DashboardSnapshot) {
  return !view || Date.now() - view.updatedAt >= DASHBOARD_FRESH_FOR
}

export default function DashboardPage() {
 const language = useAdminLanguage()

  const navigate = useNavigate()
  const scope = getAdminCacheScope()
  const grant = getDashboardSession()
  const [snapshot, setSnapshot] = useState(() => grant?.snapshot)
  const [failed, setFailed] = useState(false)
  const [checking, setChecking] = useState(() =>
    dashboardExpired(grant?.snapshot) || Object.values(readDashboardResources()).some(value => value === null),
  )
  const loading = !snapshot && !failed
  const { orders = [], china: chinaRequests = [], refunds = [], productsCount = 0, brandsCount = 0 } = snapshot ?? {}
  const latestLoad = useRef(0)
  const invalidateLoad = useCallback(() => {
    latestLoad.current++
    setDashboardRefreshing(grant, false)
  }, [grant])
  const [exchangeRate, setExchangeRate] = useState(cachedStoreExchangeRate)

  const refreshRate = useCallback(async (force = false) => {
    setExchangeRate(await loadStoreExchangeRate(force).catch(() => null))
  }, [])
  useEffect(() => {
    let mounted = true
    void loadStoreExchangeRate().catch(() => null).then(rate => {
      if (mounted) setExchangeRate(rate)
    })
    return () => { mounted = false }
  }, [])
  useAdminRefresh(['settings'], refreshRate)

  useEffect(()=>{
   if (loading) return
   // Warm the module once Dashboard is usable. This starts no analytics reads.
   const warmAnalytics = () => warmPage('/analytics')
   const idle = typeof window.requestIdleCallback === 'function'
     ? window.requestIdleCallback(warmAnalytics) : undefined
   if (idle === undefined) warmAnalytics()
   const paths=['/orders','/china','/catalog','/refunds'];let index=0,timer:ReturnType<typeof setTimeout>|undefined
   const warm=()=>{if(index<paths.length){warmPage(paths[index++]);timer=setTimeout(warm,250)}}
   timer=setTimeout(warm,700)
   return () => {
     clearTimeout(timer)
     if (idle !== undefined) window.cancelIdleCallback(idle)
   }
  },[loading])

  const loadData = useCallback(async (forceRefresh = false) => {
    const request = ++latestLoad.current
    const current = () => grant && grant === getDashboardSession() &&
      scope === getAdminCacheScope() && request === latestLoad.current
    // Retain the last successful, coherent view. Resource invalidations and
    // expiry determine whether to revalidate, independently of the visible view.
    const expired = dashboardExpired(grant?.snapshot)
    const { orders: cachedOrders, china: cachedChina, counts: cachedCounts, refunds: cachedRefunds } = readDashboardResources()
    if (!forceRefresh && !expired && cachedOrders && cachedChina && cachedCounts && cachedRefunds) return
    const refreshAll = forceRefresh || expired
    try {
      const [ordersData, chinaData, counts, refundData] = await Promise.all([
        !refreshAll && cachedOrders ? Promise.resolve(cachedOrders) : getOrders(),
        !refreshAll && cachedChina ? Promise.resolve(cachedChina) : getChinaRequests(),
        !refreshAll && cachedCounts ? Promise.resolve([cachedCounts.productsCount, cachedCounts.brandsCount]) : fetchCounts(),
        getRefunds(refreshAll),
      ])
      if (!current() || !grant) return
      const [pCount, bCount] = counts
      const updated: DashboardSnapshot = {
        orders: ordersData, china: chinaData, refunds: refundData,
        productsCount: pCount, brandsCount: bCount, updatedAt: Date.now(),
      }
      saveDashboardSnapshot(grant, updated)
      ordersCacheApi.set(ordersData)
      chinaCacheApi.set(chinaData)
      dashboardCountsCacheApi.set({ productsCount: pCount, brandsCount: bCount })
      startTransition(() => {
        setSnapshot(updated)
        setFailed(false)
        setChecking(false)
      })
    } catch (error) {
      if (!current()) return
      console.error('Ошибка загрузки:', error)
      if (!grant?.snapshot) toast.error(uiError('Ошибка загрузки данных панели'))
      setFailed(true)
      setChecking(false)
    } finally {
      if (current()) setDashboardRefreshing(grant, false)
    }
  }, [grant, scope])

  useEffect(() => {
    void loadData(false)
    return invalidateLoad
  }, [invalidateLoad, loadData])

  useAdminRefresh(['orders', 'china_requests', 'refunds', 'products', 'brands'], () => {
    setChecking(true)
    return loadData(true)
  })


  useEffect(() => {
    const refresh = () => {
      setChecking(true)
      setDashboardRefreshing(grant, true)
      ordersCacheApi.invalidate()
      chinaCacheApi.invalidate()
      dashboardCountsCacheApi.invalidate()
      void refreshRate(true)
      void loadData(true)
    }
    window.addEventListener(DASHBOARD_REFRESH, refresh)
    return () => window.removeEventListener(DASHBOARD_REFRESH, refresh)
  }, [grant, loadData, refreshRate])

  const { totalRevenue, activeOrders } = useMemo(() => ({
    totalRevenue: confirmedRevenue(orders),
    activeOrders: orders.filter(order => WORK_STATUSES.includes(order.status)).length,
  }), [orders])
  const revenueUzs = exchangeRate === null ? NaN : totalRevenue * exchangeRate
  const pendingRequests = useMemo(() => chinaRequests.filter(r => r.status === 'На оценке').length, [chinaRequests])
  const pendingRefunds = useMemo(() => refunds.filter(r => ['Проверка платежа','Ожидает возврата'].includes(r.status)).length, [refunds])

  return (
    <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg">

      <div data-loft-content className="max-w-6xl mx-auto p-6">
        {snapshot && <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 text-xs text-[#8A8275] dark:text-gray-300">
          <p role="status">{failed ? t('Не удалось обновить. Показаны последние данные.') : checking ? t('Данные обновляются…') : ''}</p>
          <p className="whitespace-nowrap">{t('Обновлено:')} {adminTime(snapshot.updatedAt)}</p>
        </div>}
        {!snapshot && failed && <p role="alert">{t('Ошибка загрузки данных панели')}</p>}
        {loading ? <ContentSkeleton/> : <>
        {/* ✅ KPI-строка: 3 карточки со счётчиками */}
        {snapshot && <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <KpiCard
            icon={<Package size={20} className="text-[#1B2A4A] dark:text-white" />}
            label={t("Активные заказы")}
            value={String(activeOrders)}
            subtitle={t("Всего заказов: {0}",[orders.length])}
          />
          <KpiCard
            icon={<Globe size={20} className="text-[#C9A961]" />}
            label={t("Спецзаказы на рассмотрении")}
            value={String(pendingRequests)}
            subtitle={t("Всего заявок: {0}",[chinaRequests.length])}
            accent
          />
          <KpiCard
            icon={<TrendingUp size={20} className="text-[#C9A961]" />}
            label={t("Выручка")}
            value={displayMoney(totalRevenue, 'USD')}
            secondaryValue={Number.isFinite(revenueUzs) ? '≈ ' + displayMoney(revenueUzs, 'UZS', language) : undefined}
            subtitle={t("Подтверждённая оплата")}
            accent
          />
        </div>}

        <ManagerTasks/>

        {/* ✅ Сетка разделов: карточки-ссылки */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <NavCard
            icon={<Package size={20} className="text-[#1B2A4A] dark:text-white" />}
            title={t("Заказы")}
            description={t("Управление заказами клиентов")}
            count={snapshot ? t("Всего:") + " " + orders.length : undefined}
            destination="/orders"
            onClick={() => navigate('/orders')}
          />
          <NavCard
            icon={<Globe size={20} className="text-[#C9A961]" />}
            title={t("Спецзаказы")}
            description={t("Заявки на спецзаказы из Китая")}
            count={snapshot ? t("Всего:") + " " + chinaRequests.length : undefined}
            destination="/china"
            onClick={() => navigate('/china')}
          />
        </div>
        <AdminMenuRows entries={[
         {path:'/catalog',title:'Каталог',description:'Товары, категории, бренды и размеры',icon:<ShoppingBag size={20}/>,count:snapshot ? productsCount+' · '+brandsCount : undefined},
         {path:'/refunds',title:'Возвраты',icon:<Undo2 size={20}/>,count:snapshot ? String(pendingRefunds) : undefined},
         {path:'/analytics',title:'Аналитика',icon:<BarChart3 size={20}/>},
         {path:'/campaigns',title:'Рассылки',icon:<Bell size={20}/>},
         {path:'/settings',title:'Настройки',icon:<Settings size={20}/>},
        ]}/>
        </>}
      </div>
    </div>
  )
}

import { ContentSkeleton } from '../components/PageSkeleton'
import AdminPageHeader from '../components/AdminPageHeader'
import {t,tx,uiError,useAdminLanguage} from '../lib/i18n'
import {AdminMenuRows} from '../components/AdminMenu'
import ManagerTasks from '../components/ManagerTasks'
import { cachedStoreExchangeRate, loadStoreExchangeRate } from '../lib/storeExchangeRate'
import { displayMoney } from '../lib/money'
import { useAdminRefresh } from '../lib/adminLive'
import {getRefunds} from '../lib/refunds'
import {refundsCacheApi} from '../lib/cache'
import { confirmedRevenue, WORK_STATUSES } from '../lib/revenue'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, getChinaRequests, supabase } from '../lib/supabase'
import {
  ordersCacheApi,
  chinaCacheApi,
  dashboardCountsCacheApi,
  invalidateAllCaches,
} from '../lib/cache'
import {
  Bell,
  Undo2,
  Package,
  Globe,
  LogOut,
  TrendingUp,
  ShoppingBag,
  BarChart3,
  Settings,
  ChevronRight,
  Store,
  RefreshCw,
} from 'lucide-react'
import { logout } from '../lib/auth'
import { toast } from 'sonner'
import NotificationBell from '../components/NotificationBell'
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

export default function DashboardPage() {
 const language = useAdminLanguage()

  const navigate = useNavigate()
  const [refunds,setRefunds]=useState<any[]>(()=>refundsCacheApi.get()||[])
  const [orders, setOrders] = useState<any[]>(() => ordersCacheApi.get() || [])
  const [chinaRequests, setChinaRequests] = useState<any[]>(() => chinaCacheApi.get() || [])
  const [productsCount, setProductsCount] = useState(() => dashboardCountsCacheApi.get()?.productsCount || 0)
  const [brandsCount, setBrandsCount] = useState(() => dashboardCountsCacheApi.get()?.brandsCount || 0)
  const [loading, setLoading] = useState(() => !(ordersCacheApi.get() || chinaCacheApi.get() || dashboardCountsCacheApi.get()))
  const [refreshing, setRefreshing] = useState(false)
  const [exchangeRate, setExchangeRate] = useState(cachedStoreExchangeRate)

  const refreshRate = async (force = false) => {
    setExchangeRate(await loadStoreExchangeRate(force).catch(() => null))
  }
  useEffect(() => {
    let mounted = true
    void loadStoreExchangeRate().catch(() => null).then(rate => {
      if (mounted) setExchangeRate(rate)
    })
    return () => { mounted = false }
  }, [])
  useAdminRefresh(['settings'], refreshRate)

  useEffect(() => {
    loadData(false)
  }, [])

  useAdminRefresh(['orders', 'china_requests', 'refunds', 'products', 'brands'], () => loadData(false, true))

  useEffect(()=>{
   const paths=['/orders','/china','/catalog','/refunds'];let index=0,timer:ReturnType<typeof setTimeout>|undefined
   const warm=()=>{if(index<paths.length){warmPage(paths[index++]);timer=setTimeout(warm,250)}}
   timer=setTimeout(warm,700);return()=>clearTimeout(timer)
  },[])

  const loadData = async (forceRefresh = false, background = false) => {
    // 1. Читаем все три кеша
    const cachedOrders = !forceRefresh ? ordersCacheApi.get() : null
    const cachedChina = !forceRefresh ? chinaCacheApi.get() : null
    const cachedCounts = !forceRefresh ? dashboardCountsCacheApi.get() : null

    const hasAllCached = cachedOrders && cachedChina && cachedCounts

    // 2. ✅ МГНОВЕННАЯ отрисовка — если есть все кеши, loading=false сразу
    if (hasAllCached) {
      setOrders(cachedOrders as any[])
      setChinaRequests(cachedChina as any[])
      setProductsCount(cachedCounts!.productsCount)
      setBrandsCount(cachedCounts!.brandsCount)
      setLoading(false)
      // Продолжаем в фоне — обновляем данные свежими
    } else {
      // ✅ Частичный кеш — рисуем что есть, остальные грузим фоном (без спиннера)
      if (cachedOrders || cachedChina || cachedCounts) {
        if (cachedOrders) setOrders(cachedOrders as any[])
        if (cachedChina) setChinaRequests(cachedChina as any[])
        if (cachedCounts) {
          setProductsCount(cachedCounts.productsCount)
          setBrandsCount(cachedCounts.brandsCount)
        }
        setLoading(false)
      } else {
        if (!background) setLoading(true)
      }
    }

    if (forceRefresh) setRefreshing(true)

    try {
      // 3. ✅ Параллельная загрузка только того, чего нет в кеше
      const [ordersData, chinaData, counts, refundData] = await Promise.all([
        cachedOrders ? Promise.resolve(cachedOrders) : getOrders(),
        cachedChina ? Promise.resolve(cachedChina) : getChinaRequests(),
        cachedCounts ? Promise.resolve([cachedCounts.productsCount, cachedCounts.brandsCount] as [number, number]) : fetchCounts(),
        getRefunds(forceRefresh),
      ])

      const [pCount, bCount] = counts

      setRefunds(refundData)
      setOrders(ordersData as any[])
      setChinaRequests(chinaData as any[])
      setProductsCount(pCount)
      setBrandsCount(bCount)

      // 4. ✅ Сохраняем свежие данные в кеш
      ordersCacheApi.set(ordersData as any[])
      chinaCacheApi.set(chinaData as any[])
      if (!cachedCounts) dashboardCountsCacheApi.set({ productsCount: pCount, brandsCount: bCount })
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      // Тост только если совсем ничего не смогли показать
      if (!cachedOrders && !cachedChina && !cachedCounts) {
        toast.error(uiError('Ошибка загрузки данных панели'))
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // ✅ HEAD-запрос для счётчиков — мгновенный, не грузит строки, не портит кеш
  const fetchCounts = async (): Promise<[number, number]> => {
    try {
      const [pRes, bRes] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('brands').select('*', { count: 'exact', head: true }),
      ])
      return [pRes.count || 0, bRes.count || 0]
    } catch (err) {
      console.error('Ошибка fetchCounts:', err)
      return [0, 0]
    }
  }

  const handleRefresh = () => {
    ordersCacheApi.invalidate()
    chinaCacheApi.invalidate()
    dashboardCountsCacheApi.invalidate()
    void refreshRate(true)
    loadData(true)
  }

  const handleLogout = async () => {
    // ✅ Сбрасываем весь кеш админки при выходе
    invalidateAllCaches()
    await logout()
    navigate('/login')
  }

  const totalRevenue = confirmedRevenue(orders)
  const revenueUzs = exchangeRate === null ? NaN : totalRevenue * exchangeRate
  const activeOrders = orders.filter(o => WORK_STATUSES.includes(o.status)).length
  const pendingRequests = chinaRequests.filter(r => r.status === 'На оценке').length

  return (
    <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg">

      <AdminPageHeader home title="LOFT Admin Panel" icon={<Store/>} actions={<>
            <NotificationBell />
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 min-h-11 px-3 rounded-xl text-sm font-bold text-[#1B2A4A] dark:text-white bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors disabled:opacity-50"
              title={t("Обновить данные")} aria-label={t("Обновить")}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden lg:inline">{t("Обновить")}</span></button>
            <button
              onClick={handleLogout} aria-label={t("Выйти")}
              className="flex items-center gap-2 min-h-11 px-3 rounded-xl border border-red-200 dark:border-red-500/30 bg-[#FBF9F4] dark:bg-red-500/10 text-sm font-bold text-[#9B3B3B] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden lg:inline">{t("Выйти")}</span></button>
      </>}/>

      <div data-loft-content className="max-w-6xl mx-auto p-6">
        {loading ? <ContentSkeleton/> : <>
        {/* ✅ KPI-строка: 3 карточки со счётчиками */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
        </div>

        <ManagerTasks/>

        {/* ✅ Сетка разделов: карточки-ссылки */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <NavCard
            icon={<Package size={20} className="text-[#1B2A4A] dark:text-white" />}
            title={t("Заказы")}
            description={t("Управление заказами клиентов")}
            count={`Всего: ${orders.length}`}
            destination="/orders"
            onClick={() => navigate('/orders')}
          />
          <NavCard
            icon={<Globe size={20} className="text-[#C9A961]" />}
            title={t("Спецзаказы")}
            description={t("Заявки на спецзаказы из Китая")}
            count={`Всего: ${chinaRequests.length}`}
            destination="/china"
            onClick={() => navigate('/china')}
          />
        </div>
        <AdminMenuRows entries={[
         {path:'/catalog',title:'Каталог',description:'Товары, категории, бренды и размеры',icon:<ShoppingBag size={20}/>,count:productsCount+' · '+brandsCount},
         {path:'/refunds',title:'Возвраты',icon:<Undo2 size={20}/>,count:String(refunds.filter(r=>['Проверка платежа','Ожидает возврата'].includes(r.status)).length)},
         {path:'/analytics',title:'Аналитика',icon:<BarChart3 size={20}/>},
         {path:'/campaigns',title:'Рассылки',icon:<Bell size={20}/>},
         {path:'/settings',title:'Настройки',icon:<Settings size={20}/>},
        ]}/>
        </>}
      </div>
    </div>
  )
}

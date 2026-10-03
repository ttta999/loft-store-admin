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
  Package,
  Globe,
  LogOut,
  TrendingUp,
  ShoppingBag,
  BarChart3,
  Settings,
  Tag,
  ChevronRight,
  Store,
  RefreshCw,
} from 'lucide-react'
import { logout } from '../lib/auth'
import { toast, Toaster } from 'sonner'
import NotificationBell from '../components/NotificationBell'

// ✅ KPI-карточка в стиле страницы заказа (десктоп)
function KpiCard({ icon, label, value, subtitle, accent = false }: {
  icon: React.ReactNode
  label: string
  value: string
  subtitle: string
  accent?: boolean
}) {
  return (
    <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border border-[#E8E2D5] dark:border-dark-border ${
        accent ? 'bg-[#C9A961]/10 dark:bg-gold/20' : 'bg-[#F5F1E8] dark:bg-dark-accent'
      }`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[#8A8275] dark:text-gray-300 truncate">{label}</p>
        <p className={`text-3xl font-bold truncate mt-0.5 ${
          accent ? 'text-[#C9A961]' : 'text-[#1B2A4A] dark:text-white'
        }`}>{value}</p>
        <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5 truncate">{subtitle}</p>
      </div>
    </div>
  )
}

// ✅ Карточка-ссылка на раздел (десктоп)
function NavCard({ icon, title, description, count, onClick }: {
  icon: React.ReactNode
  title: string
  description: string
  count?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-5 text-left hover:shadow-md hover:border-[#C9A961] dark:hover:border-gold transition-all group"
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border border-[#E8E2D5] dark:border-dark-border bg-[#F5F1E8] dark:bg-dark-accent">
          {icon}
        </div>
        <ChevronRight size={18} className="text-[#8A8275] dark:text-gray-300 group-hover:text-[#C9A961] dark:group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
      </div>
      <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white">{title}</h2>
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
  const navigate = useNavigate()
  const [orders, setOrders] = useState<any[]>([])
  const [chinaRequests, setChinaRequests] = useState<any[]>([])
  const [productsCount, setProductsCount] = useState(0)
  const [brandsCount, setBrandsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadData(false)
  }, [])

  const loadData = async (forceRefresh = false) => {
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
        setLoading(true)
      }
    }

    if (forceRefresh) setRefreshing(true)

    try {
      // 3. ✅ Параллельная загрузка только того, чего нет в кеше
      const [ordersData, chinaData, counts] = await Promise.all([
        cachedOrders ? Promise.resolve(cachedOrders) : getOrders(),
        cachedChina ? Promise.resolve(cachedChina) : getChinaRequests(),
        fetchCounts(),
      ])

      const [pCount, bCount] = counts

      setOrders(ordersData as any[])
      setChinaRequests(chinaData as any[])
      setProductsCount(pCount)
      setBrandsCount(bCount)

      // 4. ✅ Сохраняем свежие данные в кеш
      ordersCacheApi.set(ordersData as any[])
      chinaCacheApi.set(chinaData as any[])
      dashboardCountsCacheApi.set({ productsCount: pCount, brandsCount: bCount })
    } catch (error) {
      console.error('Ошибка загрузки:', error)
      // Тост только если совсем ничего не смогли показать
      if (!cachedOrders && !cachedChina && !cachedCounts) {
        toast.error('Ошибка загрузки данных панели')
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
    loadData(true)
  }

  const handleLogout = async () => {
    // ✅ Сбрасываем весь кеш админки при выходе
    invalidateAllCaches()
    await logout()
    navigate('/login')
  }

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_price_usd || 0), 0)
  const activeOrders = orders.filter(o => o.status === 'Активный').length
  const pendingRequests = chinaRequests.filter(r => r.status === 'На рассмотрении').length

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg flex items-center justify-center">
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2A4A] dark:border-gold mx-auto mb-4"></div>
          <p className="text-[#1B2A4A] dark:text-white font-medium">Загрузка панели...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg">
      <Toaster position="top-center" richColors />

      {/* ✅ Sticky-шапка (десктоп): лого слева, действия справа */}
      <div className="sticky top-0 z-20 bg-[#F5F1E8]/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-[#E8E2D5] dark:border-dark-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-[#1B2A4A] dark:bg-gold flex items-center justify-center flex-shrink-0">
              <Store size={20} className="text-white dark:text-[#1B2A4A]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-[#1B2A4A] dark:text-white truncate">LOFT Admin Panel</h1>
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5 truncate">Панель управления магазином</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <NotificationBell />
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#1B2A4A] dark:text-white bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors disabled:opacity-50"
              title="Обновить данные"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Обновить
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-500/30 bg-[#FBF9F4] dark:bg-red-500/10 text-sm font-bold text-[#9B3B3B] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors"
            >
              <LogOut size={16} />
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* ✅ KPI-строка: 3 карточки со счётчиками */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <KpiCard
            icon={<Package size={20} className="text-[#1B2A4A] dark:text-white" />}
            label="Активные заказы"
            value={String(activeOrders)}
            subtitle={`Всего заказов: ${orders.length}`}
          />
          <KpiCard
            icon={<Globe size={20} className="text-[#C9A961]" />}
            label="Спецзаказы на рассмотрении"
            value={String(pendingRequests)}
            subtitle={`Всего заявок: ${chinaRequests.length}`}
            accent
          />
          <KpiCard
            icon={<TrendingUp size={20} className="text-[#C9A961]" />}
            label="Выручка"
            value={`$${totalRevenue.toLocaleString()}`}
            subtitle="По всем заказам"
            accent
          />
        </div>

        {/* ✅ Сетка разделов: карточки-ссылки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NavCard
            icon={<Package size={20} className="text-[#1B2A4A] dark:text-white" />}
            title="Заказы"
            description="Управление заказами клиентов"
            count={`Всего: ${orders.length}`}
            onClick={() => navigate('/orders')}
          />
          <NavCard
            icon={<Globe size={20} className="text-[#C9A961]" />}
            title="Спецзаказы"
            description="Заявки на спецзаказы из Китая"
            count={`Всего: ${chinaRequests.length}`}
            onClick={() => navigate('/china')}
          />
          <NavCard
            icon={<ShoppingBag size={20} className="text-[#1B2A4A] dark:text-white" />}
            title="Товары"
            description="Управление каталогом и остатками"
            count={`Всего: ${productsCount}`}
            onClick={() => navigate('/products')}
          />
          <NavCard
            icon={<BarChart3 size={20} className="text-[#C9A961]" />}
            title="Аналитика"
            description="Статистика и отчёты продаж"
            onClick={() => navigate('/analytics')}
          />
          <NavCard
            icon={<Settings size={20} className="text-[#1B2A4A] dark:text-white" />}
            title="Настройки"
            description="Курс валют, скидки, доставка"
            onClick={() => navigate('/settings')}
          />
          <NavCard
            icon={<Tag size={20} className="text-[#C9A961]" />}
            title="Бренды"
            description="Управление списком брендов"
            count={`Всего: ${brandsCount}`}
            onClick={() => navigate('/brands')}
          />
        </div>
      </div>
    </div>
  )
}
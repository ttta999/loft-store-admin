import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  analyticsCacheApi,
  type AnalyticsPeriod,
  type OrderStatsEntry,
  type DailyStatsEntry,
  type ProductStatsEntry,
  type CategoryStat,
  type BrandStat,
} from '../lib/cache'
import {
  ArrowLeft,
  TrendingUp,
  Package,
  DollarSign,
  Calendar,
  Users,
  BarChart3,
  Award,
  RefreshCw,
  XCircle,
  Clock,
  Truck,
  Store,
  CreditCard,
  Banknote,
  PieChart,
} from 'lucide-react'

// ✅ Статусы, дающие реальную выручку (исключаем отменённые и неоплаченные)
const VALID_REVENUE_STATUSES = ['Активный', 'В обработке', 'Готов', 'Выдан', 'Доставлен']
const WORK_STATUSES = ['Активный', 'В обработке', 'Готов', 'Выдан']

// ✅ Подписи категорий для графика
const CATEGORY_LABELS: Record<string, string> = {
  shoes: 'Обувь 👟',
  clothes: 'Одежда 👕',
  accessories: 'Аксессуары 🧢',
  special: 'Спецзаказы 🌍',
  other: 'Прочее 📦',
}

// ✅ KPI-карточка
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

// ✅ Мини-плитка разбивки заказов
function MiniStat({ icon, label, value, percent }: {
  icon: React.ReactNode
  label: string
  value: number
  percent: number
}) {
  return (
    <div className="bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border rounded-xl p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[#8A8275] dark:text-gray-300 truncate">{label}</p>
        <p className="text-lg font-bold text-[#1B2A4A] dark:text-white leading-tight">
          {value}
          <span className="text-xs font-medium text-[#8A8275] dark:text-gray-300 ml-1">({percent}%)</span>
        </p>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<AnalyticsPeriod>('month')
  const [orderStats, setOrderStats] = useState<OrderStatsEntry | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStatsEntry[]>([])
  const [topProducts, setTopProducts] = useState<ProductStatsEntry[]>([])
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([])
  const [brandStats, setBrandStats] = useState<BrandStat[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    loadAnalytics(period, false)
  }, [period])

  const applyData = (entry: { orderStats: OrderStatsEntry; dailyStats: DailyStatsEntry[]; topProducts: ProductStatsEntry[]; categoryStats: CategoryStat[]; brandStats: BrandStat[]; timestamp: number }) => {
    setOrderStats(entry.orderStats)
    setDailyStats(entry.dailyStats)
    setTopProducts(entry.topProducts)
    setCategoryStats(entry.categoryStats)
    setBrandStats(entry.brandStats)
    setLastUpdated(new Date(entry.timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit', minute: '2-digit',
    }))
  }

  const loadAnalytics = async (selectedPeriod: AnalyticsPeriod, forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = analyticsCacheApi.get(selectedPeriod)
      if (cached) {
        applyData(cached)
        setLoading(false)
        return
      }
    }

    if (forceRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const entry = await computeAnalytics(selectedPeriod)
      analyticsCacheApi.set(selectedPeriod, entry)
      applyData({ ...entry, timestamp: Date.now() })
    } catch (error) {
      console.error('Ошибка загрузки аналитики:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getDateFilter = (period: AnalyticsPeriod): string | null => {
    if (period === 'all') return null
    const now = new Date()
    if (period === 'week') now.setDate(now.getDate() - 7)
    else if (period === 'month') now.setMonth(now.getMonth() - 1)
    else if (period === 'year') now.setFullYear(now.getFullYear() - 1)
    return now.toISOString()
  }

  // ✅ ОДИН проход по заказам: считаем все метрики сразу
  const computeAnalytics = async (selectedPeriod: AnalyticsPeriod) => {
    const dateFilter = getDateFilter(selectedPeriod)

    let ordersQuery = supabase
      .from('orders')
      .select('id, total_price_usd, status, created_at, items, delivery_method, payment_method, client_phone')
    if (dateFilter) {
      ordersQuery = ordersQuery.gte('created_at', dateFilter)
    }

    const [{ data: ordersRaw }, { data: productsRaw }] = await Promise.all([
      ordersQuery,
      supabase.from('products').select('id, category, brand'),
    ])

    const orders = ordersRaw || []
    const productMap: Record<string, { category: string; brand: string | null }> = {}
    ;(productsRaw || []).forEach((p: any) => {
      productMap[p.id] = { category: p.category, brand: p.brand || null }
    })

    // -------- Основные метрики --------
    const valid = orders.filter((o: any) => VALID_REVENUE_STATUSES.includes(o.status))
    const totalRevenue = valid.reduce((sum: number, o: any) => sum + (o.total_price_usd || 0), 0)
    const totalOrders = valid.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const activeOrders = orders.filter((o: any) => WORK_STATUSES.includes(o.status)).length
    const cancelledOrders = orders.filter((o: any) => o.status === 'Отменён').length
    const pendingPaymentOrders = orders.filter((o: any) => o.status === 'Ожидает оплаты').length
    const uniqueCustomers = new Set(valid.map((o: any) => o.client_phone).filter(Boolean)).size
    const deliveryOrders = valid.filter((o: any) => o.delivery_method === 'delivery').length
    const pickupOrders = totalOrders - deliveryOrders
    const onlinePaymentOrders = valid.filter((o: any) => o.payment_method === 'online_card').length
    const receiptPaymentOrders = totalOrders - onlinePaymentOrders

    const orderStats: OrderStatsEntry = {
      totalRevenue, totalOrders, averageOrderValue, activeOrders,
      cancelledOrders, pendingPaymentOrders, uniqueCustomers,
      deliveryOrders, pickupOrders, onlinePaymentOrders, receiptPaymentOrders,
    }

    // -------- Продажи по дням (ISO-ключ — без коллизий между годами) --------
    const statsByDay: Record<string, DailyStatsEntry> = {}
    valid.forEach((o: any) => {
      const dateObj = new Date(o.created_at)
      const dateKey = dateObj.toISOString().split('T')[0]
      const dateLabel = dateObj.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
      if (!statsByDay[dateKey]) {
        statsByDay[dateKey] = { dateKey, dateLabel, revenue: 0, orders: 0 }
      }
      statsByDay[dateKey].revenue += o.total_price_usd || 0
      statsByDay[dateKey].orders += 1
    })
    const dailyStats = Object.values(statsByDay)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .slice(-7)

    // -------- Топ товаров + категории + бренды (один проход по items) --------
    const productMapStats: Record<string, ProductStatsEntry> = {}
    const categoryMapStats: Record<string, CategoryStat> = {}
    const brandMapStats: Record<string, BrandStat> = {}

    valid.forEach((o: any) => {
      const items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || [])
      items.forEach((item: any) => {
        const qty = item.quantity || 1
        const rev = (item.priceUsd || 0) * qty
        const productId = item.productId || item.id
        const isSpecial = String(productId).startsWith('special')

        // Топ товаров
        if (!productMapStats[productId]) {
          productMapStats[productId] = {
            product_id: productId,
            product_name: item.name,
            total_sold: 0,
            revenue: 0,
          }
        }
        productMapStats[productId].total_sold += qty
        productMapStats[productId].revenue += rev

        // Категории
        const catKey = isSpecial ? 'special' : (productMap[productId]?.category || 'other')
        if (!categoryMapStats[catKey]) {
          categoryMapStats[catKey] = { key: catKey, label: CATEGORY_LABELS[catKey] || catKey, revenue: 0, sold: 0 }
        }
        categoryMapStats[catKey].revenue += rev
        categoryMapStats[catKey].sold += qty

        // Бренды (спецзаказы и без бренда не учитываем)
        const brandName = isSpecial ? null : productMap[productId]?.brand
        if (brandName) {
          if (!brandMapStats[brandName]) {
            brandMapStats[brandName] = { name: brandName, revenue: 0, sold: 0 }
          }
          brandMapStats[brandName].revenue += rev
          brandMapStats[brandName].sold += qty
        }
      })
    })

    const topProducts = Object.values(productMapStats)
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 5)
    const categoryStats = Object.values(categoryMapStats).sort((a, b) => b.revenue - a.revenue)
    const brandStats = Object.values(brandMapStats).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

    return { orderStats, dailyStats, topProducts, categoryStats, brandStats, timestamp: Date.now() }
  }

  const handleRefresh = () => {
    analyticsCacheApi.invalidate(period)
    loadAnalytics(period, true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg flex items-center justify-center">
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2A4A] dark:border-gold mx-auto mb-4"></div>
          <p className="text-[#1B2A4A] dark:text-white font-medium">Загрузка аналитики...</p>
        </div>
      </div>
    )
  }

  const maxRevenue = Math.max(...dailyStats.map(d => d.revenue), 1)
  const maxCategoryRevenue = Math.max(...categoryStats.map(c => c.revenue), 1)
  const pct = (value: number) => (orderStats && orderStats.totalOrders > 0 ? Math.round((value / orderStats.totalOrders) * 100) : 0)

  return (
    <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg">
      {/* ✅ Sticky-шапка */}
      <div className="sticky top-0 z-20 bg-[#F5F1E8]/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-[#E8E2D5] dark:border-dark-border px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 text-sm font-bold text-[#1B2A4A] dark:text-white hover:text-[#C9A961] dark:hover:text-gold transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
                <ArrowLeft size={18} />
              </span>
              На главную
            </button>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#1B2A4A] dark:text-white">Аналитика</h1>
              <span className="w-10 h-10 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
                <BarChart3 size={18} className="text-[#1B2A4A] dark:text-white" />
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#1B2A4A] dark:text-white bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors disabled:opacity-50"
              title="Обновить данные"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Обновить
            </button>
          </div>

          {/* Переключатель периода + время обновления */}
          <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'week' as const, label: 'Неделя' },
                { key: 'month' as const, label: 'Месяц' },
                { key: 'year' as const, label: 'Год' },
                { key: 'all' as const, label: 'Всё время' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setPeriod(key)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    period === key
                      ? 'bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A]'
                      : 'bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#F5F1E8] dark:hover:bg-dark-accent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {lastUpdated && (
              <p className="text-xs text-[#8A8275] dark:text-gray-300">
                Обновлено: {lastUpdated}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-4">
        {/* ✅ KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<DollarSign size={20} className="text-[#C9A961]" />}
            label="Выручка"
            value={`$${Math.round(orderStats?.totalRevenue || 0).toLocaleString()}`}
            subtitle="Подтверждённая, за период"
            accent
          />
          <KpiCard
            icon={<Package size={20} className="text-[#1B2A4A] dark:text-white" />}
            label="Заказы"
            value={String(orderStats?.totalOrders || 0)}
            subtitle={`${orderStats?.uniqueCustomers || 0} клиентов`}
          />
          <KpiCard
            icon={<TrendingUp size={20} className="text-[#C9A961]" />}
            label="Средний чек"
            value={`$${Math.round(orderStats?.averageOrderValue || 0)}`}
            subtitle="На успешный заказ"
            accent
          />
          <KpiCard
            icon={<Users size={20} className="text-[#C9A961]" />}
            label="В работе"
            value={String(orderStats?.activeOrders || 0)}
            subtitle="Текущие заказы"
            accent
          />
        </div>

        {/* ✅ Отменённые / ожидают оплаты */}
        {orderStats && (orderStats.cancelledOrders > 0 || orderStats.pendingPaymentOrders > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {orderStats.cancelledOrders > 0 && (
              <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-red-200 dark:border-red-500/30 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 flex items-center justify-center flex-shrink-0">
                  <XCircle size={18} className="text-red-700 dark:text-red-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#8A8275] dark:text-gray-300">Отменённых заказов</p>
                  <p className="text-xl font-bold text-red-700 dark:text-red-300">{orderStats.cancelledOrders}</p>
                </div>
                <p className="text-xs text-[#8A8275] dark:text-gray-400 max-w-[140px]">Не учитываются в выручке</p>
              </div>
            )}
            {orderStats.pendingPaymentOrders > 0 && (
              <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-orange-200 dark:border-orange-500/30 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-orange-700 dark:text-orange-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#8A8275] dark:text-gray-300">Ожидают оплаты</p>
                  <p className="text-xl font-bold text-orange-700 dark:text-orange-300">{orderStats.pendingPaymentOrders}</p>
                </div>
                <p className="text-xs text-[#8A8275] dark:text-gray-400 max-w-[140px]">Деньги ещё не получены</p>
              </div>
            )}
          </div>
        )}

        {/* ✅ Разбивка заказов: доставка/самовывоз/оплата */}
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-[#E8E2D5] dark:border-dark-border">
            <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <Truck size={18} className="text-[#1B2A4A] dark:text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[#1B2A4A] dark:text-white">Разбивка заказов</h2>
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">Получение и способы оплаты за период</p>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MiniStat icon={<Truck size={16} className="text-[#1B2A4A] dark:text-white" />} label="Доставка" value={orderStats?.deliveryOrders || 0} percent={pct(orderStats?.deliveryOrders || 0)} />
            <MiniStat icon={<Store size={16} className="text-[#1B2A4A] dark:text-white" />} label="Самовывоз" value={orderStats?.pickupOrders || 0} percent={pct(orderStats?.pickupOrders || 0)} />
            <MiniStat icon={<CreditCard size={16} className="text-[#1B2A4A] dark:text-white" />} label="Переводом" value={orderStats?.onlinePaymentOrders || 0} percent={pct(orderStats?.onlinePaymentOrders || 0)} />
            <MiniStat icon={<Banknote size={16} className="text-[#1B2A4A] dark:text-white" />} label="При получении" value={orderStats?.receiptPaymentOrders || 0} percent={pct(orderStats?.receiptPaymentOrders || 0)} />
          </div>
        </div>

        {/* ✅ Категории + бренды */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Продажи по категориям */}
          <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-[#E8E2D5] dark:border-dark-border">
              <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                <PieChart size={18} className="text-[#C9A961]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-[#1B2A4A] dark:text-white">Продажи по категориям</h2>
                <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">Выручка и штуки за период</p>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {categoryStats.length === 0 ? (
                <p className="text-center text-[#8A8275] dark:text-gray-300 py-6 text-sm">Нет данных за период</p>
              ) : (
                categoryStats.map(cat => (
                  <div key={cat.key} className="flex items-center gap-3">
                    <span className="w-32 text-xs font-bold text-[#1B2A4A] dark:text-white truncate flex-shrink-0">
                      {cat.label}
                    </span>
                    <div className="flex-1">
                      <div
                        className="h-6 rounded-lg bg-gradient-to-r from-[#1B2A4A] to-[#C9A961] dark:from-gold dark:to-gold/80"
                        style={{ width: `${Math.min((cat.revenue / maxCategoryRevenue) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#1B2A4A] dark:text-white whitespace-nowrap w-20 text-right">
                      ${Math.round(cat.revenue).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#8A8275] dark:text-gray-300 whitespace-nowrap w-14 text-right">
                      {cat.sold} шт.
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Топ брендов */}
          <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-[#E8E2D5] dark:border-dark-border">
              <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                <Award size={18} className="text-[#C9A961]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-[#1B2A4A] dark:text-white">Топ брендов</h2>
                <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">По выручке за период</p>
              </div>
            </div>
            <div className="divide-y divide-[#E8E2D5] dark:divide-dark-border">
              {brandStats.length === 0 ? (
                <p className="text-center text-[#8A8275] dark:text-gray-300 py-6 text-sm">Нет данных за период</p>
              ) : (
                brandStats.map((b, index) => (
                  <div key={b.name} className="flex items-center justify-between gap-3 p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border border-[#E8E2D5] dark:border-dark-border ${
                        index === 0 ? 'bg-[#C9A961] text-white dark:bg-gold dark:text-[#1B2A4A]' : 'bg-[#F5F1E8] dark:bg-dark-accent text-[#1B2A4A] dark:text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#1B2A4A] dark:text-white truncate">{b.name}</p>
                        <p className="text-[10px] text-[#8A8275] dark:text-gray-300">{b.sold} шт. продано</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-[#C9A961] whitespace-nowrap">
                      ${Math.round(b.revenue).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ✅ График по дням */}
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-[#E8E2D5] dark:border-dark-border">
            <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <Calendar size={18} className="text-[#1B2A4A] dark:text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-[#1B2A4A] dark:text-white">Продажи по дням</h2>
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
                Последние {dailyStats.length} дней с продажами (только успешные заказы)
              </p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {dailyStats.length === 0 ? (
              <p className="text-center text-[#8A8275] dark:text-gray-300 py-6 text-sm">Нет данных за выбранный период</p>
            ) : (
              dailyStats.map(day => (
                <div key={day.dateKey} className="flex items-center gap-4">
                  <div className="w-16 text-sm font-bold text-[#1B2A4A] dark:text-white flex-shrink-0">{day.dateLabel}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-7 rounded-lg bg-gradient-to-r from-[#1B2A4A] to-[#C9A961] dark:from-gold dark:to-gold/80"
                        style={{ width: `${Math.min((day.revenue / maxRevenue) * 100, 100)}%` }}
                      />
                      <span className="text-sm font-bold text-[#1B2A4A] dark:text-white whitespace-nowrap">
                        ${Math.round(day.revenue).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-[#8A8275] dark:text-gray-300 whitespace-nowrap w-20 text-right">
                    {day.orders} {day.orders === 1 ? 'заказ' : day.orders < 5 ? 'заказа' : 'заказов'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ✅ Топ товаров */}
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-[#E8E2D5] dark:border-dark-border">
            <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <Award size={18} className="text-[#C9A961]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[#1B2A4A] dark:text-white">Топ-5 товаров</h2>
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">Самые продаваемые за период (без отменённых)</p>
            </div>
          </div>
          <div className="divide-y divide-[#E8E2D5] dark:divide-dark-border">
            {topProducts.length === 0 ? (
              <p className="text-center text-[#8A8275] dark:text-gray-300 py-6 text-sm">Нет данных о продажах</p>
            ) : (
              topProducts.map((product, index) => (
                <div key={product.product_id} className="flex items-center justify-between p-3.5 hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border border-[#E8E2D5] dark:border-dark-border ${
                      index === 0 ? 'bg-[#C9A961] text-white dark:bg-gold dark:text-[#1B2A4A]' :
                      index === 1 ? 'bg-[#E8E2D5] dark:bg-dark-accent text-[#1B2A4A] dark:text-white' :
                      index === 2 ? 'bg-[#C9A961]/60 text-white dark:bg-gold/60 dark:text-[#1B2A4A]' :
                      'bg-[#F5F1E8] dark:bg-dark-accent text-[#1B2A4A] dark:text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#1B2A4A] dark:text-white truncate">{product.product_name}</p>
                      <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">Продано: {product.total_sold} шт.</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[#C9A961] whitespace-nowrap ml-3">
                    ${Math.round(product.revenue).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
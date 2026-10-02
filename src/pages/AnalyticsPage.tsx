import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { analyticsCacheApi, type AnalyticsPeriod } from '../lib/cache'
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
} from 'lucide-react'

interface OrderStats {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  activeOrders: number
}

interface DailyStats {
  date: string
  revenue: number
  orders: number
}

interface ProductStats {
  product_id: string
  product_name: string
  total_sold: number
  revenue: number
}

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

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<AnalyticsPeriod>('month')
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [topProducts, setTopProducts] = useState<ProductStats[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    loadAnalytics(period, false)
  }, [period])

  const loadAnalytics = async (selectedPeriod: AnalyticsPeriod, forceRefresh = false) => {
    // ✅ Проверяем кеш через cache API
    if (!forceRefresh) {
      const cached = analyticsCacheApi.get(selectedPeriod)
      if (cached) {
        setOrderStats(cached.orderStats)
        setDailyStats(cached.dailyStats)
        setTopProducts(cached.topProducts)
        setLastUpdated(new Date(cached.timestamp).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        }))
        setLoading(false)
        return
      }
    }

    if (forceRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const [stats, daily, products] = await Promise.all([
        loadOrderStats(selectedPeriod),
        loadDailyStats(selectedPeriod),
        loadTopProducts(selectedPeriod)
      ])

      // ✅ Сохраняем в кеш через cache API
      analyticsCacheApi.set(selectedPeriod, {
        orderStats: stats,
        dailyStats: daily,
        topProducts: products,
      })

      setOrderStats(stats)
      setDailyStats(daily)
      setTopProducts(products)
      setLastUpdated(new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }))
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
    if (period === 'week') {
      now.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      now.setMonth(now.getMonth() - 1)
    } else if (period === 'year') {
      now.setFullYear(now.getFullYear() - 1)
    }
    return now.toISOString()
  }

  const loadOrderStats = async (period: AnalyticsPeriod): Promise<OrderStats> => {
    let query = supabase.from('orders').select('total_price_usd, status, created_at')
    const dateFilter = getDateFilter(period)
    if (dateFilter) {
      query = query.gte('created_at', dateFilter)
    }

    const { data: orders } = await query
    if (!orders) {
      return { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0, activeOrders: 0 }
    }

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_price_usd || 0), 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const activeOrders = orders.filter(o => o.status === 'Активный').length

    return { totalRevenue, totalOrders, averageOrderValue, activeOrders }
  }

  const loadDailyStats = async (period: AnalyticsPeriod): Promise<DailyStats[]> => {
    let query = supabase.from('orders').select('total_price_usd, created_at').order('created_at', { ascending: true })
    const dateFilter = getDateFilter(period)
    if (dateFilter) {
      query = query.gte('created_at', dateFilter)
    }

    const { data: orders } = await query
    if (!orders) return []

    const statsByDay: Record<string, DailyStats> = {}
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit'
      })
      if (!statsByDay[date]) {
        statsByDay[date] = { date, revenue: 0, orders: 0 }
      }
      statsByDay[date].revenue += order.total_price_usd || 0
      statsByDay[date].orders += 1
    })

    return Object.values(statsByDay).slice(-7)
  }

  const loadTopProducts = async (period: AnalyticsPeriod): Promise<ProductStats[]> => {
    let query = supabase.from('orders').select('items, created_at')
    const dateFilter = getDateFilter(period)
    if (dateFilter) {
      query = query.gte('created_at', dateFilter)
    }

    const { data: orders } = await query
    if (!orders) return []

    const productMap: Record<string, ProductStats> = {}
    orders.forEach(order => {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])
      items.forEach((item: any) => {
        const productId = item.productId || item.id
        if (!productMap[productId]) {
          productMap[productId] = {
            product_id: productId,
            product_name: item.name,
            total_sold: 0,
            revenue: 0
          }
        }
        productMap[productId].total_sold += item.quantity || 1
        productMap[productId].revenue += (item.priceUsd || 0) * (item.quantity || 1)
      })
    })

    return Object.values(productMap)
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 5)
  }

  const handleRefresh = () => {
    // ✅ Принудительное обновление: сбрасываем кеш только текущего периода
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

  return (
    <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg">
      {/* ✅ Sticky-шапка с переключателем периода */}
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

            {/* ✅ Кнопка обновления */}
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

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* ✅ KPI-строка: 4 карточки со счётчиками */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<DollarSign size={20} className="text-[#C9A961]" />}
            label="Выручка"
            value={`$${(orderStats?.totalRevenue || 0).toLocaleString()}`}
            subtitle="Общая выручка"
            accent
          />
          <KpiCard
            icon={<Package size={20} className="text-[#1B2A4A] dark:text-white" />}
            label="Заказы"
            value={String(orderStats?.totalOrders || 0)}
            subtitle="Всего заказов"
          />
          <KpiCard
            icon={<TrendingUp size={20} className="text-[#C9A961]" />}
            label="Средний чек"
            value={`$${Math.round(orderStats?.averageOrderValue || 0)}`}
            subtitle="На заказ"
            accent
          />
          <KpiCard
            icon={<Users size={20} className="text-[#C9A961]" />}
            label="Активные"
            value={String(orderStats?.activeOrders || 0)}
            subtitle="В работе"
            accent
          />
        </div>

        {/* ✅ График по дням */}
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-[#E8E2D5] dark:border-dark-border">
            <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <Calendar size={18} className="text-[#1B2A4A] dark:text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white">Продажи по дням</h2>
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
                Последние {dailyStats.length} дней с заказами
              </p>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {dailyStats.length === 0 ? (
              <p className="text-center text-[#8A8275] dark:text-gray-300 py-8">
                Нет данных за выбранный период
              </p>
            ) : (
              dailyStats.map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-bold text-[#1B2A4A] dark:text-white flex-shrink-0">
                    {day.date}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 bg-gradient-to-r from-[#1B2A4A] to-[#C9A961] dark:from-gold dark:to-gold/80 rounded-lg transition-all"
                        style={{
                          width: `${Math.min((day.revenue / maxRevenue) * 100, 100)}%`
                        }}
                      />
                      <span className="text-sm font-bold text-[#1B2A4A] dark:text-white whitespace-nowrap">
                        ${day.revenue.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-1">
                      {day.orders} {day.orders === 1 ? 'заказ' : day.orders < 5 ? 'заказа' : 'заказов'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ✅ Топ товаров */}
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden">
          <div className="flex items-center gap-3 p-5 border-b border-[#E8E2D5] dark:border-dark-border">
            <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <Award size={18} className="text-[#C9A961]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white">Топ-5 товаров</h2>
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
                Самые продаваемые за выбранный период
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#E8E2D5] dark:divide-dark-border">
            {topProducts.length === 0 ? (
              <p className="text-center text-[#8A8275] dark:text-gray-300 py-8">
                Нет данных о продажах
              </p>
            ) : (
              topProducts.map((product, index) => (
                <div
                  key={product.product_id}
                  className="flex items-center justify-between p-4 hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 border border-[#E8E2D5] dark:border-dark-border ${
                      index === 0 ? 'bg-[#C9A961] text-white dark:bg-gold dark:text-[#1B2A4A]' :
                      index === 1 ? 'bg-[#E8E2D5] dark:bg-dark-accent text-[#1B2A4A] dark:text-white' :
                      index === 2 ? 'bg-[#C9A961]/60 text-white dark:bg-gold/60 dark:text-[#1B2A4A]' :
                      'bg-[#F5F1E8] dark:bg-dark-accent text-[#1B2A4A] dark:text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1B2A4A] dark:text-white truncate">
                        {product.product_name}
                      </p>
                      <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
                        Продано: {product.total_sold} шт.
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-bold text-[#C9A961] text-lg">
                      ${product.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, TrendingUp, Package, DollarSign, Calendar, Users } from 'lucide-react'

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

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([])
  const [topProducts, setTopProducts] = useState<ProductStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadOrderStats(),
        loadDailyStats(),
        loadTopProducts()
      ])
    } catch (error) {
      console.error('Ошибка загрузки аналитики:', error)
    }
    setLoading(false)
  }

  const loadOrderStats = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select('total_price_usd, status, created_at')

    if (!orders) return

    const totalRevenue = orders.reduce((sum, order) => sum + order.total_price_usd, 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const activeOrders = orders.filter(o => o.status === 'Активный').length

    setOrderStats({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      activeOrders
    })
  }

  const loadDailyStats = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select('total_price_usd, created_at')
      .order('created_at', { ascending: true })

    if (!orders) return

    const statsByDay: Record<string, DailyStats> = {}

    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit'
      })

      if (!statsByDay[date]) {
        statsByDay[date] = { date, revenue: 0, orders: 0 }
      }

      statsByDay[date].revenue += order.total_price_usd
      statsByDay[date].orders += 1
    })

    setDailyStats(Object.values(statsByDay).slice(-7))
  }

  const loadTopProducts = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select('items')

    if (!orders) return

    const productMap: Record<string, ProductStats> = {}

    orders.forEach(order => {
      const items = order.items || []
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

    const sortedProducts = Object.values(productMap)
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 5)

    setTopProducts(sortedProducts)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2A4A] mx-auto mb-4"></div>
          <p className="text-[#8A8275]">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <div className="bg-[#FBF9F4] border-b border-[#E8E2D5] p-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#8A8275] hover:text-[#1B2A4A] mb-4"
          >
            <ArrowLeft size={20} />
            <span>На главную</span>
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#1B2A4A]">📊 Аналитика и статистика</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod('week')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  period === 'week' ? 'bg-[#1B2A4A] text-white' : 'bg-[#E8E2D5] text-[#1B2A4A]'
                }`}
              >
                Неделя
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  period === 'month' ? 'bg-[#1B2A4A] text-white' : 'bg-[#E8E2D5] text-[#1B2A4A]'
                }`}
              >
                Месяц
              </button>
              <button
                onClick={() => setPeriod('year')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  period === 'year' ? 'bg-[#1B2A4A] text-white' : 'bg-[#E8E2D5] text-[#1B2A4A]'
                }`}
              >
                Год
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Основные метрики */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#FBF9F4] p-6 rounded-xl shadow-sm border border-[#E8E2D5]">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign size={24} className="text-[#C9A961]" />
              <h3 className="font-bold text-[#1B2A4A]">Выручка</h3>
            </div>
            <p className="text-3xl font-bold text-[#C9A961]">
              ${orderStats?.totalRevenue.toLocaleString() || 0}
            </p>
            <p className="text-sm text-[#8A8275] mt-1">Общая выручка</p>
          </div>

          <div className="bg-[#FBF9F4] p-6 rounded-xl shadow-sm border border-[#E8E2D5]">
            <div className="flex items-center gap-3 mb-2">
              <Package size={24} className="text-[#1B2A4A]" />
              <h3 className="font-bold text-[#1B2A4A]">Заказы</h3>
            </div>
            <p className="text-3xl font-bold text-[#1B2A4A]">
              {orderStats?.totalOrders || 0}
            </p>
            <p className="text-sm text-[#8A8275] mt-1">Всего заказов</p>
          </div>

          <div className="bg-[#FBF9F4] p-6 rounded-xl shadow-sm border border-[#E8E2D5]">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={24} className="text-[#C9A961]" />
              <h3 className="font-bold text-[#1B2A4A]">Средний чек</h3>
            </div>
            <p className="text-3xl font-bold text-[#C9A961]">
              ${Math.round(orderStats?.averageOrderValue || 0)}
            </p>
            <p className="text-sm text-[#8A8275] mt-1">На заказ</p>
          </div>

          <div className="bg-[#FBF9F4] p-6 rounded-xl shadow-sm border border-[#E8E2D5]">
            <div className="flex items-center gap-3 mb-2">
              <Users size={24} className="text-[#1B2A4A]" />
              <h3 className="font-bold text-[#1B2A4A]">Активные</h3>
            </div>
            <p className="text-3xl font-bold text-[#1B2A4A]">
              {orderStats?.activeOrders || 0}
            </p>
            <p className="text-sm text-[#8A8275] mt-1">В работе</p>
          </div>
        </div>

        {/* График по дням */}
        <div className="bg-[#FBF9F4] p-6 rounded-xl shadow-sm border border-[#E8E2D5]">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#1B2A4A]">
            <Calendar size={20} />
            Продажи по дням
          </h2>
          <div className="space-y-3">
            {dailyStats.map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium text-[#8A8275]">
                  {day.date}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-8 bg-[#1B2A4A] rounded"
                      style={{
                        width: `${Math.min((day.revenue / (Math.max(...dailyStats.map(d => d.revenue))) * 100), 100)}%`
                      }}
                    />
                    <span className="text-sm font-medium text-[#1B2A4A]">
                      ${day.revenue}
                    </span>
                  </div>
                  <p className="text-xs text-[#8A8275]">{day.orders} заказов</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Топ товаров */}
        <div className="bg-[#FBF9F4] p-6 rounded-xl shadow-sm border border-[#E8E2D5]">
          <h2 className="text-xl font-bold mb-4 text-[#1B2A4A]">🏆 Топ-5 товаров</h2>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div
                key={product.product_id}
                className="flex items-center justify-between p-3 bg-[#F5F1E8] rounded-lg border border-[#E8E2D5]"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-[#C9A961] text-white' :
                    index === 1 ? 'bg-[#E8E2D5] text-[#1B2A4A]' :
                    index === 2 ? 'bg-[#C9A961]/60 text-white' :
                    'bg-[#E8E2D5] text-[#8A8275]'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-[#1B2A4A]">{product.product_name}</p>
                    <p className="text-sm text-[#8A8275]">
                      Продано: {product.total_sold} шт.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#C9A961]">
                    ${product.revenue}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
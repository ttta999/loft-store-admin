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

    // Группируем по дням
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

    setDailyStats(Object.values(statsByDay).slice(-7)) // Последние 7 дней
  }

  const loadTopProducts = async () => {
    // Получаем все заказы с товарами
    const { data: orders } = await supabase
      .from('orders')
      .select('items')
    
    if (!orders) return

    // Анализируем товары
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

    // Сортируем по продажам и берём топ-5
    const sortedProducts = Object.values(productMap)
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 5)

    setTopProducts(sortedProducts)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-500">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b p-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft size={20} />
            <span>На главную</span>
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">📊 Аналитика и статистика</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod('week')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  period === 'week' ? 'bg-black text-white' : 'bg-gray-100'
                }`}
              >
                Неделя
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  period === 'month' ? 'bg-black text-white' : 'bg-gray-100'
                }`}
              >
                Месяц
              </button>
              <button
                onClick={() => setPeriod('year')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  period === 'year' ? 'bg-black text-white' : 'bg-gray-100'
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
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign size={24} className="text-green-600" />
              <h3 className="font-bold text-gray-700">Выручка</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              ${orderStats?.totalRevenue.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">Общая выручка</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Package size={24} className="text-blue-600" />
              <h3 className="font-bold text-gray-700">Заказы</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {orderStats?.totalOrders || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">Всего заказов</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={24} className="text-purple-600" />
              <h3 className="font-bold text-gray-700">Средний чек</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              ${Math.round(orderStats?.averageOrderValue || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">На заказ</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Users size={24} className="text-orange-600" />
              <h3 className="font-bold text-gray-700">Активные</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {orderStats?.activeOrders || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">В работе</p>
          </div>
        </div>

        {/* График по дням */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Продажи по дням
          </h2>
          <div className="space-y-3">
            {dailyStats.map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium text-gray-600">
                  {day.date}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-8 bg-blue-500 rounded"
                      style={{ 
                        width: `${Math.min((day.revenue / (Math.max(...dailyStats.map(d => d.revenue))) * 100), 100)}%` 
                      }}
                    />
                    <span className="text-sm font-medium">
                      ${day.revenue}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{day.orders} заказов</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Топ товаров */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-4">🏆 Топ-5 товаров</h2>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div 
                key={product.product_id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-400 text-orange-900' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.product_name}</p>
                    <p className="text-sm text-gray-500">
                      Продано: {product.total_sold} шт.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
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
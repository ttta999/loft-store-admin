import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, getChinaRequests, supabase } from '../lib/supabase'
import { Package, Globe, LogOut, TrendingUp, ShoppingBag, BarChart3, Settings, Tag } from 'lucide-react'
import { logout } from '../lib/auth'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<any[]>([])
  const [chinaRequests, setChinaRequests] = useState<any[]>([])
  const [productsCount, setProductsCount] = useState(0)
  const [brandsCount, setBrandsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const ordersData = await getOrders()
      const chinaData = await getChinaRequests()
      
      const { count: productsCountResult } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
      
      // ✅ Загружаем количество брендов
      const { count: brandsCountResult } = await supabase
        .from('brands')
        .select('*', { count: 'exact', head: true })
      
      setOrders(ordersData)
      setChinaRequests(chinaData)
      setProductsCount(productsCountResult || 0)
      setBrandsCount(brandsCountResult || 0)
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    }
    setLoading(false)
  }

  // ✅ ИСПРАВЛЕНО: Используем Supabase Auth logout
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_price_usd || 0), 0)
  const activeOrders = orders.filter(o => o.status === 'Активный').length
  const pendingRequests = chinaRequests.filter(r => r.status === 'На рассмотрении').length

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
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">🔐 LOFT Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-black"
          >
            <LogOut size={20} />
            <span>Выйти</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Package size={24} className="text-blue-600" />
              <h3 className="font-bold text-gray-700">Активные заказы</h3>
            </div>
            <p className="text-3xl font-bold">{activeOrders}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Globe size={24} className="text-yellow-600" />
              <h3 className="font-bold text-gray-700">Спецзаказы</h3>
            </div>
            <p className="text-3xl font-bold">{pendingRequests}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={24} className="text-green-600" />
              <h3 className="font-bold text-gray-700">Выручка</h3>
            </div>
            <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <Package size={24} className="text-blue-600" />
              <h2 className="text-xl font-bold">Заказы</h2>
            </div>
            <p className="text-gray-600">Управление заказами клиентов</p>
            <p className="text-sm text-gray-500 mt-2">Всего: {orders.length}</p>
          </button>

          <button
            onClick={() => navigate('/china')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <Globe size={24} className="text-yellow-600" />
              <h2 className="text-xl font-bold">Спецзаказы</h2>
            </div>
            <p className="text-gray-600">Заявки на спецзаказы</p>
            <p className="text-sm text-gray-500 mt-2">Всего: {chinaRequests.length}</p>
          </button>

          <button
            onClick={() => navigate('/products')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag size={24} className="text-purple-600" />
              <h2 className="text-xl font-bold">Товары</h2>
            </div>
            <p className="text-gray-600">Управление каталогом</p>
            <p className="text-sm text-gray-500 mt-2">Всего: {productsCount}</p>
          </button>

          <button
            onClick={() => navigate('/analytics')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 size={24} className="text-green-600" />
              <h2 className="text-xl font-bold">Аналитика</h2>
            </div>
            <p className="text-gray-600">Статистика и отчёты</p>
          </button>

          {/* ✅ НОВАЯ КНОПКА: Настройки */}
          <button
            onClick={() => navigate('/settings')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <Settings size={24} className="text-indigo-600" />
              <h2 className="text-xl font-bold">Настройки</h2>
            </div>
            <p className="text-gray-600">Курс валют и параметры</p>
          </button>

          {/* ✅ НОВАЯ КНОПКА: Бренды */}
          <button
            onClick={() => navigate('/brands')}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <Tag size={24} className="text-pink-600" />
              <h2 className="text-xl font-bold">Бренды</h2>
            </div>
            <p className="text-gray-600">Управление брендами</p>
            <p className="text-sm text-gray-500 mt-2">Всего: {brandsCount}</p>
          </button>
        </div>
      </div>
    </div>
  )
}
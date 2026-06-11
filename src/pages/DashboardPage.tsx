import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, getChinaRequests } from '../lib/supabase'
import { Package, Globe, LogOut, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<any[]>([])
  const [chinaRequests, setChinaRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const ordersData = await getOrders()
    const chinaData = await getChinaRequests()
    setOrders(ordersData)
    setChinaRequests(chinaData)
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn')
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
      {/* Шапка */}
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
        {/* Статистика */}
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

        {/* Кнопки навигации */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <p className="text-gray-600">Заявки из Китая</p>
            <p className="text-sm text-gray-500 mt-2">Всего: {chinaRequests.length}</p>
          </button>
        </div>
      </div>
    </div>
  )
}
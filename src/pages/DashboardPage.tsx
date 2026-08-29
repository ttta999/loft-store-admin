import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, getChinaRequests, supabase } from '../lib/supabase'
import { Package, Globe, LogOut, TrendingUp, ShoppingBag, BarChart3, Settings, Tag } from 'lucide-react'
import { logout } from '../lib/auth'
import NotificationBell from '../components/NotificationBell'

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

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_price_usd || 0), 0)
  const activeOrders = orders.filter(o => o.status === 'Активный').length
  const pendingRequests = chinaRequests.filter(r => r.status === 'На рассмотрении').length

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
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1B2A4A]">🔐 LOFT Admin Panel</h1>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-[#8A8275] hover:text-[#1B2A4A]"
            >
              <LogOut size={20} />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#FBF9F4] p-6 rounded-xl shadow-sm border border-[#E8E2D5]">
            <div className="flex items-center gap-3 mb-2">
              <Package size={24} className="text-[#1B2A4A]" />
              <h3 className="font-bold text-[#1B2A4A]">Активные заказы</h3>
            </div>
            <p className="text-3xl font-bold text-[#1B2A4A]">{activeOrders}</p>
          </div>

          <div className="bg-[#FBF9F4] p-6 rounded-xl shadow-sm border border-[#E8E2D5]">
            <div className="flex items-center gap-3 mb-2">
              <Globe size={24} className="text-[#C9A961]" />
              <h3 className="font-bold text-[#1B2A4A]">Спецзаказы</h3>
            </div>
            <p className="text-3xl font-bold text-[#1B2A4A]">{pendingRequests}</p>
          </div>

          <div className="bg-[#FBF9F4] p-6 rounded-xl shadow-sm border border-[#E8E2D5]">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={24} className="text-[#C9A961]" />
              <h3 className="font-bold text-[#1B2A4A]">Выручка</h3>
            </div>
            <p className="text-3xl font-bold text-[#1B2A4A]">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="bg-[#FBF9F4] p-6 rounded-xl shadow-sm border border-[#E8E2D5] hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <Package size={24} className="text-[#1B2A4A]" />
              <h2 className="text-xl font-bold text-[#1B2A4A]">Заказы</h2>
            </div>
            <p className="text-[#8A8275]">Управление заказами клиентов</p>
            <p className="text-sm text-[#8A8275] mt-2">Всего: {orders.length}</p>
          </button>

          <button
            onClick={() => navigate('/china')}
            className="bg-[#FBF9F4] p-6 rounded-xl shadow-sm border border-[#E8E2D5] hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <Globe size={24} className="text-[#C9A961]" />
              <h2 className="text-xl font-bold text-[#1B2A4A]">Спецзаказы</h2>
            </div>
            <p className="text-[#8A8275]">Заявки на спецзаказы</p>
            <p className="text-sm text-[#8A8275] mt-2">Всего: {chinaRequests.length}</p>
          </button>

          <button
            onClick={() => navigate('/products')}
            className="bg-[#FBF9F4] p-6 rounded-xl shadow-sm border border-[#E8E2D5] hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag size={24} className="text-[#1B2A4A]" />
              <h2 className="text-xl font-bold text-[#1B2A4A]">Товары</h2>
            </div>
            <p className="text-[#8A8275]">Управление каталогом</p>
            <p className="text-sm text-[#8A8275] mt-2">Всего: {productsCount}</p>
          </button>

          <button
            onClick={() => navigate('/analytics')}
            className="bg-[#FBF9F4] p-6 rounded-xl shadow-sm border border-[#E8E2D5] hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 size={24} className="text-[#C9A961]" />
              <h2 className="text-xl font-bold text-[#1B2A4A]">Аналитика</h2>
            </div>
            <p className="text-[#8A8275]">Статистика и отчёты</p>
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="bg-[#FBF9F4] p-6 rounded-xl shadow-sm border border-[#E8E2D5] hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <Settings size={24} className="text-[#1B2A4A]" />
              <h2 className="text-xl font-bold text-[#1B2A4A]">Настройки</h2>
            </div>
            <p className="text-[#8A8275]">Курс валют и параметры</p>
          </button>

          <button
            onClick={() => navigate('/brands')}
            className="bg-[#FBF9F4] p-6 rounded-xl shadow-sm border border-[#E8E2D5] hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <Tag size={24} className="text-[#C9A961]" />
              <h2 className="text-xl font-bold text-[#1B2A4A]">Бренды</h2>
            </div>
            <p className="text-[#8A8275]">Управление брендами</p>
            <p className="text-sm text-[#8A8275] mt-2">Всего: {brandsCount}</p>
          </button>
        </div>
      </div>
    </div>
  )
}
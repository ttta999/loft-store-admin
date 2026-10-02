import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, getChinaRequests, supabase } from '../lib/supabase'
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
} from 'lucide-react'
import { logout } from '../lib/auth'
import NotificationBell from '../components/NotificationBell'

// ✅ KPI-карточка в стиле страницы заказа (десктоп)
function KpiCard({ icon, iconColor, label, value, subtitle }: {
  icon: React.ReactNode
  iconColor: string
  label: string
  value: string
  subtitle: string
}) {
  return (
    <div className="bg-[#FBF9F4] rounded-2xl border border-[#E8E2D5] p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border border-[#E8E2D5] ${iconColor}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[#8A8275] truncate">{label}</p>
        <p className="text-3xl font-bold text-[#1B2A4A] truncate mt-0.5">{value}</p>
        <p className="text-xs text-[#8A8275] mt-0.5 truncate">{subtitle}</p>
      </div>
    </div>
  )
}

// ✅ Карточка-ссылка на раздел (десктоп)
function NavCard({ icon, iconBg, title, description, count, onClick }: {
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
  count?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="bg-[#FBF9F4] rounded-2xl border border-[#E8E2D5] p-5 text-left hover:shadow-md hover:border-[#C9A961] transition-all group"
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border border-[#E8E2D5] ${iconBg}`}>
          {icon}
        </div>
        <ChevronRight size={18} className="text-[#8A8275] group-hover:text-[#C9A961] group-hover:translate-x-0.5 transition-all" />
      </div>
      <h2 className="text-lg font-bold text-[#1B2A4A]">{title}</h2>
      <p className="text-xs text-[#8A8275] mt-1">{description}</p>
      {count !== undefined && (
        <span className="inline-block mt-3 px-2.5 py-1 rounded-full bg-[#F5F1E8] border border-[#E8E2D5] text-xs font-bold text-[#1B2A4A]">
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
        <div className="bg-[#FBF9F4] rounded-2xl border border-[#E8E2D5] p-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2A4A] mx-auto mb-4"></div>
          <p className="text-[#1B2A4A] font-medium">Загрузка панели...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* ✅ Sticky-шапка (десктоп): лого слева, действия справа */}
      <div className="sticky top-0 z-20 bg-[#F5F1E8]/95 backdrop-blur-sm border-b border-[#E8E2D5] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-[#1B2A4A] flex items-center justify-center flex-shrink-0">
              <Store size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-[#1B2A4A] truncate">LOFT Admin Panel</h1>
              <p className="text-xs text-[#8A8275] mt-0.5 truncate">Панель управления магазином</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FBF9F4] text-sm font-bold text-[#9B3B3B] hover:bg-red-50 hover:border-red-200 transition-colors"
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
            icon={<Package size={20} className="text-[#1B2A4A]" />}
            iconColor="bg-[#F5F1E8]"
            label="Активные заказы"
            value={String(activeOrders)}
            subtitle={`Всего заказов: ${orders.length}`}
          />
          <KpiCard
            icon={<Globe size={20} className="text-[#C9A961]" />}
            iconColor="bg-[#F5F1E8]"
            label="Спецзаказы на рассмотрении"
            value={String(pendingRequests)}
            subtitle={`Всего заявок: ${chinaRequests.length}`}
          />
          <KpiCard
            icon={<TrendingUp size={20} className="text-[#C9A961]" />}
            iconColor="bg-[#F5F1E8]"
            label="Выручка"
            value={`$${totalRevenue.toLocaleString()}`}
            subtitle="По всем заказам"
          />
        </div>

        {/* ✅ Сетка разделов: карточки-ссылки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NavCard
            icon={<Package size={20} className="text-[#1B2A4A]" />}
            iconBg="bg-[#F5F1E8]"
            title="Заказы"
            description="Управление заказами клиентов"
            count={`Всего: ${orders.length}`}
            onClick={() => navigate('/orders')}
          />
          <NavCard
            icon={<Globe size={20} className="text-[#C9A961]" />}
            iconBg="bg-[#F5F1E8]"
            title="Спецзаказы"
            description="Заявки на спецзаказы из Китая"
            count={`Всего: ${chinaRequests.length}`}
            onClick={() => navigate('/china')}
          />
          <NavCard
            icon={<ShoppingBag size={20} className="text-[#1B2A4A]" />}
            iconBg="bg-[#F5F1E8]"
            title="Товары"
            description="Управление каталогом и остатками"
            count={`Всего: ${productsCount}`}
            onClick={() => navigate('/products')}
          />
          <NavCard
            icon={<BarChart3 size={20} className="text-[#C9A961]" />}
            iconBg="bg-[#F5F1E8]"
            title="Аналитика"
            description="Статистика и отчёты продаж"
            onClick={() => navigate('/analytics')}
          />
          <NavCard
            icon={<Settings size={20} className="text-[#1B2A4A]" />}
            iconBg="bg-[#F5F1E8]"
            title="Настройки"
            description="Курс валют, скидки, доставка"
            onClick={() => navigate('/settings')}
          />
          <NavCard
            icon={<Tag size={20} className="text-[#C9A961]" />}
            iconBg="bg-[#F5F1E8]"
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
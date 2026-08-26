import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Package } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface OrderNotification {
  id: number
  created_at: string
  client_name: string
  total_price_usd: number
  total_price_uzs: number | null
  status: string
}

const STORAGE_KEY = 'admin_orders_last_seen'

export default function NotificationBell() {
  const navigate = useNavigate()
  const [newOrders, setNewOrders] = useState<OrderNotification[]>([])
  const [open, setOpen] = useState(false)
  const [lastSeen, setLastSeen] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || new Date().toISOString()
  })

  const loadNewOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, client_name, total_price_usd, total_price_uzs, status')
        .gt('created_at', lastSeen)
        .order('created_at', { ascending: false })
      if (error) {
        console.error('Ошибка загрузки уведомлений:', error)
        return
      }
      setNewOrders(data || [])
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error)
    }
  }

  useEffect(() => {
    loadNewOrders()
    const interval = setInterval(loadNewOrders, 30000)
    return () => clearInterval(interval)
  }, [lastSeen])

  const markAllRead = () => {
    const now = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, now)
    setLastSeen(now)
    setNewOrders([])
    setOpen(false)
  }

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })

  const formatPrice = (o: OrderNotification) =>
    o.total_price_uzs
      ? `${Number(o.total_price_uzs).toLocaleString()} сум`
      : `$${o.total_price_usd}`

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
        title="Уведомления о новых заказах"
      >
        <Bell size={22} />
        {newOrders.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {newOrders.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
            <p className="font-bold text-sm">🔔 Новые заказы</p>
            {newOrders.length > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <CheckCheck size={14} />
                Прочитано
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {newOrders.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">
                Нет новых заказов
              </p>
            ) : (
              newOrders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => {
                    setOpen(false)
                    navigate('/orders')
                  }}
                  className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-50 flex gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Package size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">Заказ №{o.id}</p>
                    <p className="text-xs text-gray-600 truncate">
                      {o.client_name} • {formatPrice(o)}
                    </p>
                    <p className="text-xs text-gray-400">{formatTime(o.created_at)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
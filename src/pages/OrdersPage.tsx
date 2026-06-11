import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, updateOrderStatus, sendClientNotification } from '../lib/supabase'
import { ArrowLeft } from 'lucide-react'

const STATUSES = ['Активный', 'В обработке', 'Готов', 'Выдан', 'Отменён']

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    const data = await getOrders()
    setOrders(data)
    setLoading(false)
  }

  const handleStatusChange = async (orderId: string, newStatus: string, clientChatId: string) => {
    const updated = await updateOrderStatus(orderId, newStatus)
    
    if (updated) {
      const messages: Record<string, string> = {
        'В обработке': `Ваш заказ принят в обработку ✅`,
        'Готов': `Ваш заказ готов к выдаче! 🎉`,
        'Выдан': `Ваш заказ выдан. Спасибо за покупку! ❤️`,
        'Отменён': `Ваш заказ отменён ❌`,
      }
      
      const message = messages[newStatus]
      if (message && clientChatId) {
        await sendClientNotification(clientChatId, message)
      }
      
      await loadOrders()
    }
  }

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter)

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
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft size={20} />
            <span>На главную</span>
          </button>
          <h1 className="text-2xl font-bold">📦 Управление заказами</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white p-4 rounded-xl mb-4">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                filter === 'all' ? 'bg-black text-white' : 'bg-gray-100'
              }`}
            >
              Все ({orders.length})
            </button>
            {STATUSES.map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  filter === status ? 'bg-black text-white' : 'bg-gray-100'
                }`}
              >
                {status} ({orders.filter(o => o.status === status).length})
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">Заказ №{order.id}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString('ru-RU')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'Активный' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'Выдан' ? 'bg-green-100 text-green-800' :
                  order.status === 'Отменён' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">👤 <strong>Клиент:</strong> {order.client_name}</p>
                  <p className="text-sm text-gray-600">📞 <strong>Телефон:</strong> {order.client_phone}</p>
                  <p className="text-sm text-gray-600">💰 <strong>Сумма:</strong> ${order.total_price_usd}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">🚚 <strong>Доставка:</strong> {order.delivery_method === 'pickup' ? 'Самовывоз' : 'Доставка'}</p>
                  {order.delivery_address && (
                    <p className="text-sm text-gray-600">📍 <strong>Адрес:</strong> {order.delivery_address}</p>
                  )}
                  <p className="text-sm text-gray-600">💳 <strong>Оплата:</strong> {order.payment_method === 'online_card' ? 'Картой' : 'При получении'}</p>
                </div>
              </div>

              {order.items && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Товары:</h4>
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="text-sm text-gray-600 mb-1">
                      {idx + 1}. {item.name} — {item.size} — {item.quantity} шт. — ${item.priceUsd}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {STATUSES.filter(s => s !== order.status).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(order.id, status, order.user_id)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, updateOrderStatus, sendClientNotification } from '../lib/supabase'
import { ArrowLeft, Truck, Store, MessageCircle } from 'lucide-react'

// Тип для статуса
interface StatusItem {
  old: string
  new: string
}

// СТАТУСЫ ДЛЯ ДОСТАВКИ
const DELIVERY_STATUSES: StatusItem[] = [
  { old: 'Активный', new: 'Принят 📄' },
  { old: 'В обработке', new: 'Собирается 📦' },
  { old: 'Готов', new: 'Упакован 🛍️' },
  { old: 'Выдан', new: 'Передан курьеру 🚀' },
  { old: 'Доставлен', new: 'Доставлен ✅' },
  { old: 'Отменён', new: 'Отменен 🚫' },
]

// СТАТУСЫ ДЛЯ САМОВЫВОЗА
const PICKUP_STATUSES: StatusItem[] = [
  { old: 'Активный', new: 'Принят 📄' },
  { old: 'В обработке', new: 'Собирается 📦' },
  { old: 'Готов', new: 'Готов к выдаче 🎉' },
  { old: 'Выдан', new: 'Получен 🤝' },
  { old: 'Отменён', new: 'Отменен 🚫' },
]

// СООБЩЕНИЯ ДЛЯ ДОСТАВКИ
const DELIVERY_MESSAGES: Record<string, string> = {
  'Активный': '📄 Оформлен: Ваш заказ №{orderId} успешно создан и уже поступил в систему!',
  'В обработке': '📦 Собирается: Ваш заказ №{orderId} уже собирается. Скоро отправим!',
  'Готов': '🛍️ Упакован: Отличные новости! Ваш заказ №{orderId} собран и ждет курьера.',
  'Выдан': '🚀 Передан курьеру: Ваш заказ №{orderId} передан курьеру и уже в пути к вам! Ожидайте звонка.',
  'Доставлен': '✅ Доставлен: Ваш заказ №{orderId} успешно доставлен! Надеемся, всё понравилось! ❤️',
  'Отменён': '🚫 Отменен: Ваш заказ №{orderId} отменен. Если это произошло по ошибке, пожалуйста, свяжитесь с нами.',
}

// СООБЩЕНИЯ ДЛЯ САМОВЫВОЗА
const PICKUP_MESSAGES: Record<string, string> = {
  'Активный': '📄 Оформлен: Ваш заказ №{orderId} успешно создан и уже поступил в систему!',
  'В обработке': '📦 Собирается: Ваш заказ №{orderId} уже собирается. Пожалуйста, дождитесь уведомления о готовности.',
  'Готов': '🎉 Готов к выдаче: Отличные новости! Ваш заказ №{orderId} собран и ожидает получения в магазине по адресу: ТЦ Меркато, 2 этаж, магазин 34.',
  'Выдан': '🤝 Получен: Заказ №{orderId} успешно выдан. Будем рады новым заказам!',
  'Отменён': '🚫 Отменен: Ваш заказ №{orderId} отменен. Если это произошло по ошибке, пожалуйста, свяжитесь с нами.',
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'delivery' | 'pickup'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCustomMessage, setShowCustomMessage] = useState<string | null>(null)
  const [customMessageText, setCustomMessageText] = useState('')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    const data = await getOrders()
    setOrders(data)
    setLoading(false)
  }

  const handleStatusChange = async (orderId: string, newStatus: string, clientChatId: string, deliveryMethod: string) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus)
      
      if (updated) {
        const messages = deliveryMethod === 'pickup' ? PICKUP_MESSAGES : DELIVERY_MESSAGES
        const messageTemplate = messages[newStatus] || `Статус заказа №${orderId} изменён на: ${newStatus}`
        const message = messageTemplate.replace('{orderId}', orderId)
        
        if (clientChatId) {
          const sent = await sendClientNotification(clientChatId, message)
          if (sent) {
            alert(`Статус изменён на: ${newStatus}\nУведомление отправлено клиенту ✅`)
          } else {
            alert(`Статус изменён на: ${newStatus}\n⚠️ Уведомление не отправлено`)
          }
        } else {
          alert(`Статус изменён на: ${newStatus}\n⚠️ Chat ID клиента не найден`)
        }
        
        await loadOrders()
      } else {
        alert('Ошибка при обновлении статуса')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Произошла ошибка при обновлении')
    }
  }

  // ✅ Отправка произвольного сообщения клиенту
  const handleSendCustomMessage = async (orderId: string, clientChatId: string) => {
    if (!customMessageText.trim()) {
      alert('Введите сообщение')
      return
    }

    if (!clientChatId) {
      alert('⚠️ Chat ID клиента не найден')
      return
    }

    try {
      const message = `📩 <b>Сообщение по заказу №${orderId}:</b>\n\n${customMessageText}`
      const sent = await sendClientNotification(clientChatId, message)
      
      if (sent) {
        alert('Сообщение отправлено клиенту ✅')
        setShowCustomMessage(null)
        setCustomMessageText('')
      } else {
        alert('⚠️ Не удалось отправить сообщение')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      alert('Произошла ошибка при отправке')
    }
  }

  const getStatusLabel = (status: string, deliveryMethod: string): string => {
    const statuses = deliveryMethod === 'pickup' ? PICKUP_STATUSES : DELIVERY_STATUSES
    const found = statuses.find(s => s.old === status)
    return found?.new || status
  }

  const getAvailableStatuses = (deliveryMethod: string): StatusItem[] => {
    return deliveryMethod === 'pickup' ? PICKUP_STATUSES : DELIVERY_STATUSES
  }

  // Фильтрация заказов
  const filteredOrders = orders.filter(order => {
    if (filter === 'delivery' && order.delivery_method !== 'delivery') return false
    if (filter === 'pickup' && order.delivery_method !== 'pickup') return false
    if (statusFilter !== 'all' && order.status !== statusFilter) return false
    return true
  })

  const deliveryOrders = orders.filter(o => o.delivery_method === 'delivery')
  const pickupOrders = orders.filter(o => o.delivery_method === 'pickup')

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
        {/* Основные фильтры по типу доставки */}
        <div className="bg-white p-4 rounded-xl mb-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { setFilter('all'); setStatusFilter('all') }}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all' ? 'bg-black text-white' : 'bg-gray-100'
              }`}
            >
              Все заказы ({orders.length})
            </button>
            <button
              onClick={() => { setFilter('delivery'); setStatusFilter('all') }}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                filter === 'delivery' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              <Truck size={18} />
              Доставка ({deliveryOrders.length})
            </button>
            <button
              onClick={() => { setFilter('pickup'); setStatusFilter('all') }}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                filter === 'pickup' ? 'bg-green-600 text-white' : 'bg-gray-100'
              }`}
            >
              <Store size={18} />
              Самовывоз ({pickupOrders.length})
            </button>
          </div>
        </div>

        {/* Фильтры по статусам */}
        {filter !== 'all' && (
          <div className="bg-white p-4 rounded-xl mb-4">
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  statusFilter === 'all' ? 'bg-black text-white' : 'bg-gray-100'
                }`}
              >
                Все ({filteredOrders.length})
              </button>
              {getAvailableStatuses(filter).map((statusItem: StatusItem) => (
                <button
                  key={statusItem.old}
                  onClick={() => setStatusFilter(statusItem.old)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                    statusFilter === statusItem.old ? 'bg-black text-white' : 'bg-gray-100'
                  }`}
                >
                  {statusItem.new} ({filteredOrders.filter(o => o.status === statusItem.old).length})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ЗАКАЗЫ С ДОСТАВКОЙ */}
        {(filter === 'all' || filter === 'delivery') && deliveryOrders.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Truck size={24} className="text-blue-600" />
              <h2 className="text-xl font-bold">🚚 Заказы с доставкой</h2>
              <span className="text-sm text-gray-500">({deliveryOrders.length})</span>
            </div>

            <div className="space-y-4">
              {deliveryOrders
                .filter(order => statusFilter === 'all' || order.status === statusFilter)
                .map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  onSendCustomMessage={handleSendCustomMessage}
                  getStatusLabel={getStatusLabel}
                  getAvailableStatuses={getAvailableStatuses}
                  showCustomMessage={showCustomMessage}
                  setShowCustomMessage={setShowCustomMessage}
                  customMessageText={customMessageText}
                  setCustomMessageText={setCustomMessageText}
                />
              ))}
            </div>
          </div>
        )}

        {/* ЗАКАЗЫ САМОВЫВОЗА */}
        {(filter === 'all' || filter === 'pickup') && pickupOrders.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Store size={24} className="text-green-600" />
              <h2 className="text-xl font-bold">🏪 Заказы самовывоза</h2>
              <span className="text-sm text-gray-500">({pickupOrders.length})</span>
            </div>

            <div className="space-y-4">
              {pickupOrders
                .filter(order => statusFilter === 'all' || order.status === statusFilter)
                .map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  onSendCustomMessage={handleSendCustomMessage}
                  getStatusLabel={getStatusLabel}
                  getAvailableStatuses={getAvailableStatuses}
                  showCustomMessage={showCustomMessage}
                  setShowCustomMessage={setShowCustomMessage}
                  customMessageText={customMessageText}
                  setCustomMessageText={setCustomMessageText}
                />
              ))}
            </div>
          </div>
        )}

        {/* Если заказов нет */}
        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            <p>Заказов не найдено</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Интерфейс для пропсов карточки заказа
interface OrderCardProps {
  order: any
  onStatusChange: (orderId: string, newStatus: string, clientChatId: string, deliveryMethod: string) => void
  onSendCustomMessage: (orderId: string, clientChatId: string) => void
  getStatusLabel: (status: string, deliveryMethod: string) => string
  getAvailableStatuses: (deliveryMethod: string) => StatusItem[]
  showCustomMessage: string | null
  setShowCustomMessage: (id: string | null) => void
  customMessageText: string
  setCustomMessageText: (text: string) => void
}

// Компонент карточки заказа
function OrderCard({ 
  order, 
  onStatusChange, 
  onSendCustomMessage,
  getStatusLabel, 
  getAvailableStatuses,
  showCustomMessage,
  setShowCustomMessage,
  customMessageText,
  setCustomMessageText
}: OrderCardProps) {
  const availableStatuses = getAvailableStatuses(order.delivery_method)
  // ✅ Используем user_chat_id, если есть, иначе user_id
  const clientChatId = order.user_chat_id || order.user_id

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg">Заказ №{order.id}</h3>
          <p className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleString('ru-RU')}
          </p>
          {order.special_order_id && (
            <p className="text-xs text-purple-600 font-medium mt-1">
              🌍 Заказ из спецзаказа
            </p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          order.status === 'Активный' ? 'bg-blue-100 text-blue-800' :
          order.status === 'В обработке' ? 'bg-yellow-100 text-yellow-800' :
          order.status === 'Готов' ? 'bg-green-100 text-green-800' :
          order.status === 'Выдан' ? 'bg-gray-100 text-gray-800' :
          order.status === 'Доставлен' ? 'bg-emerald-100 text-emerald-800' :
          order.status === 'Отменён' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {getStatusLabel(order.status, order.delivery_method)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">👤 <strong>Клиент:</strong> {order.client_name}</p>
          <p className="text-sm text-gray-600">📞 <strong>Телефон:</strong> {order.client_phone}</p>
          <p className="text-sm text-gray-600">💰 <strong>Сумма:</strong> ${order.total_price_usd}</p>
          {/* ✅ Показываем Chat ID клиента */}
          {clientChatId && (
            <p className="text-xs text-gray-500 mt-1">
              💬 Chat ID: <code className="bg-gray-100 px-1 rounded">{clientChatId}</code>
            </p>
          )}
          {!clientChatId && (
            <p className="text-xs text-orange-600 mt-1">
              ⚠️ Клиент не в Telegram
            </p>
          )}
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

      {/* Кнопка отправки произвольного сообщения */}
      {clientChatId && (
        <div className="mb-3">
          <button
            onClick={() => setShowCustomMessage(showCustomMessage === order.id ? null : order.id)}
            className="px-3 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <MessageCircle size={16} />
            Написать клиенту
          </button>

          {showCustomMessage === order.id && (
            <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <textarea
                value={customMessageText}
                onChange={(e) => setCustomMessageText(e.target.value)}
                placeholder="Введите сообщение для клиента..."
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onSendCustomMessage(order.id, clientChatId)}
                  className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                >
                  Отправить
                </button>
                <button
                  onClick={() => {
                    setShowCustomMessage(null)
                    setCustomMessageText('')
                  }}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {availableStatuses
          .filter((s: StatusItem) => s.old !== order.status)
          .map((s: StatusItem) => (
            <button
              key={s.old}
              onClick={() => onStatusChange(order.id, s.old, clientChatId, order.delivery_method)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              {s.new}
            </button>
          ))}
      </div>
    </div>
  )
}
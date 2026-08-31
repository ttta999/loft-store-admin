import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, updateOrderStatus, sendClientNotification, restoreStockAfterCancel, supabase } from '../lib/supabase'
import { ArrowLeft, Truck, Store, MessageCircle, CheckCircle, XCircle, Eye } from 'lucide-react'
import { confirmPayment } from '../lib/payments'

interface StatusItem {
  old: string
  new: string
}

const DELIVERY_STATUSES: StatusItem[] = [
  { old: 'Активный', new: 'Принят 📄' },
  { old: 'В обработке', new: 'Собирается 📦' },
  { old: 'Готов', new: 'Упакован 🛍️' },
  { old: 'Выдан', new: 'Передан курьеру 🚀' },
  { old: 'Доставлен', new: 'Доставлен ✅' },
  { old: 'Отменён', new: 'Отменен 🚫' },
]

const PICKUP_STATUSES: StatusItem[] = [
  { old: 'Активный', new: 'Принят 📄' },
  { old: 'В обработке', new: 'Собирается 📦' },
  { old: 'Готов', new: 'Готов к выдаче 🎉' },
  { old: 'Выдан', new: 'Получен 🤝' },
  { old: 'Отменён', new: 'Отменен 🚫' },
]

const DELIVERY_MESSAGES: Record<string, string> = {
  'Активный': '✅ Оформлен: Ваш заказ №{orderId} успешно создан и уже поступил в систему!',
  'В обработке': '📦 Собирается: Ваш заказ №{orderId} уже собирается. Скоро отправим!',
  'Готов': '🛍️ Упакован: Отличные новости! Ваш заказ №{orderId} собран и ждет курьера.',
  'Выдан': '🚀 Передан курьеру: Ваш заказ №{orderId} передан курьеру и уже в пути к вам!',
  'Доставлен': '✅ Доставлен: Ваш заказ №{orderId} успешно доставлен! Надеемся, всё понравилось! ❤️',
  'Отменён': '🚫 Отменен: Ваш заказ №{orderId} отменен. Если это произошло по ошибке, пожалуйста, свяжитесь с нами.',
}

const PICKUP_MESSAGES: Record<string, string> = {
  'Активный': '✅ Оформлен: Ваш заказ №{orderId} успешно создан и уже поступил в систему!',
  'В обработке': '📦 Собирается: Ваш заказ №{orderId} уже собирается. Пожалуйста, дождитесь уведомления о готовности.',
  'Готов': '🎉 Готов к выдаче: Отличные новости! Ваш заказ №{orderId} собран и ожидает получения в магазине по адресу: ТЦ Меркато, 2 этаж, магазин 34.',
  'Выдан': '🤝 Получен: Заказ №{orderId} успешно выдан. Будем рады новым заказам!',
  'Отменён': '🚫 Отменен: Ваш заказ №{orderId} отменен. Если это произошло по ошибке, пожалуйста, свяжитесь с нами.',
}

const formatOrderPrice = (order: any) => {
  if (order.total_price_uzs) {
    return `${Number(order.total_price_uzs).toLocaleString()} сум`
  }
  return `$${order.total_price_usd}`
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'delivery' | 'pickup'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCustomMessage, setShowCustomMessage] = useState<string | null>(null)
  const [customMessageText, setCustomMessageText] = useState('')

  // ✅ МОДАЛКА ССЫЛКИ НА КУРЬЕРА
  const [courierModalOrder, setCourierModalOrder] = useState<any>(null)
  const [courierLink, setCourierLink] = useState('')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    const data = await getOrders()
    const sorted = data.sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    setOrders(sorted)
    setLoading(false)
  }

  // ✅ Применение смены статуса (+ опционально ссылка курьера)
  const applyStatusChange = async (order: any, newStatus: string, clientChatId: string, courierLinkValue: string | null) => {
    try {
      const oldStatus = order.status
      let updated: any = null

      if (courierLinkValue) {
        const { data, error } = await supabase
          .from('orders')
          .update({ status: newStatus, courier_link: courierLinkValue })
          .eq('id', order.id)
          .select()
        if (error) throw error
        updated = data?.[0] || null
      } else {
        updated = await updateOrderStatus(order.id, newStatus)
      }

      if (updated) {
        if (newStatus === 'Отменён' && oldStatus !== 'Отменён') {
          console.log('🔄 Заказ отменён, возвращаем остатки')
          if (order.items && order.items.length > 0) {
            await restoreStockAfterCancel(order.items)
          }
        }
        const messages = order.delivery_method === 'pickup' ? PICKUP_MESSAGES : DELIVERY_MESSAGES
        let messageTemplate = messages[newStatus] || `Статус заказа №${order.id} изменён на: ${newStatus}`
        if (courierLinkValue) {
          messageTemplate += `\n\n🔗 Отследить курьера: ${courierLinkValue}`
        }
        const message = messageTemplate.replace('{orderId}', order.id)
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

  const handleStatusChange = async (_orderId: string, newStatus: string, clientChatId: string, deliveryMethod: string, order: any) => {
    // ✅ ЕСЛИ "ПЕРЕДАН КУРЬЕРУ" ДЛЯ ДОСТАВКИ — сначала запрашиваем ссылку на трек
    if (newStatus === 'Выдан' && deliveryMethod === 'delivery') {
      setCourierModalOrder(order)
      setCourierLink('')
      return
    }
    await applyStatusChange(order, newStatus, clientChatId, null)
  }

  const handleCourierSubmit = async () => {
    const link = courierLink.trim()
    if (!link) {
      alert('Вставьте ссылку на отслеживание курьера')
      return
    }
    if (!/^https?:\/\//i.test(link)) {
      alert('Ссылка должна начинаться с http:// или https://')
      return
    }
    const order = courierModalOrder
    if (!order) return
    const clientChatId = order.user_chat_id || order.user_id
    setCourierModalOrder(null)
    await applyStatusChange(order, 'Выдан', clientChatId, link)
  }

  const handleConfirmPayment = async (order: any) => {
    const confirmed = confirm(`✅ Подтвердить оплату заказа №${order.id}?\n\nКлиент: ${order.client_name}\nСумма: ${formatOrderPrice(order)}`)
    if (!confirmed) return
    const success = await confirmPayment(order.id)
    if (success) {
      if (order.user_chat_id) {
        const message = `✅ <b>Заказ №${order.id} оплачен!</b>\n\nМы уже начали его обработку. Спасибо за заказ!`
        await sendClientNotification(order.user_chat_id, message)
      }
      alert('✅ Оплата подтверждена! Заказ активирован.')
      await loadOrders()
    } else {
      alert('❌ Ошибка подтверждения')
    }
  }

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

  const filteredOrders = orders.filter(order => {
    if (filter === 'delivery' && order.delivery_method !== 'delivery') return false
    if (filter === 'pickup' && order.delivery_method !== 'pickup') return false
    if (statusFilter !== 'all' && order.status !== statusFilter) return false
    return true
  })

  const deliveryOrders = orders.filter(o => o.delivery_method === 'delivery')
  const pickupOrders = orders.filter(o => o.delivery_method === 'pickup')
  const pendingPaymentOrders = orders.filter(o => o.status === 'Ожидает оплаты')

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2A4A] mx-auto mb-4"></div>
          <p className="text-[#1B2A4A]">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <div className="bg-[#FBF9F4] border-b border-[#E8E2D5] p-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#1B2A4A] hover:text-[#C9A961] mb-4"
          >
            <ArrowLeft size={20} />
            <span>На главную</span>
          </button>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">📦 Управление заказами</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {pendingPaymentOrders.length > 0 && (
          <div className="bg-[#C9A961]/10 border-2 border-[#C9A961]/30 p-4 rounded-xl mb-4">
            <h2 className="text-lg font-bold text-[#1B2A4A] mb-3 flex items-center gap-2">
              ⏳ Ожидают оплаты ({pendingPaymentOrders.length})
            </h2>
            <div className="space-y-3">
              {pendingPaymentOrders.map((order) => (
                <PendingPaymentCard
                  key={order.id}
                  order={order}
                  onConfirmPayment={handleConfirmPayment}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </div>
        )}

        <div className="bg-[#FBF9F4] p-4 rounded-xl mb-4 border border-[#E8E2D5]">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { setFilter('all'); setStatusFilter('all') }}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all' ? 'bg-[#1B2A4A] text-white' : 'bg-[#E8E2D5] text-[#1B2A4A]'
              }`}
            >
              Все заказы ({orders.length})
            </button>
            <button
              onClick={() => { setFilter('delivery'); setStatusFilter('all') }}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                filter === 'delivery' ? 'bg-[#1B2A4A] text-white' : 'bg-[#E8E2D5] text-[#1B2A4A]'
              }`}
            >
              <Truck size={18} />
              Доставка ({deliveryOrders.length})
            </button>
            <button
              onClick={() => { setFilter('pickup'); setStatusFilter('all') }}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                filter === 'pickup' ? 'bg-[#1B2A4A] text-white' : 'bg-[#E8E2D5] text-[#1B2A4A]'
              }`}
            >
              <Store size={18} />
              Самовывоз ({pickupOrders.length})
            </button>
          </div>
        </div>

        {filter !== 'all' && (
          <div className="bg-[#FBF9F4] p-4 rounded-xl mb-4 border border-[#E8E2D5]">
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  statusFilter === 'all' ? 'bg-[#1B2A4A] text-white' : 'bg-[#E8E2D5] text-[#1B2A4A]'
                }`}
              >
                Все ({filteredOrders.length})
              </button>
              {getAvailableStatuses(filter).map((statusItem: StatusItem) => (
                <button
                  key={statusItem.old}
                  onClick={() => setStatusFilter(statusItem.old)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                    statusFilter === statusItem.old ? 'bg-[#1B2A4A] text-white' : 'bg-[#E8E2D5] text-[#1B2A4A]'
                  }`}
                >
                  {statusItem.new} ({filteredOrders.filter(o => o.status === statusItem.old).length})
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredOrders
            .filter(o => o.status !== 'Ожидает оплаты')
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

        {filteredOrders.filter(o => o.status !== 'Ожидает оплаты').length === 0 && (
          <div className="bg-[#FBF9F4] rounded-xl p-8 text-center text-[#1B2A4A] border border-[#E8E2D5]">
            <p>Заказов не найдено</p>
          </div>
        )}
      </div>

      {/* ✅ МОДАЛКА: ССЫЛКА НА ТРЕК КУРЬЕРА */}
      {courierModalOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FBF9F4] rounded-xl p-6 max-w-md w-full border border-[#E8E2D5]">
            <h3 className="text-lg font-bold mb-2 text-[#1B2A4A]">🚀 Передан курьеру</h3>
            <p className="text-sm text-[#1B2A4A] mb-4">
              Заказ №{courierModalOrder.id}. Вставьте ссылку на отслеживание курьера — клиент получит её в уведомлении и увидит кнопку «Отследить курьера» в приложении.
            </p>
            <input
              type="text"
              value={courierLink}
              onChange={(e) => setCourierLink(e.target.value)}
              placeholder="https://..."
              className="w-full p-3 border border-[#E8E2D5] rounded-lg focus:outline-none focus:border-[#C9A961] bg-white mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setCourierModalOrder(null)}
                className="flex-1 px-4 py-2 bg-[#E8E2D5] text-[#1B2A4A] rounded-lg font-medium"
              >
                Отмена
              </button>
              <button
                onClick={handleCourierSubmit}
                className="flex-1 px-4 py-2 bg-[#1B2A4A] text-white rounded-lg font-medium hover:bg-[#142038]"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PendingPaymentCard({ order, onConfirmPayment, onStatusChange }: any) {
  const clientChatId = order.user_chat_id || order.user_id
  return (
    <div className="bg-[#FBF9F4] rounded-xl p-4 shadow-sm border-2 border-[#C9A961]/30">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg text-[#1B2A4A]">Заказ №{order.id}</h3>
          <p className="text-sm text-[#1B2A4A]">
            {new Date(order.created_at).toLocaleString('ru-RU')}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#C9A961]/20 text-[#C9A961]">
          ⏳ Ожидает оплаты
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-[#1B2A4A]">👤 <strong>Клиент:</strong> {order.client_name}</p>
          <p className="text-sm text-[#1B2A4A]">📞 <strong>Телефон:</strong> {order.client_phone}</p>
          <p className="text-sm text-[#1B2A4A]">💰 <strong>Сумма:</strong> {formatOrderPrice(order)}</p>
          <p className="text-sm text-[#1B2A4A]">🚚 {order.delivery_method === 'pickup' ? 'Самовывоз' : 'Доставка'}</p>
        </div>
        <div>
          {order.items && (
            <div className="text-sm text-[#1B2A4A]">
              <strong>Товары:</strong>
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="text-xs mt-1">
                  • {item.name} ({item.size}) × {item.quantity}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {order.payment_screenshot_url ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-green-800 font-medium mb-2">
            ✅ Скриншот оплаты получен
          </p>
          <a
            href={order.payment_screenshot_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-green-300 rounded-lg text-sm text-green-700 hover:bg-green-100"
          >
            <Eye size={16} />
            Открыть скриншот
          </a>
        </div>
      ) : (
        <div className="bg-[#C9A961]/10 border border-[#C9A961]/20 rounded-lg p-3 mb-3">
          <p className="text-sm text-[#C9A961]">
            ⏳ Клиент ещё не загрузил скриншот оплаты
          </p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onConfirmPayment(order)}
          className="px-4 py-2 bg-[#1B2A4A] text-white rounded-lg text-sm font-medium hover:bg-[#142038] flex items-center gap-1"
        >
          <CheckCircle size={16} />
          ✅ Подтвердить оплату
        </button>
        <button
          onClick={() => {
            if (confirm(`🚫 Отменить заказ №${order.id}?`)) {
              onStatusChange(order.id, 'Отменён', clientChatId, order.delivery_method, order)
            }
          }}
          className="px-4 py-2 bg-[#9B3B3B] text-white rounded-lg text-sm font-medium hover:bg-[#7a2f2f] flex items-center gap-1"
        >
          <XCircle size={16} />
          🚫 Отменить
        </button>
      </div>
    </div>
  )
}

interface OrderCardProps {
  order: any
  onStatusChange: (orderId: string, newStatus: string, clientChatId: string, deliveryMethod: string, order: any) => void
  onSendCustomMessage: (orderId: string, clientChatId: string) => void
  getStatusLabel: (status: string, deliveryMethod: string) => string
  getAvailableStatuses: (deliveryMethod: string) => StatusItem[]
  showCustomMessage: string | null
  setShowCustomMessage: (id: string | null) => void
  customMessageText: string
  setCustomMessageText: (text: string) => void
}

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
  const clientChatId = order.user_chat_id || order.user_id
  return (
    <div className="bg-[#FBF9F4] rounded-xl p-4 shadow-sm border border-[#E8E2D5]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg text-[#1B2A4A]">Заказ №{order.id}</h3>
          <p className="text-sm text-[#1B2A4A]">
            {new Date(order.created_at).toLocaleString('ru-RU')}
          </p>
          {order.special_order_id && (
            <p className="text-xs text-[#C9A961] font-medium mt-1">
              🌍 Заказ из спецзаказа
            </p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          order.status === 'Активный' ? 'bg-blue-100 text-blue-800' :
          order.status === 'В обработке' ? 'bg-yellow-100 text-yellow-800' :
          order.status === 'Готов' ? 'bg-green-100 text-green-800' :
          order.status === 'Выдан' ? 'bg-[#E8E2D5] text-[#1B2A4A]' :
          order.status === 'Доставлен' ? 'bg-emerald-100 text-emerald-800' :
          order.status === 'Отменён' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {getStatusLabel(order.status, order.delivery_method)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-[#1B2A4A]">👤 <strong>Клиент:</strong> {order.client_name}</p>
          <p className="text-sm text-[#1B2A4A]">📞 <strong>Телефон:</strong> {order.client_phone}</p>
          <p className="text-sm text-[#1B2A4A]">💰 <strong>Сумма:</strong> {formatOrderPrice(order)}</p>
          {clientChatId && (
            <p className="text-xs text-[#1B2A4A] mt-1">
              💬 Chat ID: <code className="bg-[#E8E2D5] px-1 rounded text-[#1B2A4A]">{clientChatId}</code>
            </p>
          )}
        </div>
        <div>
          <p className="text-sm text-[#1B2A4A]">🚚 <strong>Доставка:</strong> {order.delivery_method === 'pickup' ? 'Самовывоз' : 'Доставка'}</p>
          {order.delivery_address && (
            <p className="text-sm text-[#1B2A4A]">📍 <strong>Адрес:</strong> {order.delivery_address}</p>
          )}
          <p className="text-sm text-[#1B2A4A]">💳 <strong>Оплата:</strong> {order.payment_method === 'online_card' ? 'Картой' : 'При получении'}</p>
          {order.courier_link && (
            <p className="text-sm text-[#1B2A4A] mt-1">
              🔗 <a href={order.courier_link} target="_blank" rel="noopener noreferrer" className="text-[#C9A961] underline">Трек курьера</a>
            </p>
          )}
        </div>
      </div>

      {order.items && (
        <div className="mb-4 p-3 bg-[#E8E2D5]/50 rounded-lg">
          <h4 className="font-medium mb-2 text-[#1B2A4A]">Товары:</h4>
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="text-sm text-[#1B2A4A] mb-1">
              {idx + 1}. {item.name} — {item.size} — {item.quantity} шт. — ${item.priceUsd}
            </div>
          ))}
        </div>
      )}

      {order.payment_screenshot_url && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-sm text-blue-900 mb-2">
            📸 Скриншот оплаты:
          </h4>
          <a
            href={order.payment_screenshot_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-sm text-blue-700 hover:bg-blue-100"
          >
            <Eye size={16} />
            Открыть скриншот
          </a>
        </div>
      )}

      {clientChatId && (
        <div className="mb-3">
          <button
            onClick={() => setShowCustomMessage(showCustomMessage === order.id ? null : order.id)}
            className="px-3 py-1 bg-[#C9A961]/10 text-[#C9A961] hover:bg-[#C9A961]/20 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <MessageCircle size={16} />
            Написать клиенту
          </button>
          {showCustomMessage === order.id && (
            <div className="mt-2 p-3 bg-[#C9A961]/5 border border-[#C9A961]/20 rounded-lg">
              <textarea
                value={customMessageText}
                onChange={(e) => setCustomMessageText(e.target.value)}
                placeholder="Введите сообщение для клиента..."
                rows={3}
                className="w-full p-2 border border-[#E8E2D5] rounded-lg text-sm focus:outline-none focus:border-[#C9A961] bg-white"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onSendCustomMessage(order.id, clientChatId)}
                  className="px-3 py-1 bg-[#C9A961] text-white rounded-lg text-sm font-medium hover:bg-[#b8954f]"
                >
                  Отправить
                </button>
                <button
                  onClick={() => {
                    setShowCustomMessage(null)
                    setCustomMessageText('')
                  }}
                  className="px-3 py-1 bg-[#E8E2D5] text-[#1B2A4A] rounded-lg text-sm font-medium hover:bg-[#E8E2D5]/70"
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
              onClick={() => onStatusChange(order.id, s.old, clientChatId, order.delivery_method, order)}
              className="px-3 py-1 bg-[#E8E2D5] hover:bg-[#E8E2D5]/70 rounded-lg text-sm font-medium transition-colors text-[#1B2A4A]"
            >
              {s.new}
            </button>
          ))}
      </div>
    </div>
  )
}
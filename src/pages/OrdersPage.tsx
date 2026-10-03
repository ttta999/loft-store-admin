import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, updateOrderStatus, sendClientNotification, restoreStockAfterCancel, supabase } from '../lib/supabase'
import { ordersCacheApi } from '../lib/cache'
import { toast, Toaster } from 'sonner'
import {
  ArrowLeft,
  RefreshCw,
  Truck,
  Store,
  MessageCircle,
  CheckCircle,
  XCircle,
  Eye,
  Package,
  User,
  Phone,
  DollarSign,
  MapPin,
  CreditCard,
  Link2,
  X,
  Send,
  Clock,
  Camera,
} from 'lucide-react'
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

// ✅ Валюта заказа: берём из поля order_currency (USD/UZS), для старых заказов фолбэк UZS
const getOrderCurrency = (order: any): 'USD' | 'UZS' => {
  if (order?.order_currency === 'USD') return 'USD'
  if (order?.order_currency === 'UZS') return 'UZS'
  return 'UZS'
}

// ✅ Форматирование цены заказа — в ВАЛЮТЕ ЗАКАЗА
const formatOrderPrice = (order: any) => {
  const cur = getOrderCurrency(order)
  if (cur === 'USD') {
    return `$${Number(order.total_price_usd || 0).toLocaleString()}`
  }
  const uzs = order.total_price_uzs != null
    ? Number(order.total_price_uzs)
    : Math.round((order.total_price_usd || 0) * (order.exchange_rate_at_order || 12100))
  return `${uzs.toLocaleString()} сум`
}

// ✅ Форматирование цены товара в заказе — в ВАЛЮТЕ ЗАКАЗА
const formatItemPrice = (item: any, order: any) => {
  const cur = getOrderCurrency(order)
  if (cur === 'USD') {
    return `$${Number(item.priceUsd || 0)}`
  }
  const uzs = item.priceUzs != null
    ? Number(item.priceUzs)
    : Math.round((item.priceUsd || 0) * (order.exchange_rate_at_order || 12100))
  return `${uzs.toLocaleString()} сум`
}

// ✅ Цвет статус-пиллы (единый с основным приложением)
const getStatusColor = (status: string): string => {
  return {
    'Активный': 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30',
    'В обработке': 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-500/30',
    'Готов': 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-500/30',
    'Выдан': 'bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-500/30',
    'Доставлен': 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30',
    'Отменён': 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-500/30',
    'Ожидает оплаты': 'bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30',
  }[status] || 'bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-500/30'
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'delivery' | 'pickup'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCustomMessage, setShowCustomMessage] = useState<string | null>(null)
  const [customMessageText, setCustomMessageText] = useState('')

  // ✅ МОДАЛКА ССЫЛКИ НА КУРЬЕРА
  const [courierModalOrder, setCourierModalOrder] = useState<any>(null)
  const [courierLink, setCourierLink] = useState('')

  useEffect(() => {
    loadOrders(false)
  }, [])

  const loadOrders = async (forceRefresh = false) => {
    // ✅ Проверяем кеш
    if (!forceRefresh) {
      const cached = ordersCacheApi.get()
      if (cached) {
        const sorted = [...(cached as any[])].sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setOrders(sorted)
        setLoading(false)
        return
      }
    }

    if (forceRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const data = await getOrders()
      const sorted = data.sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setOrders(sorted)
      // ✅ Сохраняем в кеш
      ordersCacheApi.set(sorted)
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error)
      toast.error('Ошибка загрузки заказов')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    ordersCacheApi.invalidate()
    loadOrders(true)
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

        let sent = false
        if (clientChatId) {
          sent = !!(await sendClientNotification(clientChatId, message))
        }

        if (sent) {
          toast.success(`Статус изменён на «${newStatus}» ✅ Уведомление отправлено`)
        } else if (clientChatId) {
          toast.warning(`Статус изменён на «${newStatus}», но уведомление не ушло`)
        } else {
          toast.error(`Статус изменён, но Chat ID клиента не найден`)
        }

        // ✅ Сбрасываем кеш и перезагружаем
        ordersCacheApi.invalidate()
        await loadOrders(true)
      } else {
        toast.error('Ошибка при обновлении статуса')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      toast.error('Произошла ошибка при обновлении')
    }
  }

  const handleStatusChange = async (_orderId: string, newStatus: string, clientChatId: string, deliveryMethod: string, order: any) => {
    if (newStatus === 'Отменён') {
      if (!confirm(`🚫 Отменить заказ №${order.id}?`)) return
    }

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
      toast.error('Вставьте ссылку на отслеживание курьера')
      return
    }
    if (!/^https?:\/\//i.test(link)) {
      toast.error('Ссылка должна начинаться с http:// или https://')
      return
    }
    const order = courierModalOrder
    if (!order) return
    const clientChatId = order.user_chat_id || order.user_id
    setCourierModalOrder(null)
    await applyStatusChange(order, 'Выдан', clientChatId, link)
  }

  const handleConfirmPayment = async (order: any) => {
    const confirmed = confirm(`✅ Подтвердить оплату заказа №${order.id}?\n\nКлиент: ${order.client_name}\nСумма: ${formatOrderPrice(order)} (${getOrderCurrency(order)})`)
    if (!confirmed) return
    const success = await confirmPayment(order.id)
    if (success) {
      if (order.user_chat_id) {
        const message = `✅ <b>Заказ №${order.id} оплачен!</b>\n\nМы уже начали его обработку. Спасибо за заказ!`
        await sendClientNotification(order.user_chat_id, message)
      }
      toast.success('Оплата подтверждена! Заказ активирован.')
      ordersCacheApi.invalidate()
      await loadOrders(true)
    } else {
      toast.error('Ошибка подтверждения')
    }
  }

  const handleSendCustomMessage = async (orderId: string, clientChatId: string) => {
    if (!customMessageText.trim()) {
      toast.error('Введите сообщение')
      return
    }
    if (!clientChatId) {
      toast.error('Chat ID клиента не найден')
      return
    }
    try {
      const message = `📩 <b>Сообщение по заказу №${orderId}:</b>\n\n${customMessageText}`
      const sent = !!(await sendClientNotification(clientChatId, message))
      if (sent) {
        toast.success('Сообщение отправлено клиенту ✅')
        setShowCustomMessage(null)
        setCustomMessageText('')
      } else {
        toast.error('Не удалось отправить сообщение')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      toast.error('Произошла ошибка при отправке')
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
      <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg flex items-center justify-center">
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2A4A] dark:border-gold mx-auto mb-4"></div>
          <p className="text-[#1B2A4A] dark:text-white font-medium">Загрузка заказов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg">
      <Toaster position="top-center" richColors />

      {/* ✅ Sticky-шапка */}
      <div className="sticky top-0 z-20 bg-[#F5F1E8]/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-[#E8E2D5] dark:border-dark-border px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 text-sm font-bold text-[#1B2A4A] dark:text-white hover:text-[#C9A961] dark:hover:text-gold transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
                <ArrowLeft size={18} />
              </span>
              На главную
            </button>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#1B2A4A] dark:text-white">Заказы</h1>
              <span className="w-10 h-10 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
                <Package size={18} className="text-[#1B2A4A] dark:text-white" />
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#1B2A4A] dark:text-white bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors disabled:opacity-50"
              title="Обновить список"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Обновить
            </button>
          </div>

          {/* ✅ Фильтры по способу получения */}
          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              onClick={() => { setFilter('all'); setStatusFilter('all') }}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                filter === 'all'
                  ? 'bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A]'
                  : 'bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#F5F1E8] dark:hover:bg-dark-accent'
              }`}
            >
              Все <span className="opacity-70">({orders.length})</span>
            </button>
            <button
              onClick={() => { setFilter('delivery'); setStatusFilter('all') }}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${
                filter === 'delivery'
                  ? 'bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A]'
                  : 'bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#F5F1E8] dark:hover:bg-dark-accent'
              }`}
            >
              <Truck size={16} />
              Доставка <span className="opacity-70">({deliveryOrders.length})</span>
            </button>
            <button
              onClick={() => { setFilter('pickup'); setStatusFilter('all') }}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${
                filter === 'pickup'
                  ? 'bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A]'
                  : 'bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#F5F1E8] dark:hover:bg-dark-accent'
              }`}
            >
              <Store size={16} />
              Самовывоз <span className="opacity-70">({pickupOrders.length})</span>
            </button>
          </div>

          {/* ✅ Фильтры по статусам (только когда выбран способ) */}
          {filter !== 'all' && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-[#C9A961] text-white'
                    : 'bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#F5F1E8] dark:hover:bg-dark-accent'
                }`}
              >
                Все ({filteredOrders.length})
              </button>
              {getAvailableStatuses(filter).map((statusItem: StatusItem) => {
                const count = filteredOrders.filter(o => o.status === statusItem.old).length
                return (
                  <button
                    key={statusItem.old}
                    onClick={() => setStatusFilter(statusItem.old)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                      statusFilter === statusItem.old
                        ? 'bg-[#C9A961] text-white'
                        : 'bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#F5F1E8] dark:hover:bg-dark-accent'
                    }`}
                  >
                    {statusItem.new} <span className="opacity-70">({count})</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-4">
        {/* ✅ Блок «Ожидают оплаты» */}
        {pendingPaymentOrders.length > 0 && (
          <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border-2 border-[#C9A961]/40 dark:border-gold/40 overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-[#C9A961]/30 dark:border-gold/30 bg-[#C9A961]/5 dark:bg-gold/10">
              <div className="w-10 h-10 rounded-full bg-[#C9A961]/20 dark:bg-gold/30 border border-[#C9A961]/40 dark:border-gold/50 flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-[#C9A961]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white">
                  Ожидают оплаты
                </h2>
                <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5">
                  {pendingPaymentOrders.length} {pendingPaymentOrders.length === 1 ? 'заказ' : pendingPaymentOrders.length < 5 ? 'заказа' : 'заказов'} требуют подтверждения
                </p>
              </div>
            </div>
            <div className="p-4 space-y-4">
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

        {/* ✅ Список заказов */}
        {filteredOrders.filter(o => o.status !== 'Ожидает оплаты').length === 0 ? (
          <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border mx-auto mb-4 flex items-center justify-center">
              <Package size={28} className="text-[#8A8275] dark:text-gray-300" />
            </div>
            <p className="text-base font-medium text-[#1B2A4A] dark:text-white mb-1">
              Заказов не найдено
            </p>
            <p className="text-sm text-[#8A8275] dark:text-gray-300">
              Попробуйте изменить фильтры
            </p>
          </div>
        ) : (
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
        )}
      </div>

      {/* ✅ МОДАЛКА: ССЫЛКА НА ТРЕК КУРЬЕРА */}
      {courierModalOrder && (
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setCourierModalOrder(null)}
        >
          <div
            className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center">
                  <Truck size={18} className="text-blue-700 dark:text-blue-300" />
                </div>
                <h3 className="text-xl font-bold text-[#1B2A4A] dark:text-white">
                  Передан курьеру
                </h3>
              </div>
              <button
                onClick={() => setCourierModalOrder(null)}
                className="p-2 rounded-lg hover:bg-[#F5F1E8] dark:hover:bg-dark-accent text-[#8A8275] dark:text-gray-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-[#8A8275] dark:text-gray-300 mb-4 leading-relaxed">
              Заказ №{courierModalOrder.id}. Вставьте ссылку на отслеживание — клиент получит её в уведомлении и увидит кнопку «Отследить курьера» в приложении.
            </p>

            <label className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider mb-1.5 block">
              Ссылка на трек
            </label>
            <input
              type="text"
              value={courierLink}
              onChange={(e) => setCourierLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-sm font-medium mb-5"
              autoFocus
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCourierModalOrder(null)}
                className="px-4 py-3 rounded-xl bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white font-bold hover:bg-[#E8E2D5] dark:hover:bg-dark-border transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleCourierSubmit}
                className="px-4 py-3 rounded-xl bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] font-bold hover:bg-[#142038] dark:hover:bg-[#d6b57e] transition-colors flex items-center justify-center gap-2"
              >
                <Send size={14} />
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
  const orderCurrency = getOrderCurrency(order)
  return (
    <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl p-5 border-2 border-[#C9A961]/40 dark:border-gold/40">
      {/* Шапка */}
      <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-[#E8E2D5] dark:border-dark-border">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="text-lg font-bold text-[#1B2A4A] dark:text-white">
              Заказ №{order.id}
            </h3>
            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
              orderCurrency === 'USD'
                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300'
                : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
            }`}>
              {orderCurrency}
            </span>
          </div>
          <p className="text-xs text-[#8A8275] dark:text-gray-300 flex items-center gap-1.5">
            <Clock size={12} />
            {new Date(order.created_at).toLocaleString('ru-RU')}
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30 flex-shrink-0">
          ⏳ Ожидает оплаты
        </span>
      </div>

      {/* Строки-иконки */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-[#1B2A4A] dark:text-white" />
          </div>
          <p className="text-sm text-[#1B2A4A] dark:text-white truncate">
            <span className="text-[#8A8275] dark:text-gray-300">Клиент:</span>{' '}
            <span className="font-medium">{order.client_name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
            <Phone size={14} className="text-[#1B2A4A] dark:text-white" />
          </div>
          <p className="text-sm text-[#1B2A4A] dark:text-white truncate">
            <span className="text-[#8A8275] dark:text-gray-300">Телефон:</span>{' '}
            <span className="font-medium">{order.client_phone}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
            <DollarSign size={14} className="text-[#C9A961]" />
          </div>
          <p className="text-sm text-[#1B2A4A] dark:text-white truncate">
            <span className="text-[#8A8275] dark:text-gray-300">Сумма:</span>{' '}
            <span className="font-bold">{formatOrderPrice(order)}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
            {order.delivery_method === 'pickup'
              ? <Store size={14} className="text-[#1B2A4A] dark:text-white" />
              : <Truck size={14} className="text-[#1B2A4A] dark:text-white" />}
          </div>
          <p className="text-sm text-[#1B2A4A] dark:text-white truncate">
            {order.delivery_method === 'pickup' ? 'Самовывоз' : 'Доставка'}
          </p>
        </div>
      </div>

      {/* Товары */}
      {order.items && (
        <div className="mb-4 p-3 bg-[#F5F1E8] dark:bg-dark-accent rounded-xl border border-[#E8E2D5] dark:border-dark-border">
          <p className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider mb-2">
            Товары ({order.items.length})
          </p>
          <div className="space-y-1">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="text-xs text-[#1B2A4A] dark:text-white flex justify-between gap-2">
                <span className="truncate flex-1 min-w-0">
                  {item.name} <span className="text-[#8A8275] dark:text-gray-300">({item.size}) × {item.quantity}</span>
                </span>
                <span className="font-bold flex-shrink-0">{formatItemPrice(item, order)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Скриншот оплаты */}
      {order.payment_screenshot_url ? (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <span className="text-sm">✅</span>
            </div>
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">
              Скриншот оплаты получен
            </p>
          </div>
          <a
            href={order.payment_screenshot_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-accent border border-green-300 dark:border-green-500/30 rounded-lg text-sm text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-dark-border transition-colors font-medium"
          >
            <Eye size={14} />
            Открыть скриншот
          </a>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-[#C9A961]/5 dark:bg-gold/10 border border-[#C9A961]/20 dark:border-gold/30 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#C9A961]/20 dark:bg-gold/30 flex items-center justify-center">
              <Camera size={14} className="text-[#C9A961]" />
            </div>
            <p className="text-sm text-[#C9A961]">
              Клиент ещё не загрузил скриншот оплаты
            </p>
          </div>
        </div>
      )}

      {/* Кнопки */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onConfirmPayment(order)}
          className="px-4 py-3 rounded-xl bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] text-sm font-bold hover:bg-[#142038] dark:hover:bg-[#d6b57e] transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle size={16} />
          Подтвердить
        </button>
        <button
          onClick={() => onStatusChange(order.id, 'Отменён', clientChatId, order.delivery_method, order)}
          className="px-4 py-3 rounded-xl bg-[#9B3B3B] dark:bg-red-900 text-white text-sm font-bold hover:bg-red-700 dark:hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
        >
          <XCircle size={16} />
          Отменить
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
  const orderCurrency = getOrderCurrency(order)

  return (
    <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden">
      {/* ✅ Шапка карточки: номер + дата + валюта + статус-пилла + бейдж спецзаказа */}
      <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-[#E8E2D5] dark:border-dark-border">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="text-lg font-bold text-[#1B2A4A] dark:text-white">
              Заказ №{order.id}
            </h3>
            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
              orderCurrency === 'USD'
                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300'
                : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
            }`}>
              {orderCurrency}
            </span>
            {order.special_order_id && (
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300">
                🌍 Спецзаказ
              </span>
            )}
          </div>
          <p className="text-xs text-[#8A8275] dark:text-gray-300 flex items-center gap-1.5">
            <Clock size={12} />
            {new Date(order.created_at).toLocaleString('ru-RU')}
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${getStatusColor(order.status)}`}>
          {getStatusLabel(order.status, order.delivery_method)}
        </span>
      </div>

      {/* ✅ Строки-иконки: клиент, телефон, сумма, доставка, адрес, оплата */}
      <div className="divide-y divide-[#E8E2D5] dark:divide-dark-border">
        <div className="flex items-center gap-3 p-3.5">
          <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-[#1B2A4A] dark:text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#8A8275] dark:text-gray-300">Клиент</p>
            <p className="text-sm font-medium text-[#1B2A4A] dark:text-white truncate">
              {order.client_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5">
          <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
            <Phone size={16} className="text-[#1B2A4A] dark:text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#8A8275] dark:text-gray-300">Телефон</p>
            <p className="text-sm font-medium text-[#1B2A4A] dark:text-white truncate">
              {order.client_phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5">
          <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
            <DollarSign size={16} className="text-[#C9A961]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#8A8275] dark:text-gray-300">Сумма заказа</p>
            <p className="text-base font-bold text-[#1B2A4A] dark:text-white">
              {formatOrderPrice(order)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5">
          <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
            {order.delivery_method === 'pickup'
              ? <Store size={16} className="text-[#1B2A4A] dark:text-white" />
              : <Truck size={16} className="text-[#1B2A4A] dark:text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#8A8275] dark:text-gray-300">Способ получения</p>
            <p className="text-sm font-medium text-[#1B2A4A] dark:text-white">
              {order.delivery_method === 'pickup' ? 'Самовывоз' : 'Доставка'}
            </p>
          </div>
        </div>

        {order.delivery_address && (
          <div className="flex items-center gap-3 p-3.5">
            <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <MapPin size={16} className="text-[#1B2A4A] dark:text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#8A8275] dark:text-gray-300">Адрес доставки</p>
              <p className="text-sm font-medium text-[#1B2A4A] dark:text-white break-words">
                {order.delivery_address}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 p-3.5">
          <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
            <CreditCard size={16} className="text-[#1B2A4A] dark:text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#8A8275] dark:text-gray-300">Оплата</p>
            <p className="text-sm font-medium text-[#1B2A4A] dark:text-white">
              {order.payment_method === 'online_card' ? 'Переводом' : 'При получении'}
            </p>
          </div>
        </div>

        {order.courier_link && (
          <div className="flex items-center gap-3 p-3.5">
            <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <Link2 size={16} className="text-[#1B2A4A] dark:text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#8A8275] dark:text-gray-300">Трек курьера</p>
              <a
                href={order.courier_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[#C9A961] hover:underline break-all"
              >
                {order.courier_link}
              </a>
            </div>
          </div>
        )}

        {clientChatId && (
          <div className="flex items-center gap-3 p-3.5">
            <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <MessageCircle size={16} className="text-[#1B2A4A] dark:text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#8A8275] dark:text-gray-300">Chat ID</p>
              <p className="text-sm font-mono text-[#1B2A4A] dark:text-white truncate">
                {clientChatId}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Товары */}
      {order.items && (
        <div className="p-4 bg-[#F5F1E8]/40 dark:bg-dark-accent/30 border-t border-[#E8E2D5] dark:border-dark-border">
          <p className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider mb-2 px-1">
            Товары ({order.items.length})
          </p>
          <div className="space-y-1.5">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-3 p-2 bg-white dark:bg-dark-card rounded-lg border border-[#E8E2D5] dark:border-dark-border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1B2A4A] dark:text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#8A8275] dark:text-gray-300">
                    {item.size} · {item.quantity} шт.
                  </p>
                </div>
                <p className="text-sm font-bold text-[#1B2A4A] dark:text-white whitespace-nowrap">
                  {formatItemPrice(item, order)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ Скриншот оплаты */}
      {order.payment_screenshot_url && (
        <div className="p-4 border-t border-[#E8E2D5] dark:border-dark-border bg-blue-50/50 dark:bg-blue-500/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <Camera size={12} className="text-blue-700 dark:text-blue-300" />
            </div>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
              Скриншот оплаты загружен
            </p>
          </div>
          <a
            href={order.payment_screenshot_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-dark-accent border border-blue-200 dark:border-blue-500/30 rounded-lg text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-dark-border transition-colors font-medium"
          >
            <Eye size={14} />
            Открыть скриншот
          </a>
        </div>
      )}

      {/* ✅ Кнопка «Написать клиенту» + textarea */}
      {clientChatId && (
        <div className="p-4 border-t border-[#E8E2D5] dark:border-dark-border">
          <button
            onClick={() => setShowCustomMessage(showCustomMessage === order.id ? null : order.id)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F5F1E8] dark:bg-dark-accent hover:bg-[#E8E2D5] dark:hover:bg-dark-border border border-[#E8E2D5] dark:border-dark-border rounded-xl text-sm font-bold text-[#1B2A4A] dark:text-white transition-colors"
          >
            <MessageCircle size={14} />
            {showCustomMessage === order.id ? 'Скрыть сообщение' : 'Написать клиенту'}
          </button>
          {showCustomMessage === order.id && (
            <div className="mt-3 space-y-2">
              <textarea
                value={customMessageText}
                onChange={(e) => setCustomMessageText(e.target.value)}
                placeholder="Введите сообщение для клиента..."
                rows={3}
                className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl text-sm bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white placeholder:text-[#8A8275] dark:placeholder:text-gray-500 focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold resize-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onSendCustomMessage(order.id, clientChatId)}
                  className="px-3 py-2.5 bg-[#C9A961] text-white rounded-xl text-sm font-bold hover:bg-[#b8954f] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send size={14} />
                  Отправить
                </button>
                <button
                  onClick={() => {
                    setShowCustomMessage(null)
                    setCustomMessageText('')
                  }}
                  className="px-3 py-2.5 bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white rounded-xl text-sm font-bold hover:bg-[#E8E2D5] dark:hover:bg-dark-border transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ Футер с кнопками смены статуса */}
      <div className="p-4 pt-3 border-t border-[#E8E2D5] dark:border-dark-border bg-[#F5F1E8]/40 dark:bg-dark-accent/30">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
            <CheckCircle size={12} className="text-[#8A8275] dark:text-gray-300" />
          </div>
          <p className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider">
            Сменить статус
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableStatuses
            .filter((s: StatusItem) => s.old !== order.status)
            .map((s: StatusItem) => (
              <button
                key={s.old}
                onClick={() => onStatusChange(order.id, s.old, clientChatId, order.delivery_method, order)}
                className="px-3.5 py-2 bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border hover:border-[#C9A961] dark:hover:border-gold hover:bg-white dark:hover:bg-dark-border rounded-xl text-xs font-bold text-[#1B2A4A] dark:text-white transition-colors"
              >
                {s.new}
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}
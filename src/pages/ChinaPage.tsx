import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getChinaRequests, updateChinaRequestStatus, sendClientNotification } from '../lib/supabase'
import { chinaCacheApi } from '../lib/cache'
import { toast, Toaster } from 'sonner'
import {
  ArrowLeft,
  Globe,
  RefreshCw,
  Tag,
  Link2,
  Ruler,
  MessageCircle,
  Image as ImageIcon,
  DollarSign,
  X,
  Send,
  XCircle,
  Info,
  Search,
  ChevronDown,
} from 'lucide-react'

const STATUSES = [
  { old: 'На рассмотрении', new: 'Принят 📄', color: 'yellow' },
  { old: 'Оценён', new: 'Оценён 💎', color: 'purple' },
  { old: 'Оплачен', new: 'Оплачен ✅', color: 'green' },
  { old: 'Отменён клиентом', new: 'Отменён вами 🙅‍♂️', color: 'orange' },
  { old: 'Отклонён', new: 'Отклонён 🛑', color: 'red' },
]

const STATUS_MESSAGES: Record<string, string> = {
  'На рассмотрении': '📄 Принят: Ваш спецзаказ №{requestId} принят! Менеджер уже изучает детали, чтобы рассчитать точную стоимость. Обычно это занимает немного времени. Скоро вернемся с ответом 🔍',
  'Оценён': '💎 Оценён: Ваш спецзаказ №{requestId} оценён в ${managerPrice}! ✨\n\nКомментарий менеджера: {managerComment}\n\nВы можете принять условия и оплатить заказ или отменить заявку. 📲',
  'Оплачен': '✅ Оплачен: Оплата спецзаказа №{requestId} успешно принята, спасибо! 🎉 Менеджер уже приступил к оформлению и подготовке!',
  'Отменён клиентом': '🙅‍️ Отменён вами: Заявка на спецзаказ №{requestId} отменена вами. 👋 Если вы захотите изменить параметры, вы всегда можете отправить новую заявку.',
  'Отклонён': '🛑 Отклонён: К сожалению, мы вынуждены отклонить заявку на спецзаказ №{requestId}. 😔\n\nПричина: {managerComment}\n\nПриносим извинения за неудобства. Наша поддержка всегда готова помочь вам подобрать альтернативу! ✉️',
}

const getStatusColor = (status: string) => {
  return {
    'На рассмотрении': 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-500/30',
    'Оценён': 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30',
    'Оплачен': 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-500/30',
    'Отменён клиентом': 'bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30',
    'Отклонён': 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-500/30',
  }[status] || 'bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-500/30'
}

// ✅ Компактная мини-строка информации внутри раскрытой карточки (как в OrdersPage)
function InfoMini({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 p-2.5 bg-[#FBF9F4] dark:bg-dark-card rounded-xl border border-[#E8E2D5] dark:border-dark-border">
      <div className="w-8 h-8 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-[#8A8275] dark:text-gray-300 uppercase tracking-wider font-bold">{label}</p>
        <div className="text-xs font-medium text-[#1B2A4A] dark:text-white mt-0.5 break-all">{children}</div>
      </div>
    </div>
  )
}

export default function ChinaPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [showPriceModal, setShowPriceModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)

  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [managerPrice, setManagerPrice] = useState('')
  const [managerComment, setManagerComment] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadRequests(false)
  }, [])

  const loadRequests = async (forceRefresh = false) => {
    // ✅ Проверяем кеш
    if (!forceRefresh) {
      const cached = chinaCacheApi.get()
      if (cached) {
        setRequests(cached as any[])
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
      const data = await getChinaRequests()
      setRequests(data)
      // ✅ Сохраняем в кеш
      chinaCacheApi.set(data)
    } catch (error) {
      console.error('Ошибка загрузки спецзаказов:', error)
      toast.error('Ошибка загрузки спецзаказов')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    chinaCacheApi.invalidate()
    loadRequests(true)
  }

  const handleStatusChange = async (requestId: string, newStatus: string, clientChatId: string) => {
    if (newStatus === 'Оценён') {
      const request = requests.find(r => r.id === requestId)
      setSelectedRequest(request)
      setShowPriceModal(true)
      return
    }

    if (newStatus === 'Отклонён') {
      const request = requests.find(r => r.id === requestId)
      setSelectedRequest(request)
      setShowRejectModal(true)
      return
    }

    setSubmitting(true)
    try {
      const updated = await updateChinaRequestStatus(requestId, newStatus)
      if (updated) {
        const messageTemplate = STATUS_MESSAGES[newStatus] || `Статус спецзаказа №${requestId} изменён на: ${newStatus}`
        const message = messageTemplate.replace('{requestId}', requestId)

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
        chinaCacheApi.invalidate()
        await loadRequests(true)
      } else {
        toast.error('Ошибка при обновлении статуса')
      }
    } catch (error) {
      console.error('Ошибка:', error)
      toast.error('Произошла ошибка при обновлении')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePriceSubmit = async () => {
    if (!managerPrice || !selectedRequest) return
    setSubmitting(true)
    try {
      const updated = await updateChinaRequestStatus(selectedRequest.id, 'Оценён', {
        manager_price: parseFloat(managerPrice),
        manager_comment: managerComment
      })

      if (updated) {
        const message = STATUS_MESSAGES['Оценён']
          .replace('{requestId}', selectedRequest.id)
          .replace('{managerPrice}', managerPrice)
          .replace('{managerComment}', managerComment || 'Без комментария')

        let sent = false
        if (selectedRequest.user_id) {
          sent = !!(await sendClientNotification(selectedRequest.user_id, message))
        }

        if (sent) {
          toast.success(`Цена $${managerPrice} установлена ✅ Уведомление отправлено`)
        } else if (selectedRequest.user_id) {
          toast.warning(`Цена установлена, но уведомление не ушло`)
        } else {
          toast.error('Цена установлена, но Chat ID клиента не найден')
        }

        setShowPriceModal(false)
        setManagerPrice('')
        setManagerComment('')
        
        // ✅ Сбрасываем кеш и перезагружаем
        chinaCacheApi.invalidate()
        await loadRequests(true)
      } else {
        toast.error('Ошибка при установке цены')
      }
    } catch (error: any) {
      console.error('Ошибка:', error)
      toast.error('Ошибка: ' + (error.message || 'неизвестно'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleRejectSubmit = async () => {
    if (!selectedRequest || rejectReason.trim().length < 5) return
    setSubmitting(true)
    try {
      const updated = await updateChinaRequestStatus(selectedRequest.id, 'Отклонён', {
        manager_comment: rejectReason
      })

      if (updated) {
        const message = STATUS_MESSAGES['Отклонён']
          .replace('{requestId}', selectedRequest.id)
          .replace('{managerComment}', rejectReason || 'Не указана')

        let sent = false
        if (selectedRequest.user_id) {
          sent = !!(await sendClientNotification(selectedRequest.user_id, message))
        }

        if (sent) {
          toast.success(`Спецзаказ отклонён ✅ Уведомление отправлено`)
        } else if (selectedRequest.user_id) {
          toast.warning('Спецзаказ отклонён, но уведомление не ушло')
        } else {
          toast.error('Спецзаказ отклонён, но Chat ID клиента не найден')
        }

        setShowRejectModal(false)
        setRejectReason('')
        
        // ✅ Сбрасываем кеш и перезагружаем
        chinaCacheApi.invalidate()
        await loadRequests(true)
      } else {
        toast.error('Ошибка при отклонении спецзаказа')
      }
    } catch (error: any) {
      console.error('Ошибка:', error)
      toast.error('Ошибка: ' + (error.message || 'неизвестно'))
    } finally {
      setSubmitting(false)
    }
  }

  // ✅ ПОИСК: по номеру заявки, названию товара, ссылке, комментарию
  const q = searchQuery.trim().toLowerCase()
  const searchFiltered = q
    ? requests.filter(r => {
        if (String(r.id).includes(q)) return true
        if ((r.product_name || '').toLowerCase().includes(q)) return true
        if ((r.link || '').toLowerCase().includes(q)) return true
        if ((r.comment || '').toLowerCase().includes(q)) return true
        if ((r.size_color || '').toLowerCase().includes(q)) return true
        return false
      })
    : requests

  const filteredRequests = searchFiltered.filter(r => filter === 'all' || r.status === filter)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg flex items-center justify-center">
        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2A4A] dark:border-gold mx-auto mb-4"></div>
          <p className="text-[#1B2A4A] dark:text-white font-medium">Загрузка спецзаказов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg">
      <Toaster position="top-center" richColors />

      {/* ✅ Sticky-шапка: назад / заголовок / refresh + поиск + фильтры */}
      <div className="sticky top-0 z-20 bg-[#F5F1E8]/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-[#E8E2D5] dark:border-dark-border px-6 py-4">
        <div className="max-w-5xl mx-auto">
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
              <h1 className="text-2xl font-bold text-[#1B2A4A] dark:text-white">Спецзаказы</h1>
              <span className="w-10 h-10 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
                <Globe size={18} className="text-[#C9A961]" />
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

          {/* ✅ Поиск по номеру / названию / ссылке / комментарию */}
          <div className="mt-4 bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border flex items-center gap-3 p-3">
            <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
              <Search size={16} className="text-[#1B2A4A] dark:text-white" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск: № заявки, название, ссылка..."
              className="flex-1 bg-transparent text-sm font-medium text-[#1B2A4A] dark:text-white focus:outline-none placeholder:text-[#8A8275] dark:placeholder:text-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1.5 rounded-lg text-[#8A8275] dark:text-gray-300 hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* ✅ Фильтр статусов — компактный селект */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider flex-shrink-0">
                Статус:
              </span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-[#E8E2D5] dark:border-dark-border bg-[#FBF9F4] dark:bg-dark-card text-sm font-bold text-[#1B2A4A] dark:text-white focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold truncate"
              >
                <option value="all">Все ({searchFiltered.length})</option>
                {STATUSES.map(s => {
                  const count = searchFiltered.filter(r => r.status === s.old).length
                  return (
                    <option key={s.old} value={s.old}>
                      {s.new} ({count})
                    </option>
                  )
                })}
              </select>
            </div>
            <span className="px-3 py-2 rounded-xl bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-sm font-bold text-[#1B2A4A] dark:text-white flex-shrink-0">
              Показано: <span className="text-[#C9A961]">{filteredRequests.length}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {filteredRequests.length === 0 ? (
          <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border mx-auto mb-4 flex items-center justify-center">
              <Globe size={28} className="text-[#8A8275] dark:text-gray-300" />
            </div>
            <p className="text-base font-medium text-[#1B2A4A] dark:text-white mb-1">
              {q ? 'Спецзаказов не найдено' : filter === 'all' ? 'Спецзаказов пока нет' : 'Нет заявок с таким статусом'}
            </p>
            <p className="text-sm text-[#8A8275] dark:text-gray-300">
              {q
                ? `По запросу «${searchQuery}» ничего нет`
                : filter === 'all'
                  ? 'Когда клиенты начнут отправлять заявки — они появятся здесь'
                  : 'Попробуйте выбрать другой фильтр'}
            </p>
          </div>
        ) : (
          /* ✅ СПИСОК СПЕЦЗАКАЗОВ — компактные строки-аккордеон */
          <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden divide-y divide-[#E8E2D5] dark:divide-dark-border">
            {filteredRequests.map((request) => {
              const requestLink =
                typeof request.link === 'string' && request.link.startsWith('http') ? request.link : null
              const requestName =
                request.product_name || (request.link && !requestLink ? request.link : null)
              const isOpen = expandedId === String(request.id)
              const priceInSums = request.manager_price
                ? Math.round(request.manager_price * (request.exchange_rate_at_order || 12100))
                : 0

              return (
                <div key={request.id}>
                  {/* ✅ Компактная строка */}
                  <button
                    onClick={() => setExpandedId(isOpen ? null : String(request.id))}
                    className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                      <Globe size={16} className="text-[#C9A961]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-[#1B2A4A] dark:text-white">
                          Спецзаказ №{request.id}
                        </p>
                        {request.image_url && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#8A8275] dark:text-gray-300">
                            📷
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5 truncate">
                        {new Date(request.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        {requestName ? ` · ${requestName}` : ''}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      {priceInSums > 0 ? (
                        <p className="text-sm font-bold text-[#C9A961]">
                          {priceInSums.toLocaleString('ru-RU')} сум
                        </p>
                      ) : (
                        <p className="text-xs text-[#8A8275] dark:text-gray-400">не оценён</p>
                      )}
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${getStatusColor(request.status)}`}>
                        {STATUSES.find(s => s.old === request.status)?.new || request.status}
                      </span>
                    </div>

                    <ChevronDown
                      size={18}
                      className={`text-[#8A8275] dark:text-gray-300 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* ✅ Раскрытые детали */}
                  {isOpen && (
                    <div className="px-4 pb-4 pt-3 bg-[#F5F1E8]/40 dark:bg-dark-accent/30 border-t border-[#E8E2D5] dark:border-dark-border space-y-3">
                      {/* Инфо-сетка */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {requestName && (
                          <InfoMini icon={<Tag size={14} className="text-[#1B2A4A] dark:text-white" />} label="Название товара">
                            {requestName}
                          </InfoMini>
                        )}
                        {requestLink && (
                          <InfoMini icon={<Link2 size={14} className="text-[#1B2A4A] dark:text-white" />} label="Ссылка на товар">
                            <a
                              href={requestLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#C9A961] hover:underline break-all"
                            >
                              {requestLink}
                            </a>
                          </InfoMini>
                        )}
                        {request.size_color && (
                          <InfoMini icon={<Ruler size={14} className="text-[#1B2A4A] dark:text-white" />} label="Размер / Цвет">
                            {request.size_color}
                          </InfoMini>
                        )}
                        {request.comment && (
                          <InfoMini icon={<MessageCircle size={14} className="text-[#1B2A4A] dark:text-white" />} label="Комментарий">
                            <span className="break-words whitespace-pre-wrap">{request.comment}</span>
                          </InfoMini>
                        )}
                        {request.user_id && (
                          <InfoMini icon={<MessageCircle size={14} className="text-[#1B2A4A] dark:text-white" />} label="Chat ID">
                            <span className="font-mono">{request.user_id}</span>
                          </InfoMini>
                        )}
                        {request.image_url && (
                          <InfoMini icon={<ImageIcon size={14} className="text-[#1B2A4A] dark:text-white" />} label="Фото товара">
                            <a
                              href={request.image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block"
                            >
                              <img
                                src={request.image_url}
                                alt="Product"
                                className="w-20 h-20 object-cover rounded-lg border border-[#E8E2D5] dark:border-dark-border hover:opacity-80 transition-opacity"
                              />
                            </a>
                          </InfoMini>
                        )}
                      </div>

                      {/* Оценка менеджера */}
                      {request.manager_price && (
                        <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-xl border border-[#C9A961]/30 dark:border-gold/40 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-[#C9A961]/20 dark:bg-gold/30 border border-[#C9A961]/40 dark:border-gold/50 flex items-center justify-center flex-shrink-0">
                                <DollarSign size={14} className="text-[#C9A961]" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] text-[#C9A961] uppercase tracking-wider font-bold">
                                  Оценка менеджера
                                </p>
                                <p className="text-sm font-bold text-[#C9A961]">
                                  ${request.manager_price} ≈ {priceInSums.toLocaleString('ru-RU')} сум
                                </p>
                              </div>
                            </div>
                          </div>
                          {request.manager_comment && (
                            <p className="mt-2 text-xs text-[#1B2A4A] dark:text-white bg-[#C9A961]/5 dark:bg-gold/10 border border-[#C9A961]/20 dark:border-gold/30 rounded-lg p-2 italic">
                              💬 {request.manager_comment}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Кнопки смены статуса */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider">
                          Статус:
                        </span>
                        {STATUSES
                          .filter(({ old }) => old !== request.status)
                          .map(({ old, new: newLabel }) => (
                            <button
                              key={old}
                              onClick={() => handleStatusChange(request.id, old, request.user_id)}
                              disabled={submitting}
                              className="px-3 py-1.5 bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border hover:border-[#C9A961] dark:hover:border-gold rounded-xl text-xs font-bold text-[#1B2A4A] dark:text-white transition-colors disabled:opacity-50"
                            >
                              {newLabel}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ✅ Модалка для ввода цены */}
      {showPriceModal && (
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            if (!submitting) {
              setShowPriceModal(false)
              setManagerPrice('')
              setManagerComment('')
            }
          }}
        >
          <div
            className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center">
                  <DollarSign size={18} className="text-purple-700 dark:text-purple-300" />
                </div>
                <h3 className="text-xl font-bold text-[#1B2A4A] dark:text-white">
                  Оценить №{selectedRequest?.id}
                </h3>
              </div>
              <button
                onClick={() => {
                  if (!submitting) {
                    setShowPriceModal(false)
                    setManagerPrice('')
                    setManagerComment('')
                  }
                }}
                disabled={submitting}
                className="p-2 rounded-lg hover:bg-[#F5F1E8] dark:hover:bg-dark-accent text-[#8A8275] dark:text-gray-300 transition-colors disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Инфо-плашка */}
            <div className="flex items-start gap-2.5 p-3 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-xl mb-5">
              <Info size={14} className="text-purple-600 dark:text-purple-300 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-purple-800 dark:text-purple-300 leading-relaxed">
                После сохранения клиенту будет отправлено уведомление с ценой и комментарием
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider mb-1.5 block">
                  Цена в USD *
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-3 bg-[#E8E2D5] dark:bg-dark-accent rounded-xl text-[#1B2A4A] dark:text-white font-bold">$</span>
                  <input
                    type="number"
                    value={managerPrice}
                    onChange={(e) => setManagerPrice(e.target.value)}
                    placeholder="200"
                    className="flex-1 px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-base font-bold"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider mb-1.5 block">
                  Комментарий (необязательно)
                </label>
                <textarea
                  value={managerComment}
                  onChange={(e) => setManagerComment(e.target.value)}
                  placeholder="Например: Доставка займёт 2-3 недели"
                  rows={3}
                  className="w-full px-4 py-3 border border-[#E8E2D5] dark:border-dark-border rounded-xl bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold text-sm resize-none placeholder:text-[#8A8275] dark:placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-6">
              <button
                onClick={() => {
                  if (!submitting) {
                    setShowPriceModal(false)
                    setManagerPrice('')
                    setManagerComment('')
                  }
                }}
                disabled={submitting}
                className="px-4 py-3 rounded-xl bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white font-bold hover:bg-[#E8E2D5] dark:hover:bg-dark-border transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handlePriceSubmit}
                disabled={submitting || !managerPrice}
                className="px-4 py-3 rounded-xl bg-[#C9A961] text-white font-bold hover:bg-[#b8954f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Отправить
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Модалка для отклонения с причиной */}
      {showRejectModal && (
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            if (!submitting) {
              setShowRejectModal(false)
              setRejectReason('')
            }
          }}
        >
          <div
            className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 flex items-center justify-center">
                  <XCircle size={18} className="text-[#9B3B3B] dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-[#9B3B3B] dark:text-red-400">
                  Отклонить №{selectedRequest?.id}
                </h3>
              </div>
              <button
                onClick={() => {
                  if (!submitting) {
                    setShowRejectModal(false)
                    setRejectReason('')
                  }
                }}
                disabled={submitting}
                className="p-2 rounded-lg hover:bg-[#F5F1E8] dark:hover:bg-dark-accent text-[#8A8275] dark:text-gray-300 transition-colors disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Инфо-плашка */}
            <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl mb-5">
              <Info size={14} className="text-red-600 dark:text-red-300 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
                Укажите причину отклонения — это сообщение будет отправлено клиенту
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider mb-1.5 block">
                Причина отклонения *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Например: Товар снят с производства / Не можем найти поставщика / Слишком долгая доставка"
                rows={4}
                className="w-full px-4 py-3 border border-red-200 dark:border-red-500/30 rounded-xl bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white focus:outline-none focus:border-[#9B3B3B] dark:focus:border-red-400 text-sm resize-none placeholder:text-[#8A8275] dark:placeholder:text-gray-500"
                autoFocus
              />
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-1.5">
                {rejectReason.trim().length < 5 ? (
                  <span className="text-[#9B3B3B] dark:text-red-400">
                    Минимум 5 символов ({rejectReason.trim().length}/5)
                  </span>
                ) : (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ {rejectReason.trim().length} символов
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-6">
              <button
                onClick={() => {
                  if (!submitting) {
                    setShowRejectModal(false)
                    setRejectReason('')
                  }
                }}
                disabled={submitting}
                className="px-4 py-3 rounded-xl bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white font-bold hover:bg-[#E8E2D5] dark:hover:bg-dark-border transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={submitting || rejectReason.trim().length < 5}
                className="px-4 py-3 rounded-xl bg-[#9B3B3B] text-white font-bold hover:bg-[#7a2f2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <XCircle size={14} />
                    Отклонить
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
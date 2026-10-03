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
  Clock,
  Send,
  XCircle,
  Info,
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

export default function ChinaPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')

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

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter)

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

      {/* ✅ Sticky-шапка: назад слева, заголовок+иконка по центру, кнопка refresh справа */}
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

          {/* ✅ Переключатель фильтров — pills со счётчиками */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                filter === 'all'
                  ? 'bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A]'
                  : 'bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#F5F1E8] dark:hover:bg-dark-accent'
              }`}
            >
              Все <span className="opacity-70">({requests.length})</span>
            </button>
            {STATUSES.map(({ old, new: newLabel }) => {
              const count = requests.filter(r => r.status === old).length
              return (
                <button
                  key={old}
                  onClick={() => setFilter(old)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                    filter === old
                      ? 'bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A]'
                      : 'bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white hover:bg-[#F5F1E8] dark:hover:bg-dark-accent'
                  }`}
                >
                  {newLabel} <span className="opacity-70">({count})</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {filteredRequests.length === 0 ? (
          <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border mx-auto mb-4 flex items-center justify-center">
              <Globe size={28} className="text-[#8A8275] dark:text-gray-300" />
            </div>
            <p className="text-base font-medium text-[#1B2A4A] dark:text-white mb-1">
              {filter === 'all' ? 'Спецзаказов пока нет' : 'Нет заявок с таким статусом'}
            </p>
            <p className="text-sm text-[#8A8275] dark:text-gray-300">
              {filter === 'all'
                ? 'Когда клиенты начнут отправлять заявки — они появятся здесь'
                : 'Попробуйте выбрать другой фильтр'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              // ✅ Разделяем ссылку и название (как в приложении)
              const requestLink =
                typeof request.link === 'string' && request.link.startsWith('http') ? request.link : null
              const requestName =
                request.product_name || (request.link && !requestLink ? request.link : null)

              return (
                <div
                  key={request.id}
                  className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border overflow-hidden"
                >
                  {/* ✅ Шапка карточки: номер + дата + статус-пилла */}
                  <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-[#E8E2D5] dark:border-dark-border">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-lg font-bold text-[#1B2A4A] dark:text-white truncate">
                          Спецзаказ №{request.id}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#8A8275] dark:text-gray-300">
                        <Clock size={12} />
                        <span>{new Date(request.created_at).toLocaleString('ru-RU')}</span>
                      </div>
                      {request.user_id && (
                        <div className="flex items-center gap-2 text-xs text-[#8A8275] dark:text-gray-300 mt-1">
                          <span className="font-mono">Chat ID: {request.user_id}</span>
                        </div>
                      )}
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${getStatusColor(request.status)}`}>
                      {STATUSES.find(s => s.old === request.status)?.new || request.status}
                    </span>
                  </div>

                  {/* ✅ Строки-иконки с данными (как в приложении) */}
                  <div className="divide-y divide-[#E8E2D5] dark:divide-dark-border">
                    {requestName && (
                      <div className="flex items-start gap-3 p-4">
                        <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                          <Tag size={16} className="text-[#1B2A4A] dark:text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#8A8275] dark:text-gray-300 mb-0.5">
                            Название товара
                          </p>
                          <p className="text-sm font-medium text-[#1B2A4A] dark:text-white break-words">
                            {requestName}
                          </p>
                        </div>
                      </div>
                    )}

                    {requestLink && (
                      <div className="flex items-start gap-3 p-4">
                        <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                          <Link2 size={16} className="text-[#1B2A4A] dark:text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#8A8275] dark:text-gray-300 mb-0.5">
                            Ссылка на товар
                          </p>
                          <a
                            href={requestLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-[#1B2A4A] dark:text-white hover:text-[#C9A961] dark:hover:text-gold hover:underline break-all"
                          >
                            {requestLink}
                          </a>
                        </div>
                      </div>
                    )}

                    {request.size_color && (
                      <div className="flex items-start gap-3 p-4">
                        <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                          <Ruler size={16} className="text-[#1B2A4A] dark:text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#8A8275] dark:text-gray-300 mb-0.5">
                            Размер / Цвет
                          </p>
                          <p className="text-sm font-medium text-[#1B2A4A] dark:text-white">
                            {request.size_color}
                          </p>
                        </div>
                      </div>
                    )}

                    {request.comment && (
                      <div className="flex items-start gap-3 p-4">
                        <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                          <MessageCircle size={16} className="text-[#1B2A4A] dark:text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#8A8275] dark:text-gray-300 mb-0.5">
                            Комментарий клиента
                          </p>
                          <p className="text-sm font-medium text-[#1B2A4A] dark:text-white break-words">
                            {request.comment}
                          </p>
                        </div>
                      </div>
                    )}

                    {request.image_url && (
                      <div className="flex items-start gap-3 p-4">
                        <div className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                          <ImageIcon size={16} className="text-[#1B2A4A] dark:text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#8A8275] dark:text-gray-300 mb-1.5">
                            Фото товара
                          </p>
                          <a
                            href={request.image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                          >
                            <img
                              src={request.image_url}
                              alt="Product"
                              className="w-28 h-28 object-cover rounded-xl border border-[#E8E2D5] dark:border-dark-border hover:opacity-80 transition-opacity"
                            />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* ✅ Оценка менеджера */}
                    {request.manager_price && (
                      <div className="flex items-start gap-3 p-4 bg-[#C9A961]/5 dark:bg-gold/10">
                        <div className="w-9 h-9 rounded-full bg-[#C9A961]/20 dark:bg-gold/30 border border-[#C9A961]/30 dark:border-gold/50 flex items-center justify-center flex-shrink-0">
                          <DollarSign size={16} className="text-[#C9A961]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#C9A961] mb-0.5">
                            Цена менеджера
                          </p>
                          <p className="text-lg font-bold text-[#C9A961]">
                            ${request.manager_price}
                          </p>
                          {request.manager_comment && (
                            <p className="text-sm text-[#1B2A4A] dark:text-white mt-2 italic">
                              💬 {request.manager_comment}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ✅ Кнопки смены статуса — футер с flex-wrap */}
                  <div className="p-4 pt-3 border-t border-[#E8E2D5] dark:border-dark-border bg-[#F5F1E8]/40 dark:bg-dark-accent/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
                        <Send size={12} className="text-[#8A8275] dark:text-gray-300" />
                      </div>
                      <p className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider">
                        Сменить статус
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.filter(({ old }) => old !== request.status).map(({ old, new: newLabel }) => (
                        <button
                          key={old}
                          onClick={() => handleStatusChange(request.id, old, request.user_id)}
                          disabled={submitting}
                          className="px-3.5 py-2 bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border hover:border-[#C9A961] dark:hover:border-gold hover:bg-white dark:hover:bg-dark-border rounded-xl text-xs font-bold text-[#1B2A4A] dark:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {newLabel}
                        </button>
                      ))}
                    </div>
                  </div>
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
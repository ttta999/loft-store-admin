import {t,tx,uiError,getAdminLocale,useAdminLanguage} from '../lib/i18n'
import ProtectedFile from '../components/ProtectedFile'
import PageSkeleton from '../components/PageSkeleton'
import { useAdminRefresh } from '../lib/adminLive'
import { displayMoney, moneyNumber } from '../lib/money'
import { dataCache } from '../lib/resourceCache'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getChinaRequests, updateChinaRequestStatus, supabase } from '../lib/supabase'
import { chinaCacheApi } from '../lib/cache'
import { toast } from 'sonner'
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
  { old: 'На оценке', new: 'На оценке', color: 'yellow' },
  { old: 'Оценён', new: 'Оценён ', color: 'purple' },
  { old: 'Оформлен', new: 'Оформлен', color: 'green' },
  { old: 'Отменён', new: 'Отменён', color: 'orange' },
  { old: 'Отклонён', new: 'Отклонён ', color: 'red' },
]

const getStatusColor = (status: string) => {
  return {
    'На оценке': 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30',
    'Оценён': 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30',
    'Оформлен': 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-500/30',
    'Отменён': 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-500/30',
    'Отклонён': 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-500/30',
  }[status] || 'bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-500/30'
}

// ✅ Компактная мини-строка информации внутри раскрытой карточки (как в OrdersPage)
function InfoMini({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
 useAdminLanguage()

  return (
    <div className="flex items-start gap-2.5 p-2.5 bg-[#FBF9F4] dark:bg-dark-card rounded-xl border border-[#E8E2D5] dark:border-dark-border">
      <div className="w-8 h-8 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-[#8A8275] dark:text-gray-300 uppercase tracking-wider font-bold">{tx(label)}</p>
        <div className="text-xs font-medium text-[#1B2A4A] dark:text-white mt-0.5 break-all">{children}</div>
      </div>
    </div>
  )
}

export default function ChinaPage() {
 useAdminLanguage()

  const navigate = useNavigate()
  const [params]=useSearchParams()
  const [exchangeRate, setExchangeRate] = useState<number | null>(() => dataCache.get<number>('admin:exchange-rate'))
  const [requests, setRequests] = useState<any[]>(() => chinaCacheApi.get() || [])
  const [loading, setLoading] = useState(() => !chinaCacheApi.get())
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState(params.get('status')||'all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(params.get('request'))

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

  useAdminRefresh(['china_requests', 'settings'], () => loadRequests(false, true))

  const loadRequests = async (forceRefresh = false, background = false) => {
    const cached = !forceRefresh ? chinaCacheApi.get() : null
    if (forceRefresh) {
      setRefreshing(true)
      dataCache.invalidate('admin:exchange-rate')
    } else if (!cached) if (!background) setLoading(true)
    try {
      const [data, rate] = await Promise.all([
        cached ? Promise.resolve(cached) : getChinaRequests(),
        dataCache.load('admin:exchange-rate', async () => {
          const { data, error } = await supabase.from('settings').select('value').eq('key', 'exchange_rate').single()
          if (error) throw error
          const rate = Number(data?.value?.rate)
          if (!Number.isFinite(rate) || rate <= 0) throw new Error('Курс магазина недоступен')
          return rate
        }, 60_000).catch(error => { console.error('Ошибка загрузки курса магазина:', error); return null }),
      ])
      setExchangeRate(rate)
      setRequests(data)
      chinaCacheApi.set(data)
    } catch (error) {
      console.error('Ошибка загрузки спецзаказов:', error)
      toast.error(uiError('Ошибка загрузки спецзаказов'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    chinaCacheApi.invalidate()
    loadRequests(true)
  }

  const handleStatusChange = (requestId: string, newStatus: string, _clientChatId: string) => {
    const request = requests.find(r => String(r.id) === String(requestId))
    if (!request || request.status !== 'На оценке') return
    setSelectedRequest(request)
    if (newStatus === 'Оценён') setShowPriceModal(true)
    if (newStatus === 'Отклонён') setShowRejectModal(true)
  }
  const handlePriceSubmit = async () => {
    if (submitting || !selectedRequest) return
    const price = Number(managerPrice)
    if (!Number.isFinite(price) || price <= 0 || price > 1000000 || Math.abs(price * 100 - Math.round(price * 100)) > 0.000001) { toast.error(uiError('Укажите цену в USD с точностью до цента')); return }
    setSubmitting(true)
    try {
      await updateChinaRequestStatus(selectedRequest.id, 'Оценён', { manager_price: price, manager_comment: managerComment })
      toast.success(tx(t("Оценка сохранена. Уведомление добавлено в очередь.")))
      setShowPriceModal(false); setManagerPrice(''); setManagerComment('')
      chinaCacheApi.invalidate(); await loadRequests(true)
    } catch (error: any) { toast.error(uiError(error.message || 'Не удалось сохранить оценку')) }
    finally { setSubmitting(false) }
  }
  const handleRejectSubmit = async () => {
    if (submitting || !selectedRequest || !rejectReason.trim()) return
    setSubmitting(true)
    try {
      await updateChinaRequestStatus(selectedRequest.id, 'Отклонён', { rejection_reason: rejectReason.trim() })
      toast.success(tx(t("Заявка отклонена. Уведомление добавлено в очередь.")))
      setShowRejectModal(false); setRejectReason('')
      chinaCacheApi.invalidate(); await loadRequests(true)
    } catch (error: any) { toast.error(uiError(error.message || 'Не удалось отклонить заявку')) }
    finally { setSubmitting(false) }
  }

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

  if(loading)return <PageSkeleton title={t("Спецзаказы")}/>

  return (
    <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg">

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
              {t("На главную")}</button>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#1B2A4A] dark:text-white">{t("Спецзаказы")}</h1>
              <span className="w-10 h-10 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center">
                <Globe size={18} className="text-[#C9A961]" />
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#1B2A4A] dark:text-white bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors disabled:opacity-50"
              title={t("Обновить список")}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {t("Обновить")}</button>
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
              placeholder={t("Поиск: № заявки, название, ссылка...")}
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
                {t("Статус:")}</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-[#E8E2D5] dark:border-dark-border bg-[#FBF9F4] dark:bg-dark-card text-sm font-bold text-[#1B2A4A] dark:text-white focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold truncate"
              >
                <option value="all">{t("Все (")}{searchFiltered.length})</option>
                {STATUSES.map(s => {
                  const count = searchFiltered.filter(r => r.status === s.old).length
                  return (
                    <option key={s.old} value={s.old}>
                      {tx(s.new)} ({tx(count)})
                    </option>
                  )
                })}
              </select>
            </div>
            <span className="px-3 py-2 rounded-xl bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-sm font-bold text-[#1B2A4A] dark:text-white flex-shrink-0">
              {t("Показано:")}{' '}<span className="text-[#C9A961]">{filteredRequests.length}</span>
            </span>
          </div>
        </div>
      </div>

      <div data-loft-content className="max-w-5xl mx-auto p-6">
        {filteredRequests.length === 0 ? (
          <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border mx-auto mb-4 flex items-center justify-center">
              <Globe size={28} className="text-[#8A8275] dark:text-gray-300" />
            </div>
            <p className="text-base font-medium text-[#1B2A4A] dark:text-white mb-1">
              {q?t("Спецзаказов не найдено"):filter === 'all'?t("Спецзаказов пока нет"):t("Нет заявок с таким статусом")}
            </p>
            <p className="text-sm text-[#8A8275] dark:text-gray-300">
              {q?t("По запросу «{0}» ничего нет",[searchQuery]):filter === 'all'?t("Когда клиенты начнут отправлять заявки — они появятся здесь"):t("Попробуйте выбрать другой фильтр")}
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
              const priceInSums = request.manager_price && exchangeRate !== null
                ? Math.round(request.manager_price * exchangeRate)
                : null

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
                          {t("Спецзаказ №")}{request.id}
                        </p>
                      </div>
                      <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5 truncate">
                        {new Date(request.created_at).toLocaleString(getAdminLocale(), { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        {requestName ? ` · ${requestName}` : ''}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      {request.manager_price ? (
                        <p className="text-sm font-bold text-[#C9A961]">
                          {priceInSums !== null ? displayMoney(priceInSums,'UZS') : `$${request.manager_price}`}
                        </p>
                      ) : (
                        <p className="text-xs text-[#8A8275] dark:text-gray-400">{t("не оценён")}</p>
                      )}
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${getStatusColor(request.status)}`}>
                        {tx(STATUSES.find(s => s.old === request.status)?.new || request.status)}
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
                          <InfoMini icon={<Tag size={14} className="text-[#1B2A4A] dark:text-white" />} label={t("Название товара")}>
                            {requestName}
                          </InfoMini>
                        )}
                        {requestLink && (
                          <InfoMini icon={<Link2 size={14} className="text-[#1B2A4A] dark:text-white" />} label={t("Ссылка на товар")}>
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
                          <InfoMini icon={<Ruler size={14} className="text-[#1B2A4A] dark:text-white" />} label={t("Размер / Цвет")}>
                            {request.size_color}
                          </InfoMini>
                        )}
                        {request.comment && (
                          <InfoMini icon={<MessageCircle size={14} className="text-[#1B2A4A] dark:text-white" />} label={t("Комментарий")}>
                            <span className="break-words whitespace-pre-wrap">{request.comment}</span>
                          </InfoMini>
                        )}
                        {request.user_id && (
                          <InfoMini icon={<MessageCircle size={14} className="text-[#1B2A4A] dark:text-white" />} label="Chat ID">
                            <span className="font-mono">{request.user_id}</span>
                          </InfoMini>
                        )}
                        {request.image_url && (
                          <InfoMini icon={<ImageIcon size={14} className="text-[#1B2A4A] dark:text-white" />} label={t("Фото товара")}>
                            <ProtectedFile
                              value={request.image_url} bucket="china-requests" imageClassName="w-20 h-20 object-cover rounded-lg border border-[#E8E2D5] dark:border-dark-border hover:opacity-80 transition-opacity" aria-label={t("Фото товара")}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block"
                            >

                            </ProtectedFile>
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
                                  {t("Оценка менеджера")}</p>
                                <p className="text-sm font-bold text-[#C9A961]">
                                  ${request.manager_price} ≈ {priceInSums !== null ? moneyNumber(priceInSums,'UZS') : '—'} {' '}{t("сум")}</p>
                              </div>
                            </div>
                          </div>
                          {request.manager_comment && (
                            <p className="mt-2 text-xs text-[#1B2A4A] dark:text-white bg-[#C9A961]/5 dark:bg-gold/10 border border-[#C9A961]/20 dark:border-gold/30 rounded-lg p-2 italic">
                               {request.manager_comment}
                            </p>
                          )}
                        </div>
                      )}

                      {request.rejection_reason && <InfoMini icon={<Info size={14} />} label={t("Причина отказа")}>{request.rejection_reason}</InfoMini>}
                      {(request.converted_to_order_id || request.reserved_order_id) && <button onClick={() => navigate(`/orders?order=${request.converted_to_order_id || request.reserved_order_id}`)} className="py-2 px-3 rounded-xl bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] font-bold">{t("Перейти к заказу №")}{request.converted_to_order_id || request.reserved_order_id}</button>}
                      {/* Кнопки смены статуса */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider">
                          {t("Статус:")}</span>
                        {STATUSES
                          .filter(({ old }) => request.status === 'На оценке' && ['Оценён', 'Отклонён'].includes(old))
                          .map(({ old, new: newLabel }) => (
                            <button
                              key={old}
                              onClick={() => handleStatusChange(request.id, old, request.user_id)}
                              disabled={submitting}
                              className="px-3 py-1.5 bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border hover:border-[#C9A961] dark:hover:border-gold rounded-xl text-xs font-bold text-[#1B2A4A] dark:text-white transition-colors disabled:opacity-50"
                            >
                              {tx(newLabel)}
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
          className="loft-modal fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
                  {t("Оценить №")}{selectedRequest?.id}
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
                {t("После сохранения клиенту будет отправлено уведомление с ценой и комментарием")}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider mb-1.5 block">
                  {t("Цена в USD *")}</label>
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
                  {t("Комментарий (необязательно)")}</label>
                <textarea
                  value={managerComment}
                  onChange={(e) => setManagerComment(e.target.value)}
                  placeholder={t("Например: Доставка займёт 2-3 недели")}
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
                {t("Отмена")}</button>
              <button
                onClick={handlePriceSubmit}
                disabled={submitting || !managerPrice}
                className="px-4 py-3 rounded-xl bg-[#C9A961] text-white font-bold hover:bg-[#b8954f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    {t("Отправка...")}</>
                ) : (
                  <>
                    <Send size={14} />
                    {t("Отправить")}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Модалка для отклонения с причиной */}
      {showRejectModal && (
        <div
          className="loft-modal fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
                  {t("Отклонить №")}{selectedRequest?.id}
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
                {t("Укажите причину отклонения — это сообщение будет отправлено клиенту")}</p>
            </div>

            <div>
              <label className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider mb-1.5 block">
                {t("Причина отклонения *")}</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t("Например: Товар снят с производства / Не можем найти поставщика / Слишком долгая доставка")}
                rows={4}
                className="w-full px-4 py-3 border border-red-200 dark:border-red-500/30 rounded-xl bg-white dark:bg-dark-accent text-[#1B2A4A] dark:text-white focus:outline-none focus:border-[#9B3B3B] dark:focus:border-red-400 text-sm resize-none placeholder:text-[#8A8275] dark:placeholder:text-gray-500"
                autoFocus
              />
              <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-1.5">
                {rejectReason.trim().length < 5 ? (
                  <span className="text-[#9B3B3B] dark:text-red-400">
                    {t("Минимум 5 символов (")}{rejectReason.trim().length}/5)
                  </span>
                ) : (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ {rejectReason.trim().length} {' '}{t("символов")}</span>
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
                {t("Отмена")}</button>
              <button
                onClick={handleRejectSubmit}
                disabled={submitting || rejectReason.trim().length < 5}
                className="px-4 py-3 rounded-xl bg-[#9B3B3B] text-white font-bold hover:bg-[#7a2f2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    {t("Отправка...")}</>
                ) : (
                  <>
                    <XCircle size={14} />
                    {t("Отклонить")}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

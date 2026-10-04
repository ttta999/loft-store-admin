import { useState, useEffect, useRef } from 'react'
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

// ✅ Module-level кеш: переживает размонтирование компонента,
// чтобы при открытии/закрытии дропдауна не было повторных запросов
let notificationsCache: OrderNotification[] | null = null
let notificationsCacheTimestamp = 0
let notificationsLastSeen: string = ''
const NOTIFICATIONS_TTL = 30_000 // 30 секунд (совпадает с интервалом polling)

export default function NotificationBell() {
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const bellButtonRef = useRef<HTMLButtonElement>(null)

  const [newOrders, setNewOrders] = useState<OrderNotification[]>([])
  const [open, setOpen] = useState(false)
  const [lastSeen, setLastSeen] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || new Date().toISOString()
  })

  const loadNewOrders = async (force = false) => {
    // ✅ Кеш: если lastSeen не изменился и кеш свежий — возвращаем без запроса
    if (
      !force &&
      notificationsLastSeen === lastSeen &&
      notificationsCache &&
      Date.now() - notificationsCacheTimestamp < NOTIFICATIONS_TTL
    ) {
      setNewOrders(notificationsCache)
      return
    }

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
      const list = data || []
      notificationsCache = list
      notificationsCacheTimestamp = Date.now()
      notificationsLastSeen = lastSeen
      setNewOrders(list)
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error)
    }
  }

  // ✅ Polling каждые 30 секунд
  useEffect(() => {
    loadNewOrders(true)
    const interval = setInterval(() => loadNewOrders(), 30_000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSeen])

  // ✅ Клик вне дропдауна закрывает его
  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        bellButtonRef.current &&
        !bellButtonRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // ✅ Закрытие по Escape
  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open])

  const markAllRead = () => {
    const now = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, now)
    setLastSeen(now)
    setNewOrders([])
    setOpen(false)
    // Сбрасываем кеш, чтобы следующий polling увидел актуальные данные
    notificationsCache = null
    notificationsCacheTimestamp = 0
  }

  // ✅ Относительное форматирование времени: «только что», «5 мин назад», «2 ч назад», «12.10»
  const formatTime = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime()
    if (diff < 0) return 'только что'
    const mins = Math.floor(diff / 60_000)
    if (mins < 1) return 'только что'
    if (mins < 60) return `${mins} мин назад`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} ч назад`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} дн назад`
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
    })
  }

  const formatPrice = (o: OrderNotification) =>
    o.total_price_uzs
      ? `${Number(o.total_price_uzs).toLocaleString('ru-RU')} сум`
      : `$${o.total_price_usd}`

  return (
    <div className="relative">
      {/* ✅ Кнопка-колокольчик в стиле кнопок админки (круглая с border) */}
      <button
        ref={bellButtonRef}
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors text-[#1B2A4A] dark:text-white"
        title="Уведомления о новых заказах"
      >
        <Bell size={18} />
        {newOrders.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[#9B3B3B] dark:bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#F5F1E8] dark:border-dark-bg shadow animate-pulse">
            {newOrders.length > 99 ? '99+' : newOrders.length}
          </span>
        )}
      </button>

      {/* ✅ Дропдаун в стиле карточки заказа */}
      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-12 w-80 bg-[#FBF9F4] dark:bg-dark-card rounded-2xl shadow-2xl border border-[#E8E2D5] dark:border-dark-border z-50 overflow-hidden"
        >
          {/* Шапка карточки — как шапка заказа */}
          <div className="p-4 border-b border-[#E8E2D5] dark:border-dark-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                <Bell size={18} className="text-[#1B2A4A] dark:text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-[#1B2A4A] dark:text-white truncate">
                  Новые заказы
                </p>
                <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5 truncate">
                  {newOrders.length > 0
                    ? `${newOrders.length} непрочитанных`
                    : 'Все прочитаны'}
                </p>
              </div>
            </div>
            {newOrders.length > 0 && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#9B3B3B]/10 dark:bg-red-500/20 text-[#9B3B3B] dark:text-red-300 border border-[#9B3B3B]/20 dark:border-red-500/30 whitespace-nowrap flex-shrink-0">
                NEW
              </span>
            )}
          </div>

          {/* Тело — строки-иконки с divide-y */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#E8E2D5] dark:divide-dark-border">
            {newOrders.length === 0 ? (
              /* ✅ Пустое состояние — как EmptyStateCard */
              <div className="p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border mx-auto mb-3 flex items-center justify-center">
                  <Bell size={22} className="text-[#8A8275] dark:text-gray-300" />
                </div>
                <p className="text-sm font-medium text-[#1B2A4A] dark:text-white mb-1">
                  Нет новых заказов
                </p>
                <p className="text-xs text-[#8A8275] dark:text-gray-300">
                  Уведомления появятся здесь
                </p>
              </div>
            ) : (
              newOrders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => {
                    setOpen(false)
                    navigate('/orders')
                  }}
                  className="w-full text-left p-3.5 hover:bg-[#F5F1E8] dark:hover:bg-dark-accent flex gap-3 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-[#1B2A4A]/10 dark:bg-gold/20 text-[#1B2A4A] dark:text-gold flex items-center justify-center flex-shrink-0 border border-[#E8E2D5] dark:border-dark-border">
                    <Package size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-bold text-[#1B2A4A] dark:text-white truncate">
                        Заказ №{o.id}
                      </p>
                      <span className="text-[10px] text-[#8A8275] dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                        {formatTime(o.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-[#8A8275] dark:text-gray-300 truncate">
                      {o.client_name}
                    </p>
                    <p className="text-xs font-bold text-[#1B2A4A] dark:text-white mt-0.5">
                      {formatPrice(o)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Футер с кнопкой «Отметить прочитанными» */}
          {newOrders.length > 0 && (
            <div className="p-3 border-t border-[#E8E2D5] dark:border-dark-border bg-[#F5F1E8]/40 dark:bg-dark-accent/30">
              <button
                onClick={markAllRead}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-[#1B2A4A] dark:text-white bg-white dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border hover:bg-[#F5F1E8] dark:hover:bg-dark-border transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCheck size={14} />
                Отметить все прочитанными
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
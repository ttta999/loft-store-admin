import {t,tx,getAdminLocale,useAdminLanguage} from '../lib/i18n'
import { useAdminRefresh } from '../lib/adminLive'
import {formatOrderMoney} from '../lib/orderState'
import {getRefunds} from '../lib/refunds'
import { specialOrderIds } from '../lib/specialOrders'
import { readAll } from '../lib/readAll'
import { dataCache } from '../lib/resourceCache'
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Package, Globe } from 'lucide-react'
import { supabase, getAdminCacheScope } from '../lib/supabase'

interface AdminNotification {
  kind: 'order' | 'request' | 'refund'
  receipt_submitted_at?:string
  order_id?:number
  order_currency?:string
  exchange_rate_at_order?:number
  id: number
  created_at: string
  client_name?: string
  special_order_id?: number | null
  items?: any[]
  product_name?: string
  total_price_usd?: number
  total_price_uzs?: number | null
  status: string
}

const STORAGE_KEY = 'admin_orders_last_seen'

// ✅ Module-level кеш: переживает размонтирование компонента,
// чтобы при открытии/закрытии дропдауна не было повторных запросов
const NOTIFICATIONS_TTL = 30_000
const seenStorageKey = () => `${STORAGE_KEY}:${getAdminCacheScope()}`

export default function NotificationBell() {
 useAdminLanguage()

  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const bellButtonRef = useRef<HTMLButtonElement>(null)

  const loadGeneration = useRef(0)
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [open, setOpen] = useState(false)
  const [present, setPresent] = useState(false)
  const motionFrame = useRef<{ opacity: string; transform: string } | null>(null)
  useLayoutEffect(() => {
    if (!present) { motionFrame.current = null; return }
    const element = dropdownRef.current
    if (!element) return
    element.inert = !open
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const animation = element.animate([
      motionFrame.current || { opacity: '0', transform: 'translateY(-4px) scale(0.97)' },
      { opacity: open ? '1' : '0', transform: open ? 'translateY(0px) scale(1)' : 'translateY(-2px) scale(0.99)' },
    ], { duration: reduce ? 0 : open ? 250 : 150, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' })
    let active = true
    void animation.finished.then(() => { if (active && !open) setPresent(false) }).catch(() => {})
    return () => {
      active = false
      const style = getComputedStyle(element)
      motionFrame.current = { opacity: style.opacity, transform: style.transform }
      animation.cancel()
    }
  }, [open, present])
  const [lastSeen, setLastSeen] = useState<string>(() => {
    return localStorage.getItem(seenStorageKey()) || dataCache.get<{ lastSeen: string }>('admin:notifications')?.lastSeen || new Date(0).toISOString()
  })

  const loadNotifications = async (force = false) => {
    const generation = ++loadGeneration.current
    const scope = getAdminCacheScope()
    const cached = !force ? dataCache.get<{ lastSeen: string; list: AdminNotification[] }>('admin:notifications') : null
    if (cached && cached.lastSeen === lastSeen) { setNotifications(cached.list); return }
    try {
      const [orders, requests, refunds] = await Promise.all([
        readAll<Omit<AdminNotification, 'kind'>>(supabase.from('orders')
          .select('id, created_at, client_name, special_order_id, items, total_price_usd, total_price_uzs, order_currency, exchange_rate_at_order, receipt_submitted_at, status')
          .or(`created_at.gt.${lastSeen},receipt_submitted_at.gt.${lastSeen}`).order('created_at', { ascending: false })),
        readAll<Omit<AdminNotification, 'kind'>>(supabase.from('china_requests')
          .select('id, created_at, product_name, status')
          .gt('created_at', lastSeen).order('created_at', { ascending: false })),
        getRefunds(force),
      ])
      if (orders.error || requests.error) throw orders.error || requests.error
      if (generation !== loadGeneration.current || scope !== getAdminCacheScope()) return
      const list: AdminNotification[] = [
        ...(orders.data || []).map(row => ({ ...row, created_at:row.receipt_submitted_at||row.created_at, kind: 'order' as const })),
        ...refunds.filter(r=>Date.parse(r.created_at)>Date.parse(lastSeen)&&['Проверка платежа','Ожидает возврата'].includes(r.status)).map(r=>({...r,kind:'refund' as const})),
        ...(requests.data || []).map(row => ({ ...row, kind: 'request' as const })),
      ].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
      dataCache.set('admin:notifications', { list, lastSeen }, NOTIFICATIONS_TTL)
      setNotifications(list)
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error)
    }
  }

  useAdminRefresh(['orders','china_requests','refunds'],()=>loadNotifications())

  // ✅ Polling каждые 30 секунд
  useEffect(() => {
    loadNotifications()
    const interval = setInterval(() => loadNotifications(true), 30_000)
    return () => { clearInterval(interval); loadGeneration.current++ }
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
    const now = notifications.reduce((latest, item) => Date.parse(item.created_at) > Date.parse(latest) ? item.created_at : latest, lastSeen)
    loadGeneration.current++
    localStorage.setItem(seenStorageKey(), now)
    setLastSeen(now)
    setNotifications([])
    setOpen(false)
    // Сбрасываем кеш, чтобы следующий polling увидел актуальные данные
    dataCache.invalidate('admin:notifications')
    dataCache.invalidate('http:')
  }

  // ✅ Относительное форматирование времени: «только что», «5 мин назад», «2 ч назад», «12.10»
  const formatTime = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime()
    if (diff < 0) return t('только что')
    const mins = Math.floor(diff / 60_000)
    if (mins < 1) return t('только что')
    if (mins < 60) return t('{0} мин назад',[mins])
    const hours = Math.floor(mins / 60)
    if (hours < 24) return t('{0} ч назад',[hours])
    const days = Math.floor(hours / 24)
    if (days < 7) return t('{0} дн назад',[days])
    return new Date(dateStr).toLocaleDateString(getAdminLocale(), {
      day: '2-digit',
      month: '2-digit',
    })
  }

  const formatPrice = (o: AdminNotification) => o.kind==='order'?formatOrderMoney(o):o.status

  return (
    <div className="relative">
      {/* ✅ Кнопка-колокольчик в стиле кнопок админки (круглая с border) */}
      <button
        ref={bellButtonRef}
        aria-expanded={open}
        onClick={() => { if (!open) { setPresent(true); void loadNotifications(true) } setOpen(!open) }}
        className="relative w-10 h-10 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors text-[#1B2A4A] dark:text-white"
        title={t("Уведомления о новых заказах и спецзаказах")}
      >
        <Bell size={18} />
        {notifications.length > 0 && (
          <span data-notification-count className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[#9B3B3B] dark:bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#F5F1E8] dark:border-dark-bg shadow animate-pulse">
            {notifications.length > 99 ? '99+' : notifications.length}
          </span>
        )}
      </button>

      {/* ✅ Дропдаун в стиле карточки заказа */}
      {present && (
        <div
          ref={dropdownRef}
          data-notification-menu aria-hidden={!open}
          style={{ transition: 'none', pointerEvents: open ? 'auto' : 'none' }}
          className="absolute left-0 sm:left-auto sm:right-0 top-12 w-80 max-w-[calc(100vw-3rem)] origin-top-left sm:origin-top-right bg-[#FBF9F4] dark:bg-dark-card rounded-2xl shadow-2xl border border-[#E8E2D5] dark:border-dark-border z-50 overflow-hidden"
        >
          {/* Шапка карточки — как шапка заказа */}
          <div className="p-4 border-b border-[#E8E2D5] dark:border-dark-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center flex-shrink-0">
                <Bell size={18} className="text-[#1B2A4A] dark:text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-[#1B2A4A] dark:text-white truncate">
                  {t("Новые заказы и спецзаказы")}</p>
                <p className="text-xs text-[#8A8275] dark:text-gray-300 mt-0.5 truncate">
                  {notifications.length > 0?t("{0} непрочитанных",[notifications.length]):t("Все прочитаны")}
                </p>
              </div>
            </div>
            {notifications.length > 0 && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#9B3B3B]/10 dark:bg-red-500/20 text-[#9B3B3B] dark:text-red-300 border border-[#9B3B3B]/20 dark:border-red-500/30 whitespace-nowrap flex-shrink-0">
                NEW
              </span>
            )}
          </div>

          {/* Тело — строки-иконки с divide-y */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#E8E2D5] dark:divide-dark-border">
            {notifications.length === 0 ? (
              /* ✅ Пустое состояние — как EmptyStateCard */
              <div className="p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border mx-auto mb-3 flex items-center justify-center">
                  <Bell size={22} className="text-[#8A8275] dark:text-gray-300" />
                </div>
                <p className="text-sm font-medium text-[#1B2A4A] dark:text-white mb-1">
                  {t("Нет новых заказов и спецзаказов")}</p>
                <p className="text-xs text-[#8A8275] dark:text-gray-300">
                  {t("Уведомления появятся здесь")}</p>
              </div>
            ) : (
              notifications.map((o) => (
                <button
                  key={`${o.kind}:${o.id}`}
                  onClick={() => {
                    setOpen(false)
                    navigate(o.kind === 'refund'?`/refunds?order=${o.order_id}`:o.kind === 'request' ? '/china' : `/orders?order=${o.id}`)
                  }}
                  className="w-full text-left p-3.5 hover:bg-[#F5F1E8] dark:hover:bg-dark-accent flex gap-3 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-[#1B2A4A]/10 dark:bg-gold/20 text-[#1B2A4A] dark:text-gold flex items-center justify-center flex-shrink-0 border border-[#E8E2D5] dark:border-dark-border">
                    {o.kind === 'request' ? <Globe size={16} /> : <Package size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-bold text-[#1B2A4A] dark:text-white truncate">
                        {o.kind==='refund'?t("Возврат"):o.kind === 'request'?t("Спецзаказ"):t("Заказ")} №{o.id}
                      </p>
                      <span className="text-[10px] text-[#8A8275] dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                        {formatTime(o.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-[#8A8275] dark:text-gray-300 truncate">
                      {o.kind === 'request' ? o.product_name : o.client_name}
                    </p>
                    {o.kind === 'order' && specialOrderIds(o).length > 0 && <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">{t("Спецзаказ №")}{specialOrderIds(o).join(", №")}</p>}
                    <p className="text-xs font-bold text-[#1B2A4A] dark:text-white mt-0.5">
                      {tx(formatPrice(o))}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Футер с кнопкой «Отметить прочитанными» */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-[#E8E2D5] dark:border-dark-border bg-[#F5F1E8]/40 dark:bg-dark-accent/30">
              <button
                onClick={markAllRead}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-[#1B2A4A] dark:text-white bg-white dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border hover:bg-[#F5F1E8] dark:hover:bg-dark-border transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCheck size={14} />
                {t("Отметить все прочитанными")}</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

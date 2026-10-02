// ✅ Единый файл кеша для всей админки.
// Module-level переменные переживают размонтирование компонентов.
// Типобезопасные get/set/invalidate функции для каждого типа данных.

export interface AnalyticsCacheEntry {
  orderStats: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    activeOrders: number
  }
  dailyStats: Array<{
    date: string
    revenue: number
    orders: number
  }>
  topProducts: Array<{
    product_id: string
    product_name: string
    total_sold: number
    revenue: number
  }>
  timestamp: number
}

export type AnalyticsPeriod = 'week' | 'month' | 'year' | 'all'

const DEFAULT_TTL = 5 * 60 * 1000 // 5 минут

// ✅ Кеш аналитики: Map<period, entry> — храним данные по каждому периоду отдельно
const analyticsCache = new Map<AnalyticsPeriod, AnalyticsCacheEntry>()

// ========== АНАЛИТИКА ==========
export const analyticsCacheApi = {
  get(period: AnalyticsPeriod, ttl: number = DEFAULT_TTL): AnalyticsCacheEntry | null {
    const entry = analyticsCache.get(period)
    if (!entry) return null
    if (Date.now() - entry.timestamp > ttl) {
      analyticsCache.delete(period)
      return null
    }
    return entry
  },

  set(period: AnalyticsPeriod, data: Omit<AnalyticsCacheEntry, 'timestamp'>) {
    analyticsCache.set(period, {
      ...data,
      timestamp: Date.now(),
    })
  },

  /** Сбросить кеш одного периода */
  invalidate(period?: AnalyticsPeriod) {
    if (period) {
      analyticsCache.delete(period)
    } else {
      analyticsCache.clear()
    }
  },
}

// ========== ЗАКАЗЫ ==========
let ordersCache: any[] | null = null
let ordersCacheTimestamp = 0

export const ordersCacheApi = {
  get(ttl: number = DEFAULT_TTL): any[] | null {
    if (!ordersCache) return null
    if (Date.now() - ordersCacheTimestamp > ttl) {
      ordersCache = null
      return null
    }
    return ordersCache
  },
  set(data: any[]) {
    ordersCache = data
    ordersCacheTimestamp = Date.now()
  },
  invalidate() {
    ordersCache = null
    ordersCacheTimestamp = 0
    // При изменении заказа — сбрасываем и аналитику (она зависит от заказов)
    analyticsCacheApi.invalidate()
  },
}

// ========== СПЕЦЗАКАЗЫ ==========
let chinaRequestsCache: any[] | null = null
let chinaCacheTimestamp = 0

export const chinaCacheApi = {
  get(ttl: number = DEFAULT_TTL): any[] | null {
    if (!chinaRequestsCache) return null
    if (Date.now() - chinaCacheTimestamp > ttl) {
      chinaRequestsCache = null
      return null
    }
    return chinaRequestsCache
  },
  set(data: any[]) {
    chinaRequestsCache = data
    chinaCacheTimestamp = Date.now()
  },
  invalidate() {
    chinaRequestsCache = null
    chinaCacheTimestamp = 0
  },
}

// ========== ТОВАРЫ ==========
let productsCache: any[] | null = null
let productsCacheTimestamp = 0

export const productsCacheApi = {
  get(ttl: number = DEFAULT_TTL): any[] | null {
    if (!productsCache) return null
    if (Date.now() - productsCacheTimestamp > ttl) {
      productsCache = null
      return null
    }
    return productsCache
  },
  set(data: any[]) {
    productsCache = data
    productsCacheTimestamp = Date.now()
  },
  invalidate() {
    productsCache = null
    productsCacheTimestamp = 0
    // Товары влияют на топ-товары аналитики
    analyticsCacheApi.invalidate()
  },
}

// ========== БРЕНДЫ ==========
let brandsCache: any[] | null = null
let brandsCacheTimestamp = 0

export const brandsCacheApi = {
  get(ttl: number = DEFAULT_TTL): any[] | null {
    if (!brandsCache) return null
    if (Date.now() - brandsCacheTimestamp > ttl) {
      brandsCache = null
      return null
    }
    return brandsCache
  },
  set(data: any[]) {
    brandsCache = data
    brandsCacheTimestamp = Date.now()
  },
  invalidate() {
    brandsCache = null
    brandsCacheTimestamp = 0
  },
}

// ========== ОБЩИЙ СБРОС ==========
/** Сбросить весь кеш админки (использовать при logout) */
export function invalidateAllCaches() {
  analyticsCacheApi.invalidate()
  ordersCacheApi.invalidate()
  chinaCacheApi.invalidate()
  productsCacheApi.invalidate()
  brandsCacheApi.invalidate()
}
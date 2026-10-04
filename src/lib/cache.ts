// ✅ Единый файл кеша для всей админки.
// Module-level переменные переживают размонтирование компонентов.

// ========== ТИПЫ АНАЛИТИКИ ==========
export interface OrderStatsEntry {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  activeOrders: number
  cancelledOrders: number
  pendingPaymentOrders: number
  uniqueCustomers: number
  deliveryOrders: number
  pickupOrders: number
  onlinePaymentOrders: number
  receiptPaymentOrders: number
}

export interface DailyStatsEntry {
  dateKey: string   // "2026-10-03" — для сортировки
  dateLabel: string // "03.10" — для отображения
  revenue: number
  orders: number
}

export interface ProductStatsEntry {
  product_id: string
  product_name: string
  total_sold: number
  revenue: number
}

export interface CategoryStat {
  key: string
  label: string
  revenue: number
  sold: number
}

export interface BrandStat {
  name: string
  revenue: number
  sold: number
}

export interface AnalyticsCacheEntry {
  orderStats: OrderStatsEntry
  dailyStats: DailyStatsEntry[]
  topProducts: ProductStatsEntry[]
  categoryStats: CategoryStat[]
  brandStats: BrandStat[]
  timestamp: number
}

export type AnalyticsPeriod = 'week' | 'month' | 'year' | 'all'

const DEFAULT_TTL = 5 * 60 * 1000 // 5 минут

// ✅ Кеш аналитики: Map<period, entry>
const analyticsCache = new Map<AnalyticsPeriod, AnalyticsCacheEntry>()

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
    // При изменении заказа — сбрасываем и аналитику
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
    // ✅ При изменении товаров — сбрасываем variants (они зависят от товаров)
    variantsCacheApi.invalidate()
    analyticsCacheApi.invalidate()
  },
}

// ========== ВАРИАНТЫ ТОВАРОВ ==========
// ✅ Отдельный кеш для product_variants — чтобы модалка редактирования открывалась мгновенно
let variantsCache: any[] | null = null
let variantsCacheTimestamp = 0

export const variantsCacheApi = {
  get(ttl: number = DEFAULT_TTL): any[] | null {
    if (!variantsCache) return null
    if (Date.now() - variantsCacheTimestamp > ttl) {
      variantsCache = null
      return null
    }
    return variantsCache
  },
  set(data: any[]) {
    variantsCache = data
    variantsCacheTimestamp = Date.now()
  },
  invalidate() {
    variantsCache = null
    variantsCacheTimestamp = 0
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

// ========== СЧЁТЧИКИ ДАШБОРДА ==========
// ✅ Отдельный кеш для количества товаров и брендов — чтобы дашборд открывался мгновенно
interface DashboardCounts {
  productsCount: number
  brandsCount: number
}

let dashboardCountsCache: DashboardCounts | null = null
let dashboardCountsTimestamp = 0

export const dashboardCountsCacheApi = {
  get(ttl: number = DEFAULT_TTL): DashboardCounts | null {
    if (!dashboardCountsCache) return null
    if (Date.now() - dashboardCountsTimestamp > ttl) {
      dashboardCountsCache = null
      return null
    }
    return dashboardCountsCache
  },
  set(data: DashboardCounts) {
    dashboardCountsCache = data
    dashboardCountsTimestamp = Date.now()
  },
  invalidate() {
    dashboardCountsCache = null
    dashboardCountsTimestamp = 0
  },
}

// ========== КАТЕГОРИИ (дерево) ==========
// ✅ Кеш для дерева категорий (категории + вложенные подкатегории)
let categoriesCache: any[] | null = null
let categoriesCacheTimestamp = 0

export const categoriesCacheApi = {
  get(ttl: number = DEFAULT_TTL): any[] | null {
    if (!categoriesCache) return null
    if (Date.now() - categoriesCacheTimestamp > ttl) {
      categoriesCache = null
      return null
    }
    return categoriesCache
  },
  set(data: any[]) {
    categoriesCache = data
    categoriesCacheTimestamp = Date.now()
  },
  invalidate() {
    categoriesCache = null
    categoriesCacheTimestamp = 0
  },
}

// ========== ОБЩИЙ СБРОС ==========
export function invalidateAllCaches() {
  analyticsCacheApi.invalidate()
  ordersCacheApi.invalidate()
  chinaCacheApi.invalidate()
  productsCacheApi.invalidate()
  brandsCacheApi.invalidate()
  variantsCacheApi.invalidate()
  dashboardCountsCacheApi.invalidate()
  categoriesCacheApi.invalidate()
}
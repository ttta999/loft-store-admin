import { dataCache } from './resourceCache'
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
  product_image?: string | null
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

const DEFAULT_TTL = 5 * 60 * 1000
function collection<T>(key: string, ttl = DEFAULT_TTL, dependents: string[] = []) {
  return {
    get(maxAge = ttl): T | null {
      const entry = dataCache.get<{ data: T; savedAt: number }>(key)
      if (!entry || Date.now() - entry.savedAt >= maxAge) return null
      return entry.data
    },
    set(data: T) {
      if (dataCache.get<{ data: T }>(key)?.data === data) return
      dataCache.set(key, { data, savedAt: Date.now() }, ttl)
    },
    invalidate() {
      dataCache.invalidate(key)
      dataCache.invalidate('http:')
      dependents.forEach(dependency => dataCache.invalidate(dependency))
    },
  }
}
export const analyticsCacheApi = {
  get(period: AnalyticsPeriod, ttl = 60_000): AnalyticsCacheEntry | null {
    const entry = dataCache.get<AnalyticsCacheEntry>(`admin:analytics:${period}`)
    return entry && Date.now() - entry.timestamp < ttl ? entry : null
  },
  set(period: AnalyticsPeriod, data: Omit<AnalyticsCacheEntry, 'timestamp'>) {
    dataCache.set(`admin:analytics:${period}`, { ...data, timestamp: Date.now() }, 60_000)
  },
  invalidate(period?: AnalyticsPeriod) {
    dataCache.invalidate(period ? `admin:analytics:${period}` : 'admin:analytics:')
    dataCache.invalidate('http:')
  },
}
export const ordersCacheApi = collection<any[]>('admin:orders', 15_000, ['admin:analytics:', 'admin:notifications'])
export const chinaCacheApi = collection<any[]>('admin:china', 30_000)
export const productsCacheApi = collection<any[]>('admin:products', DEFAULT_TTL, ['admin:variants', 'admin:colors', 'admin:analytics:', 'admin:counts'])
export const variantsCacheApi = collection<any[]>('admin:variants', 30_000)
export const brandsCacheApi = collection<any[]>('admin:brands', DEFAULT_TTL, ['admin:counts', 'admin:analytics:'])
export const categoryRowsCacheApi = collection<any[]>('admin:category-rows', DEFAULT_TTL)
export const categoriesCacheApi = collection<any[]>('admin:categories', DEFAULT_TTL)
export const colorsCacheApi = collection<any[]>('admin:colors', DEFAULT_TTL)
export const subcategoriesCacheApi = collection<any[]>('admin:subcategories', DEFAULT_TTL)
interface DashboardCounts { productsCount: number; brandsCount: number }
export const dashboardCountsCacheApi = collection<DashboardCounts>('admin:counts', 60_000)
export function invalidateAllCaches() { dataCache.clear() }

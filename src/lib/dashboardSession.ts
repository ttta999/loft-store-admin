import { useSyncExternalStore } from 'react'
import type { getRefunds } from './refunds'
import type { getChinaRequests, getOrders } from './supabase'

export interface DashboardSnapshot {
  orders: Awaited<ReturnType<typeof getOrders>>
  china: Awaited<ReturnType<typeof getChinaRequests>>
  refunds: Awaited<ReturnType<typeof getRefunds>>
  productsCount: number
  brandsCount: number
  updatedAt: number
}

export const DASHBOARD_REFRESH = 'loft:dashboard-refresh'
export const DASHBOARD_FRESH_FOR = 120_000

type RefreshState = 'idle' | 'busy' | 'success' | 'error'
type DashboardSession = { id: string; snapshot?: DashboardSnapshot; refresh: RefreshState }
let session: DashboardSession | null = null
const listeners = new Set<() => void>()
const notify = () => listeners.forEach(listener => listener())
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function setDashboardSession(id: string | null) {
  if ((session?.id ?? null) === id) return
  if (session) delete session.snapshot
  session = id ? { id, refresh: 'idle' } : null
  notify()
}

export function saveDashboardSnapshot(grant: DashboardSession, snapshot: DashboardSnapshot) {
  if (session !== grant) return
  grant.snapshot = snapshot
  notify()
}

export const getDashboardSession = () => session
export const useDashboardSession = () => useSyncExternalStore(subscribe, getDashboardSession)
export const useDashboardRefreshState = () => useSyncExternalStore(subscribe, () => session?.refresh ?? 'idle')
export const useDashboardUpdatedAt = () => useSyncExternalStore(subscribe, () => session?.snapshot?.updatedAt ?? 0)

export function setDashboardRefresh(grant: DashboardSession | null, refresh: RefreshState) {
  if (!grant || session !== grant || grant.refresh === refresh) return
  grant.refresh = refresh
  notify()
}

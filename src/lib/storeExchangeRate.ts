import { dataCache } from './resourceCache'
import { supabase } from './supabase'

const key = 'admin:exchange-rate'

export function cachedStoreExchangeRate() {
  return dataCache.get<number>(key)
}

export function loadStoreExchangeRate(force = false) {
  if (force) dataCache.invalidateWhere(cacheKey => cacheKey.startsWith('http:') && cacheKey.includes('/rest/v1/settings?'))
  return dataCache.load(key, async () => {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'exchange_rate').single()
    if (error) throw error
    const value: unknown = data?.value?.rate
    const rate = typeof value === 'number' || typeof value === 'string' ? Number(value) : NaN
    if (!Number.isFinite(rate) || rate <= 0) throw new Error('Store exchange rate unavailable')
    return rate
  }, 60_000, force)
}

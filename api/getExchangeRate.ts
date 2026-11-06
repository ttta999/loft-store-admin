import type { VercelRequest, VercelResponse } from '../server/types.ts'
import { createClient } from '@supabase/supabase-js'
import { exchangeRate } from '../server/exchangeRate.ts'
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const authorization = req.headers.authorization
    if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) return res.status(401).json({ error: 'Войдите в админку' })
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key || !serviceKey) return res.status(503).json({ error: 'Сервис временно недоступен' })
    const db = createClient(url,key,{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}})
    const { data: { user }, error } = await db.auth.getUser(authorization.slice(7))
    if (error || !user) return res.status(401).json({ error: 'Войдите в админку' })
    const { data: allowed, error: roleError } = await db.rpc('store_is_admin')
    if (roleError || allowed !== true) return res.status(403).json({ error: 'Нет доступа' })
    const service = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data: withinLimit, error: limitError } = await service.rpc('store_rate_limit', { p_user: user.id, p_action: 'exchange-rate', p_limit: 12, p_seconds: 60 })
    if (limitError || !withinLimit) return res.status(429).json({ error: 'Повторите позже' })
    const { rate, source, timestamp } = await exchangeRate()
    return res.json({ success: true, rate, source, timestamp })
  } catch { return res.status(503).json({ success: false, error: 'Не удалось получить актуальный курс' }) }
}

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control','no-store')
  res.setHeader('X-Content-Type-Options','nosniff')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const auth = req.headers.authorization
    if (typeof auth !== 'string' || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Войдите в админку' })
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key || !serviceKey) return res.status(503).json({ error: 'Сервис временно недоступен' })
    const db = createClient(url,key,{global:{headers:{Authorization:auth}},auth:{persistSession:false,autoRefreshToken:false}})
    const { data: { user }, error } = await db.auth.getUser(auth.slice(7))
    if (error || !user) return res.status(401).json({ error: 'Войдите в админку' })
    const { data: allowed, error: roleError } = await db.rpc('store_is_admin')
    if (roleError || !allowed) return res.status(403).json({ error: 'Нет доступа' })
    const { chatId, message, botType } = req.body || {}
    if (botType !== 'client' || !/^[1-9]\d{0,15}$/.test(String(chatId)) || typeof message !== 'string' || !message.trim() || message.length>4000) return res.status(400).json({ error: 'Некорректное сообщение' })
    // The manager can only message a customer who has a persisted order/request.
    const [orders, requests] = await Promise.all([
      db.from('orders').select('id').eq('user_id',String(chatId)).limit(1),
      db.from('china_requests').select('id').eq('user_id',String(chatId)).limit(1),
    ])
    if (!orders.data?.length && !requests.data?.length) return res.status(403).json({ error: 'Клиент не найден' })
    const service = createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}})
    const {data: limited,error: limitError}=await service.rpc('store_rate_limit',{p_user:user.id,p_action:'admin-notification',p_limit:30,p_seconds:60})
    if(limitError || !limited) return res.status(429).json({error:'Подождите немного и повторите отправку'})
    const token = process.env.TELEGRAM_BOT_TOKEN
    if(!token) return res.status(503).json({error:'Уведомления временно недоступны'})
    const response=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{
      method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(8000),
      body:JSON.stringify({chat_id:String(chatId),text:message.replace(/<\/?(?:b|i|u|s|code|pre)>/g,''),link_preview_options:{is_disabled:true}}),
    })
    const data=await response.json()
    if(!response.ok || !data.ok) return res.status(502).json({error:'Не удалось отправить сообщение'})
    return res.json({success:true})
  } catch { return res.status(500).json({error:'Не удалось отправить сообщение'}) }
}

import { readAll } from './readAll'
import { createDataFetch } from './dataFetch'
import { invalidateAllCaches } from './cache'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, { global: { fetch: createDataFetch(invalidateAllCaches) } })
let cacheUserId: string | null = null
export const getAdminCacheScope = () => cacheUserId || 'anonymous'
supabase.auth.onAuthStateChange((event, session) => {
  const nextUserId = session?.user.id || null
  if (nextUserId !== cacheUserId || event === 'SIGNED_OUT') {
    cacheUserId = nextUserId
    invalidateAllCaches()
  }
})

export async function privateFile(value: string | null, bucket: string) {
  if (!value) return null
  let path: string
  const marker = `private:${bucket}/`
  if (value.startsWith(marker)) path = value.slice(marker.length)
  else {
    try {
      const url = new URL(value)
      const prefix = `/storage/v1/object/public/${bucket}/`
      if (url.origin !== new URL(supabaseUrl).origin || !url.pathname.startsWith(prefix)) return null
      path = decodeURIComponent(url.pathname.slice(prefix.length))
    } catch { return null }
  }
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 900)
  if (error) return null
  return data.signedUrl
}

export const getOrders = async () => {
  const { data, error } = await readAll(supabase.from('orders').select('*').order('created_at', { ascending: false }))
  
  if (error) {
    console.error('Ошибка при загрузке заказов:', error)
    throw error
  }
  
  return Promise.all((data || []).map(async order => ({
    ...order, payment_screenshot_url: await privateFile(order.payment_screenshot_url, 'payment-screenshots'),
    items: await Promise.all((order.items || []).map(async (item: any) => item.isSpecialOrder
      ? { ...item, image: await privateFile(item.image, 'china-requests') } : item)),
  })))
}

export const getChinaRequests = async () => {
  const { data, error } = await readAll(supabase.from('china_requests').select('*').order('created_at', { ascending: false }))
  
  if (error) {
    console.error('Ошибка при загрузке спецзаказов:', error)
    throw error
  }
  
  return Promise.all((data || []).map(async request => ({ ...request, image_url: await privateFile(request.image_url, 'china-requests') })))
}

export type AdminNotice = { key: string; message: string }
export const updateOrderStatus = async (orderId: string, status: string, notice?: AdminNotice) => {
  const { data, error } = await supabase.rpc('store_admin_order_status', { p_id: orderId, p_status: status, p_notice: notice || null })
  if (error) throw error
  return data
}

export const updateChinaRequestStatus = async (requestId: string, status: string, extraData?: Record<string, unknown>, notice?: AdminNotice) => {
  const { data, error } = await supabase.rpc('store_admin_request_status', { p_id: requestId, p_status: status, p_extra: extraData || {}, p_notice: notice || null })
  if (error) throw error
  return data
}

// ✅ ИСПРАВЛЕНО: Отправка уведомления КЛИЕНТУ (через клиентский бот)
export const sendClientNotification = async (chatId: string, message: string, requestKey = crypto.randomUUID()) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false
    const response = await fetch('/api/sendNotification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ 
        chatId, 
        message,
        requestKey,
        botType: 'client' // ✅ Отправляем через КЛИЕНТСКИЙ бот
      }),
    })
    
    if (!response.ok) {
      console.error('Ошибка HTTP:', response.status)
      return false
    }
    
    const data = await response.json()
    return data.success
  } catch (error) {
    console.error('Ошибка отправки уведомления клиенту:', error)
    return false
  }
}

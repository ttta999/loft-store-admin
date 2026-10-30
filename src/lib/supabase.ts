import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function privateFile(value: string | null, bucket: string) {
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
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Ошибка при загрузке заказов:', error)
    return []
  }
  
  return Promise.all((data || []).map(async order => ({
    ...order, payment_screenshot_url: await privateFile(order.payment_screenshot_url, 'payment-screenshots'),
    items: await Promise.all((order.items || []).map(async (item: any) => item.isSpecialOrder
      ? { ...item, image: await privateFile(item.image, 'china-requests') } : item)),
  })))
}

export const getChinaRequests = async () => {
  const { data, error } = await supabase
    .from('china_requests')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Ошибка при загрузке спецзаказов:', error)
    return []
  }
  
  return Promise.all((data || []).map(async request => ({ ...request, image_url: await privateFile(request.image_url, 'china-requests') })))
}

export const updateOrderStatus = async (orderId: string, status: string) => {
  if (status === 'Отменён') {
    const { data, error } = await supabase.rpc('store_admin_cancel_order', { p_order_id: orderId })
    if (error) throw error
    return data
  }
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
  
  if (error) {
    console.error('Ошибка при обновлении статуса:', error)
    return null
  }
  
  return data?.[0] || null
}

export const updateChinaRequestStatus = async (
  requestId: string, 
  status: string, 
  extraData?: any
) => {
  const { data, error } = await supabase
    .from('china_requests')
    .update({ 
      status,
      ...extraData 
    })
    .eq('id', requestId)
    .select()
  
  if (error) {
    console.error('Ошибка обновления статуса спецзаказа:', error)
    return null
  }
  
  return Array.isArray(data) ? data[0] : data
}

// ✅ ИСПРАВЛЕНО: Отправка уведомления КЛИЕНТУ (через клиентский бот)
export const sendClientNotification = async (chatId: string, message: string) => {
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

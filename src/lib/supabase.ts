import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const getOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Ошибка при загрузке заказов:', error)
    return []
  }
  
  return data
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
  
  return data
}

export const updateOrderStatus = async (orderId: string, status: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
  
  if (error) {
    console.error('Ошибка при обновлении статуса:', error)
    return null
  }
  
  return data?.[0]
}

export const updateChinaRequestStatus = async (requestId: string, status: string) => {
  const { data, error } = await supabase
    .from('china_requests')
    .update({ status })
    .eq('id', requestId)
    .select()
  
  if (error) {
    console.error('Ошибка при обновлении статуса:', error)
    return null
  }
  
  return data?.[0]
}

export const sendClientNotification = async (chatId: string, message: string) => {
  try {
    const response = await fetch('/api/sendNotification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatId, message }),
    })
    
    if (!response.ok) {
      console.error('Ошибка HTTP:', response.status)
      return false
    }
    
    const data = await response.json()
    console.log('Уведомление отправлено:', data)
    return data.success
  } catch (error) {
    console.error('Ошибка отправки уведомления:', error)
    return false
  }
}
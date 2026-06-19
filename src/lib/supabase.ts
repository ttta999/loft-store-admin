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

// ✅ ВОЗВРАТ ОСТАТКОВ ПРИ ОТМЕНЕ ЗАКАЗА
export const restoreStockAfterCancel = async (items: any[]) => {
  console.log('📈 Возвращаем остатки после отмены:', items)
  
  for (const item of items) {
    // Пропускаем спецзаказы
    if (!item.productId || item.isSpecialOrder) continue
    
    // Находим вариант товара
    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', item.productId)
      .eq('size_value', item.size)
    
    if (!variants || variants.length === 0) continue
    
    const variant = variants[0]
    const newStock = (variant.stock || 0) + item.quantity
    
    console.log(`📈 Товар ${item.productId} (${item.size}): ${variant.stock} → ${newStock}`)
    
    // Обновляем остаток
    await supabase
      .from('product_variants')
      .update({ stock: newStock })
      .eq('id', variant.id)
    
    // ✅ Если товар был скрыт — снова показываем
    if (variant.stock === 0 && newStock > 0) {
      await supabase
        .from('products')
        .update({ is_active: true })
        .eq('id', item.productId)
    }
  }
}
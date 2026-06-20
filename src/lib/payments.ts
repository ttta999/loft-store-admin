import { supabase } from './supabase'

export const confirmPayment = async (orderId: string) => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'Активный',
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        payment_provider: 'manual'
      })
      .eq('id', orderId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Ошибка подтверждения оплаты:', error)
    return false
  }
}
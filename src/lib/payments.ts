import { supabase } from './supabase'

export const confirmPayment = async (orderId: string) => {
  const { data, error } = await supabase.rpc('store_admin_confirm_payment', { p_order_id: orderId })
  return !error && data === true
}

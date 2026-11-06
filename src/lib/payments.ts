import { supabase, type AdminNotice } from './supabase'

export const confirmPayment = async (orderId: string, notice?: AdminNotice) => {
  const { data, error } = await supabase.rpc('store_admin_confirm_payment_with_notice', { p_order_id: orderId, p_notice: notice || null })
  return !error && data === true
}

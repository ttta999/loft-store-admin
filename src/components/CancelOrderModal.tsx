import {useState} from 'react'
import {toast} from 'sonner'
import {supabase} from '../lib/supabase'
import {cancellationNeedsReview} from '../lib/orderState'
import {ordersCacheApi,refundsCacheApi} from '../lib/cache'
export default function CancelOrderModal({order,onClose,onSaved}:{order:any;onClose:()=>void;onSaved:()=>void}){
 const [reason,setReason]=useState(''),[manual,setManual]=useState(false),[busy,setBusy]=useState(false)
 const review=cancellationNeedsReview(order)
 const save=async()=>{
  if(busy||!reason.trim()||(review&&!manual))return
  setBusy(true)
  try{
   const {error}=await supabase.rpc('store_admin_cancel_order_reason',{p_order_id:order.id,p_reason:reason.trim(),p_manual:manual})
   if(error)throw error
   ordersCacheApi.invalidate();refundsCacheApi.invalidate();toast.success('Заказ отменён. Состояние возврата сохранено.');onSaved()
  }catch(error:any){toast.error(error.message||'Не удалось отменить заказ')}finally{setBusy(false)}
 }
 return <div role="dialog" aria-modal="true" aria-label="Отмена заказа" className="loft-modal fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
  <div className="bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-6 w-full max-w-lg">
   <h2 className="text-xl font-bold text-[#1B2A4A] dark:text-white">Отменить заказ №{order.id}</h2>
   <label className="block mt-4 text-sm text-[#8A8275] dark:text-gray-300">Причина отмены *</label>
   <textarea aria-label="Причина отмены" maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)} className="mt-2 w-full p-3 rounded-xl border border-[#E8E2D5] dark:border-dark-border bg-[#F5F1E8] dark:bg-dark-accent text-[#1B2A4A] dark:text-white text-base" rows={3}/>
   {review&&<label className="flex items-start gap-2 text-sm text-[#8A8275] dark:text-gray-300 mt-3"><input type="checkbox" checked={manual} onChange={e=>setManual(e.target.checked)}/>Я проверил ситуацию с курьером или поставщиком и согласовал отмену вручную. Банковский возврат автоматически не выполняется.</label>}
   <div className="flex gap-2 mt-5"><button disabled={busy} onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#E8E2D5] dark:border-dark-border text-[#1B2A4A] dark:text-white">Назад</button><button disabled={busy||!reason.trim()||(review&&!manual)} onClick={save} className="flex-1 py-3 rounded-xl bg-[#9B3B3B] dark:bg-red-900 text-white font-bold disabled:opacity-50">{busy?'Сохраняем…':'Отменить заказ'}</button></div>
  </div>
 </div>
}

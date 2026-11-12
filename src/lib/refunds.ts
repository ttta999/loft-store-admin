import { supabase, privateFile, getAdminCacheScope } from './supabase'
import { refundsCacheApi } from './cache'
import { dataCache } from './resourceCache'

export async function getRefunds(force = false): Promise<any[]> {
  const scope = getAdminCacheScope()
  const entry = await dataCache.load('admin:refunds', async () => {
    const rows: any[] = []
    let before: number | null = null
    for (;;) {
      const {data,error} = await supabase.rpc('store_admin_refunds', {p_before:before})
      if (error) throw error
      const page: any[] = data || []
      rows.push(...page)
      if (page.length < 100) break
      before = page[page.length-1].id
    }
    if(scope!==getAdminCacheScope()) throw new Error('Сеанс изменился. Откройте возвраты повторно')
    return {data:rows,savedAt:Date.now()}
  },15_000,force)
  return entry.data
}
export async function getRefundDetail(refund:any) {
  const scope=getAdminCacheScope()
  return dataCache.load(`admin:refunds:detail:${scope}:${refund.id}:${refund.updated_at||''}`,async()=>{
    const [history,receipt,proof]=await Promise.all([
      supabase.rpc('store_admin_refund_history',{p_id:refund.id}),
      privateFile(refund.orders?.payment_screenshot_url,'payment-screenshots'),
      privateFile(refund.proof_url,'refund-proofs'),
    ])
    if(history.error) throw history.error
    if(scope!==getAdminCacheScope()) throw new Error('Сеанс изменился')
    return {history:history.data||[],receipt,proof}
  },60_000)
}

export async function refundAction(id:number, action:string, key:string, extra:Record<string,unknown> = {}) {
  const {data,error} = await supabase.rpc('store_admin_refund_action',{p_id:id,p_action:action,p_key:key,...extra})
  if(error) throw error
  refundsCacheApi.invalidate()
  return data
}
export async function uploadRefundProof(refund:any, file:File) {
  const extensions: Record<string,string> = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp','application/pdf':'pdf'}
  if(!extensions[file.type] || !file.size || file.size>8*1024*1024) throw new Error('Выберите JPEG, PNG, WebP или PDF до 8 МБ')
  const {data:{user}} = await supabase.auth.getUser()
  if(!user) throw new Error('Войдите в админку повторно')
  const path = `${refund.id}/${user.id}/${crypto.randomUUID()}.${extensions[file.type]}`
  const {error} = await supabase.storage.from('refund-proofs').upload(path,file,{contentType:file.type,upsert:false})
  if(error) throw error
  // A failed RPC may be retried with this same path; never re-upload/overwrite bank proof.
  return `private:refund-proofs/${path}`
}
export {privateFile}

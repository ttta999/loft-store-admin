import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Undo2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { supabase, sendClientNotification } from '../lib/supabase'
import { refundsCacheApi } from '../lib/cache'
import { getRefunds, privateFile, refundAction, uploadRefundProof } from '../lib/refunds'
import { REFUND_STATUSES, formatMoney, formatOrderMoney, orderStatus } from '../lib/orderState'
import { specialOrderIds } from '../lib/specialOrders'

const card='bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border rounded-2xl'
const button='px-4 py-2 rounded-xl border border-[#E8E2D5] dark:border-dark-border font-semibold disabled:opacity-50'
const input='w-full p-3 rounded-xl border border-[#E8E2D5] dark:border-dark-border bg-transparent'
const actions:Record<string,string>={created:'Создан возврат',late_payment_check:'Открыта проверка платежа',claim:'Взят в работу',payment_received:'Подтверждено поступление оплаты',no_payment:'Оплата не обнаружена',proof:'Прикреплена квитанция',complete:'Подтверждён обратный перевод'}

function RefundDetail({r,userId,onSaved}:{r:any,userId:string,onSaved:()=>Promise<void>}) {
 const o=r.orders || {};const navigate=useNavigate()
 const [amount,setAmount]=useState('');const [currency,setCurrency]=useState('UZS');const [comment,setComment]=useState('')
 const [history,setHistory]=useState<any[]>([]);const [receipt,setReceipt]=useState<string|null>(null);const [proof,setProof]=useState<string|null>(null)
 const [confirmOpen,setConfirmOpen]=useState(false);const [busy,setBusy]=useState(false);const [confirmed,setConfirmed]=useState(false);const [message,setMessage]=useState('')
 const operation=useRef<{signature:string,key:string}|null>(null)
 const uploaded=useRef<{file:File,path:string}|null>(null)
 const mine=r.assigned_to===userId;const closed=r.status==='Возврат выполнен'
 useEffect(()=>{let active=true;void Promise.all([
  supabase.rpc('store_admin_refund_history',{p_id:r.id}),
  privateFile(o.payment_screenshot_url,'payment-screenshots'),privateFile(r.proof_url,'refund-proofs'),
 ]).then(([h,a,b])=>{if(active){if(h.error)toast.error('Не удалось загрузить историю возврата');setHistory(h.data||[]);setReceipt(a);setProof(b)}}).catch(()=>toast.error('Не удалось загрузить документы возврата'));return()=>{active=false}},[r.id,r.updated_at])
 const run=async(action:string,extra:Record<string,unknown>={})=>{
  if(busy)return;setBusy(true)
  const signature=JSON.stringify([r.id,action,extra]);if(operation.current?.signature!==signature)operation.current={signature,key:crypto.randomUUID()}
  try{await refundAction(r.id,action,operation.current.key,extra);operation.current=null;await onSaved();setConfirmed(false);toast.success('Изменения сохранены')}
  catch(e:any){toast.error(e.message||'Не удалось сохранить возврат')}finally{setBusy(false)}
 }
 const upload=async(file:File)=>{
  if(busy)return;setBusy(true)
  try{if(uploaded.current?.file!==file)uploaded.current={file,path:await uploadRefundProof(r,file)};const path=uploaded.current!.path
   const signature=JSON.stringify([r.id,'proof',path]);if(operation.current?.signature!==signature)operation.current={signature,key:crypto.randomUUID()}
   await refundAction(r.id,'proof',operation.current.key,{p_proof:path});operation.current=null;await onSaved();toast.success('Квитанция сохранена')
  }catch(e:any){toast.error(e.message||'Не удалось сохранить квитанцию')}finally{setBusy(false)}
 }
 const special=specialOrderIds(o)
 return <div className="p-5 border-t border-[#E8E2D5] dark:border-dark-border space-y-4">
  <div className="grid sm:grid-cols-2 gap-4">
   <div><p className="font-bold">Заказ №{o.id}{special.length>0?` · Спецзаказ №${special.join(', №')}`:''}</p><p>{orderStatus(o)} · {formatOrderMoney(o)}</p><p>{o.created_at?new Date(o.created_at).toLocaleString('ru-RU'):''}</p><button className={button} onClick={()=>navigate(`/orders?order=${o.id}`)}>Открыть заказ</button></div>
   <div><p>{o.client_name||'Имя не указано'}</p><p>{o.client_phone||'Телефон не указан'}</p><p>Telegram: {o.user_chat_id||o.user_id}</p></div>
  </div>
  <p>Отмена: {r.cancelled_by==='client'?'клиентом':r.cancelled_by==='store'?'магазином':r.cancelled_by==='system'?'системой':'источник не сохранён'}. {r.reason||o.cancellation_reason||'Причина не сохранена'}</p>
  <p>Получение: {o.delivery_method==='pickup'?'Самовывоз':'Доставка'}{o.delivery_address?` · ${o.delivery_address}`:''}</p>
  <p>Фактически подтверждённая оплата: {o.payment_amount!=null?formatMoney(o.payment_amount,o.payment_currency):o.paid_at?formatOrderMoney(o):'сумма не подтверждена'}</p>
  <p>Оплата: {o.payment_method==='upon_receipt'?'при получении':'переводом'} · {o.paid_at?`поступление подтверждено ${new Date(o.paid_at).toLocaleString('ru-RU')}`:'поступление не подтверждено'}</p>
  {receipt&&<a href={receipt} target="_blank" rel="noreferrer" className="underline">Оригинал подтверждения оплаты</a>}
  <p>Возврат: {['Ожидает возврата','Возврат выполнен'].includes(r.status)?formatMoney(r.amount,r.currency):'сумма и валюта требуют проверки'}</p>
  {r.completed_at&&<p>Перевод подтверждён {new Date(r.completed_at).toLocaleString('ru-RU')} · {r.processed_by===userId?'Вы':'Менеджер'}</p>}
  {proof&&<p><a href={proof} target="_blank" rel="noreferrer" className="underline">Квитанция обратного перевода</a></p>}
  <p>{r.assigned_to?(mine?'Вы обрабатываете этот возврат':'Возврат обрабатывает другой менеджер'):'Ответственный менеджер не назначен'}</p>
  {!closed&&!r.assigned_to&&<button className={button} disabled={busy} onClick={()=>void run('claim')}>Взять в работу</button>}
  {mine&&!closed&&<div className="space-y-3">
   {(r.status==='Проверка платежа'||r.status==='Возврат не требуется')&&<>
    <p>Сверьте поступление с банком. Укажите фактически полученную сумму. Заказ останется отменённым.</p>
    <div className="flex gap-3"><input aria-label="Фактически полученная сумма" className={input} type="number" min="0.01" step={currency==='USD'?'0.01':'1'} value={amount} onChange={e=>setAmount(e.target.value)}/><select aria-label="Валюта платежа" className={input} value={currency} onChange={e=>setCurrency(e.target.value)}><option>UZS</option><option>USD</option></select></div>
    <textarea aria-label="Внутренний комментарий" placeholder={r.status==='Возврат не требуется'?'Причина повторной проверки (обязательно)':'Внутренний комментарий'} className={input} maxLength={2000} value={comment} onChange={e=>setComment(e.target.value)}/>
    <button className={button} disabled={busy||!(Number(amount)>0)||(r.status==='Возврат не требуется'&&comment.trim().length<3)} onClick={()=>{if(confirm('Подтвердить фактическое поступление оплаты?'))void run('payment_received',{p_amount:Number(amount),p_currency:currency,p_comment:comment})}}>Оплата поступила</button>
    {r.status==='Проверка платежа'&&<button className={button} disabled={busy} onClick={()=>{if(confirm('Проверка в банке завершена, поступление оплаты не подтверждено?'))void run('no_payment',{p_comment:comment})}}>Оплата не поступила</button>}
   </>}
   {r.status==='Ожидает возврата'&&<>
    <p>Выполните перевод клиенту вручную через банк, затем прикрепите квитанцию. Приложение деньги не переводит. Не повторяйте банковский перевод после ошибки сохранения — проверьте его в банке.</p>
    <label className="block">Квитанция обратного перевода (до 8 МБ)<input aria-label="Квитанция обратного перевода" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" disabled={busy} onChange={e=>{const f=e.target.files?.[0];if(f)void upload(f)}}/></label>
    <label className="flex gap-2"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>Подтверждаю: обратный банковский перевод фактически выполнен</label>
    <button className={button} disabled={busy||!confirmed||!r.proof_url} onClick={()=>setConfirmOpen(true)}>Подтвердить выполненный возврат</button>
   </>}
  </div>}
  {confirmOpen&&<div className="loft-modal fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5" role="dialog" aria-modal="true" aria-labelledby="refund-confirm-title"><div className={`${card} p-6 max-w-md space-y-4`}><h2 id="refund-confirm-title" className="font-bold text-xl">Подтвердить возврат?</h2><p>Подтвердите фактический обратный перевод {formatMoney(r.amount,r.currency)} по заказу №{o.id}. Квитанция сохранена. Приложение не выполняет банковский перевод.</p><div className="flex gap-3"><button className={button} disabled={busy} onClick={()=>setConfirmOpen(false)}>Назад</button><button className={button} disabled={busy} onClick={async()=>{await run('complete');setConfirmOpen(false)}}>Перевод выполнен</button></div></div></div>}
  {r.manager_comment&&<p>Внутренний комментарий: {r.manager_comment}</p>}
  <details><summary className="cursor-pointer font-semibold">История обработки ({history.length})</summary>{history.map(h=><div className="py-2 border-b border-[#E8E2D5] dark:border-dark-border" key={h.id}><p>{new Date(h.created_at).toLocaleString('ru-RU')} · {actions[h.action]||h.action} · {h.actor_id===userId?'Вы':h.actor_id?'Менеджер':'Система'}</p><p>{h.current_state?.status}{h.current_state?.manager_comment?` · ${h.current_state.manager_comment}`:''}</p></div>)}</details>
  <textarea aria-label="Сообщение клиенту" placeholder="Сообщение клиенту" className={input} value={message} maxLength={3000} onChange={e=>setMessage(e.target.value)}/>
  <button className={button} disabled={busy||!message.trim()} onClick={async()=>{setBusy(true);try{const escaped=message.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]!));const ok=await sendClientNotification(o.user_chat_id||o.user_id,`Возврат по заказу №${o.id}\n\n${escaped}`);if(!ok)throw Error('Не удалось отправить сообщение');setMessage('');toast.success('Сообщение отправлено')}catch(e:any){toast.error(e.message)}finally{setBusy(false)}}}>Написать клиенту</button>
 </div>
}

export default function RefundsPage(){
 const navigate=useNavigate();const [params]=useSearchParams()
 const [rows,setRows]=useState<any[]>(()=>refundsCacheApi.get()||[]);const [loading,setLoading]=useState(!refundsCacheApi.get());const [error,setError]=useState('')
 const [filter,setFilter]=useState('Все');const [query,setQuery]=useState('');const [expanded,setExpanded]=useState<number|null>(null);const [userId,setUserId]=useState('')
 const load=async(force=false)=>{try{const data=await getRefunds(force);setRows(data);setError('');if(params.get('order'))setExpanded(data.find(r=>String(r.order_id)===params.get('order'))?.id||null)}catch(e:any){setError(e.message||'Не удалось загрузить возвраты')}finally{setLoading(false)}}
 useEffect(()=>{void load();void supabase.auth.getUser().then(({data})=>setUserId(data.user?.id||''))},[])
 const openCheck=async()=>{const reason=prompt('Укажите основание проверки поступления оплаты после отмены');if(!reason?.trim())return;setLoading(true);try{const {error}=await supabase.rpc('store_admin_open_refund',{p_order_id:Number(params.get('order')),p_reason:reason});if(error)throw error;refundsCacheApi.invalidate();await load(true)}catch(e:any){toast.error(e.message)}finally{setLoading(false)}}
 const q=query.trim().toLowerCase();const filtered=rows.filter(r=>(filter==='Все'||r.status===filter)&&(!q||[r.id,r.order_id,r.orders?.client_name,r.orders?.client_phone,...specialOrderIds(r.orders||{})].some(v=>String(v||'').toLowerCase().includes(q))))
 return <main className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg text-[#1B2A4A] dark:text-white p-6"><div className="max-w-5xl mx-auto space-y-5">
  <header className="flex items-center justify-between gap-3"><button className={button} onClick={()=>navigate('/')}><ArrowLeft size={18}/>На главную</button><h1 className="text-2xl font-bold flex items-center gap-2"><Undo2/>Возвраты</h1><button className={button} disabled={loading} onClick={()=>void load(true)} aria-label="Обновить возвраты"><RefreshCw size={18}/></button></header>
  <input className={input} placeholder="Поиск: номер возврата, заказа, имя, телефон…" value={query} onChange={e=>setQuery(e.target.value)}/>
  <div className="flex gap-3 items-center"><label>Статус <select className={button} value={filter} onChange={e=>setFilter(e.target.value)}>{['Все',...REFUND_STATUSES].map(s=><option key={s}>{s}</option>)}</select></label><p>Активных: {rows.filter(r=>['Проверка платежа','Ожидает возврата'].includes(r.status)).length}</p></div>
  {loading&&<p>Загрузка возвратов…</p>}{error&&<p role="alert">{error}</p>}
  {params.get('order')&&!rows.some(r=>String(r.order_id)===params.get('order'))&&!loading&&!error&&<section className={`${card} p-5`}><p>По заказу №{params.get('order')} нет записи возврата. Если поступление денег обнаружено после отмены, откройте проверку.</p><button className={button} onClick={()=>void openCheck()}>Открыть проверку платежа</button></section>}
  {!loading&&!error&&!filtered.length&&<p>Возвраты не найдены</p>}
  {filtered.map(r=><section className={card} key={r.id}><button className="w-full p-5 flex justify-between text-left gap-3" aria-expanded={expanded===r.id} onClick={()=>setExpanded(expanded===r.id?null:r.id)}><span><strong>Возврат №{r.id} · Заказ №{r.order_id}</strong><p className="text-sm opacity-70">{r.orders?.client_name} · {new Date(r.created_at).toLocaleString('ru-RU')}</p><p className="text-sm">{['Ожидает возврата','Возврат выполнен'].includes(r.status)?formatMoney(r.amount,r.currency):'Сумма требует проверки'} · {r.cancelled_by==='client'?'Отменён клиентом':r.cancelled_by==='store'?'Отменён магазином':'Источник отмены не сохранён'}</p></span><span>{r.status}<ChevronDown size={18}/></span></button>{expanded===r.id&&<RefundDetail key={r.id} r={r} userId={userId} onSaved={()=>load(true)}/>}</section>)}
 </div></main>
}

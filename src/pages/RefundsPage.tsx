import { useAdminRefresh } from '../lib/adminLive'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Undo2, ChevronDown, Search, X, User, Package, CreditCard, MapPin, MessageCircle, FileText, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { supabase, sendClientNotification, getAdminCacheScope } from '../lib/supabase'
import { refundsCacheApi } from '../lib/cache'
import { getRefunds, getRefundDetail, refundAction, uploadRefundProof } from '../lib/refunds'
import { REFUND_STATUSES, formatMoney, formatOrderMoney, orderStatus } from '../lib/orderState'
import { dataCache } from '../lib/resourceCache'
import { specialOrderIds } from '../lib/specialOrders'

const card='bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border rounded-2xl'
const button='inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] dark:border-dark-border bg-[#F5F1E8] dark:bg-dark-accent text-[#1B2A4A] dark:text-white text-xs font-bold hover:bg-[#E8E2D5] dark:hover:bg-dark-border transition-colors disabled:opacity-50'
const input='w-full p-3 rounded-xl border border-[#E8E2D5] dark:border-dark-border bg-[#FBF9F4] dark:bg-dark-card text-[#1B2A4A] dark:text-white text-base sm:text-sm focus:outline-none focus:border-[#C9A961] placeholder:text-[#8A8275] dark:placeholder:text-gray-500'
const actions:Record<string,string>={created:'Создан возврат',late_payment_check:'Открыта проверка платежа',claim:'Взят в работу',payment_received:'Подтверждено поступление оплаты',no_payment:'Оплата не обнаружена',proof:'Прикреплена квитанция',complete:'Подтверждён обратный перевод'}

function RefundDetail({r,userId,onSaved}:{r:any,userId:string,onSaved:()=>Promise<void>}) {
 const o=r.orders || {};const navigate=useNavigate()
 const [amount,setAmount]=useState('');const [currency,setCurrency]=useState('UZS');const [comment,setComment]=useState('')
 const [history,setHistory]=useState<any[]>([]);const [receipt,setReceipt]=useState<string|null>(null);const [proof,setProof]=useState<string|null>(null)
 const [confirmOpen,setConfirmOpen]=useState(false);const [busy,setBusy]=useState(false);const [confirmed,setConfirmed]=useState(false);const [message,setMessage]=useState('')
 const operation=useRef<{signature:string,key:string}|null>(null)
 const uploaded=useRef<{file:File,path:string}|null>(null)
 const mine=r.assigned_to===userId;const closed=r.status==='Возврат выполнен'
 useEffect(()=>{let active=true;void getRefundDetail(r).then(data=>{if(active){setHistory(data.history);setReceipt(data.receipt);setProof(data.proof)}}).catch(()=>{if(active)toast.error('Не удалось загрузить документы возврата')});return()=>{active=false}},[r.id,r.updated_at])
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
 return <div className="p-4 space-y-4 border-t border-[#E8E2D5] dark:border-dark-border bg-[#F5F1E8]/30 dark:bg-dark-bg/30 text-sm text-[#1B2A4A] dark:text-white">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
   <InfoMini icon={<Package size={14}/>} label="Связанный заказ"><p className="font-bold">Заказ №{o.id}{special.length>0?` · Спецзаказ №${special.join(', №')}`:''}</p><p>{orderStatus(o)} · {formatOrderMoney(o)}</p><button className="inline-flex items-center gap-1 text-[#C9A961] font-bold mt-1 hover:underline" onClick={()=>navigate(`/orders?order=${o.id}`)}>Открыть заказ</button></InfoMini>
   <InfoMini icon={<User size={14}/>} label="Клиент"><p>{o.client_name||'Имя не указано'} · {o.client_phone||'Телефон не указан'}</p><p className="text-[#8A8275] dark:text-gray-300 mt-1">Telegram: {o.user_chat_id||o.user_id}</p></InfoMini>
   <InfoMini icon={<Undo2 size={14}/>} label="Отмена"><p>{cancellationSource(r.cancelled_by)}</p><p className="text-[#8A8275] dark:text-gray-300 mt-1">{r.reason||o.cancellation_reason||'Причина не сохранена'}</p></InfoMini>
   <InfoMini icon={<MapPin size={14}/>} label="Получение"><p>{o.delivery_method==='pickup'?'Самовывоз':'Доставка'}</p><p className="text-[#8A8275] dark:text-gray-300 mt-1">{o.delivery_address||'ТЦ «Меркато», 2 этаж, магазин №34'}</p></InfoMini>
   <InfoMini icon={<CreditCard size={14}/>} label="Фактически подтверждённая оплата"><p>{o.payment_amount!=null?formatMoney(o.payment_amount,o.payment_currency):o.paid_at?formatOrderMoney(o):'Сумма не подтверждена'}</p><p className="text-[#8A8275] dark:text-gray-300 mt-1">{o.payment_method==='upon_receipt'?'При получении':'Переводом'} · {o.paid_at?new Date(o.paid_at).toLocaleString('ru-RU'):'Поступление не подтверждено'}</p>{receipt&&<a href={receipt} target="_blank" rel="noreferrer" className="inline-block mt-1 text-[#C9A961] font-bold hover:underline">Оригинал подтверждения оплаты</a>}</InfoMini>
   <InfoMini icon={<ShieldCheck size={14}/>} label="Ответственный менеджер"><p>{r.assigned_to?(mine?'Вы обрабатываете этот возврат':'Возврат обрабатывает другой менеджер'):'Ответственный менеджер не назначен'}</p>{r.completed_at&&<p className="mt-1 text-[#8A8275] dark:text-gray-300">Перевод подтверждён {new Date(r.completed_at).toLocaleString('ru-RU')} · {r.processed_by===userId?'Вы':'Менеджер'}</p>}</InfoMini>
  </div>
  <div className={`${card} p-4 flex flex-wrap items-center justify-between gap-3`}><div className="flex items-center gap-3"><span className="w-9 h-9 rounded-full bg-[#C9A961]/10 border border-[#C9A961]/30 flex items-center justify-center text-[#C9A961]"><Undo2 size={16}/></span><div><p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8275] dark:text-gray-300">Сумма возврата</p><p className="text-base font-bold text-[#C9A961]">{refundAmount(r)}</p></div></div>{proof&&<a href={proof} target="_blank" rel="noreferrer" className={button}><FileText size={14}/>Квитанция обратного перевода</a>}</div>
  {!closed&&!r.assigned_to&&<button className={button} disabled={busy} onClick={()=>void run('claim')}><ShieldCheck size={14}/>Взять в работу</button>}
  {mine&&!closed&&<div className={`${card} p-4 space-y-3`}>
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
  <details className={`${card} p-4`}><summary className="cursor-pointer font-bold text-xs">История обработки ({history.length})</summary>{history.map(h=><div className="py-2 border-b border-[#E8E2D5] dark:border-dark-border" key={h.id}><p>{new Date(h.created_at).toLocaleString('ru-RU')} · {actions[h.action]||h.action} · {h.actor_id===userId?'Вы':h.actor_id?'Менеджер':'Система'}</p><p>{h.current_state?.status}{h.current_state?.manager_comment?` · ${h.current_state.manager_comment}`:''}</p></div>)}</details>
  <textarea rows={3} aria-label="Сообщение клиенту" placeholder="Сообщение клиенту" className={input} value={message} maxLength={3000} onChange={e=>setMessage(e.target.value)}/>
  <button className={button} disabled={busy||!message.trim()} onClick={async()=>{setBusy(true);try{const escaped=message.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]!));const ok=await sendClientNotification(o.user_chat_id||o.user_id,`Возврат по заказу №${o.id}\n\n${escaped}`);if(!ok)throw Error('Не удалось отправить сообщение');setMessage('');toast.success('Сообщение отправлено')}catch(e:any){toast.error(e.message)}finally{setBusy(false)}}}><MessageCircle size={14}/>Написать клиенту</button>
 </div>
}

function InfoMini({icon,label,children}:{icon:ReactNode;label:string;children:ReactNode}) {
 return <div className={`${card} !rounded-xl p-3 flex items-start gap-2.5`}><span className="w-8 h-8 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center shrink-0">{icon}</span><div className="min-w-0 flex-1"><p className="text-[10px] uppercase tracking-wider font-bold text-[#8A8275] dark:text-gray-300">{label}</p><div className="text-xs font-medium mt-1 break-words">{children}</div></div></div>
}
function cancellationSource(source:string){return source==='client'?'Отменён клиентом':source==='store'?'Отменён магазином':source==='system'?'Отменён системой':'Источник отмены не сохранён'}
function refundAmount(r:any){return ['Ожидает возврата','Возврат выполнен'].includes(r.status)?formatMoney(r.amount,r.currency):'Сумма требует проверки'}
function statusColor(status:string){return ({'Проверка платежа':'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30','Ожидает возврата':'bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-500/30','Возврат выполнен':'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-500/30','Возврат не требуется':'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-500/30'} as Record<string,string>)[status]||''}
type ViewState={filter:string;query:string;expanded:number|null}
const viewKey=()=>`view:refunds:${getAdminCacheScope()}`

function RefundRow({r,open,userId,toggle,onSaved}:{r:any;open:boolean;userId:string;toggle:()=>void;onSaved:()=>Promise<void>}){
 const [visited,setVisited]=useState(open)
 useEffect(()=>{if(open)setVisited(true)},[open])
 return <section data-refund-row={r.id}>
  <button className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-[#F5F1E8] dark:hover:bg-dark-accent transition-colors" aria-expanded={open} aria-controls={`refund-detail-${r.id}`} onClick={toggle}>
   <span className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center shrink-0"><Undo2 size={16} className="text-[#C9A961]"/></span>
   <span className="flex-1 min-w-0"><span className="block text-sm font-bold">Возврат №{r.id} · Заказ №{r.order_id}</span><span className="block text-xs text-[#8A8275] dark:text-gray-300 mt-0.5 truncate">{r.orders?.client_name} · {new Date(r.created_at).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'})}</span><span className="block text-[10px] text-[#8A8275] dark:text-gray-300 mt-1 truncate">{cancellationSource(r.cancelled_by)}</span></span>
   <span className="shrink-0 text-right max-w-[48%]"><span className="block text-sm font-bold text-[#C9A961]">{refundAmount(r)}</span><span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor(r.status)}`}>{r.status}</span></span>
   <ChevronDown size={16} style={{transition:'rotate 250ms var(--loft-motion-ease)'}} className={`shrink-0 text-[#8A8275] dark:text-gray-300 transition-transform duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${open?'rotate-180':''}`}/>
  </button>
  <div id={`refund-detail-${r.id}`} data-refund-collapse className="grid transition-[grid-template-rows] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none" style={{gridTemplateRows:open?'1fr':'0fr',transition:'grid-template-rows 250ms var(--loft-motion-ease)'}} aria-hidden={!open} inert={!open}>
   <div className="overflow-hidden min-h-0">{(visited||open)&&<RefundDetail r={r} userId={userId} onSaved={onSaved}/>}</div>
  </div>
 </section>
}

export default function RefundsPage(){
 const navigate=useNavigate();const [params]=useSearchParams();const initial=dataCache.get<ViewState>(viewKey());const linked=!!params.get('order')
 const [rows,setRows]=useState<any[]>(()=>refundsCacheApi.get()||[]);const [loading,setLoading]=useState(!refundsCacheApi.get());const [refreshing,setRefreshing]=useState(false);const [error,setError]=useState('')
 const [filter,setFilter]=useState(linked?'Все':params.get('status')||initial?.filter||'Все');const [query,setQuery]=useState(linked?'':initial?.query||'');const [expanded,setExpanded]=useState<number|null>(linked?null:initial?.expanded||null);const [userId,setUserId]=useState('')
 const generation=useRef(0);const linkedResolved=useRef(false)
 const load=async(force=false)=>{const current=++generation.current;if(force)setRefreshing(true);try{const data=await getRefunds(force);if(current!==generation.current)return;setRows(data);setError('');if(linked&&!linkedResolved.current){setExpanded(data.find(r=>String(r.order_id)===params.get('order'))?.id||null);linkedResolved.current=true}}catch(e:any){if(current===generation.current)setError(e.message||'Не удалось загрузить возвраты')}finally{if(current===generation.current){setLoading(false);setRefreshing(false)}}}
 useEffect(()=>{void load();void supabase.auth.getUser().then(({data})=>setUserId(data.user?.id||''));return()=>{generation.current++}},[])
 useEffect(()=>{dataCache.set(viewKey(),{filter,query,expanded},30*60_000)},[filter,query,expanded,rows])
 useAdminRefresh(['refunds','orders'],()=>load())
 const openCheck=async()=>{const reason=prompt('Укажите основание проверки поступления оплаты после отмены');if(!reason?.trim())return;setRefreshing(true);try{const {error}=await supabase.rpc('store_admin_open_refund',{p_order_id:Number(params.get('order')),p_reason:reason});if(error)throw error;refundsCacheApi.invalidate();linkedResolved.current=false;await load(true)}catch(e:any){toast.error(e.message)}finally{setRefreshing(false)}}
 const q=query.trim().toLowerCase();const searchFiltered=rows.filter(r=>!q||[r.id,r.order_id,r.orders?.client_name,r.orders?.client_phone,...specialOrderIds(r.orders||{})].some(v=>String(v||'').toLowerCase().includes(q)))
 const filtered=searchFiltered.filter(r=>filter==='Все'||(filter==='active'?['Проверка платежа','Ожидает возврата'].includes(r.status):r.status===filter));const active=rows.filter(r=>['Проверка платежа','Ожидает возврата'].includes(r.status)).length
 return <main className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg text-[#1B2A4A] dark:text-white">
  <div className="sticky top-0 z-20 bg-[#F5F1E8]/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-[#E8E2D5] dark:border-dark-border px-6 py-4"><div className="max-w-5xl mx-auto">
   <div className="flex items-center justify-between gap-4">
    <button className="flex items-center gap-3 text-sm font-bold hover:text-[#C9A961] transition-colors" onClick={()=>navigate('/')}><span className={`${card} !rounded-full w-10 h-10 flex items-center justify-center shrink-0`}><ArrowLeft size={18}/></span><span className="hidden sm:inline">На главную</span><span className="sr-only sm:hidden">На главную</span></button>
    <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Возвраты</h1><span className={`${card} !rounded-full w-10 h-10 flex items-center justify-center shrink-0`}><Undo2 size={18} className="text-[#C9A961]"/></span></div>
    <button className={`${button} shrink-0`} disabled={loading||refreshing} onClick={()=>void load(true)} aria-label="Обновить возвраты" title="Обновить список"><RefreshCw size={14} className={refreshing?'animate-spin':''}/><span className="hidden sm:inline">Обновить</span></button>
   </div>
   <div className={`${card} mt-4 flex items-center gap-3 p-3`}><span className="w-9 h-9 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border flex items-center justify-center shrink-0"><Search size={16}/></span><input className="flex-1 min-w-0 bg-transparent text-sm font-medium focus:outline-none placeholder:text-[#8A8275] dark:placeholder:text-gray-500" aria-label="Поиск возвратов" placeholder="Поиск: № возврата, заказа, имя или телефон..." value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="Очистить поиск" className="p-1.5 rounded-lg text-[#8A8275] hover:bg-[#F5F1E8] dark:hover:bg-dark-accent" onClick={()=>setQuery('')}><X size={16}/></button>}</div>
   <div className="mt-3 flex items-center gap-2 flex-wrap"><label className="flex items-center gap-2 basis-full sm:basis-0 flex-1 min-w-0"><span className="text-xs font-bold text-[#8A8275] dark:text-gray-300 uppercase tracking-wider">Статус:</span><select className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-[#E8E2D5] dark:border-dark-border bg-[#FBF9F4] dark:bg-dark-card text-sm font-bold focus:outline-none focus:border-[#C9A961] truncate" value={filter} onChange={e=>setFilter(e.target.value)}>{['Все',...(filter==='active'?['active']:[]),...REFUND_STATUSES].map(s=><option key={s} value={s}>{s==='active'?'Активные':s} ({s==='Все'?searchFiltered.length:searchFiltered.filter(r=>s==='active'?['Проверка платежа','Ожидает возврата'].includes(r.status):r.status===s).length})</option>)}</select></label><span className={`${card} !rounded-xl px-3 py-2 text-sm font-bold`}>Показано: <span className="text-[#C9A961]">{filtered.length}</span></span><span className={`${card} !rounded-xl px-3 py-2 text-sm font-bold`}>Активных: <span className="text-[#C9A961]">{active}</span></span></div>
  </div></div>
  <div data-loft-content className="max-w-5xl mx-auto p-6">
   {error&&<div role="alert" className={`${card} p-5 mb-4 text-[#9B3B3B] dark:text-red-300`}>{error}<button className={`${button} ml-3`} onClick={()=>void load(true)}>Повторить</button></div>}
   {loading?<div className={`${card} p-10 text-center`} role="status"><RefreshCw className="animate-spin mx-auto mb-3 text-[#C9A961]" size={28}/><p className="text-sm font-medium">Загрузка возвратов...</p></div>:<>
    {linked&&!rows.some(r=>String(r.order_id)===params.get('order'))&&!error&&<section className={`${card} p-5 mb-4`}><p className="text-sm text-[#8A8275] dark:text-gray-300 mb-3">По заказу №{params.get('order')} нет записи возврата. Если поступление денег обнаружено после отмены, откройте проверку.</p><button className={button} disabled={refreshing} onClick={()=>void openCheck()}>Открыть проверку платежа</button></section>}
    {!error&&!filtered.length?<div className={`${card} p-12 text-center`}><span className="w-16 h-16 rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border mx-auto mb-4 flex items-center justify-center"><Undo2 size={28} className="text-[#8A8275] dark:text-gray-300"/></span><p className="font-medium mb-1">{q?'Возвраты не найдены':filter==='Все'?'Возвратов пока нет':'Нет возвратов с таким статусом'}</p><p className="text-sm text-[#8A8275] dark:text-gray-300">{q?`По запросу «${query}» ничего нет`:filter==='Все'?'Возвраты появятся здесь после отмены оплаченного заказа':'Попробуйте выбрать другой фильтр'}</p></div>:<div className={`${card} overflow-hidden divide-y divide-[#E8E2D5] dark:divide-dark-border`}>{filtered.map(r=><RefundRow key={r.id} r={r} open={expanded===r.id} userId={userId} toggle={()=>setExpanded(expanded===r.id?null:r.id)} onSaved={()=>load(true)}/>)}</div>}
   </>}
  </div>
 </main>
}

import {t,tx,uiError,useAdminLanguage} from '../lib/i18n'
import {useEffect,useState} from 'react'
import {Bell,Check} from 'lucide-react'
import {toast} from 'sonner'
import {supabase} from '../lib/supabase'
import {dataCache} from '../lib/resourceCache'
import {useAdminRefresh} from '../lib/adminLive'
import LoftSwitch from './LoftSwitch'
const labels:Record<string,string>={payment_review:'Оплата не проверена',special_assessment:'Спецзаказ не оценён',supplier_purchase:'Оплаченный спецзаказ не закуплен',assembly:'Заказ на сборке',pickup_ready:'Готов, но не получен',refund:'Возврат ожидает выполнения'}
const input='rounded-xl p-2.5 text-base sm:text-sm border border-[#E8E2D5] dark:border-dark-border bg-[#F5F1E8] dark:bg-dark-accent focus:outline-none focus:border-[#C9A961]'
const button='px-4 py-2.5 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 border border-[#E8E2D5] dark:border-dark-border disabled:opacity-50'
export default function ReminderSettings(){
 useAdminLanguage()

 const [data,setData]=useState<any>(()=>dataCache.get('admin:reminders')),[error,setError]=useState(''),[dirty,setDirty]=useState<string[]>([]),[busy,setBusy]=useState('')
 const load=async(force=false)=>{if(dirty.length&&!force)return;try{const result=await dataCache.load('admin:reminders',async()=>{const {data,error}=await supabase.rpc('store_admin_reminder_settings');if(error)throw error;return data},15000,force);setData(result);setDirty([]);setError('')}catch{setError('Не удалось загрузить настройки напоминаний')}}
 useEffect(()=>{void load()},[]);useAdminRefresh(['reminder_settings'],()=>load())
 useEffect(()=>{if(!dirty.length)return;const guard=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue=''};window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard)},[dirty.length])
 const mark=(key:string)=>setDirty(old=>old.includes(key)?old:[...old,key])
 const change=(key:string,value:any)=>{setData({...data,value:{...data.value,[key]:value}});mark('global')}
 const rule=(key:string,field:string,value:any)=>{setData({...data,value:{...data.value,rules:{...data.value.rules,[key]:{...data.value.rules[key],[field]:value}}}});mark(key)}
 const save=async(group:string)=>{if(busy)return;setBusy(group);try{
  const patch=group==='global'?Object.fromEntries(['timezone','work_start','work_end','repeat_hours'].map(k=>[k,data.value[k]])):{rules:{[group]:data.value.rules[group]}}
  const {data:next,error}=await supabase.rpc('store_admin_reminder_settings',{p_value:patch,p_version:data.version});if(error)throw error
  dataCache.set('admin:reminders',next,15000);const remaining=dirty.filter(k=>k!==group)
  setData((old:any)=>{const value={...next.value,rules:{...next.value.rules}};if(remaining.includes('global'))for(const k of ['timezone','work_start','work_end','repeat_hours'])value[k]=old.value[k];for(const k of remaining.filter(k=>k!=='global'))value.rules[k]=old.value.rules[k];return {...next,value}});setDirty(remaining);setError('');toast.success(tx(t("Настройки напоминаний сохранены")))
 }catch(e:any){const message=e.message||'Не удалось сохранить';setError(message);toast.error(uiError(message))}finally{setBusy('')}}
 return <section data-loft-dirty={dirty.length?'true':undefined} className="lg:col-span-2 bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border rounded-2xl p-5 text-[#1B2A4A] dark:text-white"><h2 className="font-bold text-lg flex items-center gap-2 mb-2"><Bell size={20}/>{t("Напоминания менеджеру")}</h2><p className="text-xs text-[#8A8275] dark:text-gray-300 mb-4">{t("Работают даже при закрытой админке. Клиентам эти сообщения не отправляются.")}</p>{error&&<p role="alert" className="text-sm text-red-700 dark:text-red-300 mb-3">{uiError(error)} <button className="underline" onClick={()=>{if(!dirty.length||confirm(tx(t("Обновить настройки и отменить несохранённые изменения?"))))void load(true)}}>{t("Обновить данные")}</button></p>}{!data?<button onClick={()=>void load(true)} className="text-sm">{error?t("Повторить"):t("Загрузка...")}</button>:<>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4"><label className="text-sm">{t("Часовой пояс магазина")}<input className={`${input} w-full mt-1`} value={data.value.timezone} onChange={e=>change('timezone',e.target.value)}/></label><label className="text-sm">{t("Интервал повторения, ч.")}<input type="number" min="1" max="8760" step="1" aria-label={t("Интервал повторения")} className={`${input} w-full mt-1`} value={data.value.repeat_hours} onChange={e=>change('repeat_hours',Number(e.target.value))}/></label><label className="text-sm">{t("Начало рабочего дня")}<input type="time" className={`${input} w-full mt-1`} value={data.value.work_start} onChange={e=>change('work_start',e.target.value)}/></label><label className="text-sm">{t("Конец рабочего дня")}<input type="time" className={`${input} w-full mt-1`} value={data.value.work_end} onChange={e=>change('work_end',e.target.value)}/></label></div>
  <button className={`${button} mb-4 bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A]`} disabled={!dirty.includes('global')||!!busy} onClick={()=>void save('global')}><Check size={16}/>{t("Сохранить рабочее время")}</button>
  <div className="divide-y divide-[#E8E2D5] dark:divide-dark-border">{Object.entries(labels).map(([key,label])=><div key={key} className="py-4 space-y-3"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-medium">{tx(label)}</h3><LoftSwitch label={tx(label)} checked={data.value.rules[key].enabled} disabled={!!busy} onChange={v=>rule(key,'enabled',v)}/></div><div className="flex flex-wrap gap-3 items-center"><label className="text-xs flex gap-2 items-center">{t("Через")}<input aria-label={t("Срок: {0}",[tx(label)])} type="number" min="1" max="8760" step="1" className={`${input} w-20`} value={data.value.rules[key].hours} onChange={e=>rule(key,'hours',Number(e.target.value))}/>{t("ч.")}</label><span className="text-xs flex gap-2 items-center">{t("Telegram менеджеру")}<LoftSwitch label={`Telegram: ${tx(label)}`} checked={data.value.rules[key].telegram} disabled={!!busy} onChange={v=>rule(key,'telegram',v)}/></span><button className={`${button} sm:ml-auto`} aria-label={t("Сохранить: {0}",[tx(label)])} disabled={!dirty.includes(key)||!!busy} onClick={()=>void save(key)}>{busy===key?t("Сохраняем..."):t("Сохранить")}</button></div></div>)}</div>
 </>}</section>
}

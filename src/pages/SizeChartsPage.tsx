import {useAdminDialogRoute} from '../lib/useAdminDialogRoute'
import {ContentSkeleton} from '../components/PageSkeleton'
import AdminHeaderActions from '../components/AdminPageHeader'
import AdminDialog from '../components/AdminDialog'
import SizeChartEditor from '../components/SizeChartEditor'
import {blankChart,type ChartDraft} from '../lib/sizeChartEditor'
import {dataCache} from '../lib/resourceCache'
import {t,tx,uiError,useAdminLanguage} from '../lib/i18n'
import {useEffect,useState} from 'react'
import {Plus,Edit,EyeOff,RefreshCw} from 'lucide-react'
import {toast} from 'sonner'
import {supabase} from '../lib/supabase'
import {readAll} from '../lib/readAll'
import {useAdminRefresh} from '../lib/adminLive'
const card='bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border rounded-2xl'
const button='px-3 py-2.5 rounded-xl font-bold text-sm inline-flex items-center gap-2 border border-[#E8E2D5] dark:border-dark-border bg-[#FBF9F4] dark:bg-dark-card disabled:opacity-50'
const fields='id,title_ru,title_uz,category_id,subcategory_id,brand_id,product_id,columns_ru,columns_uz,rows,is_active,updated_at,size_mapping'
export default function SizeChartsPage(){
 const language=useAdminLanguage(),dialogRoute=useAdminDialogRoute()
 const [charts,setCharts]=useState<any[]>(()=>dataCache.get('admin:size-charts',60000)||[]),[options,setOptions]=useState<any[][]>(()=>dataCache.get('admin:size-chart-options',60000)||[[],[],[],[]]),[editing,setEditing]=useState<ChartDraft|null>(null),[loading,setLoading]=useState(!dataCache.get('admin:size-charts',60000)),[ready,setReady]=useState(!!dataCache.get('admin:size-chart-options',60000)),[busy,setBusy]=useState(false),[committed,setCommitted]=useState(false),[error,setError]=useState('')
 const [categories,subs,brands,products]=options
 const load=async(force=false)=>{try{setError('');await Promise.all([
  dataCache.load('admin:size-charts',async()=>{const {data,error}=await supabase.from('size_charts').select(fields).order('updated_at',{ascending:false});if(error)throw error;return data||[]},60000,force).then(rows=>{setCharts(rows);setLoading(false)}),
  dataCache.load('admin:size-chart-options',async()=>{const results=await Promise.all([supabase.from('categories').select('*').order('sort_order'),supabase.from('subcategories').select('*').order('sort_order'),supabase.from('brands').select('id,name').order('name'),readAll(supabase.from('products').select('id,name_ru,name_uz,category,subcategory,brand'))]);if(results.some(r=>r.error))throw new Error('Не удалось загрузить таблицы размеров');return results.map(r=>r.data||[])},60000,force).then(rows=>{setOptions(rows);setReady(true)})
 ])}catch(e){setError(e instanceof Error?e.message:'Не удалось загрузить таблицы размеров')}finally{setLoading(false)}}
 useEffect(()=>{void load()},[]);useAdminRefresh(['size_charts','categories','subcategories','brands','products'],()=>load(true))
 const save=async(draft:ChartDraft)=>{if(busy)return;setBusy(true);try{const {error}=await supabase.rpc('store_admin_size_chart',{p_id:draft.id,p_value:draft});if(error)throw error;setCommitted(true);dialogRoute.close();await load(true);toast.success(tx(t('Таблица размеров сохранена')))}catch(e:any){toast.error(uiError(e.message||'Не удалось сохранить'))}finally{setBusy(false)}}
 const close=()=>{if(!busy)dialogRoute.close()}
 const edit=(draft:ChartDraft)=>{setCommitted(false);setEditing(draft);dialogRoute.open('edit',draft.id||'new')}
 useEffect(()=>{if(dialogRoute.mode!=='edit')setEditing(null);else if(!editing&&ready){setCommitted(false);const row=charts.find(c=>c.id===dialogRoute.item);if(dialogRoute.item==='new')setEditing(blankChart());else if(row)setEditing({...row,subcategory_id:row.subcategory_id||'',brand_id:row.brand_id||'',product_id:row.product_id||''})}},[dialogRoute.mode,dialogRoute.item,charts,ready])
 return <main className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg text-[#1B2A4A] dark:text-white">
  <AdminHeaderActions actions={<><button aria-label={t('Обновить')} className={button} onClick={()=>void load(true)}><RefreshCw size={16}/></button><button aria-label={t('Добавить таблицу')} disabled={!ready} className={button} onClick={()=>edit(blankChart())}><Plus size={16}/><span className="hidden sm:inline">{t('Добавить')}</span></button></>}/>
  <div data-loft-content className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4">
   {error&&<p role="alert" className={`${card} p-4`}>{uiError(error)} <button className={button} onClick={()=>void load(true)}>{t('Повторить')}</button></p>}
   {loading?<ContentSkeleton/>:!charts.length?<p className={`${card} p-6 text-sm text-[#8A8275] dark:text-gray-300`}>{t('Добавьте достоверные данные производителя. Индивидуальная таблица товара имеет приоритет над таблицей бренда, затем используется таблица категории.')}</p>:charts.map(c=><article key={c.id} className={`${card} p-4 flex justify-between gap-4 items-center`}><div className="min-w-0"><h2 className="font-bold break-words">{language==='uz'?c.title_uz:c.title_ru}</h2><p className="text-sm text-[#8A8275] dark:text-gray-300 mt-1">{categories.find(v=>v.id===c.category_id)?.[language==='uz'?'name_uz':'name_ru']}{c.subcategory_id?' · '+(subs.find(v=>v.id===c.subcategory_id)?.[language==='uz'?'name_uz':'name_ru']||''):''}{c.brand_id?' · '+(brands.find(v=>v.id===c.brand_id)?.name||''):''}{!c.is_active?t(' · Скрыта'):''}</p></div><div className="flex gap-2 shrink-0"><button disabled={!ready} aria-label={t('Редактировать таблицу')} className={button} onClick={()=>edit({...c,subcategory_id:c.subcategory_id||'',brand_id:c.brand_id||'',product_id:c.product_id||''})}><Edit size={16}/></button>{c.is_active&&<button aria-label={t('Скрыть таблицу')} className={button} onClick={async()=>{if(!confirm(tx(t('Скрыть таблицу размеров?'))))return;const {error}=await supabase.rpc('store_admin_size_chart',{p_id:c.id,p_value:null});if(error)toast.error(uiError(error.message));else void load(true)}}><EyeOff size={16}/></button>}</div></article>)}
  </div>
  <AdminDialog open={dialogRoute.mode==='edit'&&!!editing} label={t('Таблица размеров')} onClose={close} busy={busy}>{editing&&<SizeChartEditor key={editing.id||'new'} initial={editing} categories={categories} subs={subs} brands={brands} products={products} busy={busy} committed={committed} onClose={close} onSave={draft=>void save(draft)}/>}</AdminDialog>
 </main>
}

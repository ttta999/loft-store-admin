import {useLocation} from 'react-router-dom'
import {Package,Globe,ShoppingBag,Layers,Tag,Ruler,Undo2,BarChart3,Send,Settings,Bell,Truck,Palette,DollarSign} from 'lucide-react'
import AdminPageHeader from './AdminPageHeader'
import {routeTitle} from '../lib/adminNavigation'
import {t,useAdminLanguage} from '../lib/i18n'
export function ContentSkeleton({kind='list'}:{kind?:'list'|'products'|'settings'}){
 useAdminLanguage()
 return <div aria-busy="true" role="status" aria-label={t('Загрузка')} className={kind==='products'?'grid grid-cols-2 lg:grid-cols-3 gap-4':'space-y-4'}>{[0,1,2].map(n=><div key={n} className="rounded-2xl border border-[#E8E2D5] dark:border-dark-border bg-[#FBF9F4] dark:bg-dark-card p-5 motion-safe:animate-pulse">{kind==='products'&&<div className="aspect-square rounded-xl bg-[#E8E2D5]/60 dark:bg-dark-accent mb-4"/>}<div className="flex gap-4 items-center"><div className="w-10 h-10 rounded-full bg-[#E8E2D5]/60 dark:bg-dark-accent shrink-0"/><div className="flex-1 space-y-3"><div className="h-4 w-2/3 rounded bg-[#E8E2D5]/60 dark:bg-dark-accent"/><div className="h-3 w-1/3 rounded bg-[#E8E2D5]/60 dark:bg-dark-accent"/></div></div>{kind==='settings'&&<div className="grid sm:grid-cols-2 gap-3 mt-5"><div className="h-11 rounded-xl bg-[#E8E2D5]/60 dark:bg-dark-accent"/><div className="h-11 rounded-xl bg-[#E8E2D5]/60 dark:bg-dark-accent"/></div>}</div>)}</div>
}
export default function PageSkeleton({title}:{title?:string}){
 const location=useLocation(),section=new URLSearchParams(location.search).get('section')
 const icons:Record<string,typeof Package>={'/orders':Package,'/china':Globe,'/catalog':ShoppingBag,'/products':ShoppingBag,'/categories':Layers,'/brands':Tag,'/size-charts':Ruler,'/refunds':Undo2,'/analytics':BarChart3,'/campaigns':Send,'/settings':section==='reminders'?Bell:section==='payments'?Truck:section==='theme'?Palette:section==='prices'?DollarSign:Settings}
 const Icon=icons[location.pathname]||Settings
 return <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg text-[#1B2A4A] dark:text-white"><AdminPageHeader title={title||routeTitle(location.pathname,location.search)} icon={<Icon/>}/><div data-loft-content className="max-w-6xl mx-auto p-4 sm:p-6"><ContentSkeleton kind={location.pathname==='/products'?'products':location.pathname==='/settings'?'settings':'list'}/></div></div>
}

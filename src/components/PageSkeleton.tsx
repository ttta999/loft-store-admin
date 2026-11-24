import {useLocation} from 'react-router-dom'
import {t,useAdminLanguage} from '../lib/i18n'
export function ContentSkeleton({kind='list'}:{kind?:'list'|'products'|'settings'|'analytics'}){
 useAdminLanguage()
 if (kind === 'analytics') return <div aria-busy="true" role="status" aria-label={t('Загрузка')} className="space-y-4 motion-safe:animate-pulse">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
   {[0,1,2,3].map(n => <div key={n} className="h-28 rounded-2xl border border-[#E8E2D5] dark:border-dark-border bg-[#FBF9F4] dark:bg-dark-card p-4">
    <div className="h-9 w-9 rounded-full bg-[#E8E2D5]/60 dark:bg-dark-accent mb-2"/>
    <div className="h-4 w-2/3 rounded bg-[#E8E2D5]/60 dark:bg-dark-accent"/>
   </div>)}
  </div>
  <div className="h-64 rounded-2xl border border-[#E8E2D5] dark:border-dark-border bg-[#FBF9F4] dark:bg-dark-card"/>
 </div>
 return <div aria-busy="true" role="status" aria-label={t('Загрузка')} className={kind==='products'?'grid grid-cols-2 lg:grid-cols-3 gap-4':'space-y-4'}>{[0,1,2].map(n=><div key={n} className="rounded-2xl border border-[#E8E2D5] dark:border-dark-border bg-[#FBF9F4] dark:bg-dark-card p-5 motion-safe:animate-pulse">{kind==='products'&&<div className="aspect-square rounded-xl bg-[#E8E2D5]/60 dark:bg-dark-accent mb-4"/>}<div className="flex gap-4 items-center"><div className="w-10 h-10 rounded-full bg-[#E8E2D5]/60 dark:bg-dark-accent shrink-0"/><div className="flex-1 space-y-3"><div className="h-4 w-2/3 rounded bg-[#E8E2D5]/60 dark:bg-dark-accent"/><div className="h-3 w-1/3 rounded bg-[#E8E2D5]/60 dark:bg-dark-accent"/></div></div>{kind==='settings'&&<div className="grid sm:grid-cols-2 gap-3 mt-5"><div className="h-11 rounded-xl bg-[#E8E2D5]/60 dark:bg-dark-accent"/><div className="h-11 rounded-xl bg-[#E8E2D5]/60 dark:bg-dark-accent"/></div>}</div>)}</div>
}
export default function PageSkeleton(){
 const { pathname } = useLocation()
 return <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg text-[#1B2A4A] dark:text-white"><div data-loft-content className="max-w-6xl mx-auto p-4 sm:p-6"><ContentSkeleton kind={pathname==='/analytics'?'analytics':pathname==='/products'?'products':pathname==='/settings'?'settings':'list'}/></div></div>
}

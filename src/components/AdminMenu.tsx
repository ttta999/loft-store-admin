import {t,tx,useAdminLanguage} from '../lib/i18n'
import {type ReactNode} from 'react'
import {useNavigate} from 'react-router-dom'
import {ArrowLeft,ChevronRight} from 'lucide-react'
import {warmPage} from '../lib/pagePreload'
export type MenuEntry={path:string;title:string;description?:string;icon:ReactNode;count?:string}
export function AdminMenuRows({entries}:{entries:MenuEntry[]}){
 useAdminLanguage()

 const navigate=useNavigate()
 return <div className="rounded-2xl overflow-hidden border border-[#E8E2D5] dark:border-dark-border bg-[#FBF9F4] dark:bg-dark-card divide-y divide-[#E8E2D5] dark:divide-dark-border">{entries.map(e=><button key={e.path} data-admin-card={e.path} onPointerEnter={()=>warmPage(e.path)} onFocus={()=>warmPage(e.path)} onPointerDown={()=>warmPage(e.path)} onClick={()=>navigate(e.path)} className="w-full p-4 sm:p-5 text-left flex items-center gap-4 bg-[#FBF9F4] dark:bg-dark-card hover:bg-[#F5F1E8] dark:hover:bg-dark-accent text-[#1B2A4A] dark:text-white"><span className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#C9A961]">{e.icon}</span><span className="flex-1 min-w-0"><span className="block font-bold text-sm sm:text-base">{tx(e.title)}</span>{e.description&&<span className="block text-xs mt-1 text-[#8A8275] dark:text-gray-300">{tx(e.description)}</span>}</span>{e.count&&<span className="text-xs text-[#8A8275] dark:text-gray-300">{e.count}</span>}<ChevronRight size={18} className="text-[#8A8275] dark:text-gray-300 shrink-0"/></button>)}</div>
}
export function AdminMenuPage({title,icon,entries,back='/'}:{title:string;icon:ReactNode;entries:MenuEntry[];back?:string}){
 useAdminLanguage()

 const navigate=useNavigate()
 return <main className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg text-[#1B2A4A] dark:text-white"><header className="sticky top-0 z-20 p-4 sm:p-6 bg-[#F5F1E8]/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-[#E8E2D5] dark:border-dark-border"><div className="max-w-6xl mx-auto flex items-center justify-between gap-4"><button onClick={()=>navigate(back)} className="flex items-center gap-2 font-bold text-sm"><ArrowLeft size={19}/>{back==='/'?t("На главную"):t("Назад")}</button><h1 className="text-xl sm:text-2xl font-bold flex items-center gap-3">{tx(title)}{icon}</h1><span className="w-5"/></div></header><div data-loft-content className="max-w-6xl mx-auto p-4 sm:p-6"><AdminMenuRows entries={entries}/></div></main>
}

import {tx,useAdminLanguage} from '../lib/i18n'
import {useEffect,type ReactNode} from 'react'
import {useNavigate} from 'react-router-dom'
import {ChevronRight} from 'lucide-react'
import {warmPage} from '../lib/pagePreload'
export type MenuEntry={path:string;title:string;description?:string;icon:ReactNode;count?:string}
export function AdminMenuRows({entries}:{entries:MenuEntry[]}){
 useAdminLanguage()

 const navigate=useNavigate()
 useEffect(()=>{
  const connection=(navigator as Navigator&{connection?:{saveData?:boolean;effectiveType?:string}}).connection
  if(connection?.saveData||connection?.effectiveType==='2g')return
  let cancelled=false
  const timer=setTimeout(()=>{if(!cancelled)for(const entry of entries.slice(0,2))warmPage(entry.path)},250)
  return()=>{cancelled=true;clearTimeout(timer)}
 },[entries.map(e=>e.path).join('|')])
 return <div className="rounded-2xl overflow-hidden border border-[#E8E2D5] dark:border-dark-border bg-[#FBF9F4] dark:bg-dark-card divide-y divide-[#E8E2D5] dark:divide-dark-border">{entries.map(e=><button key={e.path} data-admin-card={e.path} onPointerEnter={()=>warmPage(e.path)} onFocus={()=>warmPage(e.path)} onPointerDown={()=>warmPage(e.path)} onClick={()=>navigate(e.path)} className="w-full p-4 sm:p-5 text-left flex items-center gap-4 bg-[#FBF9F4] dark:bg-dark-card hover:bg-[#F5F1E8] dark:hover:bg-dark-accent text-[#1B2A4A] dark:text-white"><span className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-[#F5F1E8] dark:bg-dark-accent border border-[#E8E2D5] dark:border-dark-border text-[#C9A961]">{e.icon}</span><span className="flex-1 min-w-0"><span className="block font-bold text-sm sm:text-base">{tx(e.title)}</span>{e.description&&<span className="block text-xs mt-1 text-[#8A8275] dark:text-gray-300">{tx(e.description)}</span>}</span>{e.count&&<span className="text-xs text-[#8A8275] dark:text-gray-300">{e.count}</span>}<ChevronRight size={18} className="text-[#8A8275] dark:text-gray-300 shrink-0"/></button>)}</div>
}
export function AdminMenuPage({entries}:{entries:MenuEntry[]}){
 useAdminLanguage()

 return <main className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg text-[#1B2A4A] dark:text-white"><div data-loft-content className="max-w-6xl mx-auto p-4 sm:p-6"><AdminMenuRows entries={entries}/></div></main>
}

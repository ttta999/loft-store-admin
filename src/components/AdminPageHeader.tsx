import type {ReactNode} from 'react'
import {ArrowLeft} from 'lucide-react'
import {tx,useAdminLanguage} from '../lib/i18n'
import {useAdminBack} from '../lib/adminNavigation'
export function AdminBackButton(){
 useAdminLanguage();const {back,label}=useAdminBack()
 return <button data-admin-back onClick={back} className="inline-flex items-center gap-2 text-sm font-bold text-[#1B2A4A] dark:text-white min-h-11"><span className="w-10 h-10 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border inline-flex items-center justify-center shrink-0"><ArrowLeft size={18}/></span><span className="hidden sm:inline">{tx(label)}</span><span className="sr-only sm:hidden">{tx(label)}</span></button>
}
export function AdminHeaderRow({title,icon,actions}:{title:string;icon:ReactNode;actions?:ReactNode}){
 useAdminLanguage()
 return <div data-admin-heading className="grid grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 text-[#1B2A4A] dark:text-white"><div className="justify-self-start min-w-0"><AdminBackButton/></div><div className="flex items-center justify-center gap-2 sm:gap-3 min-w-0"><h1 className="text-base sm:text-2xl font-bold text-center [overflow-wrap:anywhere] max-w-[50vw] sm:max-w-none leading-tight">{tx(title)}</h1><span className="inline-flex w-8 h-8 sm:w-10 sm:h-10 rounded-full items-center justify-center shrink-0 bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border text-[#C9A961] [&>svg]:w-[18px] [&>svg]:h-[18px]">{icon}</span></div><div className="justify-self-end flex items-center gap-2 [&_button]:shrink-0">{actions}</div></div>
}
export default function AdminPageHeader(props:{title:string;icon:ReactNode;actions?:ReactNode}){
 return <header className="sticky top-0 z-20 px-4 py-4 sm:px-6 bg-[#F5F1E8] dark:bg-dark-bg border-b border-[#E8E2D5] dark:border-dark-border"><div className="max-w-6xl mx-auto"><AdminHeaderRow {...props}/></div></header>
}

import {t,tx,useAdminLanguage} from '../lib/i18n'
import {ArrowLeft} from 'lucide-react'
import {useNavigate} from 'react-router-dom'
export default function PageSkeleton({title='LOFT Admin Panel'}:{title?:string}){
 useAdminLanguage()

 const navigate=useNavigate()
 return <div aria-busy="true" className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg text-[#1B2A4A] dark:text-white"><header className="sticky top-0 border-b border-[#E8E2D5] dark:border-dark-border bg-[#F5F1E8] dark:bg-dark-bg p-6"><div className="max-w-6xl mx-auto flex items-center justify-between"><button aria-label={t("На главную")} onClick={()=>navigate('/')}><ArrowLeft size={20}/></button><h1 className="text-2xl font-bold">{tx(title)}</h1><span className="w-5"/></div></header><div data-loft-content role="status" aria-label={t("Загрузка")} className="max-w-6xl mx-auto p-6 space-y-4">{[0,1,2].map(n=><div key={n} className="h-32 rounded-2xl border border-[#E8E2D5] dark:border-dark-border bg-[#FBF9F4] dark:bg-dark-card motion-safe:animate-pulse"/>)}</div></div>
}

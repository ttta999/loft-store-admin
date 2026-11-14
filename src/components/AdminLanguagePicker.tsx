import {Languages} from 'lucide-react'
import {setAdminLanguage,t,useAdminLanguage} from '../lib/i18n'
export default function AdminLanguagePicker(){
 const language=useAdminLanguage()
 return <section className="text-[#1B2A4A] dark:text-white bg-[#FBF9F4] dark:bg-dark-card rounded-2xl border border-[#E8E2D5] dark:border-dark-border p-5 space-y-3">
  <h2 className="flex items-center gap-2 font-bold"><Languages size={18}/>{t('Язык интерфейса')}</h2>
  <div className="flex gap-2" role="group" aria-label={t('Язык интерфейса')}>
   {(['ru','uz'] as const).map(value=><button type="button" key={value} aria-pressed={language===value} onClick={()=>setAdminLanguage(value)} className={`flex-1 rounded-xl px-4 py-3 font-semibold transition-colors ${language===value?'bg-[#1B2A4A] text-white dark:bg-gold dark:text-[#1B2A4A]':'bg-[#F5F1E8] dark:bg-dark-accent text-[#1B2A4A] dark:text-white'}`}>{value==='ru'?'Русский':'O‘zbekcha'}</button>)}
  </div>
 </section>
}

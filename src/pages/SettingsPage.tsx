import {t,useAdminLanguage} from '../lib/i18n'
import {useSearchParams,useNavigate} from 'react-router-dom'
import {Settings,Truck,DollarSign,Tag,Bell,Palette,ArrowLeft} from 'lucide-react'
import {AdminMenuPage} from '../components/AdminMenu'
import ReminderSettings from '../components/ReminderSettings'
import PaymentCardsSettings from '../components/PaymentCardsSettings'
import SettingsForms from './SettingsForms'
export default function SettingsPage(){
 useAdminLanguage()

 const [params]=useSearchParams(),section=params.get('section'),navigate=useNavigate()
 if(section==='prices'||section==='sale'||section==='theme')return <SettingsForms key={section} section={section}/>
 if(section==='reminders'||section==='payments')return <main className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg text-[#1B2A4A] dark:text-white"><header className="sticky top-0 z-20 p-6 border-b border-[#E8E2D5] dark:border-dark-border bg-[#F5F1E8]/95 dark:bg-dark-bg/95"><div className="max-w-6xl mx-auto flex items-center justify-between gap-4"><button className="flex gap-2 items-center font-bold" onClick={()=>navigate('/settings')}><ArrowLeft size={18}/>{t("Настройки")}</button><h1 className="text-xl sm:text-2xl font-bold">{section==='reminders'?t("Уведомления и напоминания"):t("Оплата и доставка")}</h1><span className="w-5"/></div></header><div data-loft-content className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4">{section==='reminders'?<ReminderSettings/>:<><PaymentCardsSettings/><SettingsForms section="delivery" embedded/></>}</div></main>
 return <AdminMenuPage title={t("Настройки")} icon={<Settings size={22}/>} entries={[
  {path:'/settings?section=payments',title:'Оплата и доставка',description:'Карты для перевода, стоимость и бесплатная доставка',icon:<Truck size={20}/>},
  {path:'/settings?section=prices',title:'Валюта и цены',description:'Курс USD к UZS',icon:<DollarSign size={20}/>},
  {path:'/settings?section=sale',title:'Скидки',icon:<Tag size={20}/>},
  {path:'/settings?section=reminders',title:'Уведомления и напоминания',icon:<Bell size={20}/>},
  {path:'/settings?section=theme',title:'Язык и оформление',icon:<Palette size={20}/>},
 ]}/>
}

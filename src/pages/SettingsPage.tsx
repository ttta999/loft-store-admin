import {useSearchParams} from 'react-router-dom'
import {Truck,DollarSign,Tag,Bell,Palette} from 'lucide-react'
import {AdminMenuPage} from '../components/AdminMenu'
import ReminderSettings from '../components/ReminderSettings'
import PaymentCardsSettings from '../components/PaymentCardsSettings'
import SettingsForms from './SettingsForms'
export default function SettingsPage(){

 const [params]=useSearchParams(),section=params.get('section')
 if(section==='prices'||section==='sale'||section==='theme')return <SettingsForms key={section} section={section}/>
 if(section==='reminders'||section==='payments')return <main className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg text-[#1B2A4A] dark:text-white"><div data-loft-content className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4">{section==='reminders'?<ReminderSettings/>:<><PaymentCardsSettings/><SettingsForms section="delivery" embedded/></>}</div></main>
 return <AdminMenuPage entries={[
  {path:'/settings?section=payments',title:'Оплата и доставка',description:'Карты для перевода, стоимость и бесплатная доставка',icon:<Truck size={20}/>},
  {path:'/settings?section=prices',title:'Валюта и цены',description:'Курс USD к UZS',icon:<DollarSign size={20}/>},
  {path:'/settings?section=sale',title:'Скидки',icon:<Tag size={20}/>},
  {path:'/settings?section=reminders',title:'Уведомления и напоминания',icon:<Bell size={20}/>},
  {path:'/settings?section=theme',title:'Язык и оформление',icon:<Palette size={20}/>},
 ]}/>
}

import {t,useAdminLanguage} from '../lib/i18n'
import {ShoppingBag,Layers,Tag,Ruler} from 'lucide-react'
import {AdminMenuPage} from '../components/AdminMenu'
export default function CatalogMenuPage(){
 useAdminLanguage()
return <AdminMenuPage title={t("Каталог")} icon={<ShoppingBag size={22}/>} entries={[{path:'/products',title:'Товары',description:'Каталог и остатки',icon:<ShoppingBag size={20}/>},{path:'/categories',title:'Категории и подкатегории',icon:<Layers size={20}/>},{path:'/brands',title:'Бренды',icon:<Tag size={20}/>},{path:'/size-charts',title:'Таблицы размеров',icon:<Ruler size={20}/>}]} />}

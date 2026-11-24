import {ShoppingBag,Layers,Tag,Ruler} from 'lucide-react'
import {AdminMenuPage} from '../components/AdminMenu'
export default function CatalogMenuPage(){
return <AdminMenuPage entries={[{path:'/products',title:'Товары',description:'Каталог и остатки',icon:<ShoppingBag size={20}/>},{path:'/categories',title:'Категории и подкатегории',icon:<Layers size={20}/>},{path:'/brands',title:'Бренды',icon:<Tag size={20}/>},{path:'/size-charts',title:'Таблицы размеров',icon:<Ruler size={20}/>}]} />}

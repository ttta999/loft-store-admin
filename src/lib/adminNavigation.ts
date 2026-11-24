import {useLocation,useNavigate} from 'react-router-dom'
export type AdminLocation={key:string;pathname:string;search:string}
type Origin={url:string;index:number}
const storage='loft-admin-origins-v1'
const allowed=new Set(['/','/catalog','/orders','/china','/products','/categories','/brands','/size-charts','/refunds','/analytics','/campaigns','/settings'])
const safe=(url:string)=>url.startsWith('/')&&!url.startsWith('//')&&allowed.has(url.split('?')[0])
function read():Record<string,Origin>{try{return JSON.parse(sessionStorage.getItem(storage)||'{}')}catch{return {}}}
export function rememberAdminOrigin(from:AdminLocation,to:AdminLocation,type:string,index:number){
 if(!['PUSH','REPLACE'].includes(type)||from.pathname==='/login'||!safe(from.pathname)||!safe(to.pathname))return
 const entries=read();if(type==='REPLACE'){if(entries[from.key])entries[to.key]=entries[from.key]}else entries[to.key]={url:from.pathname+from.search,index:index-1}
 const keys=Object.keys(entries);for(const key of keys.slice(0,Math.max(0,keys.length-60)))delete entries[key]
 try{sessionStorage.setItem(storage,JSON.stringify(entries))}catch{/* History fallback remains available. */}
}
export function parentRoute(path:string,search=''){
 if(new URLSearchParams(search).has('dialog'))return path
 if(path==='/settings'&&search)return '/settings'
 if(['/products','/categories','/brands','/size-charts'].includes(path))return '/catalog'
 return '/'
}
export function routeTitle(path:string,search=''){
 const section=new URLSearchParams(search).get('section')
 const sections: Record<string, string> = {payments:'Оплата и доставка',prices:'Валюта и цены',sale:'Скидки',theme:'Язык и оформление',reminders:'Уведомления и напоминания'}
 if(path==='/settings' && section && Object.hasOwn(sections, section)) return sections[section]
 return ({'/':'На главную','/catalog':'Каталог','/products':'Товары','/categories':'Категории','/brands':'Бренды','/size-charts':'Таблицы размеров','/settings':'Настройки','/orders':'Заказы','/china':'Спецзаказы','/refunds':'Возвраты','/analytics':'Аналитика','/campaigns':'Рассылки'} as Record<string,string>)[path]||'На главную'
}
export function useAdminBack(displayed?: AdminLocation){
 const current=useLocation(),location=displayed ?? current,navigate=useNavigate(),origin=read()[location.key]
 const valid=origin&&safe(origin.url)&&origin.url!==location.pathname+location.search
 const target=valid?origin.url:parentRoute(location.pathname,location.search)
 const [path,search='']=target.split('?')
 return {target,label:routeTitle(path,search),back:()=>{if(valid&&Number(history.state?.idx)===origin.index+1)navigate(-1);else navigate(target,{replace:true,state:{adminBack:true}})}}
}

export const hasDirtyAdminForms=()=>Array.from(document.querySelectorAll('[data-loft-dirty="true"]')).some(element=>!element.closest('[inert]'))

const positionsBeforeCommit = new Map<string, number>()
export function captureAdminScroll(key: string) {
  positionsBeforeCommit.set(key, window.scrollY)
  while (positionsBeforeCommit.size > 60) positionsBeforeCommit.delete(positionsBeforeCommit.keys().next().value!)
}

export function consumeAdminScroll(key: string) {
 const position = positionsBeforeCommit.get(key)
 positionsBeforeCommit.delete(key)
 return position
}

import {useSyncExternalStore} from 'react'
import {ru} from './locales/ru'
import {uz} from './locales/uz'
export type AdminLanguage='ru'|'uz'
export type UiKey=keyof typeof ru
let manager='guest'
function saved(scope:string):AdminLanguage{try{return localStorage.getItem('loft-admin-language:'+scope)==='uz'?'uz':'ru'}catch{return 'ru'}}
let language:AdminLanguage=saved(manager)
const listeners=new Set<()=>void>()
const publish=()=>{if(typeof document!=='undefined')document.documentElement.lang=language;for(const listener of listeners)listener()}
export const getAdminLanguage=()=>language
export const getAdminLocale=()=>language==='uz'?'uz-Latn-UZ':'ru-RU'
export function useAdminLanguage(){return useSyncExternalStore(listener=>{listeners.add(listener);return()=>listeners.delete(listener)},getAdminLanguage,()=> 'ru' as const)}
export function setAdminLanguage(value:AdminLanguage){if(value!=='ru'&&value!=='uz')return;language=value;try{localStorage.setItem('loft-admin-language:'+manager,value)}catch{};publish()}
export function setLanguageScope(id:string|null){const next=id||'guest';if(next===manager)return;manager=next;language=saved(manager);publish()}
const interpolate=(text:string,params:readonly unknown[])=>text.replace(/\{(\d+)\}/g,(_,index)=>String(params[Number(index)]??''))
export function t(key:UiKey,params:readonly unknown[]=[]):string{return interpolate(language==='uz'?uz[key]||ru[key]:ru[key],params)}
/** Only explicitly marked UI labels enter here. User content and database statuses stay canonical. */
export function tx<T>(value:T):T extends string?string:T{
 if(typeof value!=='string')return value as any
 if(Object.hasOwn(ru,value))return t(value as UiKey) as any
 const trimmed=value.trim();if(Object.hasOwn(ru,trimmed))return (value.slice(0,value.indexOf(trimmed))+t(trimmed as UiKey)+value.slice(value.indexOf(trimmed)+trimmed.length)) as any
 if(language==='uz'&&/\d[\d\s.,]* сум$/.test(value))return value.replace(/ сум$/,' so‘m') as any
 return value as any
}
export function uiError(value:unknown):string{
 const text=typeof value==='string'?value:value instanceof Error?value.message:''
 if(!text)return ''
 if(Object.hasOwn(ru,text)||Object.hasOwn(ru,text.trim()))return tx(text)
 return t('Не удалось выполнить действие. Попробуйте ещё раз.')
}

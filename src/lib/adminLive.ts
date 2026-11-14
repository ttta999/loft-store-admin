import { useEffect, useRef } from 'react'
import { supabase, getAdminCacheScope } from './supabase'
import { dataCache } from './resourceCache'

export type DataTopic = 'orders'|'china_requests'|'refunds'|'products'|'product_variants'|'product_colors'|'categories'|'subcategories'|'brands'|'settings'|'size_charts'|'product_recommendations'|'reminder_settings'|'campaigns'
const dependencies: Record<DataTopic,string[]> = {
 orders:['history:','orders','analytics:','notifications','refunds','tasks'],
 china_requests:['history:','china','notifications','tasks'], refunds:['history:','refunds','orders','analytics:','notifications','tasks'],
 products:['products','counts','analytics:'], product_variants:['variants','products','analytics:'],
 product_colors:['colors','products'],categories:['categories','category-rows','products','analytics:'],
 subcategories:['subcategories','categories','products','analytics:'],brands:['brands','counts','products','analytics:'],
 campaigns:['campaigns'],
 reminder_settings:['tasks','reminders'],
 size_charts:['size-charts'],product_recommendations:['products'],
 settings:['settings','exchange-rate','china','tasks'],
}
const listeners = new Set<(topics:Set<DataTopic>)=>void>()
export function invalidateTopics(topics: Iterable<DataTopic>) {
 const set=new Set(topics)
 for(const topic of set) for(const key of dependencies[topic]||[]) dataCache.invalidate(`admin:${key}`)
 // HTTP reads also contain auth/header/query in the key. Keep unrelated resources cached.
 for(const topic of set) dataCache.invalidateWhere(key=>key.startsWith('http:')&&(key.includes(`/rest/v1/${topic}?`)||key.includes('/rest/v1/rpc/')))
 for(const listener of listeners) listener(set)
}

/** One owner per authenticated shell. RLS/MFA protects content-free revision events. */
export function useAdminLive(enabled: boolean) {
 useEffect(()=>{
  if(!enabled)return
  let active=true, running=false, rerun=false
  const versions=new Map<string,number>()
  const scope=getAdminCacheScope()
  const apply=(rows:any[],all=false)=>{
   if(!active||scope!==getAdminCacheScope())return
   const changed=new Set<DataTopic>()
   for(const row of rows){if(all||versions.get(row.topic)!==Number(row.revision))changed.add(row.topic);versions.set(row.topic,Number(row.revision))}
   if(changed.size)invalidateTopics(changed)
  }
  const check=async(all=false)=>{
   if(!active||document.hidden||navigator.onLine===false)return
   if(running){rerun=true;return}
   running=true
   try { const {data,error}=await supabase.from('store_data_revisions').select('topic,revision'); if(!error&&data)apply(data,all) }
   finally {running=false;if(active&&rerun){rerun=false;void check()}}
  }
  const channel=supabase.channel(`admin-revisions:${scope}`).on('postgres_changes',{event:'*',schema:'public',table:'store_data_revisions'},payload=>apply([payload.new])).subscribe(status=>{if(status==='SUBSCRIBED')void check()})
  const resume=()=>void check(true)
  window.addEventListener('focus',resume);window.addEventListener('online',resume);document.addEventListener('visibilitychange',resume)
  void check()
  const timer=setInterval(()=>void check(),30_000)
  return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',resume);window.removeEventListener('online',resume);document.removeEventListener('visibilitychange',resume);void supabase.removeChannel(channel)}
 },[enabled])
}
/** Coalesce bursts; reload lists only, leaving component-local form/filter state intact. */
export function useAdminRefresh(topics: DataTopic[], reload:()=>Promise<unknown>) {
 const current=useRef(reload);current.current=reload
 const key=topics.join(',')
 useEffect(()=>{
  let active=true,running=false,again=false,timer:ReturnType<typeof setTimeout>|undefined
  const run=async()=>{if(!active)return;if(running){again=true;return}running=true;try{await current.current()}catch{/* Page retains its own error state. */}finally{running=false;if(again&&active){again=false;timer=setTimeout(()=>void run(),100)}}}
  const listener=(changed:Set<DataTopic>)=>{if(!key.split(',').some(t=>changed.has(t as DataTopic)))return;clearTimeout(timer);timer=setTimeout(()=>void run(),150)}
  listeners.add(listener)
  return()=>{active=false;clearTimeout(timer);listeners.delete(listener)}
 },[key])
}

import {useEffect,useState} from 'react'
import {dataCache} from './resourceCache'
import {getAdminCacheScope} from './supabase'
/** Small bounded UI state in the existing session cache, never across managers. */
export function useAdminViewState<T>(name:string,fallback:T){
 const scope=getAdminCacheScope(),key=`view:${scope}:${name}`
 const [value,setValue]=useState<T>(()=>dataCache.get<T>(key)??fallback)
 useEffect(()=>{const keep=()=>{if(scope===getAdminCacheScope())dataCache.set(key,value,30*60_000)};keep();return keep},[key,scope,value])
 return [value,setValue] as const
}

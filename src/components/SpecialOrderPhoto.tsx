import { useEffect, useState } from 'react'
import { privateFile } from '../lib/supabase'

/** Keep the existing protected file; renew its URL before the 15-minute lease
 * expires, including a tab that has been in the background. */
export default function SpecialOrderPhoto({item,size=48}:{item:any;size?:40|48}) {
 const [url,setUrl]=useState<string|null>(item.image||null)
 useEffect(()=>{
  let active=true,refreshing=false,retried=false,last=Date.now()
  setUrl(item.image||null)
  const refresh=async(force=false)=>{
   if(refreshing||!item._specialImageRef||(!force&&(document.hidden||Date.now()-last<14*60_000)))return
   refreshing=true
   try{const next=await privateFile(item._specialImageRef,'china-requests');if(active&&next){setUrl(next);last=Date.now()}else if(active&&force)setUrl(null)}catch{if(active&&force)setUrl(null)}finally{refreshing=false}
  }
  const focus=()=>{void refresh()}
  const timer=setInterval(focus,60_000)
  window.addEventListener('focus',focus);document.addEventListener('visibilitychange',focus)
  // A failed initial image gets one fresh authorization attempt, never a retry loop.
  const failed=()=>{if(!retried){retried=true;void refresh(true)}else if(active)setUrl(null)}
  const el=document.getElementById(`special-order-photo-${item._photoKey}-${size}`)
  el?.addEventListener('error',failed)
  return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',focus);el?.removeEventListener('error',failed)}
 },[item.image,item._specialImageRef,item._photoKey,size])
 if(!url)return null
 return <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Открыть фото: ${item.name||'Спецзаказ'}`} className="shrink-0"><img id={`special-order-photo-${item._photoKey}-${size}`} src={url} alt={item.name||'Спецзаказ'} className={`${size===40?'w-10 h-10':'w-12 h-12'} object-cover rounded-lg border border-[#E8E2D5] dark:border-dark-border`}/></a>
}

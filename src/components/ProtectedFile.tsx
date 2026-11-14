import {t,useAdminLanguage} from '../lib/i18n'
import {useEffect,useRef,useState,type AnchorHTMLAttributes} from 'react'
import {privateFile} from '../lib/supabase'
export default function ProtectedFile({value,bucket,imageClassName,...props}:{value:string;bucket:string;imageClassName?:string}&Omit<AnchorHTMLAttributes<HTMLAnchorElement>,'href'>){
 useAdminLanguage()

 const [url,setUrl]=useState<string|null>(null),[failed,setFailed]=useState(false),host=useRef<HTMLSpanElement>(null),retry=useRef<()=>void>(()=>{})
 useEffect(()=>{let active=true,visible=false,running=false,last=0;setUrl(null);setFailed(false)
  const load=async(force=false)=>{if(!active||!visible||running||document.hidden||(!force&&Date.now()-last<12*60000))return;running=true;try{const result=await privateFile(value,bucket,force);if(active){setUrl(result);setFailed(!result);last=result?Date.now():0}}catch{if(active)setFailed(true)}finally{running=false}}
  retry.current=()=>void load(true)
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){visible=true;observer.disconnect();void load()}},{rootMargin:'100px'})
  if(host.current){const rect=host.current.getBoundingClientRect();if(rect.width>0&&rect.height>0&&rect.bottom>=-100&&rect.top<=innerHeight+100){visible=true;void load()}else observer.observe(host.current)};const timer=setInterval(()=>void load(),60000),focus=()=>void load();window.addEventListener('focus',focus);document.addEventListener('visibilitychange',focus)
  return()=>{active=false;observer.disconnect();clearInterval(timer);window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',focus)}
 },[value,bucket])
 return <span ref={host} className="inline-block">{url?<a {...props} href={url} target="_blank" rel="noopener noreferrer">{imageClassName?<img src={url} alt={props['aria-label'] || t("Фото товара")} className={imageClassName} loading="lazy" onError={()=>{setUrl(null);setFailed(true)}}/>:props.children}</a>:failed?<button type="button" aria-label={t("Повторить загрузку файла")} className="text-xs text-[#8A8275] dark:text-gray-400 underline" onClick={()=>retry.current()}>{t("Файл недоступен. Повторить")}</button>:<span className={imageClassName?`block ${imageClassName} bg-[#F5F1E8] dark:bg-dark-accent`:props.className} aria-label={t("Загрузка файла")}>{!imageClassName&&props.children}</span>}</span>
}

import {useLayoutEffect,useRef,useState,type ReactNode} from 'react'
import {createPortal} from 'react-dom'
const stack:HTMLElement[]=[]
let backgroundOverflow='',returnFocus:HTMLElement|null=null
/** One modal surface: reversible motion, background lock, focus containment and restoration. */
export default function AdminDialog({open,label,onClose,children,busy=false}:{open:boolean;label:string;onClose:()=>void;children:ReactNode;busy?:boolean}){
 const [present,setPresent]=useState(open),root=useRef<HTMLDivElement>(null),content=useRef(children),close=useRef(onClose),saving=useRef(busy)
 close.current=onClose;saving.current=busy;if(open)content.current=children
 useLayoutEffect(()=>{if(open&&!present)setPresent(true)},[open,present])
 useLayoutEffect(()=>{
  if(!present)return
  const element=root.current!
  if(!stack.length){returnFocus=document.activeElement as HTMLElement|null;backgroundOverflow=document.body.style.overflow}
  stack.push(element)
  document.body.style.overflow='hidden'
  const focusable=()=>Array.from(root.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')||[])
  focusable()[0]?.focus({preventScroll:true})
  const key=(event:KeyboardEvent)=>{
   if(stack.at(-1)!==element||element.inert)return
   if(event.key==='Escape'&&!saving.current){event.preventDefault();close.current()}
   if(event.key==='Tab'){const items=focusable(),first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}
  }
  document.addEventListener('keydown',key)
  return()=>{const index=stack.indexOf(element);if(index>=0)stack.splice(index,1);document.removeEventListener('keydown',key);if(!stack.length){document.body.style.overflow=backgroundOverflow;if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});returnFocus=null}}
 },[present])
 useLayoutEffect(()=>{
  if(!present||!root.current)return
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches
  const animation=root.current.animate(open?[{opacity:0},{opacity:1}]:[{opacity:1},{opacity:0}],{duration:reduced?0:open?220:150,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'})
  const surface=root.current.querySelector('section')||root.current.firstElementChild
  const movement=surface?.animate(open?[{transform:'translateY(8px) scale(.98)'},{transform:'none'}]:[{transform:'none'},{transform:'translateY(4px) scale(.99)'}],{duration:reduced?0:open?220:150,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'})
  if(!open)void animation.finished.then(()=>setPresent(false)).catch(()=>{})
  return()=>{animation.cancel();movement?.cancel()}
 },[open,present])
 return present?createPortal(<div ref={root} role="dialog" aria-modal="true" aria-hidden={!open||undefined} inert={!open} aria-label={label} className="loft-modal fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-2 sm:p-4" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)close.current()}}>{open?children:content.current}</div>,document.body):null
}

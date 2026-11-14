import {useAdminLanguage} from '../lib/i18n'
import type {ReactNode} from 'react'
export default function Collapse({open,children}:{open:boolean;children:ReactNode}){
 useAdminLanguage()
return <div aria-hidden={!open} inert={!open} style={{display:'grid',gridTemplateRows:open?'1fr':'0fr',transition:'grid-template-rows 200ms cubic-bezier(.22,1,.36,1)'}} className="motion-reduce:!transition-none"><div className="overflow-hidden min-h-0">{children}</div></div>}

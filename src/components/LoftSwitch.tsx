import {tx,useAdminLanguage} from '../lib/i18n'
export default function LoftSwitch({label,checked,onChange,disabled=false}:{label:string;checked:boolean;onChange:(value:boolean)=>void;disabled?:boolean}){
 useAdminLanguage()

 return <button type="button" role="switch" aria-label={tx(label)} aria-checked={checked} disabled={disabled} onClick={()=>onChange(!checked)} className={`w-11 h-6 p-0.5 rounded-full shrink-0 inline-flex items-center transition-colors disabled:opacity-50 ${checked?'bg-[#1B2A4A] dark:bg-gold':'bg-[#E8E2D5] dark:bg-dark-accent'}`}><span className={`w-5 h-5 rounded-full bg-white dark:bg-dark-card transition-transform duration-200 ${checked?'translate-x-5':'translate-x-0'}`}/></button>
}

import {t,useAdminLanguage} from '../lib/i18n'
import ProtectedFile from './ProtectedFile'
export default function SpecialOrderPhoto({item,size=48}:{item:any;size?:40|48}){
 useAdminLanguage()

 const value=item._specialImageRef||item.image;if(!value)return null
 return <ProtectedFile value={value} bucket="china-requests" aria-label={t("Открыть фото: {0}",[item.name||'Спецзаказ'])} className="shrink-0" imageClassName={`${size===40?'w-10 h-10':'w-12 h-12'} object-cover rounded-lg border border-[#E8E2D5] dark:border-dark-border`}/>
}

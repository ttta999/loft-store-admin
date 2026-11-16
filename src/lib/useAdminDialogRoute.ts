import {useLocation,useNavigate,useSearchParams} from 'react-router-dom'
import {useAdminBack} from './adminNavigation'
/** Dialogs participate in the same Router history and unsaved-change guard as pages. */
export function useAdminDialogRoute(){
 const location=useLocation(),navigate=useNavigate(),[params]=useSearchParams(),{back}=useAdminBack()
 return {mode:params.get('dialog'),item:params.get('item'),open:(mode:string,item:string,replace=false)=>{const search=new URLSearchParams(location.search);search.set('dialog',mode);search.set('item',item);navigate({pathname:location.pathname,search:search.toString()},{replace})},close:back}
}

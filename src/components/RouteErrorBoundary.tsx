import {Component,type ReactNode} from 'react'
import {RefreshCw,Layers} from 'lucide-react'
import AdminPageHeader from './AdminPageHeader'
import {t,tx} from '../lib/i18n'
import {preloadPage} from '../lib/pagePreload'
import {routeTitle} from '../lib/adminNavigation'
export default class RouteErrorBoundary extends Component<{children:ReactNode;path:string;search:string},{failed:boolean;busy:boolean}>{
 state={failed:false,busy:false}
 static getDerivedStateFromError(){return {failed:true,busy:false}}
 componentDidUpdate(previous:Readonly<{children:ReactNode;path:string;search:string}>){if(this.state.failed&&(previous.path!==this.props.path||previous.search!==this.props.search))this.setState({failed:false})}
 retry=async()=>{this.setState({busy:true});try{await preloadPage(this.props.path);this.setState({failed:false,busy:false})}catch{window.location.reload()}}
 render(){return this.state.failed?<main className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg text-[#1B2A4A] dark:text-white"><AdminPageHeader title={routeTitle(this.props.path,this.props.search)} icon={<Layers/>}/><section data-loft-content className="max-w-6xl mx-auto p-6" role="alert"><p>{tx('Не удалось загрузить страницу. Проверьте соединение и повторите попытку.')}</p><button className="mt-4 px-4 py-3 rounded-xl border border-[#E8E2D5] dark:border-dark-border flex items-center gap-2 font-bold" disabled={this.state.busy} onClick={()=>void this.retry()}><RefreshCw size={16}/>{t('Повторить')}</button></section></main>:this.props.children}
}

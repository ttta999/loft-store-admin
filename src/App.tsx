import {setLanguageScope,useAdminLanguage} from './lib/i18n'
import PageSkeleton from './components/PageSkeleton'
import { useAdminLive } from './lib/adminLive'
import { supabase } from './lib/supabase'
import { SizeChartsPage, CatalogMenuPage, CampaignsPage, RefundsPage, OrdersPage, ChinaPage, ProductsPage, AnalyticsPage, SettingsPage, BrandsPage, CategoriesPage } from './lib/pagePreload'
import AnimatedRoutes from './components/AnimatedRoutes'
import AppToaster from './components/AppToaster'
import { Fragment, useState, useEffect } from 'react'
import { BrowserRouter, Route, Navigate, Outlet } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import { getCurrentUser } from './lib/auth'

function ProtectedLayout() {
 useAdminLanguage()

 const [allowed,setAllowed]=useState<boolean|null>(null),[userId,setUserId]=useState<string|null>(null)
 useAdminLive(allowed===true,userId)
 useEffect(()=>{
  let active=true,generation=0,running=false,again=false,last=0
  const check=async()=>{if(!active)return;if(running){again=true;return}running=true;const id=++generation;try{const user=await getCurrentUser();if(active&&id===generation){setLanguageScope(user?.id||null);setUserId(user?.id||null);setAllowed(!!user)}}finally{running=false;last=Date.now();if(active&&again){again=false;void check()}}}
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event)=>{if(event==='INITIAL_SESSION')return;if(event==='SIGNED_OUT'){generation++;setLanguageScope(null);setUserId(null);setAllowed(false)}else queueMicrotask(()=>void check())})
  const resume=()=>{if(!document.hidden&&!running&&Date.now()-last>10000)void check()}
  const unload=(e:BeforeUnloadEvent)=>{if(document.querySelector('[data-loft-dirty="true"]')){e.preventDefault();e.returnValue=''}};window.addEventListener('beforeunload',unload)
  void check();window.addEventListener('focus',resume);window.addEventListener('online',resume);document.addEventListener('visibilitychange',resume);const timer=setInterval(resume,60000)
  return()=>{active=false;generation++;window.removeEventListener('beforeunload',unload);clearInterval(timer);subscription.unsubscribe();window.removeEventListener('focus',resume);window.removeEventListener('online',resume);document.removeEventListener('visibilitychange',resume)}
 },[])
 if(allowed===null)return <PageSkeleton/>
 if(!allowed)return <Navigate to="/login" replace/>
 return <Fragment key={userId}><Outlet/></Fragment>
}
export default function App() {
 useAdminLanguage()

  return (
    <BrowserRouter>
      <AppToaster />
      <AnimatedRoutes>
        <Route path="/login" element={<LoginPage onLogin={() => {}} />} />
        <Route element={<ProtectedLayout/>}>
        <Route path="/catalog" element={<CatalogMenuPage/>}/>
        <Route path="/campaigns" element={<CampaignsPage />}/>
        <Route path="/size-charts" element={<SizeChartsPage />}/>

        <Route path="/" element={
          <DashboardPage />
        } />
        <Route path="/refunds" element={<RefundsPage />} />
        <Route path="/orders" element={
          <OrdersPage />
        } />
        <Route path="/china" element={
          <ChinaPage />
        } />
        <Route path="/products" element={
          <ProductsPage />
        } />
        <Route path="/analytics" element={
          <AnalyticsPage />
        } />
        <Route path="/settings" element={
          <SettingsPage />
        } />
        <Route path="/brands" element={
          <BrandsPage />
        } />
        <Route path="/categories" element={
          <CategoriesPage />
        } />
        </Route>
      </AnimatedRoutes>
    </BrowserRouter>
  )
}

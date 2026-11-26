import {hasDirtyAdminForms} from './lib/adminNavigation'
import {setLanguageScope,useAdminLanguage} from './lib/i18n'
import PageSkeleton from './components/PageSkeleton'
import { useAdminLive } from './lib/adminLive'
import { getAdminCacheScope, onAdminSessionInvalidated, supabase } from './lib/supabase'
import { SizeChartsPage, CampaignsPage, RefundsPage, OrdersPage, ChinaPage, ProductsPage, AnalyticsPage, SettingsPage, BrandsPage, CategoriesPage } from './lib/pagePreload'
import AnimatedRoutes from './components/AnimatedRoutes'
import AppToaster from './components/AppToaster'
import { Fragment, useState, useEffect } from 'react'
import { BrowserRouter, Route, Navigate, Outlet } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CatalogMenuPage from './pages/CatalogMenuPage'
import { getDashboardSession, setDashboardSession, useDashboardSession } from './lib/dashboardSession'
import { invalidateAllCaches } from './lib/cache'
import { getCurrentUser } from './lib/auth'

function ProtectedLayout() {
 useAdminLanguage()

 const [allowed,setAllowed]=useState<boolean|null>(null),[userId,setUserId]=useState<string|null>(null)
 const grant=useDashboardSession()
 useAdminLive(allowed===true&&grant?.id===userId,userId)
 useEffect(()=>{
  let active=true,generation=0,running=false,again=false,last=0
  const check = async () => {
    if (!active) return
    if (running) { again = true; return }
    running = true
    const id = ++generation
    try {
      const user = await getCurrentUser()
      if (!active || id !== generation) return
      const verifiedId = user?.id ?? null
      if (verifiedId && verifiedId !== getAdminCacheScope()) return
      const previous = getDashboardSession()
      if (previous && previous.id !== verifiedId) invalidateAllCaches()
      setDashboardSession(verifiedId)
      setLanguageScope(verifiedId)
      setUserId(verifiedId)
      setAllowed(Boolean(user))
    } finally {
      running = false
      last = Date.now()
      if (active && again) { again = false; void check() }
    }
  }
  const clearAuthentication = () => {
   generation++
   setDashboardSession(null)
   setLanguageScope(null)
   setUserId(null)
   setAllowed(false)
  }
  const unsubscribeInvalidation = onAdminSessionInvalidated(clearAuthentication)
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event)=>{if(event==='INITIAL_SESSION')return;if(event==='SIGNED_OUT')clearAuthentication();else queueMicrotask(()=>void check())})
  const resume=()=>{if(!document.hidden&&!running&&Date.now()-last>10000)void check()}
  const unload=(e:BeforeUnloadEvent)=>{if(hasDirtyAdminForms()){e.preventDefault();e.returnValue=''}};window.addEventListener('beforeunload',unload)
  void check();window.addEventListener('focus',resume);window.addEventListener('online',resume);document.addEventListener('visibilitychange',resume);const timer=setInterval(resume,60000)
  return()=>{active=false;generation++;window.removeEventListener('beforeunload',unload);clearInterval(timer);subscription.unsubscribe();unsubscribeInvalidation();window.removeEventListener('focus',resume);window.removeEventListener('online',resume);document.removeEventListener('visibilitychange',resume)}
 },[])
 if(allowed===null)return <PageSkeleton/>
 if(!allowed)return <Navigate to="/login" replace/>
 if(grant?.id!==userId)return <PageSkeleton/>
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

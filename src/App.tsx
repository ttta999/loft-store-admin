import SizeChartsPage from './pages/SizeChartsPage'
import { useAdminLive } from './lib/adminLive'
import { supabase } from './lib/supabase'
import { CampaignsPage, RefundsPage, OrdersPage, ChinaPage, ProductsPage, AnalyticsPage, SettingsPage, BrandsPage, CategoriesPage } from './lib/pagePreload'
import AnimatedRoutes from './components/AnimatedRoutes'
import AppToaster from './components/AppToaster'
import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import { getCurrentUser } from './lib/auth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser()
      setIsLoggedIn(!!user)
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error)
      setIsLoggedIn(false)
    }
  }

  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B2A4A] dark:border-gold"></div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AdminLiveBridge() {
 const [enabled,setEnabled]=useState(false)
 useAdminLive(enabled)
 useEffect(()=>{
  let active=true,generation=0
  const check=async()=>{const id=++generation;const user=await getCurrentUser();if(active&&id===generation)setEnabled(!!user)}
  const {data:{subscription}}=supabase.auth.onAuthStateChange(()=>{queueMicrotask(()=>void check())})
  void check()
  return()=>{active=false;generation++;subscription.unsubscribe()}
 },[])
 return null
}
export default function App() {
  return (
    <BrowserRouter>
      <AppToaster />
      <AdminLiveBridge />
      <AnimatedRoutes>
        <Route path="/campaigns" element={<ProtectedRoute><CampaignsPage /></ProtectedRoute>}/>
        <Route path="/size-charts" element={<ProtectedRoute><SizeChartsPage /></ProtectedRoute>}/>
        <Route path="/login" element={<LoginPage onLogin={() => {}} />} />
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/refunds" element={<ProtectedRoute><RefundsPage /></ProtectedRoute>} />
        <Route path="/orders" element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/china" element={
          <ProtectedRoute>
            <ChinaPage />
          </ProtectedRoute>
        } />
        <Route path="/products" element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="/brands" element={
          <ProtectedRoute>
            <BrandsPage />
          </ProtectedRoute>
        } />
        <Route path="/categories" element={
          <ProtectedRoute>
            <CategoriesPage />
          </ProtectedRoute>
        } />
      </AnimatedRoutes>
    </BrowserRouter>
  )
}

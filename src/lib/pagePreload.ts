import { lazy } from 'react'

const loadOrdersPage = () => import('../pages/OrdersPage')
export const OrdersPage = lazy(loadOrdersPage)
const loadChinaPage = () => import('../pages/ChinaPage')
export const ChinaPage = lazy(loadChinaPage)
const loadProductsPage = () => import('../pages/ProductsPage')
export const ProductsPage = lazy(loadProductsPage)
const loadAnalyticsPage = () => import('../pages/AnalyticsPage')
export const AnalyticsPage = lazy(loadAnalyticsPage)
const loadSettingsPage = () => import('../pages/SettingsPage')
export const SettingsPage = lazy(loadSettingsPage)
const loadBrandsPage = () => import('../pages/BrandsPage')
export const BrandsPage = lazy(loadBrandsPage)
const loadCategoriesPage = () => import('../pages/CategoriesPage')
export const CategoriesPage = lazy(loadCategoriesPage)

const loaders: Record<string, () => Promise<unknown>> = {
  '/orders': loadOrdersPage,
  '/china': loadChinaPage,
  '/products': loadProductsPage,
  '/analytics': loadAnalyticsPage,
  '/settings': loadSettingsPage,
  '/brands': loadBrandsPage,
  '/categories': loadCategoriesPage,
}
export function preloadPage(pathname: string): Promise<unknown> {
  const key = '/' + pathname.split('/').filter(Boolean)[0]
  return loaders[key]?.() || Promise.resolve()
}
export function warmPage(pathname: string) { void preloadPage(pathname).catch(() => {}) }

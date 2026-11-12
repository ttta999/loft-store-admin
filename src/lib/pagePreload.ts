import { createElement, type ComponentType } from 'react'

function deferredPage(loader: () => Promise<{ default: ComponentType }>) {
  let Page: ComponentType | undefined
  let pending: Promise<unknown> | undefined
  let failure: unknown
  const load = () => pending ||= loader().then(module => { Page = module.default }, error => { failure = error; throw error })
  return {
    load,
    Component() {
      if (failure) throw failure
      if (!Page) throw load()
      return createElement(Page)
    },
  }
}

const OrdersPageResource = deferredPage(() => import('../pages/OrdersPage'))
const loadOrdersPage = OrdersPageResource.load
export const OrdersPage = OrdersPageResource.Component
const ChinaPageResource = deferredPage(() => import('../pages/ChinaPage'))
const loadChinaPage = ChinaPageResource.load
export const ChinaPage = ChinaPageResource.Component
const ProductsPageResource = deferredPage(() => import('../pages/ProductsPage'))
const loadProductsPage = ProductsPageResource.load
export const ProductsPage = ProductsPageResource.Component
const AnalyticsPageResource = deferredPage(() => import('../pages/AnalyticsPage'))
const loadAnalyticsPage = AnalyticsPageResource.load
export const AnalyticsPage = AnalyticsPageResource.Component
const SettingsPageResource = deferredPage(() => import('../pages/SettingsPage'))
const loadSettingsPage = SettingsPageResource.load
export const SettingsPage = SettingsPageResource.Component
const BrandsPageResource = deferredPage(() => import('../pages/BrandsPage'))
const loadBrandsPage = BrandsPageResource.load
export const BrandsPage = BrandsPageResource.Component
const CategoriesPageResource = deferredPage(() => import('../pages/CategoriesPage'))
const loadCategoriesPage = CategoriesPageResource.load
export const CategoriesPage = CategoriesPageResource.Component

const RefundsPageResource = deferredPage(() => import('../pages/RefundsPage'))
export const RefundsPage = RefundsPageResource.Component

const loaders: Record<string, () => Promise<unknown>> = {
  '/refunds': RefundsPageResource.load,
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

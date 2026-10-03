// ✅ Тема админки: light / dark / system.
// Module-level состояние переживает размонтирование страниц,
// выбор хранится в localStorage.
// Модуль применяет тему к <html> СРАЗУ при импорте — без «вспышки» светлой темы.

import { useSyncExternalStore } from 'react'

export type AdminTheme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'loft_admin_theme'

const readStoredTheme = (): AdminTheme => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    // localStorage недоступен — игнорируем
  }
  return 'system'
}

const applyThemeToDom = (theme: AdminTheme) => {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    // system — следуем за настройкой ОС
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
}

let currentTheme: AdminTheme = readStoredTheme()
const listeners = new Set<(t: AdminTheme) => void>()

export const getTheme = (): AdminTheme => currentTheme

export const setTheme = (theme: AdminTheme) => {
  currentTheme = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // игнорируем
  }
  applyThemeToDom(theme)
  listeners.forEach((fn) => fn(theme))
}

const subscribe = (fn: (t: AdminTheme) => void): (() => void) => {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

// ✅ React-хук для компонентов (SettingsPage и др.)
export const useTheme = (): { theme: AdminTheme; setTheme: (t: AdminTheme) => void } => {
  const theme = useSyncExternalStore(subscribe, getTheme, getTheme)
  return { theme, setTheme }
}

// ✅ Инициализация при импорте модуля:
// 1) применяем сохранённую тему ДО первого рендера (нет мигания)
// 2) следим за сменой системной темы, пока выбран режим system
if (typeof document !== 'undefined') {
  applyThemeToDom(currentTheme)

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemChange = () => {
    if (currentTheme === 'system') {
      applyThemeToDom('system')
    }
  }
  mediaQuery.addEventListener('change', handleSystemChange)
}
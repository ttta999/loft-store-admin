import {t,useAdminLanguage} from '../lib/i18n'
import { useSyncExternalStore } from 'react'
import { Toaster } from 'sonner'

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}
const readTheme = (): 'dark' | 'light' => document.documentElement.classList.contains('dark') ? 'dark' : 'light'
export default function AppToaster() {
 useAdminLanguage()

  const theme = useSyncExternalStore<'light' | 'dark'>(subscribe, readTheme, () => 'light')
  return <Toaster containerAriaLabel={t("Уведомления")} toastOptions={{closeButtonAriaLabel:t("Закрыть")}} position="top-center" richColors theme={theme} className="loft-toaster" />
}

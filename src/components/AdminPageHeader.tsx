import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { tx, useAdminLanguage } from '../lib/i18n'
import { useAdminBack } from '../lib/adminNavigation'

export function AdminBackButton() {
  useAdminLanguage()
  const { back, label } = useAdminBack()
  return <button data-admin-back onClick={back} className="inline-flex min-w-0 items-center gap-2 text-sm font-bold text-[#1B2A4A] dark:text-white min-h-11">
    <span className="w-10 h-10 shrink-0 rounded-full bg-[#FBF9F4] dark:bg-dark-card border border-[#E8E2D5] dark:border-dark-border inline-flex items-center justify-center"><ArrowLeft size={18}/></span>
    <span className="sr-only md:not-sr-only md:truncate">{tx(label)}</span>
  </button>
}

export default function AdminPageHeader({ title, icon, actions, home }: {
  title: string
  icon: ReactNode
  actions?: ReactNode
  home?: boolean
}) {
  useAdminLanguage()
  return <header data-admin-header className="sticky top-0 z-20 border-b border-[#E8E2D5] bg-[#F5F1E8] px-4 dark:border-dark-border dark:bg-dark-bg sm:px-6">
    <div data-admin-heading className="admin-header-grid mx-auto max-w-6xl items-center text-[#1B2A4A] dark:text-white">
      <div className="admin-header-back min-w-0">{!home && <AdminBackButton/>}</div>
      <div className="admin-header-title flex min-w-0 items-center justify-center gap-2 text-center">
        <h1 className="line-clamp-2 text-sm font-bold leading-tight sm:text-xl">{tx(title)}</h1>
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[#E8E2D5] bg-[#FBF9F4] text-[#C9A961] dark:border-dark-border dark:bg-dark-card sm:size-10 [&>svg]:size-[18px]">{icon}</span>
      </div>
      <div className="admin-header-actions flex min-w-0 items-center justify-end gap-2">{actions}</div>
    </div>
  </header>
}

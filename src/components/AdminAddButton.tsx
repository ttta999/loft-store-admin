import type { ButtonHTMLAttributes } from 'react'
import { Plus } from 'lucide-react'
import { tx } from '../lib/i18n'

export default function AdminAddButton({
  children, className = '', appearance = 'primary', ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { appearance?: 'primary' | 'gold' }) {
  const colors = appearance === 'gold'
    ? 'bg-[#C9A961] dark:bg-gold text-[#1B2A4A] hover:bg-[#d6b57e]'
    : 'bg-[#1B2A4A] text-white dark:bg-gold dark:text-[#1B2A4A] hover:bg-[#142038] dark:hover:bg-[#d6b57e]'
  return <button type="button" {...props} className={`inline-flex shrink-0 items-center justify-center gap-2 min-h-11 px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap active:scale-[0.98] transition-[background-color,transform] duration-150 disabled:opacity-50 ${colors} ${className}`}>
    <Plus size={18} strokeWidth={2} />
    {typeof children === 'string' ? tx(children) : children}
  </button>
}

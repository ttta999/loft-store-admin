import { resolveIcon } from '../lib/iconRegistry'

interface CategoryIconProps {
  name?: string | null
  size?: number
  className?: string
  color?: string
}

export default function CategoryIcon({
  name,
  size = 18,
  className,
  color,
}: CategoryIconProps) {
  const Icon = resolveIcon(name)
  return <Icon size={size} className={className} color={color} />
}
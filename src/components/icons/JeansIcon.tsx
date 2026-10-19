interface JeansIconProps {
  size?: number | string
  className?: string
  color?: string
  title?: string
}

export default function JeansIcon({ size = 18, className, color, title }: JeansIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color || 'currentColor'}
      className={className}
      role="img"
      aria-label={title || 'Jeans'}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 1h12v3l2.2 18h-6.2L12 10l-2 12H3.8L6 4V1Zm1 1.2h10v1.4H7v-1.4Z"
      />
    </svg>
  )
}
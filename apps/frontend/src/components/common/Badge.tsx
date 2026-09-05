
interface BadgeProps {
  label: string
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default'
  size?: 'sm' | 'md'
}

export function Badge({ label, variant = 'default', size = 'sm' }: BadgeProps) {
  const variantClass = {
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    danger: 'bg-red-500/20 text-red-400',
    info: 'bg-blue-500/20 text-blue-400',
    default: 'bg-[var(--surface-2)] text-[var(--muted)]',
  }

  const sizeClass = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
  }

  return (
    <span
      className={`
        rounded-full font-medium
        ${variantClass[variant]}
        ${sizeClass[size]}
      `}
    >
      {label}
    </span>
  )
}


import React from 'react'

interface CardProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  clickable?: boolean
  onClick?: () => void
  highlight?: 'success' | 'warning' | 'danger' | 'info'
}

export function Card({
  title,
  subtitle,
  children,
  className = '',
  clickable = false,
  onClick,
  highlight,
}: CardProps) {
  const highlightColor = {
    success: 'border-l-4 border-green-500',
    warning: 'border-l-4 border-yellow-500',
    danger: 'border-l-4 border-red-500',
    info: 'border-l-4 border-blue-500',
  }

  return (
    <div
      className={`
        bg-[var(--surface)] border border-[var(--surface-2)] rounded-xl p-6
        ${highlight ? highlightColor[highlight] : ''}
        ${clickable ? 'cursor-pointer hover:border-[var(--brand)] transition-all' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {title && (
        <div className="mb-4">
          <h3 className="font-semibold text-[var(--text)]">{title}</h3>
          {subtitle && (
            <p className="text-sm text-[var(--muted)] mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  onClick,
  highlight,
}: {
  label: string
  value: string | number
  icon?: string
  trend?: { value: number; isPositive: boolean }
  onClick?: () => void
  highlight?: string
}) {
  return (
    <Card
      clickable={!!onClick}
      onClick={onClick}
      highlight={highlight as any}
      className="text-center"
    >
      {icon && <div className="text-3xl mb-2">{icon}</div>}
      <p className="text-sm text-[var(--muted)] mb-2">{label}</p>
      <div className="text-3xl font-bold text-[var(--text)]">{value}</div>
      {trend && (
        <p
          className={`text-xs mt-2 ${
            trend.isPositive ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </p>
      )}
    </Card>
  )
}


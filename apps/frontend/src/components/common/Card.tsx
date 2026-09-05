import React from 'react'
import './Card.css'

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
  const highlightColor: Record<NonNullable<CardProps['highlight']>, string> = {
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
  }

  return (
    <div
      className={`ft-card ${clickable ? 'ft-card-clickable' : ''} ${className}`}
      style={highlight ? { borderLeft: `4px solid ${highlightColor[highlight]}` } : undefined}
      onClick={onClick}
    >
      {title && (
        <div className="ft-card-header">
          <h3 className="ft-card-title">{title}</h3>
          {subtitle && (
            <p className="ft-card-subtitle">{subtitle}</p>
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
      className="ft-stat-card"
    >
      {icon && <div className="ft-stat-icon">{icon}</div>}
      <p className="ft-stat-label">{label}</p>
      <div className="ft-stat-value">{value}</div>
      {trend && (
        <p className={`ft-stat-trend ${trend.isPositive ? 'ft-stat-trend-up' : 'ft-stat-trend-down'}`}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </p>
      )}
    </Card>
  )
}


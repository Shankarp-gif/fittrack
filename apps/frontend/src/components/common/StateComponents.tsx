import React from 'react'

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon?: string
  title: string
  message?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-5xl mb-4 opacity-50">{icon}</div>}
      <h3 className="text-lg font-semibold text-[var(--text)]">{title}</h3>
      {message && (
        <p className="text-[var(--muted)] mt-2 max-w-sm">{message}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-12 h-12 border-4 border-[var(--surface-2)] border-t-[var(--brand)] rounded-full animate-spin mb-4" />
      <p className="text-[var(--muted)]">{message}</p>
    </div>
  )
}

export function ErrorState({
  title,
  message,
  action,
}: {
  title: string
  message?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-red-500">{title}</h3>
      {message && (
        <p className="text-[var(--muted)] mt-2 max-w-sm">{message}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}


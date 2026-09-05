import React from 'react'

interface ModalProps {
  isOpen: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
  actions?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  closeOnBackdrop?: boolean
}

export function Modal({
  isOpen,
  title,
  children,
  onClose,
  actions,
  size = 'md',
  closeOnBackdrop = true,
}: ModalProps) {
  if (!isOpen) return null

  const sizeClass = {
    sm: 'w-96',
    md: 'w-full max-w-2xl',
    lg: 'w-full max-w-4xl',
  }[size]

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={`${sizeClass} bg-[var(--surface)] rounded-2xl p-6 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--text)]"
          >
            ✕
          </button>
        </div>
        <div className="mb-6">{children}</div>
        {actions && <div className="flex justify-end gap-2">{actions}</div>}
      </div>
    </div>
  )
}


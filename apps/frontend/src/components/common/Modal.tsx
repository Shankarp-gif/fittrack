import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

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
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const body = document.body
    const previousOverflow = body.style.overflow
    const previousPaddingRight = body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPaddingRight
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClass = {
    sm: 'w-96',
    md: 'w-full max-w-2xl',
    lg: 'w-full max-w-4xl',
  }[size]

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
      style={{ zIndex: 2000 }}
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

  return createPortal(modalContent, document.body)
}

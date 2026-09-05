import React, { useState, useEffect } from 'react'
import type { LucideIcon } from 'lucide-react'
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

interface CenteredSuccessModalProps {
  isOpen: boolean
  title?: string
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  onClose?: () => void
  autoClose?: boolean
  icon?: React.ReactNode
}

interface ModalInstance extends CenteredSuccessModalProps {
  id: string
}

let modalIdCounter = 0
const modalQueue: ModalInstance[] = []
let modalUpdateCallback: ((modals: ModalInstance[]) => void) | null = null

export function setCenteredModalUpdateCallback(
  callback: (modals: ModalInstance[]) => void
) {
  modalUpdateCallback = callback
}

export function showCenteredSuccessModal(props: CenteredSuccessModalProps) {
  const id = `modal-${modalIdCounter++}`
  const modal: ModalInstance = {
    ...props,
    id,
    type: props.type || 'success',
    duration: props.duration || 4000,
    autoClose: props.autoClose !== false,
  }
  modalQueue.push(modal)
  modalUpdateCallback?.(modalQueue)

  if (modal.autoClose && modal.duration && modal.duration > 0) {
    setTimeout(() => {
      const index = modalQueue.indexOf(modal)
      if (index > -1) {
        modalQueue.splice(index, 1)
        modalUpdateCallback?.(modalQueue)
      }
      modal.onClose?.()
    }, modal.duration)
  }
}

const typeConfig: Record<string, { bg: string; icon: LucideIcon; textColor: string; borderColor: string }> = {
  success: {
    bg: 'from-green-600 to-green-700',
    icon: CheckCircle,
    textColor: 'text-green-50',
    borderColor: 'border-green-500',
  },
  error: {
    bg: 'from-red-600 to-red-700',
    icon: AlertCircle,
    textColor: 'text-red-50',
    borderColor: 'border-red-500',
  },
  info: {
    bg: 'from-blue-600 to-blue-700',
    icon: Info,
    textColor: 'text-blue-50',
    borderColor: 'border-blue-500',
  },
  warning: {
    bg: 'from-amber-600 to-amber-700',
    icon: AlertTriangle,
    textColor: 'text-amber-50',
    borderColor: 'border-amber-500',
  },
}

export function CenteredSuccessModal({
  isOpen,
  title,
  message,
  type = 'success',
  onClose,
  icon,
}: CenteredSuccessModalProps) {
  const [isVisible, setIsVisible] = useState(isOpen)

  useEffect(() => {
    setIsVisible(isOpen)
  }, [isOpen])

  if (!isVisible) return null

  const config = typeConfig[type]
  const IconComponent = config.icon
  const titleText = title || (type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : type === 'info' ? 'Info' : 'Warning')

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  // Gradient colors for each type
  const gradientColors: Record<string, { start: string; end: string; border: string; textColor: string }> = {
    success: {
      start: '#16a34a',
      end: '#15803d',
      border: '#22c55e',
      textColor: '#f0fdf4',
    },
    error: {
      start: '#dc2626',
      end: '#b91c1c',
      border: '#ef4444',
      textColor: '#fef2f2',
    },
    info: {
      start: '#2563eb',
      end: '#1d4ed8',
      border: '#3b82f6',
      textColor: '#eff6ff',
    },
    warning: {
      start: '#d97706',
      end: '#b45309',
      border: '#f59e0b',
      textColor: '#fffbeb',
    },
  }

  const colors = gradientColors[type] || gradientColors.success

  // Inline styles for absolute centering
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 99999,
    padding: '16px',
    overflow: 'auto',
  }

  const cardStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 100000,
    maxWidth: '448px',
    width: '100%',
    minWidth: '300px',
    padding: '32px',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: `2px solid ${colors.border}`,
    background: `linear-gradient(135deg, ${colors.start} 0%, ${colors.end} 100%)`,
    animation: 'bounce-in 0.5s ease-out forwards',
  }

  return (
    <div
      style={overlayStyle}
      onClick={handleClose}
    >
      <div
        style={cardStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              filter: 'blur(40px)',
              transform: 'scale(1.5)',
            }} />
            <div style={{
              position: 'relative',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              padding: '16px',
            }}>
              {icon ? icon : <IconComponent size={48} color={colors.textColor} strokeWidth={1.5} />}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: colors.textColor,
            marginBottom: '8px',
          }}>
            {titleText}
          </h2>
          <p style={{
            color: colors.textColor,
            fontSize: '14px',
            opacity: 0.9,
            lineHeight: '1.5',
          }}>
            {message}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{
          marginTop: '24px',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}>
          <div
            style={{
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '9999px',
              animation: 'progress 4s ease-out forwards',
            }}
          />
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            width: '100%',
            marginTop: '24px',
            color: colors.textColor,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            fontWeight: '600',
            padding: '8px 16px',
            borderRadius: '12px',
            transition: 'all 0.2s',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
          }}
        >
          Close
        </button>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          50% {
            transform: scale(1.05) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes progress {
          0% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

export function CenteredSuccessModalContainer() {
  const [modals, setModals] = React.useState<ModalInstance[]>([])

  React.useEffect(() => {
    setCenteredModalUpdateCallback(setModals)
  }, [])

  return (
    <>
      {modals.map((modal) => (
        <CenteredSuccessModal
          key={modal.id}
          isOpen={true}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          onClose={() => {
            const index = modals.indexOf(modal)
            if (index > -1) {
              modals.splice(index, 1)
              setModals([...modals])
            }
          }}
        />
      ))}
    </>
  )
}


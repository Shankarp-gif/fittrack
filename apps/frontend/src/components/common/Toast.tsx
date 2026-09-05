import React, { useState, useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  onClose?: () => void
}

interface ToastInstance extends ToastProps {
  id: string
}

let toastIdCounter = 0
const toastQueue: ToastInstance[] = []
let toastUpdateCallback: ((toasts: ToastInstance[]) => void) | null = null

export function setToastUpdateCallback(
  callback: (toasts: ToastInstance[]) => void
) {
  toastUpdateCallback = callback
}

export function showToast(props: ToastProps) {
  const id = `toast-${toastIdCounter++}`
  const toast: ToastInstance = {
    ...props,
    id,
    type: props.type || 'info',
    duration: props.duration || 3000,
  }
  toastQueue.push(toast)
  toastUpdateCallback?.(toastQueue)

  if (toast.duration && toast.duration > 0) {
    setTimeout(() => {
      toastQueue.splice(toastQueue.indexOf(toast), 1)
      toastUpdateCallback?.(toastQueue)
    }, toast.duration)
  }
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  if (!isVisible) return null

  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-600',
  }[type]

  return (
    <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2`}>
      <span>{message}</span>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-auto text-white/70 hover:text-white"
      >
        ✕
      </button>
    </div>
  )
}

export function ToastContainer() {
  const [toasts, setToasts] = React.useState<ToastInstance[]>([])

  React.useEffect(() => {
    setToastUpdateCallback(setToasts)
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => {
            toasts.splice(toasts.indexOf(toast), 1)
            setToasts([...toasts])
          }}
        />
      ))}
    </div>
  )
}


import { logger } from '../utils/Logger'

// Initialize logger based on environment
export function initializeLogging() {
  if (import.meta.env.DEV) {
    logger.setLevel('DEBUG')
    logger.info('FitTrack Frontend Started', {
      environment: import.meta.env.MODE,
      timestamp: new Date().toISOString(),
    })
  } else {
    logger.setLevel('INFO')
  }

  // Log navigation
  window.addEventListener('load', () => {
    logger.info('Page loaded', {
      url: window.location.href,
      userAgent: navigator.userAgent,
    })
  })

  // Log errors globally
  window.addEventListener('error', (event) => {
    logger.error('Global error caught', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  // Log unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', event.reason)
  })

  logger.info('Logging system initialized')
}

// Make logger globally available for debugging
declare global {
  interface Window {
    __logger: typeof logger
    __getLogs: () => string[]
    __clearLogs: () => void
    __downloadLogs: () => void
  }
}

window.__logger = logger
window.__getLogs = () => logger.getLogs()
window.__clearLogs = () => logger.clearLogs()
window.__downloadLogs = () => logger.downloadLogs()

export { logger }


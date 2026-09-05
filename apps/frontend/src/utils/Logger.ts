// Frontend logging utility with console and local storage support
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
}

const STORAGE_KEY = 'fittrack_logs'
const MAX_LOGS = 500 // Keep last 500 logs in storage

export class Logger {
  static level = LOG_LEVELS.INFO

  static setLevel(level: keyof typeof LOG_LEVELS) {
    Logger.level = LOG_LEVELS[level]
  }

  private static formatMessage(levelName: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    if (data) {
      return `[${timestamp}] ${levelName}: ${message} ${JSON.stringify(data)}`
    }
    return `[${timestamp}] ${levelName}: ${message}`
  }

  private static saveToBrowserStorage(message: string) {
    try {
      const logs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      logs.push(message)

      // Keep only last MAX_LOGS
      if (logs.length > MAX_LOGS) {
        logs.shift()
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
    } catch (e) {
      console.error('Failed to save logs to storage', e)
    }
  }

  static debug(message: string, data?: any) {
    if (Logger.level <= LOG_LEVELS.DEBUG) {
      const formatted = Logger.formatMessage('DEBUG', message, data)
      console.debug(formatted)
      Logger.saveToBrowserStorage(formatted)
    }
  }

  static info(message: string, data?: any) {
    if (Logger.level <= LOG_LEVELS.INFO) {
      const formatted = Logger.formatMessage('INFO', message, data)
      console.log(formatted)
      Logger.saveToBrowserStorage(formatted)
    }
  }

  static warn(message: string, data?: any) {
    if (Logger.level <= LOG_LEVELS.WARN) {
      const formatted = Logger.formatMessage('WARN', message, data)
      console.warn(formatted)
      Logger.saveToBrowserStorage(formatted)
    }
  }

  static error(message: string, error?: Error | any) {
    if (Logger.level <= LOG_LEVELS.ERROR) {
      const errorData = error instanceof Error ?
        { message: error.message, stack: error.stack } :
        error
      const formatted = Logger.formatMessage('ERROR', message, errorData)
      console.error(formatted)
      Logger.saveToBrowserStorage(formatted)
    }
  }

  static getLogs(): string[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch (e) {
      console.error('Failed to retrieve logs from storage', e)
      return []
    }
  }

  static clearLogs() {
    try {
      localStorage.removeItem(STORAGE_KEY)
      console.log('Logs cleared')
    } catch (e) {
      console.error('Failed to clear logs', e)
    }
  }

  static downloadLogs() {
    const logs = Logger.getLogs()
    const text = logs.join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fittrack-frontend-${new Date().toISOString()}.log`
    a.click()
    URL.revokeObjectURL(url)
  }
}

// Export a singleton instance
export const logger = Logger


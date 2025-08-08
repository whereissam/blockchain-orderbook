// Centralized logging utility
const isProduction = import.meta.env.VITE_NODE_ENV === 'production'
const enableLogs = import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true' || !isProduction

export const logger = {
  info: (...args) => {
    if (enableLogs) console.log(...args)
  },
  warn: (...args) => {
    if (enableLogs) console.warn(...args)
  },
  error: (...args) => {
    console.error(...args) // Always log errors
  },
  debug: (...args) => {
    if (enableLogs && import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.debug(...args)
    }
  }
}

export default logger
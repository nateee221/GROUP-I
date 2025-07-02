interface ConsoleMessage {
  id: string
  timestamp: string
  level: "log" | "error" | "warn" | "info" | "debug"
  message: string
  args: any[]
}

// Mock console messages for demonstration
const INITIAL_MESSAGES: Partial<ConsoleMessage>[] = [
  { level: "info", message: "Application initialized", args: ["Application initialized"] },
  { level: "log", message: "User authentication successful", args: ["User authentication successful"] },
  { level: "warn", message: "Deprecated API call detected", args: ["Deprecated API call detected"] },
  {
    level: "error",
    message: "Failed to connect to database: Connection timeout",
    args: ["Failed to connect to database: Connection timeout"],
  },
  { level: "log", message: "Assets loaded: 157 items", args: ["Assets loaded: 157 items"] },
  {
    level: "info",
    message: "System check complete - all services operational",
    args: ["System check complete - all services operational"],
  },
  { level: "warn", message: "Low disk space warning: 15% remaining", args: ["Low disk space warning: 15% remaining"] },
  { level: "debug", message: "Cache hit ratio: 78.5%", args: ["Cache hit ratio: 78.5%"] },
  {
    level: "error",
    message: "API rate limit exceeded for endpoint: /api/assets",
    args: ["API rate limit exceeded for endpoint: /api/assets"],
  },
  {
    level: "log",
    message: "Session expired for user: admin@lgu.gov",
    args: ["Session expired for user: admin@lgu.gov"],
  },
]

class ConsoleLogger {
  private static instance: ConsoleLogger
  private messages: ConsoleMessage[] = []
  private listeners: ((messages: ConsoleMessage[]) => void)[] = []
  private originalConsole: {
    log: typeof console.log
    error: typeof console.error
    warn: typeof console.warn
    info: typeof console.info
    debug: typeof console.debug
  }
  private initialized = false

  private constructor() {
    // Store original console methods
    this.originalConsole = {
      log: console.log.bind(console),
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console),
    }

    // Add initial mock messages
    this.addInitialMessages()

    // Override console methods
    this.interceptConsole()
    this.initialized = true
  }

  private addInitialMessages() {
    // Add mock messages with timestamps spread over the last hour
    const now = Date.now()
    INITIAL_MESSAGES.forEach((msg, index) => {
      // Spread messages over the last hour
      const timestamp = new Date(now - (60 - index) * 60000).toISOString()
      this.messages.push({
        id: `console-initial-${index}`,
        timestamp,
        level: msg.level as ConsoleMessage["level"],
        message: msg.message || "",
        args: msg.args || [],
      })
    })
  }

  static getInstance(): ConsoleLogger {
    if (!ConsoleLogger.instance) {
      ConsoleLogger.instance = new ConsoleLogger()
    }
    return ConsoleLogger.instance
  }

  private interceptConsole() {
    console.log = (...args: any[]) => {
      this.addMessage("log", args)
      this.originalConsole.log(...args)
    }

    console.error = (...args: any[]) => {
      this.addMessage("error", args)
      this.originalConsole.error(...args)
    }

    console.warn = (...args: any[]) => {
      this.addMessage("warn", args)
      this.originalConsole.warn(...args)
    }

    console.info = (...args: any[]) => {
      this.addMessage("info", args)
      this.originalConsole.info(...args)
    }

    console.debug = (...args: any[]) => {
      this.addMessage("debug", args)
      this.originalConsole.debug(...args)
    }
  }

  private addMessage(level: ConsoleMessage["level"], args: any[]) {
    const message: ConsoleMessage = {
      id: `console-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      message: this.formatMessage(args),
      args,
    }

    this.messages.push(message)

    // Keep only last 1000 messages
    if (this.messages.length > 1000) {
      this.messages = this.messages.slice(-1000)
    }

    // Notify listeners
    this.listeners.forEach((listener) => listener([...this.messages]))
  }

  private formatMessage(args: any[]): string {
    return args
      .map((arg) => {
        if (typeof arg === "object") {
          try {
            return JSON.stringify(arg, null, 2)
          } catch {
            return String(arg)
          }
        }
        return String(arg)
      })
      .join(" ")
  }

  getMessages(): ConsoleMessage[] {
    return [...this.messages]
  }

  subscribe(listener: (messages: ConsoleMessage[]) => void): () => void {
    this.listeners.push(listener)

    // Immediately notify with current messages
    listener([...this.messages])

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  clear() {
    this.messages = []
    this.listeners.forEach((listener) => listener([]))
  }

  restore() {
    // Restore original console methods
    console.log = this.originalConsole.log
    console.error = this.originalConsole.error
    console.warn = this.originalConsole.warn
    console.info = this.originalConsole.info
    console.debug = this.originalConsole.debug
  }

  generateTestMessage(level: ConsoleMessage["level"] = "log") {
    const messages = {
      log: "System log: User activity recorded",
      error: "Error: Failed to process request",
      warn: "Warning: Resource usage approaching limit",
      info: "Info: Background task completed successfully",
      debug: "Debug: Variable state - {count: 42, status: 'active'}",
    }

    // Use the original console to avoid recursion
    this.originalConsole[level](messages[level])
  }
}

// Initialize the console logger as early as possible
export const consoleLogger = ConsoleLogger.getInstance()
export type { ConsoleMessage }

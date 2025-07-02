import { supabase, isSupabaseConfigured } from "./supabase-client"
import type { SystemUser } from "@/types/database"

interface AuditLogData {
  action: string
  description: string
  entityType?: string
  entityId?: string
  entityName?: string
  oldValues?: any
  newValues?: any
  severity?: "low" | "medium" | "high" | "critical"
  category?: string
}

class AuditLogger {
  private static instance: AuditLogger
  private currentUser: SystemUser | null = null
  private sessionId: string | null = null

  private constructor() {
    // Generate session ID
    this.sessionId = this.generateSessionId()
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  setCurrentUser(user: SystemUser) {
    this.currentUser = user
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private getClientInfo() {
    if (typeof window === "undefined") {
      return { ipAddress: null, userAgent: null }
    }

    return {
      ipAddress: null, // Will be set by server-side logging
      userAgent: navigator.userAgent,
    }
  }

  private categorizeAction(action: string): string {
    if (action.includes("create")) return "create"
    if (action.includes("update") || action.includes("edit")) return "update"
    if (action.includes("delete") || action.includes("remove")) return "delete"
    if (action.includes("view") || action.includes("get") || action.includes("fetch")) return "view"
    if (action.includes("login")) return "login"
    if (action.includes("logout")) return "logout"
    if (action.includes("export")) return "export"
    if (action.includes("import")) return "import"
    return "system"
  }

  private determineSeverity(action: string, category: string): "low" | "medium" | "high" | "critical" {
    if (action.includes("delete") || action.includes("remove")) return "high"
    if (action.includes("failed") || action.includes("error")) return "high"
    if (action.includes("unauthorized") || action.includes("denied")) return "critical"
    if (category === "create" || category === "update") return "medium"
    if (category === "login" || category === "logout") return "low"
    if (category === "view") return "low"
    return "medium"
  }

  async logUserAction(action: string, description: string, additionalData?: Partial<AuditLogData>) {
    if (!this.currentUser) {
      console.warn("No current user set for audit logging")
      return
    }

    const category = additionalData?.category || this.categorizeAction(action)
    const severity = additionalData?.severity || this.determineSeverity(action, category)

    await this.log({
      action,
      description,
      entityType: additionalData?.entityType || "user",
      entityId: additionalData?.entityId,
      entityName: additionalData?.entityName,
      oldValues: additionalData?.oldValues,
      newValues: additionalData?.newValues,
      severity,
      category,
    })
  }

  async logSystemAction(action: string, description: string, additionalData?: Partial<AuditLogData>) {
    const category = additionalData?.category || this.categorizeAction(action)
    const severity = additionalData?.severity || this.determineSeverity(action, category)

    await this.log({
      action,
      description,
      entityType: additionalData?.entityType || "system",
      entityId: additionalData?.entityId,
      entityName: additionalData?.entityName,
      oldValues: additionalData?.oldValues,
      newValues: additionalData?.newValues,
      severity,
      category,
    })
  }

  async logEntityChange(
    action: string,
    entityType: string,
    entityId: string,
    entityName: string,
    oldValues: any,
    newValues: any,
    description?: string,
  ) {
    const category = this.categorizeAction(action)
    const severity = this.determineSeverity(action, category)

    await this.log({
      action,
      description: description || `${action.replace(/_/g, " ")} ${entityType}: ${entityName}`,
      entityType,
      entityId,
      entityName,
      oldValues,
      newValues,
      severity,
      category,
    })
  }

  private async log(data: AuditLogData) {
    const clientInfo = this.getClientInfo()
    const timestamp = new Date().toISOString()

    const logEntry = {
      user_id: this.currentUser?.id || null,
      user_name: this.currentUser?.name || "System",
      user_email: this.currentUser?.email || null,
      action: data.action,
      entity_type: data.entityType || "unknown",
      entity_id: data.entityId || null,
      entity_name: data.entityName || null,
      description: data.description,
      old_values: data.oldValues ? JSON.stringify(data.oldValues) : null,
      new_values: data.newValues ? JSON.stringify(data.newValues) : null,
      ip_address: clientInfo.ipAddress,
      user_agent: clientInfo.userAgent,
      session_id: this.sessionId,
      severity: data.severity || "medium",
      category: data.category || "system",
      timestamp,
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("audit_logs").insert([logEntry])

        if (error) {
          console.error("Failed to log audit entry to Supabase:", error)
          this.fallbackToLocalStorage(logEntry)
        }
      } catch (error) {
        console.error("Error logging to Supabase:", error)
        this.fallbackToLocalStorage(logEntry)
      }
    } else {
      this.fallbackToLocalStorage(logEntry)
    }
  }

  private fallbackToLocalStorage(logEntry: any) {
    if (typeof window === "undefined") return

    try {
      const existingLogs = JSON.parse(localStorage.getItem("auditLogs") || "[]")
      existingLogs.push({ ...logEntry, id: Date.now().toString() })

      // Keep only last 1000 logs in localStorage
      if (existingLogs.length > 1000) {
        existingLogs.splice(0, existingLogs.length - 1000)
      }

      localStorage.setItem("auditLogs", JSON.stringify(existingLogs))
    } catch (error) {
      console.error("Failed to save audit log to localStorage:", error)
    }
  }
}

export const auditLogger = AuditLogger.getInstance()

import { supabase, isSupabaseConfigured } from "./supabase"
import type { AuditLog, AuditFilters, AuditStats } from "@/types/audit"

class AuditService {
  private static instance: AuditService

  private constructor() {}

  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService()
    }
    return AuditService.instance
  }

  // Helper function to format hour in 12-hour format
  private formatHour(hour: number): string {
    if (hour === 0) {
      return "12am"
    } else if (hour < 12) {
      return `${hour}am`
    } else if (hour === 12) {
      return "12pm"
    } else {
      return `${hour - 12}pm`
    }
  }

  async getAuditLogs(
    filters: AuditFilters = {},
    page = 1,
    limit = 50,
  ): Promise<{ logs: AuditLog[]; total: number; hasMore: boolean }> {
    if (!isSupabaseConfigured()) {
      // Return mock data when Supabase is not configured
      return this.getMockAuditLogs(filters, page, limit)
    }

    try {
      let query = supabase.from("audit_logs").select("*", { count: "exact" })

      // Apply filters
      if (filters.searchTerm) {
        query = query.or(
          `description.ilike.%${filters.searchTerm}%,action.ilike.%${filters.searchTerm}%,entity_name.ilike.%${filters.searchTerm}%`,
        )
      }

      if (filters.entityType) {
        query = query.eq("entity_type", filters.entityType)
      }

      if (filters.severity) {
        query = query.eq("severity", filters.severity)
      }

      if (filters.category) {
        query = query.eq("category", filters.category)
      }

      if (filters.userId) {
        query = query.eq("user_id", filters.userId)
      }

      if (filters.startDate) {
        query = query.gte("timestamp", filters.startDate)
      }

      if (filters.endDate) {
        query = query.lte("timestamp", filters.endDate)
      }

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await query.order("timestamp", { ascending: false }).range(from, to)

      if (error) {
        console.error("Error fetching audit logs:", error)
        return this.getMockAuditLogs(filters, page, limit)
      }

      const logs: AuditLog[] = (data || []).map((log) => ({
        id: log.id,
        userId: log.user_id,
        userName: log.user_name,
        userEmail: log.user_email,
        action: log.action,
        entityType: log.entity_type,
        entityId: log.entity_id,
        entityName: log.entity_name,
        description: log.description,
        oldValues: log.old_values,
        newValues: log.new_values,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        sessionId: log.session_id,
        severity: log.severity,
        category: log.category,
        timestamp: log.timestamp,
      }))

      return {
        logs,
        total: count || 0,
        hasMore: (count || 0) > page * limit,
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error)
      return this.getMockAuditLogs(filters, page, limit)
    }
  }

  async getAuditStats(): Promise<AuditStats> {
    if (!isSupabaseConfigured()) {
      return this.getRealTimeAuditStats()
    }

    try {
      // Get total logs count
      const { count: totalLogs } = await supabase.from("audit_logs").select("*", { count: "exact", head: true })

      // Get today's logs
      const today = new Date().toISOString().split("T")[0]
      const { count: todayLogs } = await supabase
        .from("audit_logs")
        .select("*", { count: "exact", head: true })
        .gte("timestamp", `${today}T00:00:00.000Z`)

      // Get unique users count
      const { data: uniqueUsersData } = await supabase.from("audit_logs").select("user_id").neq("user_id", null)

      const uniqueUsers = new Set(uniqueUsersData?.map((log) => log.user_id) || []).size

      // Get top actions
      const { data: actionsData } = await supabase
        .from("audit_logs")
        .select("action")
        .order("timestamp", { ascending: false })
        .limit(1000)

      const actionCounts = (actionsData || []).reduce((acc: Record<string, number>, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1
        return acc
      }, {})

      const topActions = Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Get activity by hour (last 24 hours)
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: hourlyData } = await supabase
        .from("audit_logs")
        .select("timestamp")
        .gte("timestamp", last24Hours)
        .order("timestamp", { ascending: false })

      const activityByHour = Array.from({ length: 24 }, (_, i) => ({
        hour: this.formatHour(i),
        count: 0,
      }))
      ;(hourlyData || []).forEach((log) => {
        const hour = new Date(log.timestamp).getHours()
        activityByHour[hour].count++
      })

      return {
        totalLogs: totalLogs || 0,
        todayLogs: todayLogs || 0,
        uniqueUsers,
        topActions,
        activityByHour,
      }
    } catch (error) {
      console.error("Failed to fetch audit stats:", error)
      return this.getRealTimeAuditStats()
    }
  }

  async exportAuditLogs(filters: AuditFilters = {}): Promise<string> {
    const { logs } = await this.getAuditLogs(filters, 1, 10000) // Get all logs for export

    const headers = [
      "Timestamp",
      "User Name",
      "User Email",
      "Action",
      "Entity Type",
      "Entity Name",
      "Description",
      "Severity",
      "Category",
      "IP Address",
    ]

    const csvRows = [
      headers.join(","),
      ...logs.map((log) =>
        [
          log.timestamp,
          `"${log.userName}"`,
          `"${log.userEmail}"`,
          `"${log.action}"`,
          `"${log.entityType}"`,
          `"${log.entityName || ""}"`,
          `"${log.description.replace(/"/g, '""')}"`,
          `"${log.severity}"`,
          `"${log.category}"`,
          `"${log.ipAddress || ""}"`,
        ].join(","),
      ),
    ]

    return csvRows.join("\n")
  }

  private getRealTimeAuditStats(): AuditStats {
    // Get all logs from localStorage for real-time calculation
    let allLogs: AuditLog[] = []

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("auditLogs")
        if (stored) {
          const parsedLogs = JSON.parse(stored)
          allLogs = parsedLogs.map((log: any) => ({
            id: log.id,
            userId: log.user_id,
            userName: log.user_name,
            userEmail: log.user_email,
            action: log.action,
            entityType: log.entity_type,
            entityId: log.entity_id,
            entityName: log.entity_name,
            description: log.description,
            oldValues: log.old_values ? JSON.parse(log.old_values) : null,
            newValues: log.new_values ? JSON.parse(log.new_values) : null,
            ipAddress: log.ip_address,
            userAgent: log.user_agent,
            sessionId: log.session_id,
            severity: log.severity,
            category: log.category,
            timestamp: log.timestamp,
          }))
        }
      } catch (error) {
        console.error("Error reading audit logs from localStorage:", error)
      }
    }

    // Calculate total logs
    const totalLogs = allLogs.length

    // Calculate today's logs
    const today = new Date().toISOString().split("T")[0]
    const todayLogs = allLogs.filter((log) => log.timestamp.startsWith(today)).length

    // Calculate unique users
    const uniqueUserIds = new Set(allLogs.map((log) => log.userId).filter(Boolean))
    const uniqueUsers = uniqueUserIds.size

    // Calculate top actions
    const actionCounts = allLogs.reduce((acc: Record<string, number>, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1
      return acc
    }, {})

    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Calculate activity by hour (last 24 hours) with 12-hour format
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentLogs = allLogs.filter((log) => new Date(log.timestamp) >= last24Hours)

    const activityByHour = Array.from({ length: 24 }, (_, i) => ({
      hour: this.formatHour(i),
      count: 0,
    }))

    recentLogs.forEach((log) => {
      const hour = new Date(log.timestamp).getHours()
      activityByHour[hour].count++
    })

    return {
      totalLogs,
      todayLogs,
      uniqueUsers,
      topActions,
      activityByHour,
    }
  }

  private getMockAuditLogs(
    filters: AuditFilters,
    page: number,
    limit: number,
  ): { logs: AuditLog[]; total: number; hasMore: boolean } {
    // First, try to get logs from localStorage
    let storedLogs: AuditLog[] = []
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("auditLogs")
        if (stored) {
          const parsedLogs = JSON.parse(stored)
          storedLogs = parsedLogs.map((log: any) => ({
            id: log.id,
            userId: log.user_id,
            userName: log.user_name,
            userEmail: log.user_email,
            action: log.action,
            entityType: log.entity_type,
            entityId: log.entity_id,
            entityName: log.entity_name,
            description: log.description,
            oldValues: log.old_values ? JSON.parse(log.old_values) : null,
            newValues: log.new_values ? JSON.parse(log.new_values) : null,
            ipAddress: log.ip_address,
            userAgent: log.user_agent,
            sessionId: log.session_id,
            severity: log.severity,
            category: log.category,
            timestamp: log.timestamp,
          }))
        }
      } catch (error) {
        console.error("Error reading audit logs from localStorage:", error)
      }
    }

    // Generate 10 mock audit logs for demonstration
    const mockLogs: AuditLog[] = [
      {
        id: "1",
        userId: "admin-1",
        userName: "System Administrator",
        userEmail: "admin@lgu.gov.ph",
        action: "view_audit_trail",
        entityType: "audit",
        entityId: null,
        entityName: null,
        description: "User accessed audit trail page",
        oldValues: null,
        newValues: null,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        sessionId: "session-123",
        severity: "low",
        category: "view",
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        userId: "admin-1",
        userName: "System Administrator",
        userEmail: "admin@lgu.gov.ph",
        action: "login",
        entityType: "auth",
        entityId: null,
        entityName: null,
        description: "User successfully logged into the system from IP 192.168.1.100",
        oldValues: null,
        newValues: null,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        sessionId: "session-123",
        severity: "low",
        category: "login",
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: "3",
        userId: "admin-1",
        userName: "System Administrator",
        userEmail: "admin@lgu.gov.ph",
        action: "create_user",
        entityType: "user",
        entityId: "user-456",
        entityName: "John Doe",
        description: "Created new user account for John Doe",
        oldValues: null,
        newValues: { name: "John Doe", email: "john@lgu.gov.ph", role: "staff" },
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        sessionId: "session-123",
        severity: "medium",
        category: "create",
        timestamp: new Date(Date.now() - 600000).toISOString(),
      },
      {
        id: "4",
        userId: "manager-1",
        userName: "Department Manager",
        userEmail: "manager@lgu.gov.ph",
        action: "login",
        entityType: "auth",
        entityId: null,
        entityName: null,
        description: "User successfully logged into the system from IP 192.168.1.101",
        oldValues: null,
        newValues: null,
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        sessionId: "session-456",
        severity: "low",
        category: "login",
        timestamp: new Date(Date.now() - 900000).toISOString(),
      },
      {
        id: "5",
        userId: "admin-1",
        userName: "System Administrator",
        userEmail: "admin@lgu.gov.ph",
        action: "export_audit_logs",
        entityType: "audit",
        entityId: null,
        entityName: null,
        description: "User exported audit logs to CSV",
        oldValues: null,
        newValues: null,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        sessionId: "session-123",
        severity: "medium",
        category: "export",
        timestamp: new Date(Date.now() - 1200000).toISOString(),
      },
      {
        id: "6",
        userId: null,
        userName: "System",
        userEmail: "staff@lgu.gov.ph",
        action: "failed_login",
        entityType: "auth",
        entityId: null,
        entityName: null,
        description: "Failed login attempt - invalid credentials for staff@lgu.gov.ph from IP 192.168.1.102",
        oldValues: null,
        newValues: null,
        ipAddress: "192.168.1.102",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        sessionId: null,
        severity: "high",
        category: "login",
        timestamp: new Date(Date.now() - 1500000).toISOString(),
      },
      {
        id: "7",
        userId: "staff-1",
        userName: "Staff User",
        userEmail: "staff@lgu.gov.ph",
        action: "view_dashboard",
        entityType: "dashboard",
        entityId: null,
        entityName: null,
        description: "User accessed the dashboard",
        oldValues: null,
        newValues: null,
        ipAddress: "192.168.1.103",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        sessionId: "session-789",
        severity: "low",
        category: "view",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: "8",
        userId: "admin-1",
        userName: "System Administrator",
        userEmail: "admin@lgu.gov.ph",
        action: "update_user",
        entityType: "user",
        entityId: "user-123",
        entityName: "Jane Smith",
        description: "Updated user profile for Jane Smith",
        oldValues: { role: "staff", department: "IT" },
        newValues: { role: "department_head", department: "IT" },
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        sessionId: "session-123",
        severity: "medium",
        category: "update",
        timestamp: new Date(Date.now() - 2100000).toISOString(),
      },
      {
        id: "9",
        userId: "manager-1",
        userName: "Department Manager",
        userEmail: "manager@lgu.gov.ph",
        action: "view_assets",
        entityType: "asset",
        entityId: null,
        entityName: null,
        description: "User accessed the assets page",
        oldValues: null,
        newValues: null,
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        sessionId: "session-456",
        severity: "low",
        category: "view",
        timestamp: new Date(Date.now() - 2400000).toISOString(),
      },
      {
        id: "10",
        userId: "admin-1",
        userName: "System Administrator",
        userEmail: "admin@lgu.gov.ph",
        action: "delete_user",
        entityType: "user",
        entityId: "user-999",
        entityName: "Test User",
        description: "Deleted user account for Test User",
        oldValues: { name: "Test User", email: "test@lgu.gov.ph", role: "staff" },
        newValues: null,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        sessionId: "session-123",
        severity: "high",
        category: "delete",
        timestamp: new Date(Date.now() - 2700000).toISOString(),
      },
    ]

    // Combine stored logs with mock logs, prioritizing stored logs
    const allLogs = [...storedLogs, ...mockLogs]

    // Remove duplicates based on ID
    const uniqueLogs = allLogs.filter((log, index, self) => index === self.findIndex((l) => l.id === log.id))

    // Sort by timestamp (newest first)
    uniqueLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Apply basic filtering for demo
    let filteredLogs = uniqueLogs

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      filteredLogs = filteredLogs.filter(
        (log) =>
          log.description.toLowerCase().includes(searchTerm) ||
          log.action.toLowerCase().includes(searchTerm) ||
          log.userName.toLowerCase().includes(searchTerm),
      )
    }

    if (filters.severity) {
      filteredLogs = filteredLogs.filter((log) => log.severity === filters.severity)
    }

    if (filters.category) {
      filteredLogs = filteredLogs.filter((log) => log.category === filters.category)
    }

    if (filters.entityType) {
      filteredLogs = filteredLogs.filter((log) => log.entityType === filters.entityType)
    }

    const total = filteredLogs.length
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedLogs = filteredLogs.slice(start, end)

    return {
      logs: paginatedLogs,
      total,
      hasMore: end < total,
    }
  }
}

export const auditService = AuditService.getInstance()

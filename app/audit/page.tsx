"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Download, Filter, Search, Shield, Activity, Users } from "lucide-react"
import { auditService } from "@/lib/audit-service"
import { auditLogger } from "@/lib/audit-logger"
import type { AuditLog, AuditFilters, AuditStats } from "@/types/audit"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/components/ui/use-toast"

export default function AuditTrailPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<AuditFilters>({
    searchTerm: "",
    entityType: "all",
    severity: "all",
    category: "all",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    if (user) {
      // Ensure audit logger has the correct current user
      auditLogger.setCurrentUser(user)

      // Log the audit trail access with the correct user
      auditLogger.logUserAction("view_audit_trail", `User ${user.name} (${user.role}) accessed audit trail page`, {
        entityType: "audit",
        severity: "low",
        category: "view",
      })

      loadAuditLogs()
      loadStats()
    }
  }, [user, filters, currentPage])

  // Set up real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        loadStats()
        // Reload logs if on first page to show new entries
        if (currentPage === 1) {
          loadAuditLogs()
        }
      }
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [user, currentPage])

  const loadAuditLogs = async () => {
    try {
      setLoading(true)
      // Convert "all" values to undefined for the service
      const serviceFilters = {
        searchTerm: filters.searchTerm || undefined,
        entityType: filters.entityType === "all" ? undefined : filters.entityType,
        severity: filters.severity === "all" ? undefined : filters.severity,
        category: filters.category === "all" ? undefined : filters.category,
      }
      const result = await auditService.getAuditLogs(serviceFilters, currentPage, 50)
      setLogs(result.logs)
      setTotalLogs(result.total)
      setHasMore(result.hasMore)
    } catch (error) {
      console.error("Failed to load audit logs:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load audit logs",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const auditStats = await auditService.getAuditStats()
      setStats(auditStats)
    } catch (error) {
      console.error("Failed to load audit stats:", error)
    }
  }

  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({ searchTerm: "", entityType: "all", severity: "all", category: "all" })
    setCurrentPage(1)
  }

  const exportLogs = async () => {
    try {
      if (user) {
        auditLogger.logUserAction("export_audit_logs", `User ${user.name} (${user.role}) exported audit logs`, {
          entityType: "audit",
          severity: "medium",
          category: "export",
        })
      }

      // Convert "all" values to undefined for export
      const exportFilters = {
        searchTerm: filters.searchTerm || undefined,
        entityType: filters.entityType === "all" ? undefined : filters.entityType,
        severity: filters.severity === "all" ? undefined : filters.severity,
        category: filters.category === "all" ? undefined : filters.category,
      }

      const csvContent = await auditService.exportAuditLogs(exportFilters)
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export Successful",
        description: "Audit logs have been exported to CSV",
      })

      // Reload stats after export to reflect the new export action
      setTimeout(loadStats, 1000)
    } catch (error) {
      console.error("Failed to export logs:", error)
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export audit logs",
      })
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "create":
        return "+"
      case "update":
        return "✏️"
      case "delete":
        return "🗑️"
      case "view":
        return "👁️"
      case "login":
        return "🔑"
      case "logout":
        return "🚪"
      case "export":
        return "📤"
      case "import":
        return "📥"
      default:
        return "⚙️"
    }
  }

  if (!user || (user.role !== "admin" && user.role !== "department_head")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to view audit trails. Only administrators and department heads can access this
              feature.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Trail</h1>
          <p className="text-muted-foreground">Track and monitor all system activities</p>
        </div>
        <Button onClick={exportLogs} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">All recorded activities</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayLogs.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Activities logged today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.uniqueUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Users with recorded activity</p>
                </CardContent>
              </Card>
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Actions</CardTitle>
                  <CardDescription>Most frequent activities in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topActions.map((action, index) => (
                      <div key={action.action} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <span className="text-sm">{action.action.replace(/_/g, " ")}</span>
                        </div>
                        <Badge variant="secondary">{action.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity by Hour</CardTitle>
                  <CardDescription>System activity over the last 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {/* AM Hours */}
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-muted-foreground">AM Hours</h4>
                      <div className="space-y-2">
                        {stats.activityByHour.slice(0, 12).map((hour) => (
                          <div key={hour.hour} className="flex items-center gap-2">
                            <span className="text-sm w-12">{hour.hour}</span>
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${Math.max(5, (hour.count / Math.max(...stats.activityByHour.map((h) => h.count))) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-8">{hour.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* PM Hours */}
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-muted-foreground">PM Hours</h4>
                      <div className="space-y-2">
                        {stats.activityByHour.slice(12, 24).map((hour) => (
                          <div key={hour.hour} className="flex items-center gap-2">
                            <span className="text-sm w-12">{hour.hour}</span>
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${Math.max(5, (hour.count / Math.max(...stats.activityByHour.map((h) => h.count))) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-8">{hour.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Analytics update automatically every 30 seconds
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={filters.searchTerm || ""}
                      onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Entity Type</label>
                  <Select value={filters.entityType} onValueChange={(value) => handleFilterChange("entityType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="asset">Asset</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="auth">Authentication</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Severity</label>
                  <Select value={filters.severity} onValueChange={(value) => handleFilterChange("severity", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All severities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All severities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                      <SelectItem value="view">View</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="logout">Logout</SelectItem>
                      <SelectItem value="export">Export</SelectItem>
                      <SelectItem value="import">Import</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <span className="text-sm text-muted-foreground">
                  Showing {logs.length} of {totalLogs.toLocaleString()} logs
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Detailed record of all system activities</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{log.userName}</div>
                              <div className="text-xs text-muted-foreground">{log.userEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-xs">{getCategoryIcon(log.category)}</span>
                              <span className="font-mono text-xs">{log.action}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{log.entityType}</div>
                              {log.entityName && <div className="text-xs text-muted-foreground">{log.entityName}</div>}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={log.description}>
                              {log.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getSeverityColor(log.severity) as any}>{log.severity}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{log.ipAddress || "N/A"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {hasMore && (
                    <div className="flex justify-center">
                      <Button variant="outline" onClick={() => setCurrentPage((prev) => prev + 1)} disabled={loading}>
                        Load More
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

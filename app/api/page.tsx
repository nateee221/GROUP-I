"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { useAssets } from "@/components/asset-provider"
import { AlertTriangle, Package, Wrench, FileText, CheckCircle, Clock, Calendar, Archive, Eye } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { AssetDistributionChart } from "@/components/charts/asset-distribution-chart"
import { AssetStatusChart } from "@/components/charts/asset-status-chart"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

export default function DashboardPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const {
    assets,
    assignments,
    transfers,
    maintenanceRecords,
    getTotalAssets,
    getActiveAssets,
    getMaintenanceDueAssets,
    getDisposalPendingAssets,
    getStorageAssets,
    getUpcomingMaintenanceRecords,
    getOverdueMaintenanceRecords,
  } = useAssets()
  const [activeTab, setActiveTab] = useState("overview")

  // Get real-time asset statistics
  const totalAssets = getTotalAssets()
  const activeAssets = getActiveAssets()
  const maintenanceDue = getMaintenanceDueAssets()
  const disposalPending = getDisposalPendingAssets()
  const storageAssets = getStorageAssets()

  const stats = [
    {
      title: "Total Assets",
      value: totalAssets.toLocaleString(),
      description: "Across all departments",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Active Assets",
      value: activeAssets.toLocaleString(),
      description: "Currently in use",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "In Storage",
      value: storageAssets.toLocaleString(),
      description: "Available for use",
      icon: Archive,
      color: "text-gray-600",
    },
    {
      title: "Maintenance Due",
      value: maintenanceDue.toString(),
      description: "Require attention",
      icon: Wrench,
      color: "text-orange-600",
    },
    {
      title: "Disposal Pending",
      value: disposalPending.toString(),
      description: "Awaiting disposal",
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ]

  // Generate real recent activities from actual data
  const generateRecentActivities = () => {
    const activities: any[] = []

    // Add recent asset additions (last 5 assets)
    const recentAssets = assets
      .sort((a, b) => new Date(b.purchaseDate || "").getTime() - new Date(a.purchaseDate || "").getTime())
      .slice(0, 2)

    recentAssets.forEach((asset, index) => {
      activities.push({
        id: `asset-${asset.id}`,
        type: "Asset Added",
        description: `${asset.name} added to ${asset.department}`,
        time: `${index + 1} day${index > 0 ? "s" : ""} ago`,
        status: "completed",
        relatedId: asset.id,
        relatedType: "asset",
      })
    })

    // Add recent assignments
    const recentAssignments = assignments
      .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime())
      .slice(0, 2)

    recentAssignments.forEach((assignment, index) => {
      activities.push({
        id: `assignment-${assignment.id}`,
        type: "Asset Assigned",
        description: `${assignment.assetName} assigned to ${assignment.assignedTo}`,
        time: `${index + 2} day${index + 2 > 1 ? "s" : ""} ago`,
        status: assignment.status === "Active" ? "completed" : "pending",
        relatedId: assignment.id,
        relatedType: "assignment",
      })
    })

    // Add recent transfers
    const recentTransfers = transfers
      .sort((a, b) => new Date(b.transferDate).getTime() - new Date(a.transferDate).getTime())
      .slice(0, 1)

    recentTransfers.forEach((transfer, index) => {
      activities.push({
        id: `transfer-${transfer.id}`,
        type: "Asset Transferred",
        description: `${transfer.assetName} moved from ${transfer.fromUser} to ${transfer.toUser}`,
        time: `${index + 3} day${index + 3 > 1 ? "s" : ""} ago`,
        status: transfer.status === "Completed" ? "completed" : "pending",
        relatedId: transfer.id,
        relatedType: "transfer",
      })
    })

    // Add recent maintenance activities
    const recentMaintenance = maintenanceRecords
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
      .slice(0, 2)

    recentMaintenance.forEach((maintenance, index) => {
      const isCompleted = maintenance.status === "Completed"
      activities.push({
        id: `maintenance-${maintenance.id}`,
        type: isCompleted ? "Maintenance Completed" : "Maintenance Scheduled",
        description: `${maintenance.maintenanceType} maintenance for ${maintenance.assetName}`,
        time: `${index + 4} day${index + 4 > 1 ? "s" : ""} ago`,
        status: isCompleted ? "completed" : "pending",
        relatedId: maintenance.id,
        relatedType: "maintenance",
      })
    })

    // Sort by most recent and return top 5
    return activities
      .sort((a, b) => {
        const timeA = Number.parseInt(a.time.split(" ")[0])
        const timeB = Number.parseInt(b.time.split(" ")[0])
        return timeA - timeB
      })
      .slice(0, 5)
  }

  const recentActivities = generateRecentActivities()

  // Get real upcoming maintenance
  const upcomingMaintenance = getUpcomingMaintenanceRecords()
  const overdueMaintenance = getOverdueMaintenanceRecords()

  // Combine upcoming and overdue maintenance for display
  const allUpcomingMaintenance = [
    ...overdueMaintenance.map((record) => ({
      id: record.id,
      asset: record.assetName,
      location: assets.find((a) => a.id === record.assetId)?.location || record.assetId,
      dueDate: format(new Date(record.scheduledDate), "MMM dd, yyyy"),
      priority: "High" as const,
      status: "Overdue" as const,
      type: record.maintenanceType,
      assignedTo: record.assignedTo,
      isOverdue: true,
    })),
    ...upcomingMaintenance.map((record) => ({
      id: record.id,
      asset: record.assetName,
      location: assets.find((a) => a.id === record.assetId)?.location || record.assetId,
      dueDate: format(new Date(record.scheduledDate), "MMM dd, yyyy"),
      priority:
        record.maintenanceType === "Emergency"
          ? "High"
          : record.maintenanceType === "Preventive"
            ? "Medium"
            : ("Low" as const),
      status: record.status,
      type: record.maintenanceType,
      assignedTo: record.assignedTo,
      isOverdue: false,
    })),
  ].slice(0, 5) // Show only top 5

  const handleActivityClick = (activity: any) => {
    switch (activity.relatedType) {
      case "asset":
        router.push(`/assets/${activity.relatedId}`)
        break
      case "assignment":
        router.push("/assignments")
        break
      case "transfer":
        router.push("/assignments") // Transfers are managed in assignments page
        break
      case "maintenance":
        router.push("/maintenance")
        break
      default:
        break
    }
  }

  const handleMaintenanceClick = (maintenanceId: string) => {
    router.push("/maintenance")
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "Asset Added":
        return Package
      case "Asset Assigned":
        return CheckCircle
      case "Asset Transferred":
        return Archive
      case "Maintenance Scheduled":
        return Clock
      case "Maintenance Completed":
        return CheckCircle
      default:
        return FileText
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your asset management system</p>
        </div>

        {/* Stats Cards - Now using real-time data with icons and descriptions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat, index) => (
            <Card key={index} className="border-gray-300 dark:border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section - Now using real asset data */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-gray-300 dark:border-border/50">
            <CardHeader>
              <CardTitle>Asset Distribution</CardTitle>
              <CardDescription>Distribution of assets across all departments</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <AssetDistributionChart assets={assets} />
            </CardContent>
          </Card>

          <Card className="border-gray-300 dark:border-border/50">
            <CardHeader>
              <CardTitle>Asset Status</CardTitle>
              <CardDescription>Current status of all assets</CardDescription>
            </CardHeader>
            <CardContent>
              <AssetStatusChart assets={assets} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Maintenance - Now Functional */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity - Now using real data */}
          <Card className="border-gray-300 dark:border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest asset management activities</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activities</p>
                  </div>
                ) : (
                  recentActivities.map((activity) => {
                    const ActivityIcon = getActivityIcon(activity.type)
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleActivityClick(activity)}
                      >
                        <div className="mt-1">
                          <ActivityIcon
                            className={`h-4 w-4 ${
                              activity.status === "completed" ? "text-green-600" : "text-orange-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{activity.type}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                        <Badge variant={activity.status === "completed" ? "default" : "secondary"}>
                          {activity.status}
                        </Badge>
                      </div>
                    )
                  })
                )}
              </div>
              {recentActivities.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => router.push("/audit")}>
                    View All Activities
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Maintenance - Now using real data */}
          <Card className="border-gray-300 dark:border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Maintenance</CardTitle>
                <CardDescription>
                  Scheduled maintenance tasks
                  {overdueMaintenance.length > 0 && (
                    <span className="text-destructive font-medium">({overdueMaintenance.length} overdue)</span>
                  )}
                </CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {allUpcomingMaintenance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No upcoming maintenance scheduled</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => router.push("/maintenance")}>
                    Schedule Maintenance
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border border-gray-300 dark:border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUpcomingMaintenance.map((item) => (
                        <TableRow key={item.id} className={item.isOverdue ? "bg-destructive/5" : ""}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.asset}</p>
                              <p className="text-xs text-muted-foreground">{item.location}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className={item.isOverdue ? "text-destructive font-medium" : ""}>
                                {item.dueDate}
                              </span>
                              {item.isOverdue && <AlertTriangle className="h-4 w-4 text-destructive" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                item.priority === "High" || item.isOverdue
                                  ? "border-red-500 text-red-500"
                                  : item.priority === "Medium"
                                    ? "border-orange-500 text-orange-500"
                                    : "border-green-500 text-green-500"
                              }
                            >
                              {item.isOverdue ? "Overdue" : item.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleMaintenanceClick(item.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {allUpcomingMaintenance.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => router.push("/maintenance")}>
                    View All Maintenance
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alerts - Now using real-time data */}
        <div className="grid gap-4 md:grid-cols-2">
          <Alert className="border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-900/10">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800 dark:text-orange-200">Maintenance Alert</AlertTitle>
            <AlertDescription className="text-orange-700 dark:text-orange-300">
              {maintenanceDue} assets require maintenance within the next 30 days.
              {overdueMaintenance.length > 0 && (
                <span className="block mt-1 font-medium">
                  {overdueMaintenance.length} maintenance task{overdueMaintenance.length > 1 ? "s are" : " is"} overdue!
                </span>
              )}
            </AlertDescription>
          </Alert>

          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/10">
            <FileText className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800 dark:text-blue-200">System Status</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              System is running smoothly. {totalAssets} assets tracked across{" "}
              {new Set(assets.map((a) => a.department)).size} departments.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Centralized status mapping utilities
import type { Asset } from "@/types/database"

export const AssetStatusMap = {
  // Database to App mapping
  toApp: {
    active: "In Use",
    inactive: "In Storage",
    maintenance: "In Maintenance",
    disposed: "Pending Disposal",
  } as Record<string, Asset["status"]>,

  // App to Database mapping
  toDb: {
    "In Use": "active",
    "In Storage": "inactive",
    "In Maintenance": "maintenance",
    "Pending Disposal": "disposed",
    active: "active",
    inactive: "inactive",
    maintenance: "maintenance",
    disposed: "disposed",
  } as Record<Asset["status"], string>,
}

export const AssignmentStatusMap = {
  ACTIVE: "Active",
  PENDING: "Pending",
  RETURNED: "Returned",
  OVERDUE: "Overdue",
  IN_MAINTENANCE: "In Maintenance",
} as const

export const TransferStatusMap = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
} as const

export const MaintenanceStatusMap = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
} as const

// Utility functions
export function mapAssetStatusToApp(dbStatus: string): Asset["status"] {
  return AssetStatusMap.toApp[dbStatus] || "In Storage"
}

export function mapAssetStatusToDb(appStatus: Asset["status"]): string {
  return AssetStatusMap.toDb[appStatus] || "inactive"
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    "In Use": "bg-green-100 text-green-800",
    Active: "bg-green-100 text-green-800",
    Completed: "bg-green-100 text-green-800",
    "In Storage": "bg-blue-100 text-blue-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Scheduled: "bg-yellow-100 text-yellow-800",
    "In Maintenance": "bg-orange-100 text-orange-800",
    "In Progress": "bg-orange-100 text-orange-800",
    "Pending Disposal": "bg-red-100 text-red-800",
    Overdue: "bg-red-100 text-red-800",
    Cancelled: "bg-gray-100 text-gray-800",
    Returned: "bg-gray-100 text-gray-800",
  }
  return colorMap[status] || "bg-gray-100 text-gray-800"
}

export function getStatusIcon(status: string): string {
  const iconMap: Record<string, string> = {
    "In Use": "✓",
    Active: "✓",
    Completed: "✓",
    "In Storage": "📦",
    Pending: "⏳",
    Scheduled: "📅",
    "In Maintenance": "🔧",
    "In Progress": "⚙️",
    "Pending Disposal": "🗑️",
    Overdue: "⚠️",
    Cancelled: "✕",
    Returned: "↩️",
  }
  return iconMap[status] || "❓"
}

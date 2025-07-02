"use client"

import type { Asset } from "@/types/database"

interface AssetStatusChartProps {
  assets: Asset[]
}

// Color mapping for status
const statusColors: Record<string, string> = {
  "In Use": "#3b82f6", // blue
  active: "#3b82f6", // blue
  Active: "#3b82f6", // blue
  "In Storage": "#6b7280", // gray
  inactive: "#6b7280", // gray
  Inactive: "#6b7280", // gray
  "In Maintenance": "#3b82f6", // blue (same as In Use in the screenshot)
  maintenance: "#3b82f6", // blue
  Maintenance: "#3b82f6", // blue
  "Pending Disposal": "#ef4444", // red
  disposed: "#ef4444", // red
  Disposed: "#ef4444", // red
  Unknown: "#8b5cf6", // violet
}

export function AssetStatusChart({ assets }: AssetStatusChartProps) {
  // Group assets by status and count them
  const statusCounts = assets.reduce(
    (acc, asset) => {
      const status = asset.status || "Unknown"
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Convert to chart data format
  const chartData = Object.entries(statusCounts)
    .map(([status, count]) => ({
      name: status,
      count,
      percentage: ((count / assets.length) * 100).toFixed(1),
    }))
    .sort((a, b) => b.count - a.count) // Sort by count descending

  const maxCount = Math.max(...chartData.map((item) => item.count))

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">No asset data available</div>
    )
  }

  return (
    <div className="space-y-4">
      {chartData.map((item, index) => {
        const color = statusColors[item.name] || "#8b5cf6"
        const barWidth = (item.count / maxCount) * 100

        return (
          <div key={item.name} className="flex items-center justify-between">
            {/* Status name */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <span className="text-sm font-medium text-foreground">{item.name}</span>

              {/* Progress bar */}
              <div className="flex-1 bg-muted rounded-full h-2 max-w-xs">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: color,
                    width: `${barWidth}%`,
                  }}
                />
              </div>
            </div>

            {/* Count and percentage */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                style={{ backgroundColor: color }}
              >
                {item.count}
              </div>
              <span className="text-sm font-medium text-foreground">{item.percentage}%</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

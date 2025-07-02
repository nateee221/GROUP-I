"use client"

import type { Asset } from "@/types/database"

interface AssetDistributionChartProps {
  assets: Asset[]
}

// Color mapping for departments
const departmentColors: Record<string, string> = {
  "IT Department": "#ef4444", // red
  "Finance Department": "#10b981", // green
  Administration: "#8b5cf6", // purple
  "Human Resources": "#f59e0b", // yellow
  Executive: "#06b6d4", // cyan
  Unassigned: "#6b7280", // gray
}

export function AssetDistributionChart({ assets }: AssetDistributionChartProps) {
  // Group assets by department and count them
  const departmentCounts = assets.reduce(
    (acc, asset) => {
      const dept = asset.department || "Unassigned"
      acc[dept] = (acc[dept] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Convert to chart data format
  const chartData = Object.entries(departmentCounts)
    .map(([department, count]) => ({
      name: department,
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
        const color = departmentColors[item.name] || "#6b7280"
        const barWidth = (item.count / maxCount) * 100

        return (
          <div key={item.name} className="flex items-center space-x-4">
            {/* Color indicator */}
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />

            {/* Department name and bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="text-sm text-muted-foreground">
                    {item.count} asset{item.count !== 1 ? "s" : ""}
                  </span>
                  <span className="text-sm font-medium text-foreground">{item.percentage}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: color,
                    width: `${barWidth}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

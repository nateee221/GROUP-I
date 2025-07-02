"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext, useCallback, type ReactNode } from "react"
import { saveToLocalStorage, resetToInitialData } from "@/lib/local-storage-utils"
import { unifiedDb } from "@/lib/unified-database"
import IdGenerator from "@/lib/id-generator"
import type { Asset, Assignment, Transfer, MaintenanceRecord } from "@/types/database"

// Define the context type
interface AssetContextType {
  assets: Asset[]
  assignments: Assignment[]
  transfers: Transfer[]
  maintenanceRecords: MaintenanceRecord[]
  loading: boolean
  addAsset: (asset: Omit<Asset, "id">) => void
  updateAsset: (id: string, updates: Partial<Asset>) => void
  deleteAsset: (id: string) => void
  addAssignment: (assignment: Omit<Assignment, "id">) => void
  updateAssignment: (id: string, updates: Partial<Assignment>) => void
  deleteAssignment: (id: string) => void
  addTransfer: (transfer: Omit<Transfer, "id">) => void
  updateTransfer: (id: string, updates: Partial<Transfer>) => void
  deleteTransfer: (id: string) => void
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, "id">) => void
  updateMaintenanceRecord: (id: string, updates: Partial<MaintenanceRecord>) => void
  deleteMaintenanceRecord: (id: string) => void
  getAssetsByStatus: () => Record<string, number>
  getAssetsByDepartment: () => Record<string, number>
  getTotalAssets: () => number
  getActiveAssets: () => number
  getStorageAssets: () => number
  getMaintenanceDueAssets: () => number
  getDisposalPendingAssets: () => number
  getAvailableAssets: () => Asset[]
  getAssetById: (id: string) => Asset | undefined
  getMaintenanceByAssetId: (assetId: string) => MaintenanceRecord[]
  getOverdueMaintenanceRecords: () => MaintenanceRecord[]
  getUpcomingMaintenanceRecords: () => MaintenanceRecord[]
  resetData: () => void
}

// Create the context
const AssetContext = createContext<AssetContextType | undefined>(undefined)

// Create the provider component
interface AssetProviderProps {
  children: ReactNode
}

export const AssetProvider: React.FC<AssetProviderProps> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const [assetsData, assignmentsData, transfersData, maintenanceData] = await Promise.all([
        unifiedDb.getAssets(),
        unifiedDb.getAssignments(),
        unifiedDb.getTransfers(),
        unifiedDb.getMaintenanceRecords(),
      ])

      setAssets(assetsData)
      setAssignments(assignmentsData)
      setTransfers(transfersData)
      setMaintenanceRecords(maintenanceData)

      console.log(`✅ Loaded data: ${assetsData.length} assets, ${assignmentsData.length} assignments`)
    } catch (error) {
      console.error("❌ Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Reset data to initial values
  const resetData = useCallback(() => {
    const initialData = resetToInitialData()
    setAssets(initialData.assets)
    setAssignments(initialData.assignments)
    setTransfers(initialData.transfers)
    setMaintenanceRecords(initialData.maintenanceRecords)
  }, [])

  // Helper function to create assignments from assets
  const createAssignmentsFromAssets = (assets: Asset[]): Assignment[] => {
    return assets
      .filter((asset) => asset.status === "In Use" && asset.assignedTo)
      .map((asset, index) => ({
        id: (10011 + index).toString(),
        assetId: asset.id,
        assetName: asset.name,
        assignedTo: asset.assignedTo || "",
        department: asset.department,
        assignedDate: asset.purchaseDate || new Date().toISOString().split("T")[0],
        dueDate: null,
        status: "Active" as const,
        notes: asset.notes || "",
      }))
  }

  // Helper functions for status mapping
  const mapDatabaseStatusToApp = (dbStatus: string): Asset["status"] => {
    switch (dbStatus) {
      case "active":
        return "In Use"
      case "inactive":
        return "In Storage"
      case "maintenance":
        return "In Maintenance"
      case "disposed":
        return "Pending Disposal"
      default:
        return "In Storage"
    }
  }

  const mapAppStatusToDatabase = (appStatus: Asset["status"]): string => {
    switch (appStatus) {
      case "In Use":
        return "active"
      case "In Storage":
        return "inactive"
      case "In Maintenance":
        return "maintenance"
      case "Pending Disposal":
        return "disposed"
      default:
        return "inactive"
    }
  }

  // Helper function to save to both localStorage and Supabase
  const saveAssetToSupabase = async (asset: Asset, operation: "insert" | "update" | "delete", originalId?: string) => {
    console.log("📁 Supabase not available, saving only to localStorage")
  }

  const addAsset = useCallback(async (asset: Omit<Asset, "id">) => {
    const newAsset = await unifiedDb.createAsset(asset)
    setAssets((prev) => [...prev, newAsset])
    console.log(`✅ Asset added: ${newAsset.name}`)
  }, [])

  const updateAsset = useCallback(
    async (id: string, updates: Partial<Asset>) => {
      setAssets((prevAssets) => {
        const updatedAssets = prevAssets.map((asset) => (asset.id === id ? { ...asset, ...updates } : asset))
        const updatedAsset = updatedAssets.find((asset) => asset.id === id)

        // Update related assignments
        setAssignments((prevAssignments) => {
          const updatedAssignments = prevAssignments.map((assignment) => {
            if (assignment.assetId === id) {
              return {
                ...assignment,
                assetName: updatedAsset?.name || assignment.assetName,
                assignedTo: updatedAsset?.assignedTo || assignment.assignedTo,
                department: updatedAsset?.department || assignment.department,
              }
            }
            return assignment
          })

          // Update related maintenance records
          setMaintenanceRecords((prevMaintenanceRecords) => {
            const updatedMaintenanceRecords = prevMaintenanceRecords.map((record) => {
              if (record.assetId === id) {
                return {
                  ...record,
                  assetName: updatedAsset?.name || record.assetName,
                }
              }
              return record
            })

            // Save to localStorage
            saveToLocalStorage(updatedAssets, updatedAssignments, transfers, updatedMaintenanceRecords)
            return updatedMaintenanceRecords
          })

          return updatedAssignments
        })

        return updatedAssets
      })

      console.log(`✅ Asset updated: ${id}`)
    },
    [transfers],
  )

  const deleteAsset = useCallback(
    async (id: string) => {
      const assetToDelete = assets.find((asset) => asset.id === id)

      setAssets((prevAssets) => {
        const updatedAssets = prevAssets.filter((asset) => asset.id !== id)

        setAssignments((prevAssignments) => {
          const updatedAssignments = prevAssignments.filter((assignment) => assignment.assetId !== id)

          setTransfers((prevTransfers) => {
            const updatedTransfers = prevTransfers.filter((transfer) => transfer.assetId !== id)

            setMaintenanceRecords((prevMaintenanceRecords) => {
              const updatedMaintenanceRecords = prevMaintenanceRecords.filter((record) => record.assetId !== id)

              // Save to localStorage
              saveToLocalStorage(updatedAssets, updatedAssignments, updatedTransfers, updatedMaintenanceRecords)
              return updatedMaintenanceRecords
            })

            return updatedTransfers
          })

          return updatedAssignments
        })

        return updatedAssets
      })

      // Delete from Supabase (async, won't block UI)
      if (assetToDelete) {
        await saveAssetToSupabase(assetToDelete, "delete")
      }

      console.log(`✅ Asset deleted: ${id}`)
    },
    [assets],
  )

  const addAssignment = useCallback(
    (assignment: Omit<Assignment, "id">) => {
      const newAssignment: Assignment = {
        id: IdGenerator.generateUniqueId(),
        ...assignment,
      }
      setAssignments((prevAssignments) => {
        const updatedAssignments = [...prevAssignments, newAssignment]
        saveToLocalStorage(assets, updatedAssignments, transfers, maintenanceRecords)
        return updatedAssignments
      })
      console.log(`✅ Assignment added: ${newAssignment.assetName} to ${newAssignment.assignedTo}`)
    },
    [assets, transfers, maintenanceRecords],
  )

  const updateAssignment = useCallback(
    (id: string, updates: Partial<Assignment>) => {
      setAssignments((prevAssignments) => {
        const updatedAssignments = prevAssignments.map((assignment) =>
          assignment.id === id ? { ...assignment, ...updates } : assignment,
        )
        saveToLocalStorage(assets, updatedAssignments, transfers, maintenanceRecords)
        return updatedAssignments
      })
      console.log(`✅ Assignment updated: ${id}`)
    },
    [assets, transfers, maintenanceRecords],
  )

  const deleteAssignment = useCallback(
    (id: string) => {
      setAssignments((prevAssignments) => {
        const updatedAssignments = prevAssignments.filter((assignment) => assignment.id !== id)
        saveToLocalStorage(assets, updatedAssignments, transfers, maintenanceRecords)
        return updatedAssignments
      })
      console.log(`✅ Assignment deleted: ${id}`)
    },
    [assets, transfers, maintenanceRecords],
  )

  const addTransfer = useCallback(
    (transfer: Omit<Transfer, "id">) => {
      const newTransfer: Transfer = {
        id: IdGenerator.generateUniqueId(),
        ...transfer,
      }
      setTransfers((prevTransfers) => {
        const updatedTransfers = [...prevTransfers, newTransfer]
        saveToLocalStorage(assets, assignments, updatedTransfers, maintenanceRecords)
        return updatedTransfers
      })
      console.log(`✅ Transfer added: ${newTransfer.assetName} from ${newTransfer.fromUser} to ${newTransfer.toUser}`)
    },
    [assets, assignments, maintenanceRecords],
  )

  const updateTransfer = useCallback(
    (id: string, updates: Partial<Transfer>) => {
      setTransfers((prevTransfers) => {
        const updatedTransfers = prevTransfers.map((transfer) =>
          transfer.id === id ? { ...transfer, ...updates } : transfer,
        )
        saveToLocalStorage(assets, assignments, updatedTransfers, maintenanceRecords)
        return updatedTransfers
      })
      console.log(`✅ Transfer updated: ${id}`)
    },
    [assets, assignments, maintenanceRecords],
  )

  const deleteTransfer = useCallback(
    (id: string) => {
      setTransfers((prevTransfers) => {
        const updatedTransfers = prevTransfers.filter((transfer) => transfer.id !== id)
        saveToLocalStorage(assets, assignments, updatedTransfers, maintenanceRecords)
        return updatedTransfers
      })
      console.log(`✅ Transfer deleted: ${id}`)
    },
    [assets, assignments, maintenanceRecords],
  )

  const addMaintenanceRecord = useCallback(
    (record: Omit<MaintenanceRecord, "id">) => {
      const newRecord: MaintenanceRecord = {
        id: IdGenerator.generateUniqueId(),
        ...record,
      }
      setMaintenanceRecords((prevRecords) => {
        const updatedRecords = [...prevRecords, newRecord]
        saveToLocalStorage(assets, assignments, transfers, updatedRecords)
        console.log(`✅ Maintenance record added: ${newRecord.assetName} - ${newRecord.maintenanceType}`)
        return updatedRecords
      })
    },
    [assets, assignments, transfers],
  )

  const updateMaintenanceRecord = useCallback(
    (id: string, updates: Partial<MaintenanceRecord>) => {
      console.log(`🔄 Updating maintenance record ${id}:`, updates)

      setMaintenanceRecords((prevRecords) => {
        const updatedRecords = prevRecords.map((record) => {
          if (record.id === id) {
            const updatedRecord = { ...record, ...updates }
            console.log(`✅ Updated record ${id}:`, updatedRecord)
            return updatedRecord
          }
          return record
        })

        // Save to localStorage immediately
        saveToLocalStorage(assets, assignments, transfers, updatedRecords)
        console.log(`💾 Saved updated maintenance records to localStorage`)

        return updatedRecords
      })
    },
    [assets, assignments, transfers],
  )

  const deleteMaintenanceRecord = useCallback(
    (id: string) => {
      setMaintenanceRecords((prevRecords) => {
        const updatedRecords = prevRecords.filter((record) => record.id !== id)
        saveToLocalStorage(assets, assignments, transfers, updatedRecords)
        return updatedRecords
      })
      console.log(`✅ Maintenance record deleted: ${id}`)
    },
    [assets, assignments, transfers],
  )

  const getMaintenanceByAssetId = useCallback(
    (assetId: string) => {
      return maintenanceRecords.filter((record) => record.assetId === assetId)
    },
    [maintenanceRecords],
  )

  const getOverdueMaintenanceRecords = useCallback(() => {
    const today = new Date()
    return maintenanceRecords.filter((record) => {
      if (record.status === "Completed" || record.status === "Cancelled") return false
      const scheduledDate = new Date(record.scheduledDate)
      return scheduledDate < today && record.status !== "Completed"
    })
  }, [maintenanceRecords])

  const getUpcomingMaintenanceRecords = useCallback(() => {
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    return maintenanceRecords.filter((record) => {
      if (record.status !== "Scheduled") return false
      const scheduledDate = new Date(record.scheduledDate)
      return scheduledDate >= today && scheduledDate <= thirtyDaysFromNow
    })
  }, [maintenanceRecords])

  // Analytics functions
  const getAssetsByStatus = useCallback(() => {
    const statusCounts: Record<string, number> = {
      "In Use": 0,
      "In Storage": 0,
      "In Maintenance": 0,
      "Pending Disposal": 0,
    }

    assets.forEach((asset) => {
      if (statusCounts[asset.status] !== undefined) {
        statusCounts[asset.status]++
      }
    })

    return statusCounts
  }, [assets])

  const getAssetsByDepartment = useCallback(() => {
    const departmentCounts: Record<string, number> = {}

    assets.forEach((asset) => {
      if (departmentCounts[asset.department]) {
        departmentCounts[asset.department]++
      } else {
        departmentCounts[asset.department] = 1
      }
    })

    return departmentCounts
  }, [assets])

  const getTotalAssets = useCallback(() => assets.length, [assets])

  const getActiveAssets = useCallback(() => assets.filter((asset) => asset.status === "In Use").length, [assets])

  const getStorageAssets = useCallback(() => assets.filter((asset) => asset.status === "In Storage").length, [assets])

  const getMaintenanceDueAssets = useCallback(
    () => assets.filter((asset) => asset.status === "In Maintenance").length,
    [assets],
  )

  const getDisposalPendingAssets = useCallback(
    () => assets.filter((asset) => asset.status === "Pending Disposal").length,
    [assets],
  )

  const getAvailableAssets = useCallback(() => {
    return assets.filter((asset) => {
      // Explicitly exclude disposal-related statuses
      if (asset.status === "Pending Disposal") {
        return false
      }

      // Include assets that are:
      // 1. In Storage
      // 2. Pending Assignment
      // 3. Have no assigned person (regardless of status, except disposal/maintenance)
      return (
        asset.status === "In Storage" ||
        asset.status === "Pending Assignment" ||
        (!asset.assignedTo && asset.status !== "In Maintenance" && asset.status !== "Pending Disposal")
      )
    })
  }, [assets])

  const getAssetById = useCallback(
    (id: string) => {
      return assets.find((asset) => asset.id === id)
    },
    [assets],
  )

  const value: AssetContextType = {
    assets,
    assignments,
    transfers,
    maintenanceRecords,
    loading,
    addAsset,
    updateAsset,
    deleteAsset,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    addTransfer,
    updateTransfer,
    deleteTransfer,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    getAssetsByStatus,
    getAssetsByDepartment,
    getTotalAssets,
    getActiveAssets,
    getStorageAssets,
    getMaintenanceDueAssets,
    getDisposalPendingAssets,
    getAvailableAssets,
    getAssetById,
    getMaintenanceByAssetId,
    getOverdueMaintenanceRecords,
    getUpcomingMaintenanceRecords,
    resetData,
  }

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>
}

// Create a custom hook to use the context
export const useAssets = () => {
  const context = useContext(AssetContext)
  if (!context) {
    throw new Error("useAssets must be used within an AssetProvider")
  }
  return context
}

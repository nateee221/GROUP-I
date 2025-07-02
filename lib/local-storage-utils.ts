import type { Asset, Assignment, Transfer, MaintenanceRecord } from "@/components/asset-provider"

const STORAGE_KEYS = {
  ASSETS: "asset-tracker-assets",
  ASSIGNMENTS: "asset-tracker-assignments",
  TRANSFERS: "asset-tracker-transfers",
  MAINTENANCE_RECORDS: "asset-tracker-maintenance-records",
}

// Initial data
const initialAssets: Asset[] = [
  {
    id: "10001",
    name: "Dell XPS 15 Laptop",
    category: "Computer Equipment",
    status: "In Use",
    department: "IT Department",
    assignedTo: "John Smith",
    purchaseDate: "2023-01-15",
    purchasePrice: 1299.99,
    serialNumber: "DXP15-2023-001",
    notes: "Primary development machine",
    location: "Office Building A, Floor 3",
  },
  {
    id: "10002",
    name: "HP LaserJet Pro Printer",
    category: "Office Equipment",
    status: "In Use",
    department: "Administration",
    assignedTo: "Sarah Johnson",
    purchaseDate: "2023-02-20",
    purchasePrice: 299.99,
    serialNumber: "HP-LJ-2023-002",
    notes: "Main office printer",
    location: "Office Building A, Floor 2",
  },
  {
    id: "10003",
    name: "Standing Desk",
    category: "Furniture",
    status: "In Storage",
    department: "Human Resources",
    assignedTo: "",
    purchaseDate: "2023-03-10",
    purchasePrice: 599.99,
    serialNumber: "SD-2023-003",
    notes: "Adjustable height desk",
    location: "Storage Room B",
  },
  {
    id: "10004",
    name: "Projector - Epson PowerLite",
    category: "Office Equipment",
    status: "In Maintenance",
    department: "Conference Room",
    assignedTo: "",
    purchaseDate: "2022-11-05",
    purchasePrice: 899.99,
    serialNumber: "EP-PL-2022-004",
    notes: "Conference room projector",
    location: "Conference Room A",
  },
  {
    id: "10005",
    name: "iPhone 14 Pro",
    category: "Mobile Devices",
    status: "In Use",
    department: "Sales",
    assignedTo: "Mike Wilson",
    purchaseDate: "2023-04-12",
    purchasePrice: 999.99,
    serialNumber: "IP14P-2023-005",
    notes: "Sales team mobile device",
    location: "Office Building A, Floor 1",
  },
  {
    id: "10006",
    name: "Conference Table",
    category: "Furniture",
    status: "In Use",
    department: "Conference Room",
    assignedTo: "",
    purchaseDate: "2022-08-15",
    purchasePrice: 1299.99,
    serialNumber: "CT-2022-006",
    notes: "12-person conference table",
    location: "Conference Room A",
  },
  {
    id: "10007",
    name: "Security Camera System",
    category: "Security Equipment",
    status: "In Use",
    department: "Security",
    assignedTo: "Security Team",
    purchaseDate: "2023-01-30",
    purchasePrice: 2499.99,
    serialNumber: "SCS-2023-007",
    notes: "Building surveillance system",
    location: "Multiple Locations",
  },
  {
    id: "10008",
    name: "Filing Cabinet",
    category: "Furniture",
    status: "In Use",
    department: "Administration",
    assignedTo: "",
    purchaseDate: "2022-12-01",
    purchasePrice: 199.99,
    serialNumber: "FC-2022-008",
    notes: "4-drawer filing cabinet",
    location: "Office Building A, Floor 2",
  },
  {
    id: "10009",
    name: "Shredder",
    category: "Office Equipment",
    status: "Pending Disposal",
    department: "Administration",
    assignedTo: "",
    purchaseDate: "2020-05-15",
    purchasePrice: 149.99,
    serialNumber: "SH-2020-009",
    notes: "End of life, needs disposal",
    location: "Storage Room C",
  },
  {
    id: "10010",
    name: "Water Dispenser",
    category: "Office Equipment",
    status: "In Maintenance",
    department: "Break Room",
    assignedTo: "",
    purchaseDate: "2022-09-20",
    purchasePrice: 299.99,
    serialNumber: "WD-2022-010",
    notes: "Break room water dispenser",
    location: "Break Room",
  },
]

const initialAssignments: Assignment[] = [
  {
    id: "10011",
    assetId: "10001",
    assetName: "Dell XPS 15 Laptop",
    assignedTo: "John Smith",
    department: "IT Department",
    assignedDate: "2023-01-15",
    dueDate: null,
    status: "Active",
    notes: "Primary development machine",
  },
  {
    id: "10012",
    assetId: "10002",
    assetName: "HP LaserJet Pro Printer",
    assignedTo: "Sarah Johnson",
    department: "Administration",
    assignedDate: "2023-02-20",
    dueDate: null,
    status: "Active",
    notes: "Main office printer",
  },
  {
    id: "10013",
    assetId: "10005",
    assetName: "iPhone 14 Pro",
    assignedTo: "Mike Wilson",
    department: "Sales",
    assignedDate: "2023-04-12",
    dueDate: null,
    status: "Active",
    notes: "Sales team mobile device",
  },
  {
    id: "10014",
    assetId: "10007",
    assetName: "Security Camera System",
    assignedTo: "Security Team",
    department: "Security",
    assignedDate: "2023-01-30",
    dueDate: null,
    status: "Active",
    notes: "Building surveillance system",
  },
]

const initialTransfers: Transfer[] = [
  {
    id: "10015",
    assetId: "10003",
    assetName: "Standing Desk",
    fromUser: "Previous Employee",
    toUser: "Storage",
    fromDepartment: "IT Department",
    toDepartment: "Human Resources",
    transferDate: "2023-03-10",
    approvedBy: "HR Manager",
    status: "Completed",
  },
]

const initialMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: "10016",
    assetId: "10001",
    assetName: "Dell XPS 15 Laptop",
    maintenanceType: "Preventive",
    status: "Scheduled",
    scheduledDate: "2023-06-15",
    assignedTo: "IT Support",
    description: "Regular system maintenance and updates",
    notes: "Quarterly maintenance check",
  },
  {
    id: "10017",
    assetId: "10004",
    assetName: "Projector - Epson PowerLite",
    maintenanceType: "Corrective",
    status: "In Progress",
    scheduledDate: "2023-05-10",
    assignedTo: "External Vendor",
    description: "Lamp replacement and calibration",
    notes: "Vendor scheduled for on-site service",
  },
  {
    id: "10018",
    assetId: "10010",
    assetName: "Water Dispenser",
    maintenanceType: "Preventive",
    status: "In Progress",
    scheduledDate: "2023-05-18",
    assignedTo: "Facilities Team",
    description: "Filter replacement and cleaning",
    notes: "Monthly maintenance routine",
  },
  {
    id: "10019",
    assetId: "10002",
    assetName: "HP LaserJet Pro Printer",
    maintenanceType: "Corrective",
    status: "Completed",
    scheduledDate: "2023-04-05",
    completedDate: "2023-04-05",
    assignedTo: "IT Support",
    description: "Paper jam repair and roller replacement",
    notes: "Issue resolved successfully",
  },
  {
    id: "10020",
    assetId: "10008",
    assetName: "Filing Cabinet",
    maintenanceType: "Preventive",
    status: "Completed",
    scheduledDate: "2023-03-20",
    completedDate: "2023-03-20",
    assignedTo: "Facilities Team",
    description: "Lock lubrication and drawer adjustment",
    notes: "Routine maintenance completed",
  },
  {
    id: "10021",
    assetId: "10001",
    assetName: "Dell XPS 15 Laptop",
    maintenanceType: "Corrective",
    status: "Completed",
    scheduledDate: "2023-02-10",
    completedDate: "2023-02-10",
    assignedTo: "IT Support",
    description: "Software troubleshooting and updates",
    notes: "Performance issues resolved",
  },
  {
    id: "10022",
    assetId: "10009",
    assetName: "Shredder",
    maintenanceType: "Preventive",
    status: "Overdue",
    scheduledDate: "2023-05-01",
    assignedTo: "Security Team",
    description: "Final inspection before disposal",
    notes: "Asset marked for disposal",
  },
]

export const saveToLocalStorage = (
  assets: Asset[],
  assignments: Assignment[],
  transfers: Transfer[],
  maintenanceRecords: MaintenanceRecord[],
) => {
  try {
    console.log("💾 Saving to localStorage:", {
      assets: assets.length,
      assignments: assignments.length,
      transfers: transfers.length,
      maintenanceRecords: maintenanceRecords.length,
    })

    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets))
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments))
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers))
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE_RECORDS, JSON.stringify(maintenanceRecords))

    console.log("✅ Successfully saved to localStorage")
  } catch (error) {
    console.error("❌ Error saving to localStorage:", error)
  }
}

export const loadFromLocalStorage = () => {
  try {
    console.log("📁 Loading from localStorage...")

    const assetsData = localStorage.getItem(STORAGE_KEYS.ASSETS)
    const assignmentsData = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)
    const transfersData = localStorage.getItem(STORAGE_KEYS.TRANSFERS)
    const maintenanceRecordsData = localStorage.getItem(STORAGE_KEYS.MAINTENANCE_RECORDS)

    const assets = assetsData ? JSON.parse(assetsData) : []
    const assignments = assignmentsData ? JSON.parse(assignmentsData) : []
    const transfers = transfersData ? JSON.parse(transfersData) : []
    const maintenanceRecords = maintenanceRecordsData ? JSON.parse(maintenanceRecordsData) : []

    console.log("📁 Loaded from localStorage:", {
      assets: assets.length,
      assignments: assignments.length,
      transfers: transfers.length,
      maintenanceRecords: maintenanceRecords.length,
    })

    return {
      assets,
      assignments,
      transfers,
      maintenanceRecords,
    }
  } catch (error) {
    console.error("❌ Error loading from localStorage:", error)
    return {
      assets: [],
      assignments: [],
      transfers: [],
      maintenanceRecords: [],
    }
  }
}

export const resetToInitialData = () => {
  console.log("🔄 Resetting to initial data...")

  const data = {
    assets: initialAssets,
    assignments: initialAssignments,
    transfers: initialTransfers,
    maintenanceRecords: initialMaintenanceRecords,
  }

  saveToLocalStorage(data.assets, data.assignments, data.transfers, data.maintenanceRecords)

  console.log("✅ Reset to initial data complete")
  return data
}

export const clearLocalStorage = () => {
  try {
    console.log("🗑️ Clearing localStorage...")

    localStorage.removeItem(STORAGE_KEYS.ASSETS)
    localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS)
    localStorage.removeItem(STORAGE_KEYS.TRANSFERS)
    localStorage.removeItem(STORAGE_KEYS.MAINTENANCE_RECORDS)

    console.log("✅ localStorage cleared")
  } catch (error) {
    console.error("❌ Error clearing localStorage:", error)
  }
}

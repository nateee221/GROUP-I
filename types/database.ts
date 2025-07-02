// Consolidated type definitions for the entire application

// User-related types
export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "department_head" | "staff"
  department: string
  status: "active" | "inactive"
  lastLogin?: string
  phone?: string
  jobTitle?: string
  createdAt?: string
  updatedAt?: string
}

export interface SystemUser extends User {
  password: string
}

// Asset-related types
export interface Asset {
  id: string
  name: string
  description?: string
  category: string
  serialNumber?: string
  model?: string
  manufacturer?: string
  purchaseDate?: string
  purchasePrice?: number
  currentValue?: number
  condition?: "excellent" | "good" | "fair" | "poor" | "damaged"
  status:
    | "active"
    | "inactive"
    | "maintenance"
    | "disposed"
    | "In Use"
    | "In Storage"
    | "In Maintenance"
    | "Pending Disposal"
  location?: string
  department: string
  assignedTo?: string
  warrantyExpiry?: string
  lastMaintenanceDate?: string
  nextMaintenanceDate?: string
  imageUrl?: string
  tags?: string[]
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface Assignment {
  id: string
  assetId: string
  assetName: string
  assignedTo: string
  department: string
  assignedDate: string
  dueDate: string | null
  status: "active" | "returned" | "lost" | "damaged" | "Active" | "Pending" | "In Maintenance" | "Overdue"
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface Transfer {
  id: string
  assetId: string
  assetName: string
  fromUser: string
  toUser: string
  fromDepartment: string
  toDepartment: string
  transferDate: string
  approvedBy: string
  status: "Completed" | "Pending" | "Cancelled"
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface MaintenanceRecord {
  id: string
  assetId: string
  assetName: string
  performedBy?: string
  maintenanceType: "Preventive" | "Corrective" | "Inspection" | "Emergency"
  description?: string
  cost?: number | null
  scheduledDate: string
  completedDate?: string | null
  status:
    | "scheduled"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "Scheduled"
    | "In Progress"
    | "Completed"
    | "Overdue"
    | "Cancelled"
  assignedTo: string
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface Department {
  id: string
  name: string
  description?: string
  headUserId?: string
  createdAt?: string
  updatedAt?: string
}

// Audit-related types
export interface AuditLog {
  id: string
  userId: string
  userName?: string
  action: string
  entityType: string
  entityId: string
  details?: string
  timestamp: string
  ipAddress?: string
}

// Centralized validation utilities
import type { Asset, Assignment, Transfer, SystemUser, MaintenanceRecord } from "@/types/database"

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateAsset(asset: Partial<Asset>): ValidationResult {
  const errors: string[] = []

  if (!asset.name?.trim()) {
    errors.push("Asset name is required")
  }

  if (!asset.category?.trim()) {
    errors.push("Category is required")
  }

  if (!asset.department?.trim()) {
    errors.push("Department is required")
  }

  if (asset.purchasePrice && asset.purchasePrice < 0) {
    errors.push("Purchase price cannot be negative")
  }

  if (asset.currentValue && asset.currentValue < 0) {
    errors.push("Current value cannot be negative")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateUser(user: Partial<SystemUser>): ValidationResult {
  const errors: string[] = []

  if (!user.name?.trim()) {
    errors.push("Name is required")
  }

  if (!user.email?.trim()) {
    errors.push("Email is required")
  } else if (!isValidEmail(user.email)) {
    errors.push("Invalid email format")
  }

  if (!user.role) {
    errors.push("Role is required")
  }

  if (!user.department?.trim()) {
    errors.push("Department is required")
  }

  if (user.password && user.password.length < 6) {
    errors.push("Password must be at least 6 characters")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateAssignment(assignment: Partial<Assignment>): ValidationResult {
  const errors: string[] = []

  if (!assignment.assetId?.trim()) {
    errors.push("Asset ID is required")
  }

  if (!assignment.assignedTo?.trim()) {
    errors.push("Assigned to is required")
  }

  if (!assignment.department?.trim()) {
    errors.push("Department is required")
  }

  if (!assignment.assignedDate) {
    errors.push("Assigned date is required")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateTransfer(transfer: Partial<Transfer>): ValidationResult {
  const errors: string[] = []

  if (!transfer.assetId?.trim()) {
    errors.push("Asset ID is required")
  }

  if (!transfer.fromUser?.trim()) {
    errors.push("From user is required")
  }

  if (!transfer.toUser?.trim()) {
    errors.push("To user is required")
  }

  if (!transfer.fromDepartment?.trim()) {
    errors.push("From department is required")
  }

  if (!transfer.toDepartment?.trim()) {
    errors.push("To department is required")
  }

  if (!transfer.transferDate) {
    errors.push("Transfer date is required")
  }

  if (!transfer.approvedBy?.trim()) {
    errors.push("Approved by is required")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateMaintenanceRecord(record: Partial<MaintenanceRecord>): ValidationResult {
  const errors: string[] = []

  if (!record.assetId?.trim()) {
    errors.push("Asset ID is required")
  }

  if (!record.maintenanceType) {
    errors.push("Maintenance type is required")
  }

  if (!record.scheduledDate) {
    errors.push("Scheduled date is required")
  }

  if (!record.assignedTo?.trim()) {
    errors.push("Assigned to is required")
  }

  if (record.cost && record.cost < 0) {
    errors.push("Cost cannot be negative")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Sanitization utilities
export function sanitizeString(input: string | undefined): string {
  return input?.trim().replace(/[<>]/g, "") || ""
}

export function sanitizeNumber(input: number | string | undefined): number | undefined {
  if (typeof input === "number") return input
  if (typeof input === "string") {
    const parsed = Number.parseFloat(input)
    return isNaN(parsed) ? undefined : parsed
  }
  return undefined
}

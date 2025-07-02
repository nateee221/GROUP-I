"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Department {
  id: string
  name: string
  description: string
  head: string
  location: string
  employeeCount: number
  status: "active" | "inactive"
  createdAt: string
}

interface DepartmentContextType {
  departments: Department[]
  addDepartment: (department: Omit<Department, "id" | "createdAt">) => void
  updateDepartment: (id: string, department: Partial<Department>) => void
  deleteDepartment: (id: string) => void
}

const mockDepartments: Department[] = [
  {
    id: "D001",
    name: "IT Department",
    description: "Information Technology and Systems Management",
    head: "John Smith",
    location: "Building A, Floor 3",
    employeeCount: 25,
    status: "active",
    createdAt: "2023-01-15",
  },
  {
    id: "D002",
    name: "Finance",
    description: "Financial Management and Accounting",
    head: "Sarah Johnson",
    location: "Building B, Floor 2",
    employeeCount: 15,
    status: "active",
    createdAt: "2023-01-15",
  },
  {
    id: "D003",
    name: "HR",
    description: "Human Resources and Personnel Management",
    head: "Michael Brown",
    location: "Building A, Floor 1",
    employeeCount: 12,
    status: "active",
    createdAt: "2023-01-15",
  },
  {
    id: "D004",
    name: "Admin",
    description: "Administrative Services and Support",
    head: "Lisa Davis",
    location: "Building B, Floor 1",
    employeeCount: 18,
    status: "active",
    createdAt: "2023-01-15",
  },
  {
    id: "D005",
    name: "Executive",
    description: "Executive Management and Leadership",
    head: "Robert Wilson",
    location: "Building A, Floor 4",
    employeeCount: 8,
    status: "active",
    createdAt: "2023-01-15",
  },
  {
    id: "D006",
    name: "Facilities",
    description: "Facilities Management and Maintenance",
    head: "Jennifer Garcia",
    location: "Building C, Floor 1",
    employeeCount: 22,
    status: "active",
    createdAt: "2023-01-15",
  },
  {
    id: "D007",
    name: "Security",
    description: "Security and Safety Management",
    head: "David Martinez",
    location: "Building A, Ground Floor",
    employeeCount: 16,
    status: "active",
    createdAt: "2023-01-15",
  },
]

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined)

export function DepartmentProvider({ children }: { children: React.ReactNode }) {
  const [departments, setDepartments] = useState<Department[]>([])

  useEffect(() => {
    const savedDepartments = localStorage.getItem("departments")
    if (savedDepartments) {
      setDepartments(JSON.parse(savedDepartments))
    } else {
      setDepartments(mockDepartments)
      localStorage.setItem("departments", JSON.stringify(mockDepartments))
    }
  }, [])

  const addDepartment = (departmentData: Omit<Department, "id" | "createdAt">) => {
    const newDepartment: Department = {
      ...departmentData,
      id: `D${String(departments.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString().split("T")[0],
    }

    const updatedDepartments = [...departments, newDepartment]
    setDepartments(updatedDepartments)
    localStorage.setItem("departments", JSON.stringify(updatedDepartments))
  }

  const updateDepartment = (id: string, departmentData: Partial<Department>) => {
    const updatedDepartments = departments.map((dept) => (dept.id === id ? { ...dept, ...departmentData } : dept))
    setDepartments(updatedDepartments)
    localStorage.setItem("departments", JSON.stringify(updatedDepartments))
  }

  const deleteDepartment = (id: string) => {
    const updatedDepartments = departments.filter((dept) => dept.id !== id)
    setDepartments(updatedDepartments)
    localStorage.setItem("departments", JSON.stringify(updatedDepartments))
  }

  return (
    <DepartmentContext.Provider value={{ departments, addDepartment, updateDepartment, deleteDepartment }}>
      {children}
    </DepartmentContext.Provider>
  )
}

export function useDepartments() {
  const context = useContext(DepartmentContext)
  if (context === undefined) {
    throw new Error("useDepartments must be used within a DepartmentProvider")
  }
  return context
}

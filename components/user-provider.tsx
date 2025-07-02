"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext, type ReactNode } from "react"
import type { SystemUser } from "@/types/database"
import { unifiedDb } from "@/lib/unified-database"

// Define the context type
interface UserContextType {
  users: SystemUser[]
  addUser: (user: Omit<SystemUser, "id" | "lastLogin">) => Promise<void>
  updateUser: (id: string, updates: Partial<SystemUser>) => void
  deleteUser: (id: string) => Promise<boolean>
  refreshUsers: () => Promise<void>
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined)

// Create a provider component
interface UserProviderProps {
  children: ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<SystemUser[]>([])

  // Function to refresh users from the "database"
  const refreshUsers = async () => {
    try {
      const fetchedUsers = await unifiedDb.getUsers()
      setUsers(fetchedUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  // Load users on component mount
  useEffect(() => {
    refreshUsers()
  }, [])

  const addUser = async (user: Omit<SystemUser, "id" | "lastLogin">) => {
    try {
      await unifiedDb.createUser(user)
      await refreshUsers()
    } catch (error) {
      console.error("Error adding user:", error)
      throw error
    }
  }

  const updateUser = async (id: string, updates: Partial<SystemUser>) => {
    try {
      const success = await unifiedDb.updateUser(id, updates)
      if (success) {
        await refreshUsers() // Refresh the list from the database
      } else {
        console.error("User not found for update")
      }
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  const deleteUser = async (id: string) => {
    try {
      const success = await unifiedDb.deleteUser(id)
      if (success) {
        await refreshUsers() // Refresh the list from the database
        return true
      }
      return false
    } catch (error) {
      console.error("Error deleting user:", error)
      return false
    }
  }

  const value = {
    users,
    addUser,
    updateUser,
    deleteUser,
    refreshUsers,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

// Create a custom hook to use the context
export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

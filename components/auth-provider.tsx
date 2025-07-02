"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { unifiedDb } from "@/lib/unified-database"
import { auditLogger } from "@/lib/audit-logger"

// Define user types
export type UserRole = "admin" | "department_head" | "staff"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  jobTitle?: string
  department?: string
  phone?: string
}

// Auth context type
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  updateUserProfile: (updatedUser: Partial<User>) => void
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const db = unifiedDb

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        // Initialize audit logger with restored user
        auditLogger.setCurrentUser(parsedUser)
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("user")
      }
    }
    setLoading(false)

    // Redirect to login if not authenticated and not already on login page
    if (!storedUser && pathname !== "/login" && pathname !== "/forgot-password") {
      router.push("/login")
    }
  }, [pathname, router])

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      console.log("Attempting login for:", email)

      // Use the database to verify credentials
      const foundUser = await db.verifyUserCredentials(email, password)

      console.log("Login result:", foundUser ? "Success" : "Failed")

      if (foundUser) {
        const userWithoutPassword = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          department: foundUser.department,
          jobTitle: foundUser.jobTitle,
          phone: foundUser.phone,
        }

        setUser(userWithoutPassword)

        // Clear any previous audit logger state and set the new user
        auditLogger.setCurrentUser(userWithoutPassword)

        localStorage.setItem("user", JSON.stringify(userWithoutPassword))

        // Initialize audit logger and log successful login
        auditLogger.setCurrentUser(userWithoutPassword)
        await auditLogger.logUserAction(
          "login",
          `User ${userWithoutPassword.name} successfully logged into the system`,
          {
            entityType: "auth",
            severity: "low",
            category: "login",
          },
        )

        toast({
          title: "Login successful",
          description: `Welcome back, ${userWithoutPassword.name}!`,
        })

        router.push("/dashboard")
      } else {
        // Log failed login attempt
        await auditLogger.logSystemAction("failed_login", `Failed login attempt for email: ${email}`, {
          entityType: "auth",
          severity: "high",
          category: "login",
        })

        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password",
        })
      }
    } catch (error) {
      console.error("Login error:", error)

      // Log login error
      await auditLogger.logSystemAction("login_error", `Login error occurred for email: ${email}`, {
        entityType: "auth",
        severity: "high",
        category: "login",
      })

      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An error occurred during login",
      })
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    // Clear the audit logger user
    auditLogger.setCurrentUser(null)

    if (user) {
      // Log logout action
      await auditLogger.logUserAction("logout", `User ${user.name} logged out of the system`, {
        entityType: "auth",
        severity: "low",
        category: "logout",
      })
    }

    setUser(null)
    localStorage.removeItem("user")
    router.push("/login")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  // Update user profile
  const updateUserProfile = async (updatedUser: Partial<User>) => {
    if (user) {
      const oldValues = { ...user }
      const newUser = { ...user, ...updatedUser }
      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser))

      // Log profile update
      await auditLogger.logEntityChange(
        "update_profile",
        "user",
        user.id,
        user.name,
        oldValues,
        newUser,
        `User ${user.name} updated their profile`,
      )

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      })
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUserProfile }}>{children}</AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

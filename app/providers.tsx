"use client"

import type React from "react"
import { useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import { AuthProvider } from "@/components/auth-provider"
import { UserProvider } from "@/components/user-provider"
import { AssetProvider } from "@/components/asset-provider"
import { DepartmentProvider } from "@/components/department-provider"
import { AccountRequestProvider } from "@/components/account-request-provider"

export function ConsoleProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Log some initial messages when the app starts
    console.log("Application started")
    console.info("Environment:", process.env.NODE_ENV)

    // Generate some test messages
    setTimeout(() => {
      console.log("Assets loaded successfully")
    }, 1000)

    setTimeout(() => {
      console.warn("Session will expire in 30 minutes")
    }, 2000)

    return () => {
      // Clean up if needed
    }
  }, [])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <AuthProvider>
          <UserProvider>
            <AssetProvider>
              <DepartmentProvider>
                <AccountRequestProvider>
                  <ConsoleProvider>{children}</ConsoleProvider>
                </AccountRequestProvider>
              </DepartmentProvider>
            </AssetProvider>
          </UserProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

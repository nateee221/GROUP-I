"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { AccountRequest } from "@/types/account-request"
import { accountRequestService } from "@/lib/account-request-service"

interface AccountRequestContextType {
  requests: AccountRequest[]
  pendingCount: number
  refreshRequests: () => Promise<void>
  approveRequest: (id: string, reviewedBy: string, reviewNotes?: string) => Promise<boolean>
  rejectRequest: (id: string, reviewedBy: string, reviewNotes?: string) => Promise<boolean>
  deleteRequest: (id: string) => Promise<boolean>
  isLoading: boolean
}

const AccountRequestContext = createContext<AccountRequestContextType | undefined>(undefined)

interface AccountRequestProviderProps {
  children: ReactNode
}

export const AccountRequestProvider: React.FC<AccountRequestProviderProps> = ({ children }) => {
  const [requests, setRequests] = useState<AccountRequest[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const refreshRequests = async () => {
    try {
      setIsLoading(true)
      const fetchedRequests = await accountRequestService.getAccountRequests()
      setRequests(fetchedRequests)

      const pending = await accountRequestService.getPendingRequestsCount()
      setPendingCount(pending)
    } catch (error) {
      console.error("Error fetching account requests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshRequests()

    // Set up an interval to refresh requests periodically (reduced frequency)
    const interval = setInterval(refreshRequests, 60000) // Refresh every 60 seconds instead of 30

    return () => clearInterval(interval)
  }, [])

  const approveRequest = async (id: string, reviewedBy: string, reviewNotes?: string) => {
    try {
      const success = await accountRequestService.approveAccountRequest(id, reviewedBy, reviewNotes)
      if (success) {
        await refreshRequests()
      }
      return success
    } catch (error) {
      console.error("Error approving request:", error)
      return false
    }
  }

  const rejectRequest = async (id: string, reviewedBy: string, reviewNotes?: string) => {
    try {
      const success = await accountRequestService.rejectAccountRequest(id, reviewedBy, reviewNotes)
      if (success) {
        await refreshRequests()
      }
      return success
    } catch (error) {
      console.error("Error rejecting request:", error)
      return false
    }
  }

  const deleteRequest = async (id: string) => {
    try {
      const success = await accountRequestService.deleteAccountRequest(id)
      if (success) {
        await refreshRequests()
      }
      return success
    } catch (error) {
      console.error("Error deleting request:", error)
      return false
    }
  }

  const value = {
    requests,
    pendingCount,
    refreshRequests,
    approveRequest,
    rejectRequest,
    deleteRequest,
    isLoading,
  }

  return <AccountRequestContext.Provider value={value}>{children}</AccountRequestContext.Provider>
}

export const useAccountRequests = () => {
  const context = useContext(AccountRequestContext)
  if (context === undefined) {
    // Return default values instead of throwing error to prevent crashes
    console.warn("useAccountRequests called outside of AccountRequestProvider, returning defaults")
    return {
      requests: [],
      pendingCount: 0,
      refreshRequests: async () => {},
      approveRequest: async () => false,
      rejectRequest: async () => false,
      deleteRequest: async () => false,
      isLoading: false,
    }
  }
  return context
}

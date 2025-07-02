import { createClient } from "@supabase/supabase-js"
import type { AccountRequest } from "@/types/account-request"

class AccountRequestService {
  private supabase: any
  private isSupabaseAvailable = false

  constructor() {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      console.log("🔧 AccountRequestService: Initializing...")
      console.log("🔧 Supabase URL:", supabaseUrl ? "✅ Present" : "❌ Missing")
      console.log("🔧 Supabase Key:", supabaseAnonKey ? "✅ Present" : "❌ Missing")

      if (supabaseUrl && supabaseAnonKey) {
        this.supabase = createClient(supabaseUrl, supabaseAnonKey)
        this.isSupabaseAvailable = true
        console.log("✅ AccountRequestService: Supabase client initialized successfully")
      } else {
        console.log("⚠️ AccountRequestService: Supabase credentials missing, using fallback mode")
        this.isSupabaseAvailable = false
        this.supabase = this.createMockSupabase()
      }
    } catch (error) {
      console.error("❌ AccountRequestService: Supabase initialization failed:", error)
      this.isSupabaseAvailable = false
      this.supabase = this.createMockSupabase()
    }
  }

  private createMockSupabase() {
    const mockData: AccountRequest[] = [
      {
        id: "req_001",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@company.com",
        department: "IT Department",
        jobTitle: "Software Developer",
        reason: "Need access to manage development assets and track project equipment.",
        requestDate: new Date().toISOString(),
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "req_002",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@company.com",
        department: "Finance Department",
        jobTitle: "Financial Analyst",
        reason: "Require access to track financial assets and generate cost reports.",
        requestDate: new Date().toISOString(),
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    return {
      from: (table: string) => ({
        select: (columns?: string) => ({
          eq: (column: string, value: any) => ({
            single: () =>
              Promise.resolve({
                data: mockData.find((item) => item[column as keyof AccountRequest] === value) || null,
                error: null,
              }),
          }),
          order: (column: string, options?: any) => Promise.resolve({ data: mockData, error: null }),
          limit: (count: number) => Promise.resolve({ data: mockData.slice(0, count), error: null }),
        }),
        insert: (values: any) => ({
          select: () => ({
            single: () => {
              const newItem = {
                ...values,
                id: `req_${Date.now()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
              mockData.push(newItem)
              return Promise.resolve({ data: newItem, error: null })
            },
          }),
        }),
        update: (values: any) => ({
          eq: (column: string, value: any) => {
            const index = mockData.findIndex((item) => item[column as keyof AccountRequest] === value)
            if (index !== -1) {
              mockData[index] = { ...mockData[index], ...values, updatedAt: new Date().toISOString() }
            }
            return Promise.resolve({ error: null })
          },
        }),
        delete: () => ({
          eq: (column: string, value: any) => {
            const index = mockData.findIndex((item) => item[column as keyof AccountRequest] === value)
            if (index !== -1) {
              mockData.splice(index, 1)
            }
            return Promise.resolve({ error: null })
          },
        }),
      }),
    }
  }

  async getAccountRequests(): Promise<AccountRequest[]> {
    try {
      console.log("🔍 AccountRequestService: Fetching account requests...")

      const { data, error } = await this.supabase
        .from("account_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Supabase error:", error)
        if (this.isSupabaseAvailable) {
          console.log("🔄 Falling back to mock data due to error")
        }
        // Return mock data on error
        const fallbackData = await this.supabase
          .from("account_requests")
          .select("*")
          .order("createdAt", { ascending: false })
        return fallbackData.data || []
      }

      const requests = data || []
      console.log(`✅ AccountRequestService: Found ${requests.length} account requests`)
      return requests.map(this.normalizeAccountRequest)
    } catch (error) {
      console.error("❌ Error in getAccountRequests:", error)
      // Return mock data on error
      const fallbackData = await this.supabase
        .from("account_requests")
        .select("*")
        .order("createdAt", { ascending: false })
      return fallbackData.data || []
    }
  }

  async getPendingRequestsCount(): Promise<number> {
    try {
      const requests = await this.getAccountRequests()
      const pendingCount = requests.filter((req) => req.status === "pending").length
      console.log(`📊 AccountRequestService: ${pendingCount} pending requests`)
      return pendingCount
    } catch (error) {
      console.error("❌ Error getting pending requests count:", error)
      return 0
    }
  }

  async getAccountRequestById(id: string): Promise<AccountRequest | null> {
    try {
      console.log(`🔍 AccountRequestService: Fetching request ${id}`)

      const { data, error } = await this.supabase.from("account_requests").select("*").eq("id", id).single()

      if (error) {
        console.error("❌ Error fetching account request:", error)
        return null
      }

      console.log(`✅ AccountRequestService: Found request ${id}`)
      return data ? this.normalizeAccountRequest(data) : null
    } catch (error) {
      console.error("❌ Error in getAccountRequestById:", error)
      return null
    }
  }

  async createAccountRequest(
    requestData: Omit<AccountRequest, "id" | "createdAt" | "updatedAt">,
  ): Promise<AccountRequest> {
    try {
      console.log("➕ AccountRequestService: Creating new account request")

      const newRequest = {
        ...requestData,
        request_date: requestData.requestDate || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await this.supabase.from("account_requests").insert(newRequest).select().single()

      if (error) {
        console.error("❌ Error creating account request:", error)
        throw new Error(`Failed to create account request: ${error.message}`)
      }

      console.log(`✅ AccountRequestService: Created request ${data.id}`)
      return this.normalizeAccountRequest(data)
    } catch (error) {
      console.error("❌ Error in createAccountRequest:", error)
      throw error
    }
  }

  async updateAccountRequest(id: string, updates: Partial<AccountRequest>): Promise<boolean> {
    try {
      console.log(`🔄 AccountRequestService: Updating request ${id}`)

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      }

      const { error } = await this.supabase.from("account_requests").update(updateData).eq("id", id)

      if (error) {
        console.error("❌ Error updating account request:", error)
        return false
      }

      console.log(`✅ AccountRequestService: Updated request ${id}`)
      return true
    } catch (error) {
      console.error("❌ Error in updateAccountRequest:", error)
      return false
    }
  }

  async approveAccountRequest(id: string, reviewedBy: string, reviewNotes?: string): Promise<boolean> {
    try {
      console.log(`✅ AccountRequestService: Approving request ${id}`)

      return await this.updateAccountRequest(id, {
        status: "approved",
        reviewedBy: reviewedBy,
        reviewedDate: new Date().toISOString(),
        reviewNotes: reviewNotes,
      })
    } catch (error) {
      console.error("❌ Error approving account request:", error)
      return false
    }
  }

  async rejectAccountRequest(id: string, reviewedBy: string, reviewNotes?: string): Promise<boolean> {
    try {
      console.log(`❌ AccountRequestService: Rejecting request ${id}`)

      return await this.updateAccountRequest(id, {
        status: "rejected",
        reviewedBy: reviewedBy,
        reviewedDate: new Date().toISOString(),
        reviewNotes: reviewNotes,
      })
    } catch (error) {
      console.error("❌ Error rejecting account request:", error)
      return false
    }
  }

  async deleteAccountRequest(id: string): Promise<boolean> {
    try {
      console.log(`🗑️ AccountRequestService: Deleting request ${id}`)

      const { error } = await this.supabase.from("account_requests").delete().eq("id", id)

      if (error) {
        console.error("❌ Error deleting account request:", error)
        return false
      }

      console.log(`✅ AccountRequestService: Deleted request ${id}`)
      return true
    } catch (error) {
      console.error("❌ Error in deleteAccountRequest:", error)
      return false
    }
  }

  private normalizeAccountRequest(data: any): AccountRequest {
    return {
      id: data.id,
      firstName: data.first_name || data.firstName,
      lastName: data.last_name || data.lastName,
      email: data.email,
      department: data.department,
      jobTitle: data.job_title || data.jobTitle,
      reason: data.reason,
      requestDate: data.request_date || data.requestDate,
      status: data.status,
      reviewedBy: data.reviewed_by || data.reviewedBy,
      reviewedDate: data.reviewed_date || data.reviewedDate,
      reviewNotes: data.review_notes || data.reviewNotes,
      createdAt: data.created_at || data.createdAt,
      updatedAt: data.updated_at || data.updatedAt,
    }
  }
}

// Create and export the service instance
export const accountRequestService = new AccountRequestService()

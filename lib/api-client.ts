// API client utilities for frontend
import type { Asset, Assignment, Transfer, SystemUser } from "@/types/database"

type ApiResponse<T> = {
  data?: T
  error?: string
}

export class ApiClient {
  private baseUrl: string
  private token: string | null

  constructor() {
    this.baseUrl = "/api"
    this.token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
      }

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })

      const result = await response.json()

      if (!response.ok) {
        return { error: result.error || "Request failed" }
      }

      return { data: result }
    } catch (error) {
      return { error: "Network error" }
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ user: SystemUser; token: string }>> {
    const result = await this.request<{ user: SystemUser; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (result.data?.token) {
      this.token = result.data.token
      localStorage.setItem("authToken", result.data.token)
    }

    return result
  }

  logout(): void {
    this.token = null
    localStorage.removeItem("authToken")
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    })
  }

  async verifyResetToken(token: string): Promise<ApiResponse<{ valid: boolean }>> {
    return this.request("/auth/verify-reset-token", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
  }

  // Generic resource methods
  async getResources<T>(resource: string, filters?: Record<string, string>): Promise<ApiResponse<T[]>> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }

    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request<T[]>(`/${resource}${query}`)
  }

  async getResource<T>(resource: string, id: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/${resource}/${id}`)
  }

  async createResource<T>(resource: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(`/${resource}`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateResource<T>(resource: string, id: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(`/${resource}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteResource(resource: string, id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/${resource}/${id}`, {
      method: "DELETE",
    })
  }

  // Assets
  async getAssets(filters?: { department?: string; status?: string; category?: string }): Promise<
    ApiResponse<Asset[]>
  > {
    return this.getResources<Asset>("assets", filters)
  }

  async getAsset(id: string): Promise<ApiResponse<Asset>> {
    return this.getResource<Asset>("assets", id)
  }

  async createAsset(asset: Partial<Asset>): Promise<ApiResponse<Asset>> {
    return this.createResource<Asset>("assets", asset)
  }

  async updateAsset(id: string, updates: Partial<Asset>): Promise<ApiResponse<Asset>> {
    return this.updateResource<Asset>("assets", id, updates)
  }

  async deleteAsset(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.deleteResource("assets", id)
  }

  // Assignments
  async getAssignments(filters?: { department?: string; status?: string }): Promise<ApiResponse<Assignment[]>> {
    return this.getResources<Assignment>("assignments", filters)
  }

  async createAssignment(assignment: Partial<Assignment>): Promise<ApiResponse<Assignment>> {
    return this.createResource<Assignment>("assignments", assignment)
  }

  async updateAssignment(id: string, updates: Partial<Assignment>): Promise<ApiResponse<Assignment>> {
    return this.updateResource<Assignment>("assignments", id, updates)
  }

  // Transfers
  async getTransfers(filters?: { department?: string; status?: string }): Promise<ApiResponse<Transfer[]>> {
    return this.getResources<Transfer>("transfers", filters)
  }

  async createTransfer(transfer: Partial<Transfer>): Promise<ApiResponse<Transfer>> {
    return this.createResource<Transfer>("transfers", transfer)
  }

  // Users
  async getUsers(): Promise<ApiResponse<SystemUser[]>> {
    return this.getResources<SystemUser>("users")
  }

  async getUser(id: string): Promise<ApiResponse<SystemUser>> {
    return this.getResource<SystemUser>("users", id)
  }

  async createUser(user: Partial<SystemUser>): Promise<ApiResponse<SystemUser>> {
    return this.createResource<SystemUser>("users", user)
  }

  async updateUser(id: string, updates: Partial<SystemUser>): Promise<ApiResponse<SystemUser>> {
    return this.updateResource<SystemUser>("users", id, updates)
  }

  async deleteUser(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.deleteResource("users", id)
  }

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request("/dashboard/stats")
  }
}

export const apiClient = new ApiClient()

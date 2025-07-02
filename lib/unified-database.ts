// Unified database service that handles both localStorage and Supabase
import { createClient } from "@supabase/supabase-js"
import type { Asset, Assignment, Transfer, SystemUser, MaintenanceRecord } from "@/types/database"

class UnifiedDatabase {
  private static instance: UnifiedDatabase
  private supabase: any
  private localStorageKey = "asset_tracking_data"
  private isSupabaseAvailable = false

  constructor() {
    this.initializeSupabase()
    this.initializeLocalStorage()
  }

  private initializeSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey)
        this.isSupabaseAvailable = true
        console.log("✅ Supabase initialized successfully")
      } catch (error) {
        console.log("⚠️ Supabase initialization failed, using localStorage fallback")
        this.isSupabaseAvailable = false
        this.createMockSupabase()
      }
    } else {
      console.log("ℹ️ Supabase credentials not found, using localStorage fallback")
      this.isSupabaseAvailable = false
      this.createMockSupabase()
    }
  }

  private createMockSupabase() {
    this.supabase = {
      from: (table: string) => ({
        select: (columns?: string) => ({
          eq: (column: string, value: any) => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
          data: [],
          error: null,
        }),
        insert: (data: any) => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
        update: (data: any) => ({
          eq: (column: string, value: any) => ({
            select: () => ({
              single: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
        }),
        delete: () => ({
          eq: (column: string, value: any) => Promise.resolve({ error: null }),
        }),
      }),
    }
  }

  static getInstance(): UnifiedDatabase {
    if (!UnifiedDatabase.instance) {
      UnifiedDatabase.instance = new UnifiedDatabase()
    }
    return UnifiedDatabase.instance
  }

  private initializeLocalStorage() {
    if (typeof window === "undefined") return

    const defaultData = {
      users: this.getDefaultUsers(),
      assets: this.getDefaultAssets(),
      assignments: this.getDefaultAssignments(),
      transfers: this.getDefaultTransfers(),
      maintenanceRecords: this.getDefaultMaintenanceRecords(),
    }

    const existing = this.getLocalData()
    if (!existing || Object.keys(existing).length === 0) {
      this.setLocalData(defaultData)
    }
  }

  private getLocalData(): any {
    if (typeof window === "undefined") return {}
    try {
      const data = localStorage.getItem(this.localStorageKey)
      return data ? JSON.parse(data) : {}
    } catch {
      return {}
    }
  }

  private setLocalData(data: any): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(data))
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }

  private updateLocalData(key: string, value: any): void {
    const data = this.getLocalData()
    data[key] = value
    this.setLocalData(data)
  }

  // Authentication method - ADDED
  async verifyUserCredentials(email: string, password: string): Promise<SystemUser | null> {
    console.log("🔐 Verifying user credentials for:", email)

    if (this.isSupabaseAvailable) {
      try {
        console.log("🔐 Using Supabase for authentication")
        const { data, error } = await this.supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .eq("password", password)
          .single()

        if (error) {
          console.log("🔐 Supabase auth error, falling back to localStorage:", error.message)
          return this.verifyUserCredentialsLocal(email, password)
        }

        if (data) {
          console.log("🔐 Supabase authentication successful")
          return {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            department: data.department,
            jobTitle: data.job_title || data.jobTitle,
            phone: data.phone,
            status: data.status,
            lastLogin: data.last_login || data.lastLogin,
            password: data.password,
          }
        }

        return null
      } catch (error) {
        console.log("🔐 Supabase auth error, falling back to localStorage:", error)
        return this.verifyUserCredentialsLocal(email, password)
      }
    } else {
      console.log("🔐 Using localStorage for authentication")
      return this.verifyUserCredentialsLocal(email, password)
    }
  }

  private verifyUserCredentialsLocal(email: string, password: string): SystemUser | null {
    try {
      const localData = this.getLocalData()
      let users = localData.users || []

      // If no users exist, seed with default users
      if (users.length === 0) {
        users = this.getDefaultUsers()
        this.updateLocalData("users", users)
      }

      const user = users.find((u: any) => u.email === email && u.password === password)
      return user || null
    } catch (error) {
      console.error("🔐 Error verifying credentials locally:", error)
      return null
    }
  }

  async query(sql: string, params?: any[]) {
    // Mock query implementation
    console.log("Mock query:", sql, params)
    return []
  }

  async getAllAssets() {
    if (this.isSupabaseAvailable) {
      try {
        const { data, error } = await this.supabase.from("assets").select("*")
        if (!error && data) return data
      } catch (error) {
        console.log("Supabase query failed, using localStorage")
      }
    }

    // Fallback to localStorage
    const localData = this.getLocalData()
    return localData.assets || this.getDefaultAssets()
  }

  async getAllTransfers() {
    if (this.isSupabaseAvailable) {
      try {
        const { data, error } = await this.supabase.from("transfers").select("*")
        if (!error && data) return data
      } catch (error) {
        console.log("Supabase query failed, using localStorage")
      }
    }

    // Fallback to localStorage
    const localData = this.getLocalData()
    return localData.transfers || this.getDefaultTransfers()
  }

  async createTransfer(transferData: any) {
    if (this.isSupabaseAvailable) {
      try {
        const { data, error } = await this.supabase.from("transfers").insert(transferData).select().single()
        if (!error && data) return data
      } catch (error) {
        console.log("Supabase insert failed, using localStorage")
      }
    }

    // Fallback to localStorage
    const newTransfer = { ...transferData, id: Date.now().toString() }
    const localData = this.getLocalData()
    const transfers = localData.transfers || []
    transfers.push(newTransfer)
    this.updateLocalData("transfers", transfers)
    return newTransfer
  }

  // Methods expected by AssetProvider
  async getAssets(): Promise<Asset[]> {
    if (this.isSupabaseAvailable) {
      try {
        const { data, error } = await this.supabase.from("assets").select("*")
        if (!error && data) {
          return data.map((asset: any) => this.transformSupabaseAsset(asset))
        }
      } catch (error) {
        console.log("Supabase query failed, using localStorage")
      }
    }

    // Fallback to localStorage
    const localData = this.getLocalData()
    return localData.assets || this.getDefaultAssets()
  }

  async getAssignments(): Promise<Assignment[]> {
    if (this.isSupabaseAvailable) {
      try {
        const { data, error } = await this.supabase.from("assignments").select("*")
        if (!error && data) return data
      } catch (error) {
        console.log("Supabase query failed, using localStorage")
      }
    }

    // Fallback to localStorage
    const localData = this.getLocalData()
    return localData.assignments || this.getDefaultAssignments()
  }

  async getTransfers(): Promise<Transfer[]> {
    if (this.isSupabaseAvailable) {
      try {
        const { data, error } = await this.supabase.from("transfers").select("*")
        if (!error && data) return data
      } catch (error) {
        console.log("Supabase query failed, using localStorage")
      }
    }

    // Fallback to localStorage
    const localData = this.getLocalData()
    return localData.transfers || this.getDefaultTransfers()
  }

  async getMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    if (this.isSupabaseAvailable) {
      try {
        const { data, error } = await this.supabase.from("maintenance_records").select("*")
        if (!error && data) return data
      } catch (error) {
        console.log("Supabase query failed, using localStorage")
      }
    }

    // Fallback to localStorage
    const localData = this.getLocalData()
    return localData.maintenanceRecords || this.getDefaultMaintenanceRecords()
  }

  async createAsset(assetData: Omit<Asset, "id">): Promise<Asset> {
    const newAsset: Asset = {
      id: Date.now().toString(),
      ...assetData,
    }

    if (this.isSupabaseAvailable) {
      try {
        const supabaseAsset = this.transformAssetForSupabase(newAsset)
        const { data, error } = await this.supabase.from("assets").insert(supabaseAsset).select().single()
        if (!error && data) {
          return this.transformSupabaseAsset(data)
        }
      } catch (error) {
        console.log("Supabase insert failed, using localStorage")
      }
    }

    // Fallback to localStorage
    const localData = this.getLocalData()
    const assets = localData.assets || []
    assets.push(newAsset)
    this.updateLocalData("assets", assets)
    return newAsset
  }

  async getUsers(): Promise<SystemUser[]> {
    if (this.isSupabaseAvailable) {
      try {
        const { data, error } = await this.supabase.from("users").select("*")
        if (!error && data) return data
      } catch (error) {
        console.log("Supabase query failed, using localStorage")
      }
    }

    // Fallback to localStorage
    const localData = this.getLocalData()
    return localData.users || this.getDefaultUsers()
  }

  async createUser(userData: Omit<SystemUser, "id" | "lastLogin">): Promise<SystemUser> {
    const newUser: SystemUser = {
      id: Date.now().toString(),
      lastLogin: new Date().toISOString(),
      ...userData,
    }

    if (this.isSupabaseAvailable) {
      try {
        const { data, error } = await this.supabase.from("users").insert(newUser).select().single()
        if (!error && data) return data
      } catch (error) {
        console.log("Supabase insert failed, using localStorage")
      }
    }

    // Fallback to localStorage
    const localData = this.getLocalData()
    const users = localData.users || []
    users.push(newUser)
    this.updateLocalData("users", users)
    return newUser
  }

  async updateUser(id: string, updates: Partial<SystemUser>): Promise<boolean> {
    if (this.isSupabaseAvailable) {
      try {
        const { error } = await this.supabase.from("users").update(updates).eq("id", id)
        if (!error) return true
      } catch (error) {
        console.log("Supabase update failed, using localStorage")
      }
    }

    // Fallback to localStorage
    const localData = this.getLocalData()
    const users = localData.users || []
    const userIndex = users.findIndex((user: any) => user.id === id)
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates }
      this.updateLocalData("users", users)
      return true
    }
    return false
  }

  async deleteUser(id: string): Promise<boolean> {
    if (this.isSupabaseAvailable) {
      try {
        const { error } = await this.supabase.from("users").delete().eq("id", id)
        if (!error) return true
      } catch (error) {
        console.log("Supabase delete failed, using localStorage")
      }
    }

    // Fallback to localStorage
    const localData = this.getLocalData()
    const users = localData.users || []
    const filteredUsers = users.filter((user: any) => user.id !== id)
    this.updateLocalData("users", filteredUsers)
    return true
  }

  // Mock Prisma-like interface with fallbacks
  user = {
    findUnique: async ({ where }: any) => {
      if (this.isSupabaseAvailable) {
        try {
          const { data, error } = await this.supabase.from("users").select("*").eq("id", where.id).single()
          if (!error && data) return data
        } catch (error) {
          console.log("Supabase query failed, using localStorage")
        }
      }

      // Fallback to localStorage
      const localData = this.getLocalData()
      const users = localData.users || this.getDefaultUsers()
      return users.find((user: any) => user.id === where.id) || null
    },
    update: async ({ where, data }: any) => {
      if (this.isSupabaseAvailable) {
        try {
          const { data: result, error } = await this.supabase
            .from("users")
            .update(data)
            .eq("id", where.id)
            .select()
            .single()
          if (!error && result) return result
        } catch (error) {
          console.log("Supabase update failed, using localStorage")
        }
      }

      // Fallback to localStorage
      const localData = this.getLocalData()
      const users = localData.users || []
      const userIndex = users.findIndex((user: any) => user.id === where.id)
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...data }
        this.updateLocalData("users", users)
        return users[userIndex]
      }
      return null
    },
    delete: async ({ where }: any) => {
      if (this.isSupabaseAvailable) {
        try {
          const { error } = await this.supabase.from("users").delete().eq("id", where.id)
          if (!error) return true
        } catch (error) {
          console.log("Supabase delete failed, using localStorage")
        }
      }

      // Fallback to localStorage
      const localData = this.getLocalData()
      const users = localData.users || []
      const filteredUsers = users.filter((user: any) => user.id !== where.id)
      this.updateLocalData("users", filteredUsers)
      return true
    },
  }

  asset = {
    findUnique: async ({ where }: any) => {
      if (this.isSupabaseAvailable) {
        try {
          const { data, error } = await this.supabase.from("assets").select("*").eq("id", where.id).single()
          if (!error && data) return data
        } catch (error) {
          console.log("Supabase query failed, using localStorage")
        }
      }

      // Fallback to localStorage
      const localData = this.getLocalData()
      const assets = localData.assets || this.getDefaultAssets()
      return assets.find((asset: any) => asset.id === where.id) || null
    },
    update: async ({ where, data }: any) => {
      if (this.isSupabaseAvailable) {
        try {
          const { data: result, error } = await this.supabase
            .from("assets")
            .update(data)
            .eq("id", where.id)
            .select()
            .single()
          if (!error && result) return result
        } catch (error) {
          console.log("Supabase update failed, using localStorage")
        }
      }

      // Fallback to localStorage
      const localData = this.getLocalData()
      const assets = localData.assets || []
      const assetIndex = assets.findIndex((asset: any) => asset.id === where.id)
      if (assetIndex !== -1) {
        assets[assetIndex] = { ...assets[assetIndex], ...data }
        this.updateLocalData("assets", assets)
        return assets[assetIndex]
      }
      return null
    },
    delete: async ({ where }: any) => {
      if (this.isSupabaseAvailable) {
        try {
          const { error } = await this.supabase.from("assets").delete().eq("id", where.id)
          if (!error) return true
        } catch (error) {
          console.log("Supabase delete failed, using localStorage")
        }
      }

      // Fallback to localStorage
      const localData = this.getLocalData()
      const assets = localData.assets || []
      const filteredAssets = assets.filter((asset: any) => asset.id !== where.id)
      this.updateLocalData("assets", filteredAssets)
      return true
    },
  }

  assignment = {
    findMany: async () => {
      if (this.isSupabaseAvailable) {
        try {
          const { data, error } = await this.supabase.from("assignments").select("*")
          if (!error && data) return data
        } catch (error) {
          console.log("Supabase query failed, using localStorage")
        }
      }

      // Fallback to localStorage
      const localData = this.getLocalData()
      return localData.assignments || this.getDefaultAssignments()
    },
    findUnique: async ({ where, include }: any) => {
      if (this.isSupabaseAvailable) {
        try {
          const { data, error } = await this.supabase.from("assignments").select("*").eq("id", where.id).single()
          if (!error && data) return data
        } catch (error) {
          console.log("Supabase query failed, using localStorage")
        }
      }

      // Fallback to localStorage
      const localData = this.getLocalData()
      const assignments = localData.assignments || this.getDefaultAssignments()
      return assignments.find((assignment: any) => assignment.id === where.id) || null
    },
    create: async ({ data }: any) => {
      if (this.isSupabaseAvailable) {
        try {
          const { data: result, error } = await this.supabase.from("assignments").insert(data).select().single()
          if (!error && result) return result
        } catch (error) {
          console.log("Supabase insert failed, using localStorage")
        }
      }

      // Fallback to localStorage
      const newAssignment = { ...data, id: Date.now().toString() }
      const localData = this.getLocalData()
      const assignments = localData.assignments || []
      assignments.push(newAssignment)
      this.updateLocalData("assignments", assignments)
      return newAssignment
    },
    update: async ({ where, data }: any) => {
      if (this.isSupabaseAvailable) {
        try {
          const { data: result, error } = await this.supabase
            .from("assignments")
            .update(data)
            .eq("id", where.id)
            .select()
            .single()
          if (!error && result) return result
        } catch (error) {
          console.log("Supabase update failed, using localStorage")
        }
      }

      // Fallback to localStorage
      const localData = this.getLocalData()
      const assignments = localData.assignments || []
      const assignmentIndex = assignments.findIndex((assignment: any) => assignment.id === where.id)
      if (assignmentIndex !== -1) {
        assignments[assignmentIndex] = { ...assignments[assignmentIndex], ...data }
        this.updateLocalData("assignments", assignments)
        return assignments[assignmentIndex]
      }
      return null
    },
    delete: async ({ where }: any) => {
      if (this.isSupabaseAvailable) {
        try {
          const { error } = await this.supabase.from("assignments").delete().eq("id", where.id)
          if (!error) return true
        } catch (error) {
          console.log("Supabase delete failed, using localStorage")
        }
      }

      // Fallback to localStorage
      const localData = this.getLocalData()
      const assignments = localData.assignments || []
      const filteredAssignments = assignments.filter((assignment: any) => assignment.id !== where.id)
      this.updateLocalData("assignments", filteredAssignments)
      return true
    },
  }

  transfer = {
    findUnique: async ({ where }: any) => {
      if (this.isSupabaseAvailable) {
        try {
          const { data, error } = await this.supabase.from("transfers").select("*").eq("id", where.id).single()
          if (!error && data) return data
        } catch (error) {
          console.log("Supabase query failed, using localStorage")
        }
      }

      // Fallback to localStorage
      const localData = this.getLocalData()
      const transfers = localData.transfers || this.getDefaultTransfers()
      return transfers.find((transfer: any) => transfer.id === where.id) || null
    },
    update: async ({ where, data }: any) => {
      if (this.isSupabaseAvailable) {
        try {
          const { data: result, error } = await this.supabase
            .from("transfers")
            .update(data)
            .eq("id", where.id)
            .select()
            .single()
          if (!error && result) return result
        } catch (error) {
          console.log("Supabase update failed, using localStorage")
        }
      }

      // Fallback to localStorage
      const localData = this.getLocalData()
      const transfers = localData.transfers || []
      const transferIndex = transfers.findIndex((transfer: any) => transfer.id === where.id)
      if (transferIndex !== -1) {
        transfers[transferIndex] = { ...transfers[transferIndex], ...data }
        this.updateLocalData("transfers", transfers)
        return transfers[transferIndex]
      }
      return null
    },
    delete: async ({ where }: any) => {
      if (this.isSupabaseAvailable) {
        try {
          const { data: result, error } = await this.supabase
            .from("transfers")
            .delete()
            .eq("id", where.id)
            .select()
            .single()
          if (!error) return result
        } catch (error) {
          console.log("Supabase delete failed, using localStorage")
        }
      }

      // Fallback to localStorage
      const localData = this.getLocalData()
      const transfers = localData.transfers || []
      const transfer = transfers.find((t: any) => t.id === where.id)
      const filteredTransfers = transfers.filter((t: any) => t.id !== where.id)
      this.updateLocalData("transfers", filteredTransfers)
      return transfer
    },
  }

  // Transform functions for Supabase compatibility
  private transformSupabaseAsset(supabaseAsset: any): Asset {
    return {
      id: supabaseAsset.asset_number || supabaseAsset.id,
      name: supabaseAsset.name,
      category: supabaseAsset.category,
      status: this.mapDatabaseStatusToApp(supabaseAsset.status),
      department: supabaseAsset.location || "Unknown Department",
      assignedTo: supabaseAsset.assigned_to || "",
      purchaseDate: supabaseAsset.purchase_date || "",
      purchasePrice: supabaseAsset.purchase_price || 0,
      serialNumber: supabaseAsset.serial_number || "",
      location: supabaseAsset.location || "",
      notes: supabaseAsset.notes || "",
    }
  }

  private transformAssetForSupabase(asset: Partial<Asset>): any {
    return {
      asset_number: asset.id,
      name: asset.name,
      category: asset.category,
      status: asset.status ? this.mapAppStatusToDatabase(asset.status) : undefined,
      location: asset.location || asset.department,
      assigned_to: asset.assignedTo || null,
      purchase_date: asset.purchaseDate || null,
      purchase_price: asset.purchasePrice || null,
      serial_number: asset.serialNumber || null,
      notes: asset.notes || null,
    }
  }

  private mapDatabaseStatusToApp(dbStatus: string): Asset["status"] {
    const statusMap: Record<string, Asset["status"]> = {
      active: "In Use",
      inactive: "In Storage",
      maintenance: "In Maintenance",
      disposed: "Pending Disposal",
    }
    return statusMap[dbStatus] || "In Storage"
  }

  private mapAppStatusToDatabase(appStatus: Asset["status"]): string {
    const statusMap: Record<Asset["status"], string> = {
      "In Use": "active",
      "In Storage": "inactive",
      "In Maintenance": "maintenance",
      "Pending Disposal": "disposed",
      active: "active",
      inactive: "inactive",
      maintenance: "maintenance",
      disposed: "disposed",
    }
    return statusMap[appStatus] || "inactive"
  }

  // Default data generators
  private getDefaultUsers(): SystemUser[] {
    return [
      {
        id: "admin-001",
        name: "System Administrator",
        email: "admin@lgu.gov",
        password: "admin123",
        role: "admin",
        department: "IT Department",
        status: "active",
        lastLogin: new Date().toISOString(),
        jobTitle: "System Administrator",
        phone: "+1234567890",
      },
      {
        id: "head-001",
        name: "Department Head",
        email: "head@lgu.gov",
        password: "head123",
        role: "department_head",
        department: "Finance Department",
        status: "active",
        jobTitle: "Department Head",
        phone: "+1234567891",
      },
      {
        id: "staff-001",
        name: "Staff Member",
        email: "staff@lgu.gov",
        password: "staff123",
        role: "staff",
        department: "General Services",
        status: "active",
        jobTitle: "Staff",
        phone: "+1234567892",
      },
    ]
  }

  private getDefaultAssets(): Asset[] {
    return [
      {
        id: "10001",
        name: "Dell XPS 15 Laptop",
        category: "Computer Equipment",
        status: "In Use",
        department: "IT Department",
        assignedTo: "John Doe",
        purchaseDate: "2023-01-15",
        purchasePrice: 1500,
        serialNumber: "DL-XPS-12345",
        location: "IT Department",
      },
      {
        id: "10002",
        name: "HP LaserJet Pro Printer",
        category: "Office Equipment",
        status: "In Use",
        department: "Finance Department",
        assignedTo: "Finance Team",
        purchaseDate: "2022-11-05",
        purchasePrice: 450,
        serialNumber: "HP-LJ-67890",
        location: "Finance Department",
      },
      {
        id: "10003",
        name: "Conference Room Table",
        category: "Furniture",
        status: "In Use",
        department: "Administration",
        assignedTo: "Meeting Room 2",
        purchaseDate: "2022-08-20",
        purchasePrice: 800,
        serialNumber: "FRN-TBL-54321",
        location: "Meeting Room 2",
      },
      {
        id: "10004",
        name: "Projector - Epson PowerLite",
        category: "Audio/Visual Equipment",
        status: "In Maintenance",
        department: "IT Department",
        assignedTo: "Conference Room A",
        purchaseDate: "2022-05-10",
        purchasePrice: 700,
        serialNumber: "EP-PL-13579",
        location: "Maintenance Room",
      },
      {
        id: "10005",
        name: "Office Chair - Ergonomic",
        category: "Furniture",
        status: "In Use",
        department: "Human Resources",
        assignedTo: "Jane Smith",
        purchaseDate: "2023-02-28",
        purchasePrice: 250,
        serialNumber: "FRN-CHR-24680",
        location: "HR Office",
      },
    ]
  }

  private getDefaultAssignments(): Assignment[] {
    return [
      {
        id: "10011",
        assetId: "10001",
        assetName: "Dell XPS 15 Laptop",
        assignedTo: "John Doe",
        department: "IT Department",
        assignedDate: "2023-01-20",
        dueDate: "2025-01-20",
        status: "Active",
        notes: "Primary work laptop",
      },
      {
        id: "10012",
        assetId: "10002",
        assetName: "HP LaserJet Pro Printer",
        assignedTo: "Finance Team",
        department: "Finance Department",
        assignedDate: "2022-11-10",
        dueDate: null,
        status: "Active",
        notes: "Shared department printer",
      },
    ]
  }

  private getDefaultTransfers(): Transfer[] {
    return [
      {
        id: "10017",
        assetId: "10001",
        assetName: "Dell XPS 15 Laptop",
        fromUser: "IT Storage",
        toUser: "John Doe",
        fromDepartment: "IT Department",
        toDepartment: "IT Department",
        transferDate: "2023-01-20",
        approvedBy: "Jane Doe",
        status: "Completed",
      },
    ]
  }

  private getDefaultMaintenanceRecords(): MaintenanceRecord[] {
    return [
      {
        id: "10021",
        assetId: "10004",
        assetName: "Projector - Epson PowerLite",
        performedBy: "IT Technician",
        maintenanceType: "Preventive",
        description: "Regular maintenance and cleaning",
        cost: 50,
        scheduledDate: "2024-01-15",
        completedDate: "2024-01-15",
        status: "Completed",
        assignedTo: "IT Department",
        notes: "Maintenance completed successfully",
      },
    ]
  }
}

export const unifiedDb = UnifiedDatabase.getInstance()

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: "admin" | "department_head" | "staff"
          department: string
          status: "active" | "inactive"
          last_login: string | null
          phone: string | null
          job_title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: "admin" | "department_head" | "staff"
          department: string
          status?: "active" | "inactive"
          last_login?: string | null
          phone?: string | null
          job_title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: "admin" | "department_head" | "staff"
          department?: string
          status?: "active" | "inactive"
          last_login?: string | null
          phone?: string | null
          job_title?: string | null
          updated_at?: string
        }
      }
      user_auth: {
        Row: {
          user_id: string
          password_hash: string
          reset_token: string | null
          reset_token_expires: string | null
        }
        Insert: {
          user_id: string
          password_hash: string
          reset_token?: string | null
          reset_token_expires?: string | null
        }
        Update: {
          user_id?: string
          password_hash?: string
          reset_token?: string | null
          reset_token_expires?: string | null
        }
      }
      assets: {
        Row: {
          id: string
          name: string
          category: string
          serial_number: string
          model: string
          manufacturer: string
          purchase_date: string
          purchase_price: number
          current_value: number
          condition: "excellent" | "good" | "fair" | "poor" | "damaged"
          status: "active" | "inactive" | "maintenance" | "disposed"
          location: string
          department: string
          assigned_to: string | null
          description: string | null
          warranty_expiry: string | null
          last_maintenance_date: string | null
          next_maintenance_date: string | null
          image_url: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          serial_number: string
          model: string
          manufacturer: string
          purchase_date: string
          purchase_price: number
          current_value: number
          condition: "excellent" | "good" | "fair" | "poor" | "damaged"
          status: "active" | "inactive" | "maintenance" | "disposed"
          location: string
          department: string
          assigned_to?: string | null
          description?: string | null
          warranty_expiry?: string | null
          last_maintenance_date?: string | null
          next_maintenance_date?: string | null
          image_url?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          serial_number?: string
          model?: string
          manufacturer?: string
          purchase_date?: string
          purchase_price?: number
          current_value?: number
          condition?: "excellent" | "good" | "fair" | "poor" | "damaged"
          status?: "active" | "inactive" | "maintenance" | "disposed"
          location?: string
          department?: string
          assigned_to?: string | null
          description?: string | null
          warranty_expiry?: string | null
          last_maintenance_date?: string | null
          next_maintenance_date?: string | null
          image_url?: string | null
          tags?: string[] | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

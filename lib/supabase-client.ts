import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a single Supabase client instance
let supabase: any
let isAvailable = false

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
    isAvailable = true
    console.log("✅ Supabase client initialized successfully")
  } else {
    console.log("ℹ️ Supabase environment variables not found, using fallback mode")
    // Create a mock client that won't cause errors
    supabase = {
      from: (table: string) => ({
        select: (columns?: string) => ({
          eq: (column: string, value: any) => ({
            single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
            order: (column: string, options?: any) => Promise.resolve({ data: [], error: null }),
            limit: (count: number) => Promise.resolve({ data: [], error: null }),
          }),
          order: (column: string, options?: any) => Promise.resolve({ data: [], error: null }),
          limit: (count: number) => Promise.resolve({ data: [], error: null }),
          range: (from: number, to: number) => Promise.resolve({ data: [], error: null }),
        }),
        insert: (values: any) => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
          }),
        }),
        update: (values: any) => ({
          eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
        }),
        delete: () => ({
          eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
        }),
        upsert: (values: any) => Promise.resolve({ data: null, error: null }),
      }),
      auth: {
        signInWithPassword: () => Promise.resolve({ data: null, error: null }),
        signUp: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: null }),
          download: () => Promise.resolve({ data: null, error: null }),
        }),
      },
    }
  }
} catch (error) {
  console.log("ℹ️ Supabase initialization failed, using localStorage fallback")
  isAvailable = false
  // Create a mock client
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: new Error("Supabase not configured") }),
      insert: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      update: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      delete: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
    }),
  }
}

export { supabase }
export const isSupabaseAvailable = () => isAvailable
export const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

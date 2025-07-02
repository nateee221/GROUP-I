import { supabase, isSupabaseConfigured, isSupabaseAvailable } from "./supabase-client"

// Re-export for backward compatibility
export { supabase, isSupabaseConfigured, isSupabaseAvailable }

// Helper function to check if we're on the server
export const isServer = () => typeof window === "undefined"

// Supabase Server Client for API routes (with service role key)
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization for Supabase Admin client
let supabaseAdminInstance: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
    if (!supabaseAdminInstance) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
        supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })
    }
    return supabaseAdminInstance
}

// Legacy export for backward compatibility (lazy getter)
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
    get(_, prop) {
        return (getSupabaseAdmin() as any)[prop]
    }
})

// For direct PostgreSQL queries (legacy support) - lazy initialization
let poolInstance: any = null

export function getPool() {
    if (!poolInstance) {
        const { Pool } = require('pg')
        poolInstance = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        })
    }
    return poolInstance
}

export const pool = new Proxy({} as any, {
    get(_, prop) {
        return getPool()[prop]
    }
})

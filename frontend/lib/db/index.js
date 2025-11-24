// Database connection using Supabase PostgreSQL
// For legacy controllers that use raw SQL queries
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;

// Note: For new features, prefer using Supabase Client SDK
// Import from: import { supabaseAdmin } from '@/lib/supabase/server'

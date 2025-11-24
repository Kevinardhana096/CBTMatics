# 🚀 Migrasi ke Supabase

## Overview
CBTMatics sekarang menggunakan **Supabase** sebagai database PostgreSQL backend.

---

## 📋 Langkah Setup Supabase

### 1. Buat Project Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Klik **"New Project"**
3. Isi detail project:
   - **Name**: CBTMatics
   - **Database Password**: Simpan password ini (akan digunakan di connection string)
   - **Region**: Pilih yang terdekat (Singapore/Tokyo untuk Indonesia)
   - **Pricing Plan**: Free tier sudah cukup untuk development

### 2. Import Database Schema

#### Option A: Via SQL Editor (Recommended)

1. Di Supabase Dashboard, buka **SQL Editor**
2. Klik **"New Query"**
3. Copy isi file `frontend/database_schema.sql`
4. Paste ke SQL Editor
5. Klik **"Run"** atau tekan `Ctrl + Enter`
6. Verifikasi di **Table Editor** bahwa semua tabel sudah dibuat

#### Option B: Via psql Command Line

```bash
# Install psql terlebih dahulu jika belum ada
# Windows: Download dari PostgreSQL official website
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql-client

# Connect ke Supabase
psql "postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Import schema
\i frontend/database_schema.sql
```

### 3. Get Connection String

1. Di Supabase Dashboard, buka **Project Settings** > **Database**
2. Scroll ke **Connection String** section
3. Pilih tab **URI**
4. Copy connection string yang sudah include password:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

### 4. Setup Environment Variables

#### Development (`.env.local`)

```env
# Supabase Database Connection
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters

# API URL
NEXT_PUBLIC_API_URL=/api

# Node Environment
NODE_ENV=development
```

#### Production (Vercel Dashboard)

1. Buka Vercel Dashboard > Your Project > **Settings** > **Environment Variables**
2. Tambahkan variable berikut:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres.[PROJECT-REF]:...` | Production |
| `JWT_SECRET` | `your-32-char-secret` | Production |
| `NODE_ENV` | `production` | Production |
| `NEXT_PUBLIC_API_URL` | `/api` | Production |

---

## 🔐 Generate JWT Secret

```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online Generator
# https://generate-secret.vercel.app/32
```

---

## ✅ Verifikasi Database

### Check Tables via Supabase Dashboard

1. Buka **Table Editor**
2. Pastikan tabel berikut ada:
   - ✅ `users`
   - ✅ `questions`
   - ✅ `exams`
   - ✅ `exam_questions`
   - ✅ `exam_submissions`
   - ✅ `exam_answers`

### Test Connection via API

```bash
# Start development server
cd frontend
npm run dev

# Test login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 📊 Default Credentials (dari database_schema.sql)

### Admin Account
- **Username**: `admin`
- **Email**: `admin@cbt.com`
- **Password**: `admin123` (hash: `$2b$10$YourHashedPasswordHere`)

⚠️ **PENTING**: Ganti password default setelah first login!

### Test Data
- 3 sample users (admin, teacher, student)
- 3 sample questions (multiple choice, true/false)
- 1 sample exam dengan 3 soal

---

## 🔧 Supabase Features (Optional)

### Row Level Security (RLS)

Untuk production, aktifkan RLS:

```sql
-- Enable RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see themselves
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid()::text = id::text);

-- Similar policies untuk tabel lain...
```

### Realtime Subscriptions (Optional)

Jika butuh real-time updates:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Subscribe to exam submissions
supabase
  .channel('exam_submissions')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'exam_submissions' },
    (payload) => {
      console.log('New submission:', payload)
    }
  )
  .subscribe()
```

---

## 🚨 Troubleshooting

### Error: "Connection timeout"

**Solusi**: Periksa connection string, pastikan menggunakan **pooler** (port 6543):
```
postgresql://...@aws-0-[region].pooler.supabase.com:6543/postgres
```

### Error: "SSL required"

**Solusi**: Sudah ditangani di `frontend/lib/db/index.js`:
```javascript
ssl: { rejectUnauthorized: false }
```

### Error: "Too many connections"

**Solusi**: 
1. Gunakan connection pooling (sudah default di `Pool`)
2. Upgrade Supabase plan jika perlu lebih banyak connections
3. Set `max` connections di Pool:
   ```javascript
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20 // Maximum 20 connections
   })
   ```

### Error: "Password authentication failed"

**Solusi**:
1. Reset database password di Supabase Dashboard
2. Update DATABASE_URL dengan password baru
3. Restart development server

---

## 📦 Migration from Vercel Postgres

Jika sebelumnya pakai Vercel Postgres, tidak perlu export/import data karena database masih kosong. Cukup:

1. ✅ Import schema baru ke Supabase
2. ✅ Update environment variable `DATABASE_URL`
3. ✅ Deploy ulang ke Vercel

---

## 🎯 Keuntungan Supabase vs Vercel Postgres

| Feature | Supabase | Vercel Postgres |
|---------|----------|-----------------|
| Free Tier | 500MB database | 256MB database |
| Dashboard UI | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| SQL Editor | ✅ Built-in | ❌ (manual psql) |
| Realtime | ✅ | ❌ |
| Auth (optional) | ✅ | ❌ |
| Storage (optional) | ✅ | ❌ |
| Table Editor | ✅ | ❌ |

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase PostgreSQL](https://supabase.com/docs/guides/database)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

---

**Migration Date**: November 24, 2025  
**Status**: ✅ Complete

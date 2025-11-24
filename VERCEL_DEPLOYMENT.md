# Deploy CBTMatics ke Vercel (All-in-One)

## Persiapan

Project sudah dikonfigurasi untuk deploy sebagai monorepo dengan:
- **Frontend**: Next.js
- **Backend**: Express.js API dalam Next.js API Routes
- **Database**: Supabase PostgreSQL

⚠️ **NOTE**: Sekarang menggunakan Supabase, bukan Vercel Postgres. Lihat `SUPABASE_MIGRATION.md` untuk setup database.

## Step-by-Step Deployment

### 1. Push ke GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin master
```

### 2. Deploy ke Vercel

1. Buka https://vercel.com
2. Login dengan GitHub
3. Click "Add New" → "Project"
4. Pilih repository `CBTMatics`
5. **Configure Project:**
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

6. **Environment Variables** (Click "Add" untuk setiap variable):
   ```
   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   JWT_SECRET=<generate-random-secret-key>
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=/api
   ```

   **Get DATABASE_URL**:
   - Buka [Supabase Dashboard](https://supabase.com/dashboard)
   - Project Settings > Database > Connection String > URI
   - Copy connection string dengan password

   **Generate JWT_SECRET**:
   ```bash
   openssl rand -base64 32
   ```

7. Click **"Deploy"**

### 3. Setup Database (Supabase)

**BEFORE deploying**, setup Supabase database terlebih dahulu:

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project (pilih region Singapore/Tokyo)
3. Tunggu database ready (~2 menit)
4. Buka **SQL Editor** > **New Query**
5. Copy semua isi file `frontend/database_schema.sql`
6. Paste dan click **"Run"** (Ctrl + Enter)
7. Verifikasi di **Table Editor** - harus ada 6 tabel

📖 **Detailed Guide**: Lihat `SUPABASE_MIGRATION.md`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

### 4. Import Database Schema

1. Click database yang sudah dibuat
2. Click tab **"Query"** atau **".sql"**
3. Copy-paste SQL schema dari `backend/database/schema.sql`
4. Run query

Atau menggunakan CLI:
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Connect to database
vercel env pull .env.local

# Import schema
psql $POSTGRES_URL < backend/database/schema.sql
```

### 5. Verifikasi Deployment

- Frontend: https://your-project.vercel.app
- API: https://your-project.vercel.app/api/auth/test

## Environment Variables yang Dibutuhkan

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key untuk JWT token | `your-super-secret-key-min-32-chars` |
| `NODE_ENV` | Environment mode | `production` |
| `NEXT_PUBLIC_API_URL` | API base URL | `/api` (relative URL) |
| `POSTGRES_URL` | Database connection (auto) | Auto dari Vercel |

## Troubleshooting

### Error: Module not found
```bash
# Pastikan semua dependencies terinstall
cd frontend
npm install
```

### Error: Database connection
- Pastikan database sudah dibuat di Vercel Storage
- Check environment variables sudah ter-set

### Error: 500 Internal Server Error
- Check Vercel Function Logs
- Dashboard → Project → Deployments → View Function Logs

## Auto-deployment

Setiap push ke branch `master` akan otomatis trigger deployment baru.

## Database Backup

```bash
# Export database
pg_dump $POSTGRES_URL > backup.sql

# Import backup
psql $POSTGRES_URL < backup.sql
```

## Local Development

```bash
cd frontend
npm install
npm run dev
```

Akses: http://localhost:3000

## Production URL

Setelah deploy, Vercel akan memberikan URL:
- Production: `https://your-project.vercel.app`
- Preview: `https://your-project-xxx.vercel.app` (untuk PR/branch lain)

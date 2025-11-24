# CBT System - Struktur Project

## Struktur Folder Frontend

```
frontend/
├── app/                          # Next.js 15 App Directory
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── (auth)/                  # Auth routes (login, register)
│   │   ├── login/
│   │   └── register/
│   ├── api/                     # Next.js API Routes (Backend Integration)
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts    # POST /api/auth/login
│   │   │   └── register/
│   │   │       └── route.ts    # POST /api/auth/register
│   │   ├── questions/
│   │   │   ├── route.ts        # GET, POST /api/questions
│   │   │   └── [id]/
│   │   │       └── route.ts    # GET, PUT, DELETE /api/questions/:id
│   │   ├── exams/
│   │   │   ├── route.ts        # GET, POST /api/exams
│   │   │   └── [id]/
│   │   │       └── route.ts    # GET, PUT, DELETE /api/exams/:id
│   │   └── submissions/        # (To be implemented)
│   │       └── route.ts
│   └── (dashboard)/             # Dashboard routes
│       ├── layout.tsx           # Dashboard layout dengan sidebar
│       ├── admin/               # Admin pages
│       │   ├── exams/          # Manajemen ujian
│       │   ├── questions/      # Manajemen soal
│       │   ├── reports/        # Laporan & statistik
│       │   └── users/          # Manajemen user
│       └── student/            # Student pages
│           ├── exam/           # Halaman ujian siswa
│           ├── exams/          # Daftar ujian tersedia
│           └── results/        # Hasil ujian
│
├── components/                  # Reusable components
│   ├── auth/                   # Auth components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── ui/                     # UI components
│   │   ├── LatexRenderer.tsx   # Render LaTeX math
│   │   └── RichTextEditor.tsx  # WYSIWYG editor
│   └── index.tsx               # Central exports
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.tsx            # Authentication hook
│   ├── useExamSubmission.ts   # Exam submission logic
│   └── useTimer.ts            # Timer countdown
│
├── lib/                       # Backend Logic (Copied from backend/)
│   ├── controllers/          # Express controllers (adapted for Next.js)
│   │   ├── authController.js
│   │   ├── examController.js
│   │   ├── questionController.js
│   │   ├── submissionController.js
│   │   ├── reportController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   └── roleCheck.js     # Role-based access
│   ├── routes/              # Express routes (for reference)
│   │   ├── authRoutes.js
│   │   ├── examRoutes.js
│   │   ├── questionRoutes.js
│   │   └── reportRoutes.js
│   ├── db/
│   │   └── index.js         # PostgreSQL connection (Vercel Postgres)
│   ├── api.ts               # Axios instance dengan auth
│   ├── apiAdapter.ts        # Express to Next.js adapter
│   └── utils.ts             # Helper functions
│
├── public/                  # Static assets
│   ├── uploads/            # Uploaded images
│   │   └── questions/      # Question images
│   └── templates/          # Import templates (CSV/ZIP)
│       ├── soal_dengan_gambar.csv
│       ├── soal_olimpiade_matematika.csv
│       ├── template_soal.csv
│       └── CARA_IMPORT_GAMBAR.md
│
├── database_schema.sql      # Database schema (for Supabase import)
├── .env.local               # Environment variables
├── .env.example             # Environment template
├── next.config.ts           # Next.js configuration
├── package.json             # Dependencies
└── tsconfig.json            # TypeScript config
```

## Teknologi Stack

### Frontend
- **Framework:** Next.js 15 (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Math Rendering:** KaTeX
- **Rich Text Editor:** TipTap
- **HTTP Client:** Axios
- **State Management:** React Hooks

### Backend (Integrated in Next.js API Routes)
- **Runtime:** Node.js
- **Database:** Supabase PostgreSQL
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer
- **File Processing:** 
  - xlsx (Excel)
  - csv-parser (CSV)
  - adm-zip (ZIP with images)
- **Password Hashing:** bcrypt

## Fitur Utama

### Admin
✅ Manajemen soal (CRUD)
✅ Import/Export soal (CSV, Excel, ZIP)
✅ Support LaTeX & gambar
✅ Manajemen ujian
✅ Manajemen user
✅ Laporan & statistik
✅ Preview & testing soal

### Student
✅ Daftar ujian tersedia
✅ Ikuti ujian dengan timer
✅ Auto-save jawaban
✅ Submit ujian
✅ Lihat hasil & pembahasan

## File Penting

### Frontend
- `app/(dashboard)/layout.tsx` - Dashboard layout dengan sidebar & auth check
- `hooks/useAuth.tsx` - Authentication state management
- `components/ui/LatexRenderer.tsx` - Render formula matematika
- `components/ui/RichTextEditor.tsx` - WYSIWYG editor dengan LaTeX

### Backend (Integrated)
- `lib/controllers/questionController.js` - Handle import CSV/ZIP dengan gambar
- `lib/middleware/auth.js` - JWT verification
- `database_schema.sql` - Complete database structure

## Environment Variables

### Development (`.env.local`)
```env
# Supabase Database
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters

# API URL
NEXT_PUBLIC_API_URL=/api

# Node Environment
NODE_ENV=development
```

### Production (Vercel)
```env
# Supabase Database Connection
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters

# API URL
NEXT_PUBLIC_API_URL=/api

# Node Environment
NODE_ENV=production
```

## Getting Started

### Development Mode (Monorepo)

#### 1. Setup Supabase Database

1. Buat project di [Supabase Dashboard](https://supabase.com/dashboard)
2. Buka **SQL Editor** > **New Query**
3. Copy isi `frontend/database_schema.sql`
4. Paste dan **Run**
5. Get connection string dari **Project Settings** > **Database**

📖 **Detailed Guide**: `SUPABASE_MIGRATION.md`

#### 2. Setup Frontend (Main App)
```bash
cd frontend
npm install
npm run dev
```

#### 3. Access Application
- Frontend & API: http://localhost:3000
- API Routes: http://localhost:3000/api

### Production Deployment (Vercel)

#### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin master
```

#### 2. Deploy to Vercel
1. Connect GitHub repo to Vercel
2. Set **Root Directory** to `frontend/`
3. Set environment variables:
   - `DATABASE_URL` (from Supabase)
   - `JWT_SECRET` (generate with `openssl rand -base64 32`)
   - `NODE_ENV=production`
4. Deploy!

#### 3. Access Production
- Production URL: https://your-app.vercel.app

📖 **Detailed Guides**:
- Supabase Setup: `SUPABASE_MIGRATION.md`
- Vercel Deployment: `VERCEL_DEPLOYMENT.md`

## Default Credentials

### Admin
- Username: `admin`
- Password: `admin123`

### Student
- Username: `student`
- Password: `student123`

## Folder yang Di-ignore (.gitignore)

- `node_modules/`
- `.env` / `.env.local`
- `.next/`
- `uploads/` (optional)
- `archive/` (optional)

## Deployment Architecture

### Single-App Structure (Vercel)
```
CBTMatics (GitHub Repo)
└── frontend/          ← Vercel Root Directory (Full-stack Next.js)
    ├── app/api/      ← Next.js API Routes (Backend)
    ├── app/...       ← Frontend Pages
    ├── lib/          ← Backend Logic (controllers, middleware)
    └── public/       ← Static files & templates
```

### API Integration Flow
1. **Express.js** controllers copied to `frontend/lib/controllers/`
2. **API Routes** adapt Express logic using `apiAdapter.ts`
3. **Database** connects via Supabase (`DATABASE_URL`)
4. **No separate backend server** - all in one Next.js app

### Key Changes for Next.js 15
- ✅ Dynamic route params: `params: Promise<{ id: string }>`
- ✅ Return types: `Promise<NextResponse>` for all handlers
- ✅ Server external packages: `pg`, `bcrypt` in `next.config.ts`
- ✅ Relative API URLs: `/api` instead of `http://localhost:8080/api`

## Recent Updates

**Latest Commits:**
- ✅ `39f5771` - Fix Next.js 15 params as Promise in dynamic routes
- ✅ `316224e` - Fix TypeScript return types in API route handlers
- ✅ `1d351ef` - Remove vercel.json - use dashboard config instead

**Status:** 
- ✅ All TypeScript errors resolved
- ✅ Vercel build successful
- ✅ Migrated to Supabase
- ⏳ Supabase database import pending
- ⏳ Environment variables setup pending

## Notes

- ⚡ **Full-stack Next.js** - Backend dan frontend dalam satu app
- 🗄️ **Supabase PostgreSQL** - Managed database dengan UI dashboard
- 🔐 **JWT Authentication** - Custom auth implementation
- 📁 **File uploads** disimpan di `frontend/public/uploads/`
- 📊 **Import templates** tersedia di `frontend/public/templates/`
- 🚀 **Deploy-ready** - Tinggal push ke GitHub dan deploy ke Vercel

## File Penting untuk Deployment

- `SUPABASE_MIGRATION.md` - Panduan setup Supabase (NEW!)
- `VERCEL_DEPLOYMENT.md` - Panduan lengkap deployment Vercel
- `frontend/next.config.ts` - Konfigurasi server external packages
- `frontend/lib/db/index.js` - PostgreSQL connection untuk Supabase
- `frontend/database_schema.sql` - Schema untuk import ke Supabase
- `frontend/public/templates/` - CSV/ZIP import templates

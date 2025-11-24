# CBT System - Struktur Project

## Struktur Folder Frontend

```
frontend/
├── app/                          # Next.js 13+ App Directory
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── (auth)/                  # Auth routes (login, register)
│   │   ├── login/
│   │   └── register/
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
├── lib/                       # Utilities & configs
│   ├── api.ts                # Axios instance dengan auth
│   └── utils.ts              # Helper functions
│
├── .env.local                # Environment variables
├── next.config.ts            # Next.js configuration
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript config
```

## Struktur Folder Backend

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # PostgreSQL connection
│   ├── controllers/           # Business logic
│   │   ├── authController.js
│   │   ├── examController.js
│   │   ├── questionController.js
│   │   ├── reportController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js           # JWT authentication
│   └── routes/
│       ├── index.js          # Route aggregator
│       ├── authRoutes.js
│       ├── examRoutes.js
│       ├── questionRoutes.js
│       ├── reportRoutes.js
│       └── userRoutes.js
│
├── uploads/                   # Uploaded files
│   └── questions/            # Question images
│
├── templates/                 # Import templates
│   ├── soal_olimpiade_matematika.csv
│   ├── soal_dengan_gambar.csv
│   └── README_IMPORT_GAMBAR.md
│
├── archive/                   # Old/temp files (ignored by git)
│   ├── temp_sql/
│   └── temp_scripts/
│
├── .env                      # Environment variables
├── database_schema.sql       # Database schema
├── DATABASE_SETUP.md         # Setup instructions
├── server.js                 # Express server entry
└── package.json              # Dependencies
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

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
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

### Backend
- `src/controllers/questionController.js` - Handle import CSV/ZIP dengan gambar
- `src/middleware/auth.js` - JWT verification
- `database_schema.sql` - Complete database structure

## Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Backend (`.env`)
```
PORT=8080
DB_USER=postgres
DB_HOST=localhost
DB_NAME=cbt_db
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret
```

## Getting Started

### 1. Setup Database
```bash
psql -U postgres
CREATE DATABASE cbt_db;
\c cbt_db
\i database_schema.sql
```

### 2. Setup Backend
```bash
cd backend
npm install
npm start
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api

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

## Notes

- Semua komponen yang tidak digunakan sudah dihapus
- Struktur folder sudah disederhanakan
- Hanya ada satu set component di frontend (tidak ada duplikat di `src/`)
- Backend sudah terorganisir dengan baik
- Archive folder berisi file-file temporary/lama yang tidak aktif digunakan

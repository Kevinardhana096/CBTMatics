# 🗂️ Struktur Folder Backend - CBT System

## Struktur Direktori

```
backend/
│
├── 📁 src/                          # Source code utama aplikasi
│   ├── config/                      # Konfigurasi (database, env)
│   │   └── db.js                    # PostgreSQL connection pool
│   │
│   ├── controllers/                 # Business logic handlers
│   │   ├── authController.js        # Authentication (login, register)
│   │   ├── examController.js        # CRUD ujian
│   │   ├── questionController.js    # CRUD soal & import CSV
│   │   ├── reportController.js      # Generate reports & export PDF
│   │   ├── submissionController.js  # Handle pengerjaan ujian
│   │   └── userController.js        # CRUD users
│   │
│   ├── middleware/                  # Authentication & authorization
│   │   ├── auth.js                  # JWT verification
│   │   └── roleCheck.js             # Role-based access control
│   │
│   ├── routes/                      # API route definitions
│   │   ├── authRoutes.js            # /api/auth/*
│   │   ├── examRoutes.js            # /api/exams/*
│   │   ├── questionRoutes.js        # /api/questions/*
│   │   ├── reportRoutes.js          # /api/reports/*
│   │   ├── userRoutes.js            # /api/users/*
│   │   └── index.js                 # Route aggregator
│   │
│   ├── utils/                       # Utility functions
│   │   ├── csvImporter.js           # Import soal dari CSV
│   │   ├── passwordHelper.js        # Hash & verify password (bcrypt)
│   │   └── pdfExporter.js           # Export laporan ke PDF
│   │
│   └── models/                      # Database models (optional)
│
├── 📁 templates/                    # Template files untuk user
│   ├── template_soal.csv            # Template dasar import soal
│   ├── template_soal_lengkap.csv    # Template lengkap
│   ├── template_soal_matematika.csv # Template soal matematika
│   ├── README_TEMPLATE_MATEMATIKA.md # Panduan soal matematika
│   └── README.md                    # 📖 Dokumentasi template
│
├── 📁 uploads/                      # File upload (generated at runtime)
│   └── .gitkeep                     # Agar folder ter-track di git
│
├── 📁 archive/                      # ⚠️ File lama (tidak digunakan)
│   ├── temp_sql/                    # SQL scripts debugging
│   │   ├── check_enum.sql
│   │   ├── fix_all.sql
│   │   ├── reset_exam_submission.sql
│   │   └── ... (11 file SQL)
│   │
│   ├── temp_scripts/                # Script bantuan sementara
│   │   ├── fix_error_500.bat
│   │   ├── restart.bat
│   │   ├── create-users.js
│   │   └── ... (8 file script)
│   │
│   └── README.md                    # 📖 Dokumentasi archive
│
├── 📁 node_modules/                 # Dependencies (auto-generated)
│
├── 📄 server.js                     # 🚀 Entry point aplikasi
├── 📄 database_schema.sql           # 🗄️ PostgreSQL schema lengkap
├── 📄 DATABASE_SETUP.md             # 📖 Panduan setup database
├── 📄 README.md                     # 📖 Dokumentasi utama
├── 📄 package.json                  # Dependencies & scripts
├── 📄 package-lock.json             # Dependency lock file
├── 📄 .env                          # 🔒 Environment variables (SECRET!)
└── 📄 .gitignore                    # Git ignore rules
```

## 📊 Statistik Struktur

### Folder Utama
- **src/** - 6 controllers, 5 routes, 2 middleware, 3 utils
- **templates/** - 4 template files + dokumentasi
- **archive/** - 19 file archived (tidak digunakan di production)

### Total Files (excluding node_modules)
- **Production files:** ~25 files
- **Documentation:** 4 README files
- **Archived files:** 19 files

## 🎯 File-File Penting

### 🔥 Must Read
1. **README.md** - Overview dan panduan umum
2. **DATABASE_SETUP.md** - Setup database step-by-step
3. **database_schema.sql** - Schema database terbaru
4. **.env** - Configuration (JANGAN COMMIT KE GIT!)

### 🚀 Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Setup database
psql -U postgres -f database_schema.sql

# 3. Configure .env
cp .env.example .env  # Edit sesuai environment

# 4. Run server
npm start
```

## 📝 Catatan Pembersihan

### ✅ Yang Sudah Dilakukan
1. ✅ Memindahkan 11 file SQL debugging ke `archive/temp_sql/`
2. ✅ Memindahkan 8 script bantuan ke `archive/temp_scripts/`
3. ✅ Membuat dokumentasi lengkap untuk setiap folder
4. ✅ Update .gitignore untuk exclude archive folder
5. ✅ Membuat .gitkeep untuk uploads folder

### 📂 Struktur Bersih
- Root folder hanya berisi file penting dan produktif
- Dokumentasi tersedia di setiap level folder
- Archive folder terpisah untuk reference
- File upload terorganisir dengan .gitkeep

### 🔄 Maintenance
- Gunakan `database_schema.sql` untuk setup database baru
- Archive folder dapat dihapus jika tidak diperlukan lagi
- Template folder sebaiknya tidak diubah (user reference)

## 🎨 Color Legend
- 📁 Folder/Directory
- 📄 File
- 📖 Documentation
- 🚀 Entry point
- 🗄️ Database
- 🔒 Secret/Sensitive
- ⚠️ Archived/Deprecated
- 🔥 Important
- ✅ Completed

---
**Last Updated:** November 10, 2025
**Status:** ✅ Clean & Organized

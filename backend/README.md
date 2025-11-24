# Backend - Computer Based Test (CBT) System

Backend API untuk sistem ujian berbasis komputer menggunakan Node.js, Express, dan PostgreSQL.

## 📁 Struktur Folder

```
backend/
├── src/                    # Source code utama
│   ├── config/            # Konfigurasi database dan environment
│   ├── controllers/       # Business logic handlers
│   ├── middleware/        # Authentication & authorization
│   ├── routes/            # API route definitions
│   ├── utils/             # Utility functions (CSV, PDF, Password)
│   └── models/            # Database models (jika ada)
│
├── templates/             # Template file CSV untuk import soal
├── uploads/               # Folder untuk file upload (auto-generated)
├── archive/               # File lama/debugging (tidak digunakan di production)
│
├── .env                   # Environment variables (SECRET!)
├── .gitignore            # Git ignore rules
├── database_schema.sql   # Schema database PostgreSQL
├── DATABASE_SETUP.md     # Panduan setup database
├── package.json          # Dependencies & scripts
└── server.js             # Entry point aplikasi
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- npm atau yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Setup database (lihat DATABASE_SETUP.md):
```bash
psql -U postgres -f database_schema.sql
```

3. Configure .env file:
```env
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cbt_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

4. Run server:
```bash
npm start
# atau untuk development
npm run dev
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user baru
- `GET /api/auth/me` - Get user info

### Questions (Soal)
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get question by ID
- `POST /api/questions` - Create question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/import` - Import CSV

### Exams (Ujian)
- `GET /api/exams` - Get all exams
- `GET /api/exams/:id` - Get exam by ID
- `POST /api/exams` - Create exam
- `PUT /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Delete exam

### Submissions (Pengerjaan)
- `POST /api/exams/:id/start` - Start exam
- `POST /api/exams/:id/submit` - Submit exam
- `POST /api/exams/:id/save-answer` - Save answer
- `GET /api/exams/submission/:id` - Get submission detail

### Reports (Laporan)
- `GET /api/reports/exam/:id` - Get exam report
- `GET /api/reports/student/:id` - Get student report
- `GET /api/reports/export/:id` - Export PDF report

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🔒 Authentication

API menggunakan JWT (JSON Web Token) untuk authentication.

Header yang diperlukan:
```
Authorization: Bearer <your_token>
```

## 👥 User Roles

- **admin** - Full access ke semua fitur
- **teacher** - Buat & kelola soal dan ujian
- **student** - Mengerjakan ujian dan lihat hasil

## 📝 File Templates

Template CSV untuk import soal tersedia di folder `templates/`:
- `template_soal.csv` - Template dasar
- `template_soal_lengkap.csv` - Template dengan semua field
- `template_soal_matematika.csv` - Template untuk soal matematika

## 🛠️ Utilities

### CSV Importer
Import soal dari file CSV dengan format tertentu.

### PDF Exporter
Export laporan hasil ujian ke format PDF.

### Password Helper
Hash dan verify password menggunakan bcrypt.

## 📊 Database

Database menggunakan PostgreSQL dengan tabel:
- `users` - Data pengguna
- `questions` - Bank soal
- `exams` - Data ujian
- `exam_questions` - Relasi ujian dengan soal
- `exam_submissions` - Data pengerjaan ujian
- `exam_answers` - Jawaban siswa

Lihat `database_schema.sql` untuk detail lengkap.

## 🐛 Debugging

File debugging dan script bantuan tersimpan di folder `archive/`.

## 📄 License

Private - CBT System

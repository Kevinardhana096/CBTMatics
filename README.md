# CBTMatics - Computer Based Test System

Sistem ujian berbasis komputer menggunakan Next.js 15 dan Supabase PostgreSQL.

## 🚀 Quick Start

```bash
# Install dependencies
cd frontend
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local dan isi dengan credentials Supabase Anda

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📋 Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cbt.com | admin123 |
| Teacher | teacher@cbt.com | teacher123 |
| Student | student@cbt.com | student123 |

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── (dashboard)/       # Dashboard pages (admin, teacher, student)
│   └── api/               # API routes
├── components/            # Reusable React components
├── lib/                   # Libraries & utilities
│   ├── controllers/       # Business logic controllers
│   ├── middleware/        # Auth middleware
│   ├── supabase/         # Supabase clients
│   └── db/               # Database connection pool
├── hooks/                # Custom React hooks (useAuth)
├── public/               # Static assets
├── database/             # Database schema & migrations
├── backups/              # Data backups
└── scripts/              # Utility scripts
```

## 🔧 Tech Stack

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase PostgreSQL
- **Authentication:** JWT + bcrypt
- **Deployment:** Vercel / VPS

## 📚 Documentation

Dokumentasi lengkap ada di folder `docs/`:

- **[Project Structure](docs/PROJECT_STRUCTURE.md)** - Struktur project detail
- **[Supabase Migration](docs/SUPABASE_MIGRATION.md)** - Setup Supabase
- **[VPS Migration](docs/VPS_MIGRATION.md)** - Migrasi ke VPS
- **[Vercel Deployment](docs/VERCEL_DEPLOYMENT.md)** - Deploy ke Vercel
- **[Testing Guide](docs/TESTING_GUIDE.md)** - Testing checklist
- **[Debug Guide](docs/DEBUG_LOGIN.md)** - Troubleshooting login issues

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build           # Build production
npm start               # Start production server

# Database
npm run db:test         # Test database connection
npm run db:export       # Export data untuk migrasi

# Utilities
npm run lint            # Run ESLint
```

## 🎯 Features

### Admin & Teacher
- ✅ Manajemen bank soal (import CSV/ZIP, CRUD)
- ✅ Manajemen ujian (buat, edit, hapus)
- ✅ Manajemen pengguna (admin only)
- ✅ Laporan hasil ujian

### Student
- ✅ Lihat ujian yang tersedia
- ✅ Ikut ujian dengan timer
- ✅ Auto-save jawaban
- ✅ Lihat hasil ujian

## 🔐 Environment Variables

Copy `.env.example` ke `.env.local` dan isi:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres

# JWT
JWT_SECRET=your-secret-key-min-32-chars

# Next.js
NEXT_PUBLIC_API_URL=/api
NODE_ENV=development
```

## 📦 Database Setup

1. Buat project di [Supabase](https://supabase.com)
2. Buka SQL Editor di Supabase Dashboard
3. Run file `frontend/database/database_schema.sql`
4. Copy connection string ke `.env.local`

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### VPS
```bash
# Build
npm run build

# Start with PM2
npm install -g pm2
pm2 start npm --name cbt -- start
```

Detail: Lihat [VPS_MIGRATION.md](docs/VPS_MIGRATION.md)

## 🤝 Contributing

1. Fork repository
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

MIT License - Lihat file LICENSE

## 👥 Author

Kevin Ardhana - [@Kevinardhana096](https://github.com/Kevinardhana096)

## 🙏 Acknowledgments

- Next.js Team
- Supabase Team
- Vercel Platform

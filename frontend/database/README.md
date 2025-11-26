# Database

Folder ini berisi schema dan migration files untuk database PostgreSQL.

## 📋 Files

- **database_schema.sql** - Schema lengkap untuk setup database baru

## 🚀 Setup Database Baru

### Supabase

1. Buka Supabase Dashboard → SQL Editor
2. Copy paste isi `database_schema.sql`
3. Run query
4. Selesai! ✅

### Local PostgreSQL

```bash
# Create database
createdb cbtmatics

# Import schema
psql cbtmatics < database/database_schema.sql
```

### VPS PostgreSQL

```bash
# SSH ke VPS
ssh user@vps-ip

# Create database
sudo -u postgres createdb cbtmatics

# Import schema
psql -U postgres cbtmatics < database_schema.sql
```

## 📊 Schema Overview

Database menggunakan PostgreSQL 15+ dengan tables:

- **users** - User accounts (admin, teacher, student)
- **questions** - Bank soal
- **exams** - Data ujian
- **exam_questions** - Mapping soal ke ujian
- **exam_submissions** - Submission ujian dari student
- **exam_answers** - Jawaban student per soal

## 🔐 Default Accounts

Schema sudah include default accounts:

| Role | Email | Password | Hash |
|------|-------|----------|------|
| Admin | admin@cbt.com | admin123 | bcrypt |
| Teacher | teacher@cbt.com | teacher123 | bcrypt |
| Student | student@cbt.com | student123 | bcrypt |

## 🔄 Migrations

Untuk update schema di production:

1. Backup data dulu: `npm run db:export`
2. Test migration di local/staging
3. Apply di production
4. Verify dengan testing

## ⚠️ Notes

- Schema menggunakan PostgreSQL standard (compatible dengan semua PG 15+)
- Tidak ada dependency khusus Supabase
- Easy migration ke VPS

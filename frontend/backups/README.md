# Backups

Folder ini berisi backup data dari Supabase untuk keperluan migrasi ke VPS.

## 📦 Isi Folder

- **data-export-[DATE].sql** - Export data dari Supabase (users, questions, exams, dll)

## 🔄 Cara Generate Backup Baru

```bash
cd frontend
npm run db:export
```

Atau:

```bash
node scripts/export-supabase-data.js
```

## 📋 Cara Gunakan Backup

### Import ke VPS PostgreSQL

```bash
# SSH ke VPS
ssh user@vps-ip

# Masuk ke PostgreSQL
psql cbtmatics

# Import data
\i /path/to/data-export-2025-11-26.sql
```

### Import ke Local PostgreSQL

```bash
psql -d cbtmatics -f backups/data-export-2025-11-26.sql
```

## ⚠️ Catatan

- Backup otomatis dibuat saat menjalankan `npm run db:export`
- File backup di-gitignore untuk keamanan (kecuali sample)
- Jangan commit backup yang berisi data production/sensitive

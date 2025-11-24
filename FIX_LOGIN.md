# 🔧 Cara Memperbaiki Login Issue

## Langkah 1: Update Password di Supabase

1. Buka **Supabase Dashboard** → https://supabase.com/dashboard
2. Pilih project **CBT System** Anda
3. Klik **SQL Editor** di sidebar kiri
4. Copy paste script ini dan klik **RUN**:

```sql
-- Update passwords untuk semua users
UPDATE users SET password = '$2b$10$Bn4tsmSYDDfDEcB2hPTP7Ol6etfj/3XVWrLS7ArBG.0l1jJPkBnGy' 
WHERE email = 'admin@cbt.com';

UPDATE users SET password = '$2b$10$/e9QJ4Z4m5KVAqzetimXG.BxUXL2xkUVPqyHh5eB3xJBwEnRnU1TC' 
WHERE email = 'teacher@cbt.com';

UPDATE users SET password = '$2b$10$GGHuILXqoxPD/ZbZ4renyewG/ZXiz0lcWG9S29w7/zpzeKZyQwJHW' 
WHERE email = 'student@cbt.com';
```

5. Tunggu sampai ada notifikasi **Success**

## Langkah 2: Verifikasi Update Berhasil

Jalankan query ini di SQL Editor:

```sql
SELECT id, username, email, role, 
       SUBSTRING(password, 1, 20) || '...' as password_preview
FROM users
ORDER BY id;
```

Pastikan kolom `password_preview` menunjukkan hash yang berbeda untuk setiap user (tidak sama semua).

## Langkah 3: Clear Browser Cache

1. Buka **DevTools** (F12 atau Ctrl+Shift+I)
2. Tab **Application** → **Local Storage** → `http://localhost:3000`
3. Klik kanan → **Clear**
4. Refresh halaman (F5)

## Langkah 4: Test Login

### Test Admin:
- Email: `admin@cbt.com`
- Password: `admin123`
- Should redirect to: `/admin/questions`

### Test Teacher:
- Email: `teacher@cbt.com`
- Password: `teacher123`
- Should redirect to: `/admin/questions`

### Test Student:
- Email: `student@cbt.com`
- Password: `student123`
- Should redirect to: `/student/exams`

## Langkah 5: Restart Dev Server

```bash
cd frontend
npm run dev
```

## 🔍 Troubleshooting

### Problem: Masih "Invalid credentials"

**Kemungkinan penyebab:**
1. Password belum terupdate di database
2. JWT_SECRET tidak cocok
3. Bcrypt salt rounds berbeda

**Solusi:**
```bash
# Generate password baru
cd frontend
node scripts/generate-passwords.js

# Copy output SQL dan jalankan di Supabase
```

### Problem: Login berhasil tapi tidak redirect

**Check:**
1. Open DevTools → Console → Cari error
2. Check localStorage: `localStorage.getItem('user')`
3. Pastikan role user benar: `admin`, `teacher`, atau `student`

**Fix:**
```javascript
// Di DevTools Console, jalankan:
localStorage.clear();
location.reload();
```

### Problem: "Unauthorized" setelah login

**Check JWT_SECRET:**
File: `frontend/.env.local`
```env
JWT_SECRET=K8vN2xP9mQ5wR3tY7uZ1aB6cD4eF0gH2iJ8kL5nM7oP9qR3sT6vW
```

Pastikan tidak ada spasi atau karakter tambahan.

### Problem: Student page tidak ditemukan

**Check routing:**
```bash
# Pastikan file ini ada:
frontend/app/(dashboard)/student/exams/page.tsx
```

Jika tidak ada, buat folder dan file dengan struktur yang benar.

## ✅ Verifikasi Lengkap

Setelah semua langkah selesai, test ini harus berhasil:

1. ✅ Admin bisa login dan akses semua menu
2. ✅ Teacher bisa login dan akses questions/exams
3. ✅ Student bisa login dan lihat available exams
4. ✅ Logout berfungsi untuk semua role
5. ✅ Redirect otomatis sesuai role
6. ✅ Protected routes hanya bisa diakses dengan token valid

## 📝 Catatan Penting

- **Password di database HARUS bcrypt hash**, bukan plain text
- **JWT_SECRET harus sama** di semua environment
- **Token expired setelah 24 jam** - user harus login ulang
- **Bcrypt salt rounds = 10** (standar industri)

## 🆘 Masih Bermasalah?

Kirim screenshot dari:
1. Supabase SQL Editor query result dari `SELECT * FROM users;`
2. Browser DevTools → Console (semua error yang muncul)
3. Browser DevTools → Network → Request ke `/api/auth/login` (response body)

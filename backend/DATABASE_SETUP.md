# Setup Database PostgreSQL untuk CBT Application

## Langkah-langkah Setup:

### 1. Pastikan PostgreSQL sudah terinstall dan berjalan

Cek service PostgreSQL:
- Buka Services (tekan `Win + R`, ketik `services.msc`)
- Cari service `postgresql-x64-XX` 
- Pastikan statusnya **Running**

### 2. Jalankan SQL Setup Script

Ada 2 cara:

#### Cara 1: Menggunakan pgAdmin (GUI)
1. Buka **pgAdmin**
2. Connect ke PostgreSQL server (biasanya localhost)
3. Klik kanan pada **PostgreSQL** > pilih **Query Tool**
4. Buka file `setup_database.sql`
5. Klik Execute (F5)

#### Cara 2: Menggunakan Command Line
```bash
# Ganti path sesuai instalasi PostgreSQL Anda
# Contoh untuk PostgreSQL 15:
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -f setup_database.sql

# Atau jika sudah di PATH:
psql -U postgres -f setup_database.sql
```

**Note:** Anda akan diminta password untuk user `postgres`

### 3. Verifikasi Setup

Test koneksi dengan:
```bash
# Ganti path sesuai instalasi PostgreSQL Anda
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U cbt_user -d cbt_db -h localhost

# Atau jika sudah di PATH:
psql -U cbt_user -d cbt_db -h localhost
```

Password: `ji3rj2l;2;lkfop`

Jika berhasil, Anda akan masuk ke psql prompt.

### 4. Jalankan Server

```bash
cd backend
node server.js
```

### 5. Test API

Buka browser atau gunakan curl:
```bash
curl http://localhost:8080/api/test-db
```

Seharusnya return:
```json
{
  "message": "Koneksi ke database berhasil!",
  "data": {
    "current_database": "cbt_db",
    "current_user": "cbt_user",
    "version": "PostgreSQL XX.X ..."
  }
}
```

## Troubleshooting

### Error: "password authentication failed"
- Pastikan user `cbt_user` sudah dibuat
- Pastikan password di `.env` sesuai dengan yang di database
- Coba reset password user:
  ```sql
  ALTER USER cbt_user WITH PASSWORD 'ji3rj2l;2;lkfop';
  ```

### Error: "database does not exist"
- Pastikan database `cbt_db` sudah dibuat
- Jalankan script `setup_database.sql`

### Error: "Connection refused"
- Pastikan PostgreSQL service berjalan
- Cek port 5432 tidak digunakan aplikasi lain
- Pastikan PostgreSQL listen di localhost

## Konfigurasi .env

File `.env` sudah dikonfigurasi dengan:
```
DB_USER=cbt_user
DB_HOST=localhost
DATABASE=cbt_db
DB_PASSWORD=ji3rj2l;2;lkfop
DB_PORT=5432
PORT=8080
```

Jika perlu mengubah, edit file `.env` di folder `backend/`.

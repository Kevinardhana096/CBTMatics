# 🎯 QUICK START - Import Soal dengan Gambar

## Langkah Cepat (5 Menit)

### 1. Download Template & Gambar
Anda sudah punya file-file ini di `backend/templates/` dan `backend/uploads/questions/`:
- ✅ `soal_dengan_gambar.csv` (template CSV)
- ✅ `diagram.png` (contoh gambar)

### 2. Buat File ZIP

**Cara Manual (Windows):**
1. Buka folder `backend/templates/`
2. Copy file `soal_dengan_gambar.csv` ke Desktop
3. Buka folder `backend/uploads/questions/`
4. Copy file `diagram.png` ke Desktop (folder yang sama dengan CSV)
5. Pilih kedua file (`soal_dengan_gambar.csv` dan `diagram.png`)
6. Klik kanan → **Send to** → **Compressed (zipped) folder**
7. Rename menjadi `soal-contoh.zip`

**Struktur ZIP yang benar:**
```
soal-contoh.zip
├── soal_dengan_gambar.csv    ← File CSV
└── diagram.png                ← Gambar
```

**❌ SALAH - Jangan seperti ini:**
```
soal-contoh.zip
└── folder/
    ├── soal_dengan_gambar.csv
    └── diagram.png
```

### 3. Upload di Aplikasi

1. Buka browser ke `http://localhost:3000`
2. Login sebagai Admin
3. Menu **Bank Soal** → **Buat Soal Baru**
4. Klik tombol hijau **"Import dari File"**
5. Drag & drop file `soal-contoh.zip` ATAU klik untuk browse
6. Tunggu hingga muncul pesan sukses
7. Klik **"Kembali ke Bank Soal"**

### 4. Lihat Hasilnya

1. Di halaman Bank Soal, Anda akan melihat 2 soal baru
2. Klik **Preview** pada soal pertama
3. Gambar diagram.png akan muncul di atas teks soal! 🎉

---

## 📋 Isi Template

File `soal_dengan_gambar.csv` berisi 2 soal:

**Soal 1:** Dengan gambar `diagram.png`
```
Perhatikan diagram berikut. Berapakah luas dari bangun datar tersebut?
A. 12 cm²
B. 24 cm²    ← Jawaban benar
C. 36 cm²
D. 48 cm²
```

**Soal 2:** Tanpa gambar (teks biasa)
```
Berapa hasil dari 5 + 3?
A. 6
B. 7
C. 8    ← Jawaban benar
D. 9
```

---

## ✅ Verifikasi Server

Sebelum upload, pastikan:

1. **Backend berjalan:**
   ```bash
   # Di terminal backend:
   cd c:/cbt/backend
   npm start
   
   # Harus muncul:
   # 🚀 CBT Server running on port 8080
   ```

2. **Gambar bisa diakses:**
   Buka di browser: `http://localhost:8080/uploads/questions/diagram.png`
   - ✅ Jika muncul gambar = OK
   - ❌ Jika 404 = Backend belum running atau folder kosong

3. **Frontend berjalan:**
   ```bash
   # Di terminal frontend:
   cd c:/cbt/frontend
   npm run dev
   
   # Buka: http://localhost:3000
   ```

---

## 🐛 Masalah Umum

### "Gagal mengimport soal"
- ❌ File ZIP corrupt atau format salah
- ✅ Pastikan struktur ZIP benar (file langsung di root, tidak dalam folder)

### "Soal berhasil diimport tapi gambar tidak muncul"
- ❌ Nama file di CSV tidak sama dengan nama file gambar (case-sensitive!)
- ❌ File gambar tidak ada di ZIP
- ✅ Cek nama file: `diagram.png` ≠ `Diagram.png` ≠ `diagram.PNG`

### Gambar muncul di Preview tapi tidak di Simulasi
- ❌ Frontend tidak menggunakan komponen LatexRenderer
- ✅ Sudah diperbaiki - semua halaman sekarang pakai LatexRenderer

---

## 📞 Butuh Bantuan?

1. **Cek log backend:**
   ```bash
   # Di terminal backend, lihat output saat upload
   # Akan muncul: "Extracted image: diagram.png"
   ```

2. **Cek browser console (F12):**
   - Lihat tab Network untuk melihat request gambar
   - Lihat tab Console untuk error messages

3. **Cek folder uploads:**
   ```bash
   ls backend/uploads/questions/
   # Harus ada: diagram.png
   ```

---

**Selamat mencoba! Jika ada kendala, screenshot error dan tanyakan lagi. 🚀**

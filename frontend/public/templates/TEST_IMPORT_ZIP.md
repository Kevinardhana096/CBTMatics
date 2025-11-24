# ⚡ TESTING IMPORT ZIP - LANGKAH MUDAH

## 🎯 Persiapan Cepat

### 1. Pastikan Server Running

**Terminal Backend:**
```bash
cd c:/cbt/backend
npm start
```

Tunggu sampai muncul: `🚀 CBT Server running on port 8080`

**Terminal Frontend:**
```bash
cd c:/cbt/frontend
npm run dev
```

Buka browser: `http://localhost:3000`

---

## 📦 Cara Buat ZIP yang Benar

### Langkah 1: Siapkan File

1. Buka folder Desktop (atau folder mana saja)
2. Copy file ini dari `c:\cbt\backend\templates\soal_dengan_gambar.csv` ke Desktop
3. Copy file ini dari `c:\cbt\backend\uploads\questions\diagram.png` ke Desktop

**Desktop sekarang berisi:**
```
Desktop/
├── soal_dengan_gambar.csv
└── diagram.png
```

### Langkah 2: Buat ZIP (Windows)

**PENTING:** Jangan zip foldernya, tapi zip file-nya langsung!

✅ **CARA BENAR:**
1. Di Desktop, pilih **HANYA KEDUA FILE** (bukan folder!)
2. Klik kanan pada salah satu file yang dipilih
3. Pilih **Send to → Compressed (zipped) folder**
4. Windows akan buat file bernama `soal_dengan_gambar.zip`
5. Rename menjadi `test-soal.zip`

**Struktur ZIP yang benar:**
```
test-soal.zip
├── soal_dengan_gambar.csv    ← File langsung di root ZIP
└── diagram.png                ← File langsung di root ZIP
```

❌ **CARA SALAH (Jangan seperti ini!):**
```
test-soal.zip
└── New folder/                ← Ada folder di dalam!
    ├── soal_dengan_gambar.csv
    └── diagram.png
```

### Cara Verifikasi ZIP Benar:

1. Klik kanan file `test-soal.zip`
2. Pilih **Extract All** atau **Open with → File Explorer**
3. Anda harus langsung melihat `soal_dengan_gambar.csv` dan `diagram.png`
4. TIDAK boleh ada folder tambahan!

---

## 🚀 Upload & Test

### 1. Buka Aplikasi
- Browser: `http://localhost:3000`
- Login sebagai Admin

### 2. Import Soal
1. Menu **Bank Soal** → **Buat Soal Baru**
2. Klik tombol hijau **"Import dari File"**
3. Klik area upload atau drag & drop file `test-soal.zip`
4. Tunggu proses selesai

### 3. Cek Console Backend

Di terminal backend, Anda akan melihat:
```
ZIP contains 2 entries
Processing entry: soal_dengan_gambar.csv (basename: soal_dengan_gambar.csv)
Processing entry: diagram.png (basename: diagram.png)
✓ Extracted image: diagram.png (36068 bytes)
Extracted 1 images from ZIP
Found CSV file: soal_dengan_gambar.csv
CSV Headers: [....]
✓ Added image to question: diagram.png
✓ Processed 2 questions from ZIP with 1 images
```

### 4. Verifikasi Import Berhasil

Anda akan melihat popup hijau:
```
✓ Berhasil: 2 soal
Total: 2 baris
Mengalihkan ke daftar soal...
```

### 5. Lihat Hasilnya

1. Otomatis redirect ke **Bank Soal**
2. Cari soal: "Perhatikan diagram berikut"
3. Klik **Preview**
4. **Gambar diagram.png akan muncul!** 🎉

---

## 🐛 Troubleshooting

### Error: "Unsupported ZIP file"

**Penyebab:** ZIP dibuat dengan cara yang salah atau corrupt

**Solusi:**
1. Hapus file ZIP lama
2. Ikuti **CARA BENAR** di atas
3. Pastikan tidak ada folder di dalam ZIP
4. Gunakan Windows Explorer bawaan (jangan 7-Zip atau WinRAR untuk test ini)

### Error: "No CSV file found in ZIP"

**Penyebab:** File CSV ada di dalam folder, bukan di root ZIP

**Solusi:**
1. Extract ZIP Anda
2. Pastikan file `soal_dengan_gambar.csv` langsung terlihat (tidak dalam folder)
3. Buat ulang ZIP dengan memilih file langsung, bukan foldernya

### Error: "File ZIP kosong"

**Penyebab:** Proses ZIP gagal atau file corrupt

**Solusi:**
1. Hapus file ZIP
2. Restart Windows Explorer (Ctrl+Shift+Esc → File Explorer → Restart)
3. Buat ZIP lagi

### Gambar tidak muncul setelah import berhasil

**Cek:**
1. Browser console (F12) → Tab Network
2. Cari request ke `/uploads/questions/diagram.png`
3. Jika 404: File tidak terekstrak, cek log backend
4. Jika 200: Gambar ada, mungkin masalah CSS/rendering

**Solusi:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Cek folder `c:\cbt\backend\uploads\questions\` - apakah ada `diagram.png`?
3. Buka langsung: `http://localhost:8080/uploads/questions/diagram.png`

---

## 📝 Alternatif: Menggunakan PowerShell

Jika cara manual tidak berhasil, gunakan PowerShell:

```powershell
# Buka PowerShell di folder yang berisi file CSV dan PNG
cd Desktop

# Buat ZIP
Compress-Archive -Path soal_dengan_gambar.csv, diagram.png -DestinationPath test-soal.zip -Force

# Verifikasi isi ZIP
Expand-Archive -Path test-soal.zip -DestinationPath temp-check -Force
dir temp-check
```

Anda harus melihat file langsung, tanpa folder tambahan.

---

## ✅ Checklist Sebelum Upload

- [ ] Backend running di port 8080
- [ ] Frontend running di port 3000
- [ ] File CSV ada dan valid
- [ ] File gambar ada (PNG/JPG)
- [ ] ZIP dibuat dengan memilih file langsung (bukan folder)
- [ ] Verifikasi: Extract ZIP dan lihat file langsung terlihat
- [ ] Login sebagai Admin
- [ ] Ready to upload!

---

**Semoga berhasil! 🚀 Kalau masih error, screenshot error message nya ya!**

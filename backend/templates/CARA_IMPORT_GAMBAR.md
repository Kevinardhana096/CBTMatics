# 📸 Cara Import Soal dengan Gambar

## Langkah-Langkah Import

### 1️⃣ Persiapkan File

Buat folder baru dan siapkan file-file berikut:

```
my-questions/
├── soal_dengan_gambar.csv
└── diagram.png
└── grafik.png
└── (gambar lainnya...)
```

### 2️⃣ Format CSV

File CSV harus memiliki kolom berikut:

```csv
question_text,question_type,option_a,option_b,option_c,option_d,correct_answer,subject,difficulty,points,image,option_a_image,option_b_image,option_c_image,option_d_image
```

**Contoh isi:**
```csv
"Perhatikan diagram berikut. Berapakah luasnya?",multiple_choice,12 cm²,24 cm²,36 cm²,48 cm²,B,Matematika,medium,15,diagram.png,,,,
"Identifikasi bentuk ini:",multiple_choice,Persegi,Segitiga,Lingkaran,Trapesium,A,Geometri,easy,10,,persegi.png,segitiga.png,lingkaran.png,trapesium.png
```

**Penjelasan Kolom Gambar:**
- `image` - Gambar untuk pertanyaan/soal
- `option_a_image` - Gambar untuk pilihan A
- `option_b_image` - Gambar untuk pilihan B
- `option_c_image` - Gambar untuk pilihan C
- `option_d_image` - Gambar untuk pilihan D

**Catatan:** Kosongkan kolom jika tidak ada gambar (tulis `,,` atau biarkan kosong)

### 3️⃣ Buat File ZIP

**Windows:**
1. Pilih semua file (CSV + gambar)
2. Klik kanan → Send to → Compressed (zipped) folder
3. Rename menjadi `soal-matematika.zip`

**Mac/Linux:**
```bash
zip soal-matematika.zip soal_dengan_gambar.csv diagram.png grafik.png
```

### 4️⃣ Upload di Aplikasi

1. Buka halaman **Admin → Bank Soal → Buat Soal Baru**
2. Klik tombol **"Import dari File"**
3. Klik **"Download Template Matematika"** untuk template contoh
4. Klik area upload atau drag & drop file ZIP Anda
5. Tunggu proses upload selesai
6. Lihat hasil import

### 5️⃣ Verifikasi

Setelah import berhasil:
- Buka halaman **Daftar Soal**
- Klik **Preview** pada soal yang diimport
- Pastikan gambar muncul dengan benar

---

## 📝 Tips & Trik

### ✅ DO's

- **Gunakan format gambar standar:** JPG, PNG, GIF, SVG
- **Ukuran file wajar:** Maksimal 1MB per gambar
- **Nama file sederhana:** `diagram.png`, `grafik1.png` (hindari spasi dan karakter khusus)
- **Pastikan nama file di CSV sama persis** dengan nama file gambar (case-sensitive!)

### ❌ DON'Ts

- ❌ Jangan gunakan nama file dengan spasi: `diagram ujian.png`
- ❌ Jangan gunakan karakter khusus: `grafik@#$%.png`
- ❌ Jangan upload gambar terlalu besar (>5MB)
- ❌ Jangan lupa extension file: tulis `diagram.png`, bukan `diagram`

---

## 🐛 Troubleshooting

### Gambar Tidak Muncul?

**Cek hal-hal berikut:**

1. **Nama file di CSV cocok dengan file gambar?**
   ```csv
   # Di CSV: diagram.png
   # File di ZIP: diagram.png ✅
   
   # Di CSV: Diagram.PNG
   # File di ZIP: diagram.png ❌ (beda huruf besar/kecil)
   ```

2. **File benar-benar ada di ZIP?**
   - Buka file ZIP dan pastikan semua gambar ada di dalamnya
   - Pastikan tidak ada folder di dalam ZIP, semua file harus di root

3. **Format gambar didukung?**
   - Gunakan: `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`
   - Hindari: `.bmp`, `.webp`, `.tiff`

4. **Server backend berjalan?**
   - Pastikan backend running di `http://localhost:8080`
   - Cek folder `backend/uploads/questions/` untuk melihat gambar yang sudah diupload

5. **Path gambar benar?**
   - Setelah import, gambar akan diakses via: `http://localhost:8080/uploads/questions/diagram.png`
   - Buka URL tersebut di browser untuk memverifikasi

### Masih Error?

Buka **Console Browser** (F12) dan lihat error yang muncul:
- `404 Not Found` = File gambar tidak ditemukan
- `403 Forbidden` = Permission error
- `CORS Error` = Backend tidak mengizinkan request dari frontend

---

## 🎯 Contoh Lengkap

### File: `soal_matematika.csv`
```csv
question_text,question_type,option_a,option_b,option_c,option_d,correct_answer,subject,difficulty,points,image
"Perhatikan diagram berikut. Berapakah luasnya?",multiple_choice,12 cm²,24 cm²,36 cm²,48 cm²,B,Matematika,medium,15,diagram.png
"Berapakah hasil dari $2 + 2$?",multiple_choice,2,3,4,5,C,Matematika,easy,10,
```

### Struktur ZIP:
```
soal_matematika.zip
├── soal_matematika.csv
└── diagram.png
```

### Hasil setelah import:
- Soal 1: Muncul dengan gambar diagram.png
- Soal 2: Muncul tanpa gambar (hanya teks dengan LaTeX)

---

## 🔗 Sumber Daya Tambahan

- Template CSV: `/backend/templates/soal_dengan_gambar.csv`
- Dokumentasi API: `http://localhost:8080/api`
- Folder Upload: `/backend/uploads/questions/`

---

**Happy importing! 🚀**

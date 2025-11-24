# Import Soal dengan Gambar menggunakan ZIP

## Format File

Untuk mengimport soal yang mengandung gambar, gunakan file **ZIP** dengan struktur berikut:

```
soal_dengan_gambar.zip
├── soal.csv              # File CSV dengan data soal
└── images/               # Folder berisi gambar
    ├── segitiga.png
    ├── grafik_fungsi.png
    ├── persegi.png
    ├── lingkaran.png
    └── ...
```

## Format CSV

File CSV harus memiliki kolom berikut:

### Kolom Wajib:
- `question_text` - Teks pertanyaan
- `question_type` - Tipe soal (multiple_choice, true_false, essay)
- `correct_answer` - Jawaban benar
- `subject` - Mata pelajaran
- `difficulty` - Tingkat kesulitan (easy, medium, hard)
- `points` - Poin soal

### Kolom Opsional untuk Gambar:
- `image` - Nama file gambar untuk soal utama (misal: `segitiga.png`)
- `option_a`, `option_b`, `option_c`, `option_d` - Teks pilihan jawaban
- `option_a_image`, `option_b_image`, `option_c_image`, `option_d_image` - Nama file gambar untuk setiap opsi

## Contoh CSV

```csv
question_text,question_type,option_a,option_b,option_c,option_d,correct_answer,subject,difficulty,points,image,option_a_image,option_b_image
"Perhatikan diagram. Berapa luasnya?",multiple_choice,12,24,36,48,B,Matematika,medium,15,segitiga.png,,
"Pilih bangun persegi:",multiple_choice,Opsi A,Opsi B,Opsi C,Opsi D,A,Matematika,easy,10,,persegi.png,segitiga.png
```

## Cara Menggunakan

### 1. Siapkan File CSV
Buat file CSV dengan format di atas. Kolom `image` dan `option_X_image` berisi **nama file** gambar (bukan path lengkap).

### 2. Siapkan Gambar
- Buat folder `images/` atau langsung taruh gambar di root ZIP
- Gambar bisa format: JPG, JPEG, PNG, GIF, SVG
- Ukuran gambar akan otomatis di-resize di frontend

### 3. Buat File ZIP
Compress file CSV dan folder images menjadi ZIP:
```
- Pilih soal.csv dan folder images
- Klik kanan → Send to → Compressed (zipped) folder
- Atau gunakan 7-Zip/WinRAR
```

### 4. Upload di CBT System
1. Buka menu **Bank Soal** → **Tambah Soal**
2. Klik **Import dari File**
3. Upload file ZIP Anda
4. Sistem akan otomatis:
   - Extract gambar ke `uploads/questions/`
   - Parse CSV
   - Insert `<img>` tag ke question_text
   - Simpan ke database

## Tips & Trik

### Penamaan File Gambar
- Gunakan nama yang descriptive: `segitiga.png`, `grafik_sinus.jpg`
- Hindari spasi, gunakan underscore: `soal_1.png` bukan `soal 1.png`
- Huruf kecil semua untuk konsistensi

### Ukuran Gambar
- Rekomendasi: 800x600px untuk gambar soal
- Rekomendasi: 400x300px untuk gambar opsi
- Max file size ZIP: 5MB

### Kualitas Gambar
- Format PNG untuk diagram/grafik (transparency support)
- Format JPG untuk foto
- Compress gambar sebelum upload (gunakan TinyPNG/ImageOptim)

### Multiple Images
Satu soal bisa punya:
- 1 gambar utama di pertanyaan (`image`)
- 4-5 gambar di setiap opsi (`option_a_image`, etc.)

## Contoh Template

Lihat file: `soal_dengan_gambar.csv` dan `soal_dengan_gambar_template.zip`

## Troubleshooting

### Gambar tidak muncul
- Pastikan nama file di CSV **exact match** dengan nama file gambar
- Check case sensitivity: `Image.png` ≠ `image.png`

### ZIP upload gagal
- Check ukuran file < 5MB
- Pastikan ada file CSV di dalam ZIP
- Pastikan struktur folder benar

### Gambar terlalu besar
- Sistem akan render dengan `max-width: 100%`
- Tapi lebih baik resize sebelum upload untuk performa

## Format Alternatif (Tanpa ZIP)

Jika tidak ada gambar, tetap bisa pakai CSV/Excel biasa:
- Upload langsung file .csv atau .xlsx
- Tidak perlu ZIP
- Support HTML tag: `<img src="https://..."/>`

## Support

Jika ada masalah, hubungi admin atau check console browser (F12) untuk error details.

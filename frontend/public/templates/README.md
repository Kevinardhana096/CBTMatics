# Template Import Soal

Folder ini berisi template file CSV untuk import soal ke dalam sistem CBT.

## 📋 Template Yang Tersedia

### 1. template_soal.csv
Template dasar untuk import soal dengan field minimal.

**Kolom:**
- `question_text` - Teks soal (wajib)
- `question_type` - Tipe soal: multiple_choice, true_false, essay (wajib)
- `subject` - Mata pelajaran (wajib)
- `difficulty` - Tingkat kesulitan: easy, medium, hard (wajib)
- `points` - Nilai/poin soal (wajib)
- `correct_answer` - Jawaban benar (wajib)
- `option_a` - Pilihan A
- `option_b` - Pilihan B
- `option_c` - Pilihan C
- `option_d` - Pilihan D
- `option_e` - Pilihan E

### 2. template_soal_lengkap.csv
Template lengkap dengan semua field yang tersedia.

**Kolom tambahan:**
- `explanation` - Penjelasan/pembahasan soal
- `tags` - Tag untuk kategorisasi (pisahkan dengan koma)
- `created_by` - Pembuat soal

### 3. template_soal_matematika.csv
Template khusus untuk soal matematika dengan contoh formatting.

**Fitur:**
- Contoh penulisan rumus matematika
- Format untuk simbol khusus
- Tips menulis soal matematika

### 4. README_TEMPLATE_MATEMATIKA.md
Panduan lengkap untuk membuat soal matematika dengan dukungan LaTeX/KaTeX.

## 🎯 Cara Menggunakan

### 1. Download Template
Pilih template yang sesuai dengan kebutuhan Anda.

### 2. Isi Data Soal
Buka file CSV dengan Excel, Google Sheets, atau text editor.
Isi data soal sesuai dengan format yang sudah ditentukan.

**Penting:**
- Jangan mengubah nama kolom header
- Pastikan semua field wajib terisi
- Gunakan format yang benar untuk setiap tipe data

### 3. Import ke Sistem
1. Login sebagai admin atau teacher
2. Buka menu **Bank Soal**
3. Klik tombol **Import CSV**
4. Upload file CSV Anda
5. Sistem akan memvalidasi dan mengimport soal

## 📝 Format Soal

### Multiple Choice (Pilihan Ganda)
```csv
question_text,question_type,subject,difficulty,points,correct_answer,option_a,option_b,option_c,option_d,option_e
"Apa ibu kota Indonesia?",multiple_choice,Geografi,easy,10,A,Jakarta,Bandung,Surabaya,Medan,Bali
```

### True/False (Benar/Salah)
```csv
question_text,question_type,subject,difficulty,points,correct_answer,option_a,option_b
"Bumi berbentuk bulat",true_false,IPA,easy,5,A,Benar,Salah
```

### Essay
```csv
question_text,question_type,subject,difficulty,points,correct_answer
"Jelaskan proses fotosintesis",essay,Biologi,medium,20,"Fotosintesis adalah proses..."
```

## 💡 Tips & Best Practices

### 1. Penulisan Soal
- Gunakan bahasa yang jelas dan mudah dipahami
- Hindari double negative
- Pastikan hanya ada satu jawaban yang benar
- Buat distractor (pilihan salah) yang masuk akal

### 2. Formatting
- Untuk teks panjang, gunakan tanda kutip ganda: "teks panjang"
- Untuk enter/newline dalam cell, gunakan tag `<br>` atau `\n`
- Untuk tanda kutip dalam teks, gunakan escape: `\"`

### 3. Soal Matematika
- Gunakan simbol Unicode untuk karakter khusus: ², ³, √, π, ∑
- Atau gunakan LaTeX syntax: `$x^2 + y^2 = r^2$`
- Lihat README_TEMPLATE_MATEMATIKA.md untuk detail lengkap

### 4. Validasi Data
- Pastikan `question_type` sesuai: multiple_choice, true_false, essay
- Pastikan `difficulty` sesuai: easy, medium, hard
- Pastikan `correct_answer` untuk multiple choice: A, B, C, D, atau E
- Pastikan `correct_answer` untuk true_false: A (Benar) atau B (Salah)
- Untuk essay, isi `correct_answer` dengan kunci jawaban atau rubrik penilaian

### 5. Encoding File
- Simpan file CSV dengan encoding UTF-8 untuk mendukung karakter khusus
- Di Excel: Save As → More Options → Tools → Web Options → Encoding → UTF-8

## ⚠️ Common Errors

### Error: "Invalid question_type"
**Solusi:** Pastikan nilai question_type adalah: multiple_choice, true_false, atau essay (lowercase)

### Error: "Missing required field"
**Solusi:** Pastikan semua kolom wajib terisi (question_text, question_type, subject, difficulty, points, correct_answer)

### Error: "Invalid correct_answer"
**Solusi:** 
- Multiple choice: Gunakan A, B, C, D, atau E (uppercase)
- True/False: Gunakan A (Benar) atau B (Salah)

### Error: "Options required for multiple_choice"
**Solusi:** Soal pilihan ganda minimal harus memiliki option_a, option_b, option_c, option_d

## 📞 Bantuan

Jika mengalami kesulitan dalam import soal:
1. Periksa format file CSV
2. Validasi data menggunakan template yang disediakan
3. Hubungi administrator sistem

## 🔄 Update Template

Template ini akan diupdate sesuai dengan perkembangan fitur sistem.
Selalu gunakan template terbaru untuk hasil import yang optimal.

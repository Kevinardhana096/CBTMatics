# Template Import Soal - Mata Pelajaran Matematika

## 📋 Panduan Penggunaan

File ini berisi template untuk import soal pilihan ganda ke sistem CBT dengan fokus pada mata pelajaran:
1. **Kombinatorika**
2. **Struktur Aljabar**
3. **Aljabar Linear**
4. **Analisis Kompleks**
5. **Analisis Riil**

---

## 📂 Format File

### **CSV Format:**
```
question_text,question_type,options,correct_answer,subject,difficulty,points
```

### **Kolom:**
1. **question_text** - Teks soal (bisa dengan HTML untuk gambar)
2. **question_type** - Tipe soal: `multiple_choice`
3. **options** - Pilihan jawaban (pisahkan dengan `|`)
4. **correct_answer** - Jawaban benar: `A`, `B`, `C`, atau `D`
5. **subject** - Mata pelajaran
6. **difficulty** - Tingkat kesulitan: `easy`, `medium`, `hard`
7. **points** - Poin per soal (10, 15, 20, 25)

---

## 🖼️ Cara Menambah Gambar

### **Format HTML untuk gambar:**
```html
<p>Pertanyaan Anda di sini</p>
<img src="data:image/png;base64,BASE64_STRING_HERE" alt="deskripsi" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 4px;"/>
<p>Lanjutan pertanyaan</p>
```

### **Cara Convert Gambar ke Base64:**

#### **Online:**
1. Buka: https://www.base64-image.de/
2. Upload gambar Anda
3. Copy hasil Base64
4. Paste ke dalam tag `<img src="data:image/png;base64,PASTE_HERE">`

#### **Command Line (Linux/Mac):**
```bash
base64 -i gambar.png | tr -d '\n' > output.txt
```

#### **PowerShell (Windows):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("gambar.png"))
```

---

## 📊 Contoh Soal

### **1. Soal Tanpa Gambar:**
```csv
"Berapa banyak cara menyusun 5 orang dalam satu barisan?",multiple_choice,"120|720|24|5040",A,Kombinatorika,easy,10
```

### **2. Soal Dengan Gambar:**
```csv
"<p>Perhatikan diagram berikut:</p><img src='data:image/png;base64,iVBORw0...' alt='diagram'/><p>Berapa banyak jalur dari A ke B?</p>",multiple_choice,"8|12|16|10",C,Kombinatorika,hard,20
```

### **3. Soal Dengan Formula (HTML):**
```csv
"<p>Hitung lim<sub>x→0</sub> sin(x)/x:</p>",multiple_choice,"1|0|∞|Tidak ada",A,Analisis Riil,easy,10
```

---

## 📁 Files

### **File CSV Template:**
- `template_soal_matematika.csv` - Ready to import!

### **Isi Template:**
- ✅ **30 soal** pilihan ganda
- ✅ **5 mata pelajaran** matematika
- ✅ Mix soal **dengan dan tanpa gambar**
- ✅ **3 tingkat kesulitan**: easy, medium, hard
- ✅ **Variasi poin**: 10, 15, 20, 25

---

## 🎯 Mata Pelajaran

### **1. Kombinatorika (6 soal)**
- Permutasi dan kombinasi
- Teori counting
- Probabilitas dasar
- Diagram pohon

### **2. Struktur Aljabar (5 soal)**
- Grup dan subgrup
- Ring dan field
- Teorema Lagrange
- Integral domain

### **3. Aljabar Linear (6 soal)**
- Matriks dan determinan
- Vektor dan dot product
- Eigenvalue dan eigenvector
- Diagonalisasi

### **4. Analisis Kompleks (5 soal)**
- Fungsi analitik
- Teorema Cauchy
- Residu
- Integral kontur

### **5. Analisis Riil (8 soal)**
- Limit dan kontinuitas
- Deret konvergen
- Teorema Bolzano-Weierstrass
- Uniform continuity

---

## 🚀 Cara Import

### **Via Web Interface:**
1. Login sebagai Admin/Teacher
2. Buka **Admin → Questions → Create**
3. Klik tombol **"Import dari File"**
4. Upload file `template_soal_matematika.csv`
5. Tunggu proses import selesai
6. Cek hasil import (success/failed)

### **Via cURL (API):**
```bash
curl -X POST http://localhost:8080/api/questions/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@template_soal_matematika.csv"
```

---

## ⚠️ Catatan Penting

1. **Encoding:** Pastikan file CSV dalam format UTF-8
2. **Quote:** Gunakan double quote `"` untuk text yang mengandung koma
3. **Options:** Pisahkan dengan `|` (pipe), bukan koma
4. **HTML:** Valid HTML untuk gambar dan formatting
5. **Base64:** Compress gambar dulu sebelum convert ke Base64
6. **Size:** Maksimal 5MB per file CSV

---

## 🐛 Troubleshooting

### **Error: "Invalid options format"**
- Pastikan options dipisah dengan `|`
- Gunakan format: `"pilihan A|pilihan B|pilihan C|pilihan D"`

### **Error: "Image too large"**
- Compress gambar terlebih dahulu
- Maksimal resolusi gambar: 800px width
- Format recommended: PNG atau JPEG
- Quality: 80-90%

### **Error: "Failed to parse CSV"**
- Pastikan encoding UTF-8
- Check quote marks (harus double quote `"`)
- Hapus line breaks dalam cell

---

## 📞 Support

Jika ada masalah saat import:
1. Check error details di response import
2. Verify format CSV sesuai template
3. Test dengan 1-2 soal dulu sebelum import semua
4. Check console backend untuk error detail

---

**File Template:** `template_soal_matematika.csv`  
**Total Soal:** 30 soal pilihan ganda  
**Format:** CSV (UTF-8)  
**Ready to Import:** ✅

---

**Last Updated:** November 8, 2025

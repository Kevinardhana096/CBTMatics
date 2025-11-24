# 🐛 Debug Login Errors - Step by Step

## Sekarang Error Message Terlihat!

Perubahan yang sudah dilakukan:
- ✅ Error message **TIDAK** otomatis hilang
- ✅ Console logging lengkap untuk debugging
- ✅ Loading state tidak block error display
- ✅ Error box lebih prominent dengan border merah

## Cara Melihat Error Detail

### 1. **Di Browser UI**
Ketika login gagal, akan muncul kotak merah dengan:
- ❌ Icon error
- **"Login Gagal"** (bold text)
- Pesan error dari server
- Petunjuk: "Check console (F12) untuk detail error"

**Error box akan tetap tampil** sampai Anda submit form lagi.

### 2. **Di Console (F12)**
Buka DevTools dengan:
- Windows/Linux: `F12` atau `Ctrl + Shift + I`
- Mac: `Cmd + Option + I`

Anda akan melihat log seperti ini:

#### Jika Login Gagal:
```
=== Starting login process ===
Email: student@cbt.com
Login attempt: {email: "student@cbt.com"}
Login error in hook: Error: Invalid credentials
Error response: {error: "Invalid credentials"}
=== Login failed ===
Error object: Error: Invalid credentials
Error message: Invalid credentials
Error displayed: Invalid credentials
```

#### Jika Login Berhasil:
```
=== Starting login process ===
Email: student@cbt.com
Login attempt: {email: "student@cbt.com"}
Login response: {message: "Login successful", token: "eyJ...", user: {...}}
User logged in: {id: 3, username: "student1", email: "student@cbt.com", role: "student"}
=== Login successful ===
```

## Common Error Messages & Solutions

### ❌ "Invalid credentials"
**Penyebab:**
- Email atau password salah
- Password di database belum diupdate ke bcrypt hash yang benar

**Solusi:**
1. Pastikan Anda sudah run `fix_passwords.sql` di Supabase
2. Cek password hash di database:
   ```sql
   SELECT email, SUBSTRING(password, 1, 30) FROM users;
   ```
   Harus mulai dengan `$2b$10$` (bukan `$2b$10$YourHashedPasswordHere`)

### ❌ "Login failed"
**Penyebab:**
- Server error (500)
- Database connection issue
- API endpoint tidak ditemukan

**Solusi:**
1. Check server logs di terminal tempat `npm run dev` jalan
2. Pastikan server running di `http://localhost:3000`
3. Test API dengan curl:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"student@cbt.com","password":"student123"}'
   ```

### ❌ "Network Error" atau "Failed to fetch"
**Penyebab:**
- Server tidak jalan
- CORS issue
- Port 3000 sudah dipakai

**Solusi:**
```bash
# Restart dev server
cd frontend
npm run dev

# Check port 3000 tidak dipakai
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux
```

### ❌ Error tidak muncul, page langsung reload
**Ini sudah diperbaiki!** Tapi jika masih terjadi:
1. Clear browser cache: `Ctrl + Shift + Delete`
2. Hard reload: `Ctrl + F5`
3. Clear localStorage di DevTools → Application → Local Storage

## Debug Checklist

Ketika login gagal, cek hal-hal ini:

### 1. Check Console Output
```
F12 → Console Tab
```
- [ ] Ada log `=== Starting login process ===`?
- [ ] Ada log `Login attempt: {...}`?
- [ ] Ada log `Login error in hook:`?
- [ ] Apa isi `Error response:`?

### 2. Check Network Tab
```
F12 → Network Tab → Filter: Fetch/XHR
```
- [ ] Ada request ke `/api/auth/login`?
- [ ] Status code berapa? (200 = OK, 401 = Wrong credentials, 500 = Server error)
- [ ] Apa isi Response body?

### 3. Check localStorage
```
F12 → Application → Local Storage → http://localhost:3000
```
- [ ] Ada key `token`?
- [ ] Ada key `user`?
- [ ] Jika ya, clear dulu sebelum test login lagi

### 4. Check Database
Di Supabase SQL Editor:
```sql
-- Check user exists
SELECT * FROM users WHERE email = 'student@cbt.com';

-- Check password hash format
SELECT email, 
       SUBSTRING(password, 1, 7) as prefix,
       LENGTH(password) as hash_length 
FROM users;
```

Expected:
- prefix: `$2b$10$`
- hash_length: 60

## Testing After Fix

### Test 1: Wrong Password
```
Email: student@cbt.com
Password: wrongpassword
```
**Expected:**
- Error box muncul: "Invalid credentials"
- Console log: "Login error in hook"
- Error box **tidak hilang**

### Test 2: User Not Exist
```
Email: notexist@cbt.com
Password: anything
```
**Expected:**
- Error box: "Invalid credentials"
- Console log similar to Test 1

### Test 3: Correct Credentials
```
Email: student@cbt.com
Password: student123
```
**Expected:**
- Console: "=== Login successful ==="
- Redirect ke `/student/exams`
- Token tersimpan di localStorage

## Advanced Debugging

### Check JWT Token Validity
Jika berhasil login tapi masih unauthorized:

```javascript
// Di Console DevTools
const token = localStorage.getItem('token');
console.log('Token:', token);

// Decode JWT (without verification)
const base64Url = token.split('.')[1];
const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
const payload = JSON.parse(window.atob(base64));
console.log('Decoded payload:', payload);
console.log('Token expires:', new Date(payload.exp * 1000));
```

### Test API Directly
```bash
# Get token first
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@cbt.com","password":"student123"}' \
  | jq -r '.token')

echo "Token: $TOKEN"

# Test protected endpoint
curl -X GET http://localhost:3000/api/exams/available \
  -H "Authorization: Bearer $TOKEN"
```

## Still Having Issues?

Kirim screenshot dari:
1. **Error box** di halaman login
2. **Console logs** (F12 → Console) - semua output merah
3. **Network tab** (F12 → Network) - klik request `/api/auth/login` → Response
4. **Database query** hasil dari:
   ```sql
   SELECT id, email, role, SUBSTRING(password, 1, 30) as pwd FROM users;
   ```

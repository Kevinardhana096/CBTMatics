# 🔄 Fix Redirect Loop - Student Dashboard

## Masalah yang Diperbaiki

✅ **Student page redirect kembali ke login** - Sudah diperbaiki dengan:
1. Auth loading state check yang lebih baik
2. Prevent multiple redirects dengan dependency yang tepat
3. Loading screen saat check authentication
4. Console logging untuk debug

## Testing Login Flow

### Step 1: Clear Browser Data
```javascript
// Buka DevTools (F12) → Console, jalankan:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Step 2: Login dengan Student Account
```
Email: student@cbt.com
Password: student123
```

**Expected behavior:**
```
Console logs:
=== useAuth initializing ===
No saved user found
=== useAuth initialized ===
=== Starting login process ===
Email: student@cbt.com
Login attempt: {email: "student@cbt.com"}
Login response: {message: "Login successful", token: "...", user: {...}}
User logged in: {id: 3, username: "student1", email: "student@cbt.com", role: "student"}
=== Login successful ===
User already logged in, redirecting... {id: 3, ...}

[Navigate to /student/exams]
=== useAuth initializing ===
Found saved user: {id: 3, username: "student1", ...}
=== useAuth initialized ===
```

### Step 3: Verify Dashboard Loads
Setelah redirect ke `/student/exams`, halaman harus:
- ✅ Tampil header "CBT System - Student"
- ✅ Tampil username di header
- ✅ Tampil list ujian atau "Tidak ada ujian tersedia"
- ✅ Tidak redirect kembali ke login

## Debug Redirect Loop

Jika masih redirect loop, check console logs:

### Pattern Normal (GOOD):
```
=== useAuth initializing ===
Found saved user: {...}
=== useAuth initialized ===
[Page renders]
```

### Pattern Loop (BAD):
```
=== useAuth initializing ===
No saved user found
=== useAuth initialized ===
No user found, redirecting to login...
[Redirect to /login]
User already logged in, redirecting...
[Redirect to /student/exams]
No user found, redirecting to login...
[LOOP REPEATS]
```

**Penyebab loop:**
- localStorage tidak persist token/user
- Token/user di-clear sebelum redirect selesai
- Multiple useEffect racing conditions

## Solusi Jika Masih Loop

### 1. Check localStorage Setelah Login
```javascript
// Di DevTools Console setelah klik Login
setTimeout(() => {
  console.log('Token:', localStorage.getItem('token'));
  console.log('User:', localStorage.getItem('user'));
}, 1000);
```

**Expected:** Harus ada token dan user object.

### 2. Disable React Strict Mode (Temporary Debug)
Edit `frontend/next.config.mjs`:
```javascript
const nextConfig = {
    reactStrictMode: false, // Temporarily disable for testing
    // ... rest of config
};
```

React Strict Mode mounts components twice in development, bisa cause double redirect.

### 3. Check Network Tab
```
F12 → Network → Filter: Fetch/XHR
```

Setelah login, harus ada:
1. ✅ POST `/api/auth/login` → 200 OK
2. ✅ GET `/api/exams/available` → 200 OK (atau 401 jika auth issue)

Jika ada request berulang ke `/api/auth/login`, berarti ada loop.

### 4. Verify JWT Token Valid
```javascript
// Copy token dari localStorage
const token = localStorage.getItem('token');

// Decode payload (don't need secret for this)
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token payload:', payload);
console.log('Expires:', new Date(payload.exp * 1000));
console.log('Is expired?', payload.exp * 1000 < Date.now());
```

## Auth Flow Diagram

```
┌─────────────┐
│ Login Page  │
└──────┬──────┘
       │ 1. Submit form
       │ 2. Call login()
       ▼
┌──────────────────┐
│ useAuth Hook     │
│ - POST /api/auth │
│ - Get token/user │
│ - Save to localStorage
│ - Set user state │
│ - router.push()  │
└──────┬───────────┘
       │ 3. Navigate
       ▼
┌──────────────────┐
│ Student Page     │
│ - useAuth()      │
│ - Check loading  │
│ - Check user     │
└──────┬───────────┘
       │ 4. If user exists
       │    → Render page
       │ 5. If no user
       │    → Redirect /login
       ▼
   [Dashboard]
```

## Prevent Future Loops

### 1. Always Check Loading State
```tsx
const { user, loading } = useAuth();

if (loading) {
  return <LoadingSpinner />;
}

if (!user) {
  router.push('/login');
  return null;
}

return <Page />;
```

### 2. Use Dependency Arrays Correctly
```tsx
// ❌ BAD - Can cause loops
useEffect(() => {
  if (!user) router.push('/login');
}, [user, router]); // router changes can retrigger

// ✅ GOOD - Only trigger on user change
useEffect(() => {
  if (!loading && !user) {
    router.push('/login');
  }
}, [user, loading]); // Exclude router from deps
```

### 3. Prevent Double Redirects
```tsx
// ❌ BAD - Multiple redirects
if (user) router.push('/dashboard');
if (!user) router.push('/login');

// ✅ GOOD - Single redirect point
if (!loading) {
  if (user) {
    router.push('/dashboard');
  } else {
    router.push('/login');
  }
}
```

## Manual Test Checklist

- [ ] Login dengan admin → Redirect ke /admin/questions
- [ ] Login dengan teacher → Redirect ke /admin/questions  
- [ ] Login dengan student → Redirect ke /student/exams
- [ ] Student page tidak redirect balik ke login
- [ ] Refresh student page tetap stay di dashboard
- [ ] Logout dari student → Redirect ke /login
- [ ] Token valid di localStorage
- [ ] API calls include Authorization header

## Current Status

✅ **Fixed Issues:**
- Auth loading state properly checked
- Login page doesn't redirect during submission
- Student page checks auth before render
- Console logs help debug flow

🔄 **To Verify:**
- Clear browser data
- Login dengan student account
- Check console logs match expected pattern
- Dashboard loads without loop

## Need Help?

Jika masih ada masalah, kirim screenshot dari:
1. Console logs (all messages)
2. Network tab (all requests setelah login)
3. Application tab → Local Storage → isi token dan user

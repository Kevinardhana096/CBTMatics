# Testing & Troubleshooting Guide

## Default User Accounts

After running `database_schema.sql` or `fix_passwords.sql`, you can login with:

### Admin Account
- **Email:** admin@cbt.com
- **Password:** admin123
- **Access:** Full system access (questions, exams, users, reports)

### Teacher Account
- **Email:** teacher@cbt.com
- **Password:** teacher123
- **Access:** Question and exam management

### Student Account
- **Email:** student@cbt.com
- **Password:** student123
- **Access:** Take exams and view results

## Password Hash Information

All passwords are hashed using bcrypt with salt rounds = 10:

```
admin123   → $2b$10$Bn4tsmSYDDfDEcB2hPTP7Ol6etfj/3XVWrLS7ArBG.0l1jJPkBnGy
teacher123 → $2b$10$/e9QJ4Z4m5KVAqzetimXG.BxUXL2xkUVPqyHh5eB3xJBwEnRnU1TC
student123 → $2b$10$GGHuILXqoxPD/ZbZ4renyewG/ZXiz0lcWG9S29w7/zpzeKZyQwJHW
```

## Fixing Login Issues

### Issue: "Invalid credentials" error

1. **Check database passwords:**
   - Go to Supabase Dashboard
   - SQL Editor
   - Run: `SELECT email, SUBSTRING(password, 1, 20) FROM users;`
   - Verify password hashes start with `$2b$10$`

2. **Update passwords:**
   ```sql
   -- Run fix_passwords.sql in Supabase SQL Editor
   ```

3. **Clear browser cache:**
   - Clear localStorage
   - Open DevTools → Application → Local Storage → Clear All
   - Refresh page

### Issue: Redirect not working after login

1. **Check role in database:**
   ```sql
   SELECT id, username, email, role FROM users WHERE email = 'student@cbt.com';
   ```

2. **Verify role is correct:**
   - admin/teacher → redirects to `/admin/questions`
   - student → redirects to `/student/exams`

3. **Check useAuth hook:**
   - Open DevTools → Console
   - After login, check: `localStorage.getItem('user')`
   - Should show user object with correct role

### Issue: Token expired or unauthorized

1. **Clear old tokens:**
   ```javascript
   localStorage.removeItem('token');
   localStorage.removeItem('user');
   ```

2. **Login again**

3. **Check JWT_SECRET in .env.local:**
   - Must match across all environments
   - Should be a secure random string

## Testing Checklist

### Login Flow
- [ ] Admin can login with admin@cbt.com / admin123
- [ ] Teacher can login with teacher@cbt.com / teacher123
- [ ] Student can login with student@cbt.com / student123
- [ ] Invalid credentials show error message
- [ ] After login, token is stored in localStorage
- [ ] After login, redirects to correct dashboard based on role

### Admin Dashboard
- [ ] Can access /admin/questions
- [ ] Can access /admin/exams
- [ ] Can access /admin/users
- [ ] Can access /admin/reports
- [ ] Can create/edit/delete questions
- [ ] Can create/edit/delete exams
- [ ] Can create/edit/delete users

### Teacher Dashboard
- [ ] Can access /admin/questions
- [ ] Can access /admin/exams
- [ ] Can create questions
- [ ] Can create exams
- [ ] Cannot access /admin/users

### Student Dashboard
- [ ] Can access /student/exams
- [ ] Can see available exams
- [ ] Can start exam
- [ ] Can submit answers
- [ ] Can view results
- [ ] Cannot access admin routes

## API Testing

### Login API
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@cbt.com","password":"student123"}'
```

Expected response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 3,
    "username": "student1",
    "email": "student@cbt.com",
    "role": "student"
  }
}
```

### Test Protected Route
```bash
TOKEN="<your_token_here>"

curl -X GET http://localhost:3000/api/exams/available \
  -H "Authorization: Bearer $TOKEN"
```

## Common Errors

### Error: "Cannot read properties of undefined (reading 'id')"
**Solution:** Token not properly extracted. Check auth middleware is applied.

### Error: "Unauthorized" on all API calls
**Solution:** 
1. Check Authorization header format: `Bearer <token>`
2. Verify JWT_SECRET in .env.local
3. Check token hasn't expired (24h expiry)

### Error: "User not found" after successful login
**Solution:** Database user might be deleted. Re-run database_schema.sql

### Error: Redirect loop on login
**Solution:** 
1. Clear localStorage
2. Check useAuth useEffect dependencies
3. Verify router.push paths exist

## Database Verification

```sql
-- Check all users
SELECT id, username, email, role, created_at FROM users;

-- Check password hash format
SELECT email, SUBSTRING(password, 1, 7) as hash_prefix FROM users;
-- Should all show: $2b$10$

-- Test specific user
SELECT * FROM users WHERE email = 'student@cbt.com';

-- Check exams
SELECT id, title, start_time, end_time FROM exams;

-- Check questions
SELECT id, question_text, question_type, subject FROM questions LIMIT 5;
```

## Generating New Password Hashes

```bash
cd frontend
node scripts/generate-passwords.js
```

This will generate fresh bcrypt hashes for all default passwords.

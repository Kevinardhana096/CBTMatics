-- Update passwords untuk semua users
-- Run this in Supabase SQL Editor
-- Password: admin123
UPDATE users
SET password = '$2b$10$Bn4tsmSYDDfDEcB2hPTP7Ol6etfj/3XVWrLS7ArBG.0l1jJPkBnGy'
WHERE email = 'admin@cbt.com';
-- Password: teacher123
UPDATE users
SET password = '$2b$10$/e9QJ4Z4m5KVAqzetimXG.BxUXL2xkUVPqyHh5eB3xJBwEnRnU1TC'
WHERE email = 'teacher@cbt.com';
-- Password: student123
UPDATE users
SET password = '$2b$10$GGHuILXqoxPD/ZbZ4renyewG/ZXiz0lcWG9S29w7/zpzeKZyQwJHW'
WHERE email = 'student@cbt.com';
-- Verify update
SELECT id,
    username,
    email,
    role,
    SUBSTRING(password, 1, 20) || '...' as password_hash,
    created_at
FROM users
ORDER BY id;
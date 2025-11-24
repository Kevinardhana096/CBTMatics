-- Update existing users with correct bcrypt hashed passwords
-- Run this if you already have users but passwords are incorrect

-- Password: admin123 (for all sample users)
UPDATE users 
SET password = '$2b$10$rN9xKvV8zQ7pW5yT3mX6.OYGwJxKZH0p8nM2lE4sR6vU9aB3cD1eS'
WHERE email IN ('admin@cbt.com', 'teacher@cbt.com', 'student@cbt.com');

-- Verify update
SELECT username, email, role, 
       CASE 
           WHEN password = '$2b$10$rN9xKvV8zQ7pW5yT3mX6.OYGwJxKZH0p8nM2lE4sR6vU9aB3cD1eS' 
           THEN '✅ Password Updated' 
           ELSE '❌ Old Password' 
       END as password_status
FROM users
WHERE email IN ('admin@cbt.com', 'teacher@cbt.com', 'student@cbt.com');

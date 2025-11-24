-- Update existing users with correct bcrypt hashed passwords
-- Run this if you already have users but passwords are incorrect
-- Password: admin123 (for all sample users)
UPDATE users
SET password = '$2b$10$mIjmYPzdjpbOqc3Z5gAdlujaf1lh8GvV/9G2i2DY61cRBxQIALqzK'
WHERE email IN (
        'admin@cbt.com',
        'teacher@cbt.com',
        'student@cbt.com'
    );
-- Verify update
SELECT username,
    email,
    role,
    CASE
        WHEN password = '$2b$10$mIjmYPzdjpbOqc3Z5gAdlujaf1lh8GvV/9G2i2DY61cRBxQIALqzK' THEN '✅ Password Updated'
        ELSE '❌ Old Password'
    END as password_status
FROM users
WHERE email IN (
        'admin@cbt.com',
        'teacher@cbt.com',
        'student@cbt.com'
    );
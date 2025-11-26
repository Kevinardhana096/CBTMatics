-- Supabase Data Export
-- Date: 2025-11-26T12:48:10.654Z

-- Users (4 records)
INSERT INTO users (id, username, email, password, role, created_at) VALUES (4, 'tes', 'admin12@gmail.com', '$2b$10$DAjAQj0k0kCnjAE13DKbcu7sDQytIHij8X69CiFdsfTC6.azBEcEC', 'student', '2025-11-24T16:20:13.575856') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (id, username, email, password, role, created_at) VALUES (1, 'admin', 'admin@cbt.com', '$2b$10$Bn4tsmSYDDfDEcB2hPTP7Ol6etfj/3XVWrLS7ArBG.0l1jJPkBnGy', 'admin', '2025-11-24T15:49:53.887845') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (id, username, email, password, role, created_at) VALUES (2, 'teacher1', 'teacher@cbt.com', '$2b$10$/e9QJ4Z4m5KVAqzetimXG.BxUXL2xkUVPqyHh5eB3xJBwEnRnU1TC', 'teacher', '2025-11-24T15:49:53.887845') ON CONFLICT (email) DO NOTHING;
INSERT INTO users (id, username, email, password, role, created_at) VALUES (3, 'student1', 'student@cbt.com', '$2b$10$GGHuILXqoxPD/ZbZ4renyewG/ZXiz0lcWG9S29w7/zpzeKZyQwJHW', 'student', '2025-11-24T15:49:53.887845') ON CONFLICT (email) DO NOTHING;

-- Questions (2 records)
INSERT INTO questions (id, question_text, question_type, options, correct_answer, subject, difficulty, points, created_by, created_at) VALUES (4, '<img src="/uploads/questions/diagram.png" alt="Question Image" style="max-width: 100%; height: auto; margin: 10px 0;"/><br/>Perhatikan diagram berikut. Berapakah luas dari bangun datar tersebut?', 'multiple_choice', '{"A":"12 cm²","B":"24 cm²","C":"36 cm²","D":"48 cm²"}'::jsonb, 'B', 'Matematika', 'medium', 15, 1, '2025-11-24T16:49:39.739962') ON CONFLICT DO NOTHING;
INSERT INTO questions (id, question_text, question_type, options, correct_answer, subject, difficulty, points, created_by, created_at) VALUES (5, 'Berapa hasil dari 5 + 3?', 'multiple_choice', '{"A":"6","B":"7","C":"8","D":"9"}'::jsonb, 'C', 'Matematika', 'easy', 10, 1, '2025-11-24T16:49:39.739962') ON CONFLICT DO NOTHING;

-- Exams (1 records)
INSERT INTO exams (id, title, description, duration, start_time, end_time, created_by, created_at) VALUES (2, 'tes', '', 60, '2025-11-25T00:50:00', '2025-11-26T00:50:00', 1, '2025-11-24T16:50:49.529078') ON CONFLICT DO NOTHING;

-- Exam Questions Mapping (2 records)
INSERT INTO exam_questions (id, exam_id, question_id, question_order) VALUES (4, 2, 4, 1) ON CONFLICT DO NOTHING;
INSERT INTO exam_questions (id, exam_id, question_id, question_order) VALUES (5, 2, 5, 2) ON CONFLICT DO NOTHING;


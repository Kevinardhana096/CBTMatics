-- Database Schema untuk CBT Application
-- PostgreSQL 15+
-- Drop tables if exists (untuk development)
DROP TABLE IF EXISTS exam_answers CASCADE;
DROP TABLE IF EXISTS exam_submissions CASCADE;
DROP TABLE IF EXISTS exam_questions CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS users CASCADE;
-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'essay');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE submission_status AS ENUM ('not_started', 'in_progress', 'completed');
-- Table: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Table: questions
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    options JSONB,
    -- For multiple choice: {"A": "...", "B": "...", "C": "...", "D": "..."}
    correct_answer TEXT NOT NULL,
    subject VARCHAR(100),
    difficulty difficulty_level DEFAULT 'medium',
    points INTEGER DEFAULT 1,
    created_by INTEGER REFERENCES users(id) ON DELETE
    SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Table: exams
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    -- in minutes
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE
    SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Table: exam_questions (Many-to-Many relation)
CREATE TABLE exam_questions (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    UNIQUE(exam_id, question_id)
);
-- Table: exam_submissions
CREATE TABLE exam_submissions (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status submission_status DEFAULT 'not_started',
    score DECIMAL(5, 2) DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, user_id) -- Satu user hanya bisa submit satu kali per exam
);
-- Table: exam_answers
CREATE TABLE exam_answers (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES exam_submissions(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(submission_id, question_id)
);
-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_questions_subject ON questions(subject);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_exams_dates ON exams(start_time, end_time);
CREATE INDEX idx_exam_submissions_user ON exam_submissions(user_id);
CREATE INDEX idx_exam_submissions_exam ON exam_submissions(exam_id);
CREATE INDEX idx_exam_submissions_status ON exam_submissions(status);
-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE
UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE
UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_submissions_updated_at BEFORE
UPDATE ON exam_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_answers_updated_at BEFORE
UPDATE ON exam_answers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Insert sample data (optional)
-- Sample users with hashed passwords (bcrypt)
-- Passwords: admin123, teacher123, student123
INSERT INTO users (username, email, password, role)
VALUES (
        'admin',
        'admin@cbt.com',
        '$2b$10$Bn4tsmSYDDfDEcB2hPTP7Ol6etfj/3XVWrLS7ArBG.0l1jJPkBnGy',
        'admin'
    ),
    (
        'teacher1',
        'teacher@cbt.com',
        '$2b$10$/e9QJ4Z4m5KVAqzetimXG.BxUXL2xkUVPqyHh5eB3xJBwEnRnU1TC',
        'teacher'
    ),
    (
        'student1',
        'student@cbt.com',
        '$2b$10$GGHuILXqoxPD/ZbZ4renyewG/ZXiz0lcWG9S29w7/zpzeKZyQwJHW',
        'student'
    ) ON CONFLICT (email) DO NOTHING;
-- Sample questions
INSERT INTO questions (
        question_text,
        question_type,
        options,
        correct_answer,
        subject,
        difficulty,
        points,
        created_by
    )
VALUES (
        'Apa ibu kota Indonesia?',
        'multiple_choice',
        '{"A": "Jakarta", "B": "Surabaya", "C": "Bandung", "D": "Medan"}',
        'A',
        'Geography',
        'easy',
        10,
        1
    ),
    (
        'Bumi itu bulat',
        'true_false',
        '{"A": "Benar", "B": "Salah"}',
        'A',
        'Science',
        'easy',
        5,
        1
    ),
    (
        'Siapa presiden pertama Indonesia?',
        'multiple_choice',
        '{"A": "Soekarno", "B": "Soeharto", "C": "Habibie", "D": "Megawati"}',
        'A',
        'History',
        'easy',
        10,
        1
    );
-- Sample exam
INSERT INTO exams (
        title,
        description,
        duration,
        start_time,
        end_time,
        created_by
    )
VALUES (
        'Ujian Tengah Semester',
        'Ujian untuk materi semester 1',
        60,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + INTERVAL '7 days',
        1
    );
-- Link questions to exam
INSERT INTO exam_questions (exam_id, question_id, question_order)
VALUES (1, 1, 1),
    (1, 2, 2),
    (1, 3, 3);
-- Verification query
SELECT 'Database schema created successfully!' AS status;
SELECT 'Total users: ' || COUNT(*)
FROM users;
SELECT 'Total questions: ' || COUNT(*)
FROM questions;
SELECT 'Total exams: ' || COUNT(*)
FROM exams;
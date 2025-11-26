// Export Supabase data for VPS migration
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function exportSupabaseData() {
    console.log('📦 Exporting Supabase data for VPS migration...\n');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const backupDir = path.join(__dirname, '../backups');

    // Create backups directory
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const sqlFile = path.join(backupDir, `data-export-${timestamp}.sql`);
    let sqlContent = `-- Supabase Data Export\n-- Date: ${new Date().toISOString()}\n\n`;

    try {
        // Export users
        console.log('1️⃣ Exporting users...');
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*');

        if (usersError) throw usersError;

        sqlContent += `-- Users (${users.length} records)\n`;
        users.forEach(user => {
            sqlContent += `INSERT INTO users (id, username, email, password, role, created_at) VALUES (${user.id}, '${user.username}', '${user.email}', '${user.password}', '${user.role}', '${user.created_at}') ON CONFLICT (email) DO NOTHING;\n`;
        });
        sqlContent += '\n';
        console.log(`✅ Exported ${users.length} users`);

        // Export questions
        console.log('2️⃣ Exporting questions...');
        const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('*');

        if (questionsError) throw questionsError;

        sqlContent += `-- Questions (${questions.length} records)\n`;
        questions.forEach(q => {
            const options = q.options ? JSON.stringify(q.options).replace(/'/g, "''") : null;
            const questionText = q.question_text.replace(/'/g, "''");
            sqlContent += `INSERT INTO questions (id, question_text, question_type, options, correct_answer, subject, difficulty, points, created_by, created_at) VALUES (${q.id}, '${questionText}', '${q.question_type}', '${options}'::jsonb, '${q.correct_answer}', ${q.subject ? `'${q.subject}'` : 'NULL'}, '${q.difficulty}', ${q.points}, ${q.created_by}, '${q.created_at}') ON CONFLICT DO NOTHING;\n`;
        });
        sqlContent += '\n';
        console.log(`✅ Exported ${questions.length} questions`);

        // Export exams
        console.log('3️⃣ Exporting exams...');
        const { data: exams, error: examsError } = await supabase
            .from('exams')
            .select('*');

        if (examsError) throw examsError;

        sqlContent += `-- Exams (${exams.length} records)\n`;
        exams.forEach(exam => {
            const title = exam.title.replace(/'/g, "''");
            const desc = exam.description ? exam.description.replace(/'/g, "''") : '';
            sqlContent += `INSERT INTO exams (id, title, description, duration, start_time, end_time, created_by, created_at) VALUES (${exam.id}, '${title}', '${desc}', ${exam.duration}, '${exam.start_time}', '${exam.end_time}', ${exam.created_by}, '${exam.created_at}') ON CONFLICT DO NOTHING;\n`;
        });
        sqlContent += '\n';
        console.log(`✅ Exported ${exams.length} exams`);

        // Export exam_questions
        console.log('4️⃣ Exporting exam_questions...');
        const { data: examQuestions, error: examQuestionsError } = await supabase
            .from('exam_questions')
            .select('*');

        if (examQuestionsError) throw examQuestionsError;

        sqlContent += `-- Exam Questions Mapping (${examQuestions.length} records)\n`;
        examQuestions.forEach(eq => {
            sqlContent += `INSERT INTO exam_questions (id, exam_id, question_id, question_order) VALUES (${eq.id}, ${eq.exam_id}, ${eq.question_id}, ${eq.question_order}) ON CONFLICT DO NOTHING;\n`;
        });
        sqlContent += '\n';
        console.log(`✅ Exported ${examQuestions.length} exam-question mappings`);

        // Export exam_submissions
        console.log('5️⃣ Exporting exam_submissions...');
        const { data: submissions, error: submissionsError } = await supabase
            .from('exam_submissions')
            .select('*');

        if (submissionsError) throw submissionsError;

        if (submissions.length > 0) {
            sqlContent += `-- Exam Submissions (${submissions.length} records)\n`;
            submissions.forEach(sub => {
                const submittedAt = sub.submitted_at ? `'${sub.submitted_at}'` : 'NULL';
                sqlContent += `INSERT INTO exam_submissions (id, exam_id, user_id, status, score, started_at, submitted_at, created_at) VALUES (${sub.id}, ${sub.exam_id}, ${sub.user_id}, '${sub.status}', ${sub.score}, '${sub.started_at}', ${submittedAt}, '${sub.created_at}') ON CONFLICT DO NOTHING;\n`;
            });
            sqlContent += '\n';
        }
        console.log(`✅ Exported ${submissions.length} submissions`);

        // Export exam_answers
        console.log('6️⃣ Exporting exam_answers...');
        const { data: answers, error: answersError } = await supabase
            .from('exam_answers')
            .select('*');

        if (answersError) throw answersError;

        if (answers.length > 0) {
            sqlContent += `-- Exam Answers (${answers.length} records)\n`;
            answers.forEach(ans => {
                const answer = ans.answer.replace(/'/g, "''");
                sqlContent += `INSERT INTO exam_answers (id, submission_id, question_id, answer, created_at) VALUES (${ans.id}, ${ans.submission_id}, ${ans.question_id}, '${answer}', '${ans.created_at}') ON CONFLICT DO NOTHING;\n`;
            });
            sqlContent += '\n';
        }
        console.log(`✅ Exported ${answers.length} answers`);

        // Write to file
        fs.writeFileSync(sqlFile, sqlContent);
        console.log(`\n✅ Data exported to: ${sqlFile}`);
        console.log(`\n📋 Summary:`);
        console.log(`   - ${users.length} users`);
        console.log(`   - ${questions.length} questions`);
        console.log(`   - ${exams.length} exams`);
        console.log(`   - ${examQuestions.length} exam-question mappings`);
        console.log(`   - ${submissions.length} submissions`);
        console.log(`   - ${answers.length} answers`);
        console.log(`\n🚀 Ready for VPS migration!`);

    } catch (error) {
        console.error('\n❌ Export failed:', error.message);
        process.exit(1);
    }
}

exportSupabaseData();

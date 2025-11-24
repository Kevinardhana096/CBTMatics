// Controller untuk pengerjaan ujian dan auto-save
const pool = require('../config/db');

// Start exam (create submission) atau lanjutkan yang sudah ada
exports.startExam = async (req, res) => {
    try {
        const { exam_id } = req.body;
        const user_id = req.user.id;

        console.log('=== START EXAM REQUEST ===');
        console.log('Exam ID:', exam_id);
        console.log('User ID:', user_id);
        console.log('Current Time:', new Date().toISOString());

        // Cek apakah ujian tersedia
        const examResult = await pool.query(
            'SELECT id, title, duration, start_time, end_time, CURRENT_TIMESTAMP as now FROM exams WHERE id = $1',
            [exam_id]
        );

        if (examResult.rows.length === 0) {
            console.log('❌ Exam not found');
            return res.status(404).json({ error: 'Exam not found' });
        }

        const exam = examResult.rows[0];
        console.log('Exam details:', {
            id: exam.id,
            title: exam.title,
            duration: exam.duration,
            start_time: exam.start_time,
            end_time: exam.end_time,
            current_time: exam.now
        });

        const now = new Date(exam.now);
        const startTime = new Date(exam.start_time);
        const endTime = new Date(exam.end_time);

        // Cek apakah ujian masih dalam periode waktu
        console.log('Time validation:', {
            now: now.toISOString(),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            nowBeforeStart: now < startTime,
            nowAfterEnd: now > endTime
        });

        if (now < startTime) {
            console.log('❌ Exam has not started yet');
            return res.status(400).json({
                error: 'Ujian belum dimulai',
                details: {
                    current_time: now.toISOString(),
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString()
                }
            });
        }

        if (now > endTime) {
            console.log('❌ Exam has ended');
            return res.status(400).json({
                error: 'Ujian sudah berakhir',
                details: {
                    current_time: now.toISOString(),
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString()
                }
            });
        }

        // Cek apakah sudah ada submission (submitted atau in_progress)
        const existingSubmission = await pool.query(
            'SELECT * FROM exam_submissions WHERE exam_id = $1 AND user_id = $2 ORDER BY id DESC LIMIT 1',
            [exam_id, user_id]
        );

        let submission;
        let answers = [];

        // Jika sudah ada submission
        if (existingSubmission.rows.length > 0) {
            submission = existingSubmission.rows[0];

            // Jika sudah submitted, reject
            if (submission.status === 'submitted') {
                console.log('❌ User already submitted this exam');
                return res.status(400).json({ error: 'You have already submitted this exam' });
            }

            // Jika masih in_progress, lanjutkan
            console.log('✓ Continuing existing submission:', submission.id);

            // Load existing answers
            const answersResult = await pool.query(
                'SELECT question_id, answer FROM exam_answers WHERE submission_id = $1',
                [submission.id]
            );
            answers = answersResult.rows;

            // Hitung remaining time
            // Gunakan created_at atau start_time tergantung yang ada
            const startedAt = new Date(submission.start_time || submission.created_at);
            const elapsedSeconds = Math.floor((now - startedAt) / 1000);
            const totalSeconds = exam.duration * 60;
            const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

            submission.remaining_time = remainingSeconds;
            console.log('Remaining time calculated:', {
                startedAt: startedAt.toISOString(),
                elapsedSeconds,
                remainingSeconds
            });
        } else {
            // Create new submission (tanpa start_time karena kolom mungkin belum ada)
            const result = await pool.query(
                'INSERT INTO exam_submissions (exam_id, user_id, status) VALUES ($1, $2, $3) RETURNING *',
                [exam_id, user_id, 'in_progress']
            );
            submission = result.rows[0];
            submission.remaining_time = exam.duration * 60;

            // Set start_time untuk response (gunakan created_at)
            submission.start_time = submission.created_at || new Date();

            console.log('✓ Created new submission:', submission.id);
        } res.status(201).json({
            message: existingSubmission.rows.length > 0 ? 'Continuing exam' : 'Exam started successfully',
            submission: submission,
            answers: answers
        });
    } catch (err) {
        console.error('Error in startExam:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Save answer (auto-save)
exports.saveAnswer = async (req, res) => {
    try {
        const { submission_id, question_id, answer } = req.body;

        // Cek apakah submission ada dan milik user ini
        const submissionResult = await pool.query(
            'SELECT * FROM exam_submissions WHERE id = $1 AND user_id = $2',
            [submission_id, req.user.id]
        );

        if (submissionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        // Cek apakah jawaban sudah ada
        const existingAnswer = await pool.query(
            'SELECT * FROM exam_answers WHERE submission_id = $1 AND question_id = $2',
            [submission_id, question_id]
        );

        let result;
        if (existingAnswer.rows.length > 0) {
            // Update jawaban yang sudah ada
            result = await pool.query(
                'UPDATE exam_answers SET answer = $1, updated_at = CURRENT_TIMESTAMP WHERE submission_id = $2 AND question_id = $3 RETURNING *',
                [answer, submission_id, question_id]
            );
        } else {
            // Insert jawaban baru
            result = await pool.query(
                'INSERT INTO exam_answers (submission_id, question_id, answer) VALUES ($1, $2, $3) RETURNING *',
                [submission_id, question_id, answer]
            );
        }

        res.json({
            message: 'Answer saved successfully',
            answer: result.rows[0]
        });
    } catch (err) {
        console.error('Error in saveAnswer:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Submit exam
exports.submitExam = async (req, res) => {
    try {
        const { submission_id } = req.body;

        console.log('=== SUBMIT EXAM ===');
        console.log('Submission ID:', submission_id);
        console.log('User ID:', req.user.id);

        // Cek apakah submission ada dan milik user ini
        const submissionResult = await pool.query(
            'SELECT * FROM exam_submissions WHERE id = $1 AND user_id = $2',
            [submission_id, req.user.id]
        );

        if (submissionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        const submission = submissionResult.rows[0];

        // Check if already submitted
        if (submission.status === 'submitted') {
            return res.status(400).json({ error: 'Exam already submitted' });
        }

        // Get all answers with question details
        const answersResult = await pool.query(
            `SELECT ea.*, q.correct_answer, q.points, q.question_type, q.question_text
             FROM exam_answers ea
             JOIN questions q ON ea.question_id = q.id
             WHERE ea.submission_id = $1`,
            [submission_id]
        );

        console.log('Total answers:', answersResult.rows.length);

        let totalScore = 0;
        let correctAnswers = 0;
        let gradedAnswers = 0;

        // Calculate score untuk soal pilihan ganda dan true/false
        answersResult.rows.forEach(answer => {
            console.log(`Question ${answer.question_id}:`, {
                type: answer.question_type,
                student_answer: answer.answer,
                correct_answer: answer.correct_answer,
                points: answer.points
            });

            // Auto-grade untuk multiple choice dan true/false
            if (answer.question_type === 'multiple_choice' || answer.question_type === 'true_false') {
                gradedAnswers++;

                // Compare answers (case-insensitive untuk handling A/B/C/D)
                const studentAnswer = String(answer.answer).trim().toUpperCase();
                const correctAnswer = String(answer.correct_answer).trim().toUpperCase();

                if (studentAnswer === correctAnswer) {
                    totalScore += answer.points;
                    correctAnswers++;
                    console.log(`✓ Correct! +${answer.points} points`);
                } else {
                    console.log(`✗ Wrong! Expected: ${correctAnswer}, Got: ${studentAnswer}`);
                }
            } else {
                // Essay questions tidak di-grade otomatis
                console.log('⚠ Essay question - requires manual grading');
            }
        });

        console.log('Grading Summary:', {
            totalScore,
            correctAnswers,
            gradedAnswers,
            totalQuestions: answersResult.rows.length,
            needsManualGrading: answersResult.rows.length - gradedAnswers
        });

        // Update submission dengan status 'submitted' dan score
        const result = await pool.query(
            `UPDATE exam_submissions 
             SET status = 'submitted', score = $1, submitted_at = CURRENT_TIMESTAMP
             WHERE id = $2 RETURNING *`,
            [totalScore, submission_id]
        );

        console.log('✓ Exam submitted successfully');

        res.json({
            message: 'Exam submitted successfully',
            submission: result.rows[0],
            score: totalScore,
            correctAnswers,
            totalQuestions: answersResult.rows.length,
            gradedQuestions: gradedAnswers,
            needsManualGrading: answersResult.rows.length - gradedAnswers
        });
    } catch (err) {
        console.error('Error in submitExam:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get submission by ID
exports.getSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;

        // Get submission info
        const result = await pool.query(
            `SELECT 
                es.*,
                e.title as exam_title,
                e.description as exam_description,
                e.duration,
                u.username 
             FROM exam_submissions es
             JOIN exams e ON es.exam_id = e.id
             JOIN users u ON es.user_id = u.id
             WHERE es.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        const submission = result.rows[0];

        // Check if user owns this submission or is admin/teacher
        if (submission.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'teacher') {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Get answers with complete question info
        const answersResult = await pool.query(
            `SELECT 
                ea.question_id,
                ea.answer as student_answer,
                q.question_text,
                q.question_type,
                q.options,
                q.correct_answer,
                q.points
             FROM exam_answers ea
             JOIN questions q ON ea.question_id = q.id
             WHERE ea.submission_id = $1
             ORDER BY ea.question_id`,
            [id]
        );

        console.log(`Fetched submission ${id} with ${answersResult.rows.length} answers`);

        res.json({
            submission: {
                id: submission.id,
                exam_id: submission.exam_id,
                exam_title: submission.exam_title,
                exam_description: submission.exam_description,
                score: submission.score || 0,
                submitted_at: submission.submitted_at,
                duration: submission.duration
            },
            answers: answersResult.rows
        });
    } catch (err) {
        console.error('Error in getSubmissionById:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get user submissions
exports.getUserSubmissions = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT es.*, e.title as exam_title 
             FROM exam_submissions es
             JOIN exams e ON es.exam_id = e.id
             WHERE es.user_id = $1
             ORDER BY es.created_at DESC`,
            [req.user.id]
        );

        res.json({ submissions: result.rows });
    } catch (err) {
        console.error('Error in getUserSubmissions:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get user results (for student results page)
exports.getUserResults = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                es.id as submission_id,
                es.exam_id,
                e.title as exam_title,
                e.description as exam_description,
                COALESCE(es.score, 0) as score,
                es.submitted_at,
                es.status
             FROM exam_submissions es
             JOIN exams e ON es.exam_id = e.id
             WHERE es.user_id = $1 AND es.status = 'submitted'
             ORDER BY es.submitted_at DESC`,
            [req.user.id]
        );

        console.log(`Found ${result.rows.length} results for user ${req.user.id}`);
        result.rows.forEach(row => {
            console.log(`Result: ${row.exam_title} - Score: ${row.score}`);
        });

        res.json({ results: result.rows });
    } catch (err) {
        console.error('Error in getUserResults:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Reset submission (Admin/Teacher only) - untuk testing atau reset ujian
exports.resetSubmission = async (req, res) => {
    try {
        const { exam_id, user_id } = req.body;

        // Hanya admin dan teacher yang bisa reset
        if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Get submission ID first
        const submissionResult = await pool.query(
            'SELECT id FROM exam_submissions WHERE exam_id = $1 AND user_id = $2',
            [exam_id, user_id]
        );

        if (submissionResult.rows.length === 0) {
            return res.status(404).json({ error: 'No submission found to reset' });
        }

        const submission_id = submissionResult.rows[0].id;

        // Delete answers first (foreign key constraint)
        await pool.query(
            'DELETE FROM submission_answers WHERE submission_id = $1',
            [submission_id]
        );

        // Delete submission
        await pool.query(
            'DELETE FROM exam_submissions WHERE id = $1',
            [submission_id]
        );

        res.json({
            message: 'Submission reset successfully. User can now retake the exam.',
            exam_id,
            user_id
        });
    } catch (err) {
        console.error('Error in resetSubmission:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Controller untuk CRUD ujian dan jadwal
const pool = require('../config/db');

// Get all exams
exports.getAllExams = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT e.*, u.username as created_by_name 
             FROM exams e 
             LEFT JOIN users u ON e.created_by = u.id 
             ORDER BY e.created_at DESC`
        );

        res.json({ exams: result.rows });
    } catch (err) {
        console.error('Error in getAllExams:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get exam by ID
exports.getExamById = async (req, res) => {
    try {
        const { id } = req.params;
        const examResult = await pool.query('SELECT * FROM exams WHERE id = $1', [id]);

        if (examResult.rows.length === 0) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Get questions for this exam
        const questionsResult = await pool.query(
            `SELECT q.* FROM questions q
             JOIN exam_questions eq ON q.id = eq.question_id
             WHERE eq.exam_id = $1
             ORDER BY eq.question_order`,
            [id]
        );

        res.json({
            exam: examResult.rows[0],
            questions: questionsResult.rows
        });
    } catch (err) {
        console.error('Error in getExamById:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create new exam
exports.createExam = async (req, res) => {
    try {
        const { title, description, duration, start_time, end_time, question_ids } = req.body;

        // Insert exam
        const examResult = await pool.query(
            `INSERT INTO exams (title, description, duration, start_time, end_time, created_by)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [title, description, duration, start_time, end_time, req.user.id]
        );

        const exam = examResult.rows[0];

        // Insert exam questions relation
        if (question_ids && question_ids.length > 0) {
            for (let i = 0; i < question_ids.length; i++) {
                await pool.query(
                    'INSERT INTO exam_questions (exam_id, question_id, question_order) VALUES ($1, $2, $3)',
                    [exam.id, question_ids[i], i + 1]
                );
            }
        }

        res.status(201).json({
            message: 'Exam created successfully',
            exam
        });
    } catch (err) {
        console.error('Error in createExam:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update exam
exports.updateExam = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, duration, start_time, end_time, question_ids } = req.body;

        const result = await pool.query(
            `UPDATE exams 
             SET title = $1, description = $2, duration = $3, start_time = $4, end_time = $5, updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 RETURNING *`,
            [title, description, duration, start_time, end_time, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Update exam questions if provided
        if (question_ids) {
            // Delete existing questions
            await pool.query('DELETE FROM exam_questions WHERE exam_id = $1', [id]);

            // Insert new questions
            for (let i = 0; i < question_ids.length; i++) {
                await pool.query(
                    'INSERT INTO exam_questions (exam_id, question_id, question_order) VALUES ($1, $2, $3)',
                    [id, question_ids[i], i + 1]
                );
            }
        }

        res.json({
            message: 'Exam updated successfully',
            exam: result.rows[0]
        });
    } catch (err) {
        console.error('Error in updateExam:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete exam
exports.deleteExam = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM exams WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        res.json({ message: 'Exam deleted successfully' });
    } catch (err) {
        console.error('Error in deleteExam:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get available exams for student
exports.getAvailableExams = async (req, res) => {
    try {
        console.log('=== GET AVAILABLE EXAMS ===');
        console.log('User ID:', req.user?.id);

        if (!req.user || !req.user.id) {
            console.error('❌ User not authenticated');
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const user_id = req.user.id;

        // Get all active and upcoming exams
        console.log('Executing query for user_id:', user_id);
        const result = await pool.query(
            `SELECT e.*,
                    CASE 
                        WHEN EXISTS (
                            SELECT 1 FROM exam_submissions 
                            WHERE exam_id = e.id AND user_id = $1 AND status = 'in_progress'
                        ) THEN true 
                        ELSE false 
                    END as has_started,
                    CASE 
                        WHEN EXISTS (
                            SELECT 1 FROM exam_submissions 
                            WHERE exam_id = e.id AND user_id = $1 AND status = 'submitted'
                        ) THEN true 
                        ELSE false 
                    END as has_submitted
             FROM exams e
             WHERE e.end_time >= CURRENT_TIMESTAMP
             ORDER BY e.start_time ASC`,
            [user_id]
        );

        console.log('✓ Found exams:', result.rows.length);
        res.json({ exams: result.rows });
    } catch (err) {
        console.error('❌ Error in getAvailableExams:', err);
        console.error('Error details:', {
            message: err.message,
            stack: err.stack,
            code: err.code
        });
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

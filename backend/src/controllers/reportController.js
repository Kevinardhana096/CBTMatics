// Controller untuk laporan dan analitik
const pool = require('../config/db');

// Get exam report (for admin/teacher)
exports.getExamReport = async (req, res) => {
    try {
        const { examId } = req.params;

        // Get exam info
        const examResult = await pool.query('SELECT * FROM exams WHERE id = $1', [examId]);

        if (examResult.rows.length === 0) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Get all submissions for this exam
        const submissionsResult = await pool.query(
            `SELECT es.*, u.username, u.email 
             FROM exam_submissions es
             JOIN users u ON es.user_id = u.id
             WHERE es.exam_id = $1
             ORDER BY es.score DESC`,
            [examId]
        );

        // Calculate statistics
        const scores = submissionsResult.rows.map(s => s.score || 0);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length || 0;
        const maxScore = Math.max(...scores, 0);
        const minScore = Math.min(...scores, Infinity) === Infinity ? 0 : Math.min(...scores);

        res.json({
            exam: examResult.rows[0],
            submissions: submissionsResult.rows,
            statistics: {
                totalSubmissions: submissionsResult.rows.length,
                averageScore: avgScore.toFixed(2),
                maxScore,
                minScore,
                completionRate: (submissionsResult.rows.filter(s => s.status === 'completed').length / submissionsResult.rows.length * 100).toFixed(2)
            }
        });
    } catch (err) {
        console.error('Error in getExamReport:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get question analytics
exports.getQuestionAnalytics = async (req, res) => {
    try {
        const { examId } = req.params;

        const result = await pool.query(
            `SELECT 
                q.id,
                q.question_text,
                q.difficulty,
                COUNT(ea.id) as total_answers,
                SUM(CASE WHEN ea.answer = q.correct_answer THEN 1 ELSE 0 END) as correct_answers,
                ROUND(
                    SUM(CASE WHEN ea.answer = q.correct_answer THEN 1 ELSE 0 END)::numeric / 
                    NULLIF(COUNT(ea.id), 0) * 100, 
                    2
                ) as correct_percentage
             FROM questions q
             JOIN exam_questions eq ON q.id = eq.question_id
             LEFT JOIN exam_answers ea ON q.id = ea.question_id
             LEFT JOIN exam_submissions es ON ea.submission_id = es.id
             WHERE eq.exam_id = $1
             GROUP BY q.id, q.question_text, q.difficulty
             ORDER BY correct_percentage ASC`,
            [examId]
        );

        res.json({ analytics: result.rows });
    } catch (err) {
        console.error('Error in getQuestionAnalytics:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get student performance report
exports.getStudentPerformance = async (req, res) => {
    try {
        const { studentId } = req.params;

        const result = await pool.query(
            `SELECT 
                es.*,
                e.title as exam_title,
                e.duration,
                COUNT(ea.id) as answered_questions,
                SUM(CASE WHEN ea.answer = q.correct_answer THEN 1 ELSE 0 END) as correct_answers
             FROM exam_submissions es
             JOIN exams e ON es.exam_id = e.id
             LEFT JOIN exam_answers ea ON es.id = ea.submission_id
             LEFT JOIN questions q ON ea.question_id = q.id
             WHERE es.user_id = $1
             GROUP BY es.id, e.title, e.duration
             ORDER BY es.created_at DESC`,
            [studentId]
        );

        // Calculate overall statistics
        const scores = result.rows.map(r => r.score || 0);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length || 0;

        res.json({
            performance: result.rows,
            statistics: {
                totalExams: result.rows.length,
                averageScore: avgScore.toFixed(2),
                completedExams: result.rows.filter(r => r.status === 'completed').length
            }
        });
    } catch (err) {
        console.error('Error in getStudentPerformance:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Export report to PDF (placeholder)
exports.exportReportPDF = async (req, res) => {
    try {
        // TODO: Implement PDF export using library like pdfkit or puppeteer
        res.status(501).json({ message: 'PDF export feature coming soon' });
    } catch (err) {
        console.error('Error in exportReportPDF:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

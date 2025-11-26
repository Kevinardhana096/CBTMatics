// Controller untuk laporan dan analitik
// Menggunakan Supabase Client untuk koneksi yang reliable
const { createClient } = require('@supabase/supabase-js');

// Lazy initialization for Supabase client
let supabaseInstance = null;
function getSupabase() {
    if (!supabaseInstance) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase environment variables:', {
                hasUrl: !!supabaseUrl,
                hasKey: !!supabaseKey
            });
            throw new Error('Supabase configuration missing');
        }

        supabaseInstance = createClient(supabaseUrl, supabaseKey);
    }
    return supabaseInstance;
}

// Get exam report (for admin/teacher)
exports.getExamReport = async (req, res) => {
    try {
        const { examId } = req.params;

        // Get exam info
        const { data: exam, error: examError } = await getSupabase()
            .from('exams')
            .select('*')
            .eq('id', examId)
            .single();

        if (examError || !exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Get all submissions for this exam with user info
        const { data: submissions, error: subError } = await getSupabase()
            .from('exam_submissions')
            .select(`
                *,
                users:user_id (username, email)
            `)
            .eq('exam_id', examId)
            .order('score', { ascending: false });

        if (subError) {
            console.error('Error fetching submissions:', subError);
            return res.status(500).json({ error: 'Failed to fetch submissions' });
        }

        // Transform submissions to include username and email at top level
        const transformedSubmissions = (submissions || []).map(s => ({
            ...s,
            username: s.users?.username,
            email: s.users?.email
        }));

        // Calculate statistics
        const scores = transformedSubmissions.map(s => s.score || 0);
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
        const minScore = scores.length > 0 ? Math.min(...scores) : 0;
        const completedCount = transformedSubmissions.filter(s => s.status === 'submitted').length;

        res.json({
            exam,
            submissions: transformedSubmissions,
            statistics: {
                totalSubmissions: transformedSubmissions.length,
                averageScore: avgScore.toFixed(2),
                maxScore,
                minScore,
                completionRate: transformedSubmissions.length > 0
                    ? (completedCount / transformedSubmissions.length * 100).toFixed(2)
                    : '0.00'
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

        // Get exam questions
        const { data: examQuestions } = await getSupabase()
            .from('exam_questions')
            .select('question_id')
            .eq('exam_id', examId);

        if (!examQuestions || examQuestions.length === 0) {
            return res.json({ analytics: [] });
        }

        const questionIds = examQuestions.map(eq => eq.question_id);

        // Get questions
        const { data: questions } = await getSupabase()
            .from('questions')
            .select('id, question_text, difficulty, correct_answer, points')
            .in('id', questionIds);

        // Get all answers for these questions
        const { data: answers } = await getSupabase()
            .from('exam_answers')
            .select('question_id, answer')
            .in('question_id', questionIds);

        // Calculate analytics for each question
        const analytics = (questions || []).map(q => {
            const questionAnswers = (answers || []).filter(a => a.question_id === q.id);
            const totalAnswers = questionAnswers.length;
            const correctAnswers = questionAnswers.filter(a =>
                String(a.answer).trim().toUpperCase() === String(q.correct_answer).trim().toUpperCase()
            ).length;

            return {
                id: q.id,
                question_text: q.question_text,
                difficulty: q.difficulty,
                total_answers: totalAnswers,
                correct_answers: correctAnswers,
                correct_percentage: totalAnswers > 0
                    ? ((correctAnswers / totalAnswers) * 100).toFixed(2)
                    : '0.00'
            };
        });

        // Sort by correct_percentage ascending (hardest questions first)
        analytics.sort((a, b) => parseFloat(a.correct_percentage) - parseFloat(b.correct_percentage));

        res.json({ analytics });
    } catch (err) {
        console.error('Error in getQuestionAnalytics:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get student performance report
exports.getStudentPerformance = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Get all submissions for this student
        const { data: submissions, error } = await getSupabase()
            .from('exam_submissions')
            .select(`
                *,
                exams:exam_id (title, duration)
            `)
            .eq('user_id', studentId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching performance:', error);
            return res.status(500).json({ error: 'Failed to fetch performance data' });
        }

        // Transform submissions
        const performance = (submissions || []).map(s => ({
            ...s,
            exam_title: s.exams?.title,
            duration: s.exams?.duration
        }));

        // Calculate overall statistics
        const scores = performance.map(r => r.score || 0);
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

        res.json({
            performance,
            statistics: {
                totalExams: performance.length,
                averageScore: avgScore.toFixed(2),
                completedExams: performance.filter(r => r.status === 'submitted').length
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

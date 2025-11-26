// Controller untuk pengerjaan ujian dan auto-save
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

// Start exam (create submission) atau lanjutkan yang sudah ada
exports.startExam = async (req, res) => {
    try {
        const { exam_id } = req.body;
        const user_id = req.user.id;

        console.log('=== START EXAM REQUEST ===');
        console.log('Exam ID:', exam_id);
        console.log('User ID:', user_id);

        // Cek apakah ujian tersedia
        const { data: exam, error: examError } = await getSupabase()
            .from('exams')
            .select('id, title, duration, start_time, end_time')
            .eq('id', exam_id)
            .single();

        if (examError || !exam) {
            console.log('❌ Exam not found');
            return res.status(404).json({ error: 'Exam not found' });
        }

        const now = new Date();
        const startTime = new Date(exam.start_time);
        const endTime = new Date(exam.end_time);

        // Cek apakah ujian masih dalam periode waktu
        if (now < startTime) {
            console.log('❌ Exam has not started yet');
            return res.status(400).json({ error: 'Ujian belum dimulai' });
        }

        if (now > endTime) {
            console.log('❌ Exam has ended');
            return res.status(400).json({ error: 'Ujian sudah berakhir' });
        }

        // Cek apakah sudah ada submission
        const { data: existingSubmissions } = await getSupabase()
            .from('exam_submissions')
            .select('*')
            .eq('exam_id', exam_id)
            .eq('user_id', user_id)
            .order('id', { ascending: false })
            .limit(1);

        let submission;
        let answers = [];

        if (existingSubmissions && existingSubmissions.length > 0) {
            submission = existingSubmissions[0];

            // Jika sudah submitted, reject
            if (submission.status === 'submitted') {
                console.log('❌ User already submitted this exam');
                return res.status(400).json({ error: 'You have already submitted this exam' });
            }

            // Jika masih in_progress, lanjutkan
            console.log('✓ Continuing existing submission:', submission.id);

            // Load existing answers
            const { data: existingAnswers } = await getSupabase()
                .from('exam_answers')
                .select('question_id, answer')
                .eq('submission_id', submission.id);

            answers = existingAnswers || [];

            // Hitung remaining time
            const startedAt = new Date(submission.start_time || submission.created_at);
            const elapsedSeconds = Math.floor((now - startedAt) / 1000);
            const totalSeconds = exam.duration * 60;
            const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

            submission.remaining_time = remainingSeconds;
        } else {
            // Create new submission
            const { data: newSubmission, error: insertError } = await getSupabase()
                .from('exam_submissions')
                .insert([{
                    exam_id,
                    user_id,
                    status: 'in_progress'
                }])
                .select()
                .single();

            if (insertError) {
                console.error('Error creating submission:', insertError);
                return res.status(500).json({ error: 'Failed to start exam' });
            }

            submission = newSubmission;
            submission.remaining_time = exam.duration * 60;
            submission.start_time = submission.created_at;

            console.log('✓ Created new submission:', submission.id);
        }

        res.status(201).json({
            message: existingSubmissions?.length > 0 ? 'Continuing exam' : 'Exam started successfully',
            submission,
            answers
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
        const { data: submission } = await getSupabase()
            .from('exam_submissions')
            .select('*')
            .eq('id', submission_id)
            .eq('user_id', req.user.id)
            .single();

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        // Cek apakah jawaban sudah ada
        const { data: existingAnswer } = await getSupabase()
            .from('exam_answers')
            .select('id')
            .eq('submission_id', submission_id)
            .eq('question_id', question_id)
            .single();

        let result;
        if (existingAnswer) {
            // Update jawaban yang sudah ada
            const { data, error } = await getSupabase()
                .from('exam_answers')
                .update({ answer, updated_at: new Date().toISOString() })
                .eq('submission_id', submission_id)
                .eq('question_id', question_id)
                .select()
                .single();

            result = data;
        } else {
            // Insert jawaban baru
            const { data, error } = await getSupabase()
                .from('exam_answers')
                .insert([{ submission_id, question_id, answer }])
                .select()
                .single();

            result = data;
        }

        res.json({
            message: 'Answer saved successfully',
            answer: result
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

        // Cek apakah submission ada dan milik user ini
        const { data: submission } = await getSupabase()
            .from('exam_submissions')
            .select('*')
            .eq('id', submission_id)
            .eq('user_id', req.user.id)
            .single();

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        if (submission.status === 'submitted') {
            return res.status(400).json({ error: 'Exam already submitted' });
        }

        // Get all answers with question details
        const { data: answers } = await getSupabase()
            .from('exam_answers')
            .select('question_id, answer')
            .eq('submission_id', submission_id);

        // Get question details
        const questionIds = (answers || []).map(a => a.question_id);
        const { data: questions } = await getSupabase()
            .from('questions')
            .select('id, correct_answer, points, question_type')
            .in('id', questionIds);

        let totalScore = 0;
        let correctAnswers = 0;
        let gradedAnswers = 0;

        // Calculate score
        (answers || []).forEach(answer => {
            const question = questions?.find(q => q.id === answer.question_id);
            if (!question) return;

            if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
                gradedAnswers++;
                const studentAnswer = String(answer.answer).trim().toUpperCase();
                const correctAnswer = String(question.correct_answer).trim().toUpperCase();

                if (studentAnswer === correctAnswer) {
                    totalScore += question.points;
                    correctAnswers++;
                }
            }
        });

        // Update submission
        const { data: updatedSubmission, error: updateError } = await getSupabase()
            .from('exam_submissions')
            .update({
                status: 'submitted',
                score: totalScore,
                submitted_at: new Date().toISOString()
            })
            .eq('id', submission_id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating submission:', updateError);
            return res.status(500).json({ error: 'Failed to submit exam' });
        }

        console.log('✓ Exam submitted successfully');

        res.json({
            message: 'Exam submitted successfully',
            submission: updatedSubmission,
            score: totalScore,
            correctAnswers,
            totalQuestions: answers?.length || 0,
            gradedQuestions: gradedAnswers
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

        // Get submission info with exam and user details
        const { data: submission, error } = await getSupabase()
            .from('exam_submissions')
            .select(`
                *,
                exams:exam_id (title, description, duration),
                users:user_id (username)
            `)
            .eq('id', id)
            .single();

        if (error || !submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        // Check if user owns this submission or is admin/teacher
        if (submission.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'teacher') {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Get answers with question info
        const { data: answers } = await getSupabase()
            .from('exam_answers')
            .select('question_id, answer')
            .eq('submission_id', id);

        // Get question details
        const questionIds = (answers || []).map(a => a.question_id);
        let questionsData = [];
        if (questionIds.length > 0) {
            const { data } = await getSupabase()
                .from('questions')
                .select('id, question_text, question_type, options, correct_answer, points')
                .in('id', questionIds);
            questionsData = data || [];
        }

        // Combine answers with question data
        const answersWithQuestions = (answers || []).map(a => {
            const question = questionsData.find(q => q.id === a.question_id);
            return {
                question_id: a.question_id,
                student_answer: a.answer,
                question_text: question?.question_text,
                question_type: question?.question_type,
                options: question?.options,
                correct_answer: question?.correct_answer,
                points: question?.points
            };
        });

        res.json({
            submission: {
                id: submission.id,
                exam_id: submission.exam_id,
                exam_title: submission.exams?.title,
                exam_description: submission.exams?.description,
                score: submission.score || 0,
                submitted_at: submission.submitted_at,
                duration: submission.exams?.duration
            },
            answers: answersWithQuestions
        });
    } catch (err) {
        console.error('Error in getSubmissionById:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get user submissions
exports.getUserSubmissions = async (req, res) => {
    try {
        const { data: submissions, error } = await getSupabase()
            .from('exam_submissions')
            .select(`
                *,
                exams:exam_id (title)
            `)
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching submissions:', error);
            return res.status(500).json({ error: 'Failed to fetch submissions' });
        }

        const transformedSubmissions = (submissions || []).map(s => ({
            ...s,
            exam_title: s.exams?.title
        }));

        res.json({ submissions: transformedSubmissions });
    } catch (err) {
        console.error('Error in getUserSubmissions:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get user results (for student results page)
exports.getUserResults = async (req, res) => {
    try {
        const supabase = getSupabase();
        
        if (!supabase) {
            console.error('Supabase client not initialized');
            return res.status(500).json({ error: 'Database connection error' });
        }

        const { data: submissions, error } = await supabase
            .from('exam_submissions')
            .select(`
                id,
                exam_id,
                score,
                submitted_at,
                status,
                exams:exam_id (title, description)
            `)
            .eq('user_id', req.user.id)
            .eq('status', 'submitted')
            .order('submitted_at', { ascending: false });

        if (error) {
            console.error('Error fetching results:', error);
            return res.status(500).json({ error: 'Failed to fetch results', details: error.message });
        }

        const results = (submissions || []).map(s => ({
            submission_id: s.id,
            exam_id: s.exam_id,
            exam_title: s.exams?.title,
            exam_description: s.exams?.description,
            score: s.score || 0,
            submitted_at: s.submitted_at,
            status: s.status
        }));

        console.log(`Found ${results.length} results for user ${req.user.id}`);

        res.json({ results });
    } catch (err) {
        console.error('Error in getUserResults:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

// Reset submission (Admin/Teacher only)
exports.resetSubmission = async (req, res) => {
    try {
        const { exam_id, user_id } = req.body;

        // Hanya admin dan teacher yang bisa reset
        if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Get submission ID first
        const { data: submissions } = await getSupabase()
            .from('exam_submissions')
            .select('id')
            .eq('exam_id', exam_id)
            .eq('user_id', user_id);

        if (!submissions || submissions.length === 0) {
            return res.status(404).json({ error: 'No submission found to reset' });
        }

        const submission_id = submissions[0].id;

        // Delete answers first
        await getSupabase()
            .from('exam_answers')
            .delete()
            .eq('submission_id', submission_id);

        // Delete submission
        await getSupabase()
            .from('exam_submissions')
            .delete()
            .eq('id', submission_id);

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

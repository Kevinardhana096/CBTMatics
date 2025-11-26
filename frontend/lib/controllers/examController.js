// Controller untuk CRUD ujian dan jadwal
// Menggunakan Supabase Client untuk koneksi yang reliable
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all exams
exports.getAllExams = async (req, res) => {
    try {
        const { data: exams, error } = await supabase
            .from('exams')
            .select(`
                *,
                users:created_by (username)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching exams:', error);
            return res.status(500).json({ error: 'Failed to fetch exams' });
        }

        // Transform data to include created_by_name
        const transformedExams = (exams || []).map(exam => ({
            ...exam,
            created_by_name: exam.users?.username || null
        }));

        res.json({ exams: transformedExams });
    } catch (err) {
        console.error('Error in getAllExams:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get exam by ID
exports.getExamById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: exam, error: examError } = await supabase
            .from('exams')
            .select('*')
            .eq('id', id)
            .single();

        if (examError || !exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Get questions for this exam
        const { data: examQuestions } = await supabase
            .from('exam_questions')
            .select('question_id, question_order')
            .eq('exam_id', id)
            .order('question_order');

        let questions = [];
        if (examQuestions && examQuestions.length > 0) {
            const questionIds = examQuestions.map(eq => eq.question_id);
            const { data: questionsData } = await supabase
                .from('questions')
                .select('*')
                .in('id', questionIds);

            // Sort questions by order
            questions = examQuestions.map(eq =>
                questionsData?.find(q => q.id === eq.question_id)
            ).filter(Boolean);
        }

        res.json({ exam, questions });
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
        const { data: exam, error: examError } = await supabase
            .from('exams')
            .insert([{
                title,
                description,
                duration,
                start_time,
                end_time,
                created_by: req.user.id
            }])
            .select()
            .single();

        if (examError) {
            console.error('Error creating exam:', examError);
            return res.status(500).json({ error: 'Failed to create exam' });
        }

        // Insert exam questions relation
        if (question_ids && question_ids.length > 0) {
            const examQuestions = question_ids.map((qId, index) => ({
                exam_id: exam.id,
                question_id: qId,
                question_order: index + 1
            }));

            await supabase.from('exam_questions').insert(examQuestions);
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

        const { data: exam, error } = await supabase
            .from('exams')
            .update({
                title,
                description,
                duration,
                start_time,
                end_time,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error || !exam) {
            return res.status(404).json({ error: 'Exam not found' });
        }

        // Update exam questions if provided
        if (question_ids) {
            // Delete existing questions
            await supabase.from('exam_questions').delete().eq('exam_id', id);

            // Insert new questions
            if (question_ids.length > 0) {
                const examQuestions = question_ids.map((qId, index) => ({
                    exam_id: parseInt(id),
                    question_id: qId,
                    question_order: index + 1
                }));

                await supabase.from('exam_questions').insert(examQuestions);
            }
        }

        res.json({
            message: 'Exam updated successfully',
            exam
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

        const { data, error } = await supabase
            .from('exams')
            .delete()
            .eq('id', id)
            .select('id')
            .single();

        if (error || !data) {
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
        const { data: exams, error } = await supabase
            .from('exams')
            .select('*')
            .gte('end_time', new Date().toISOString())
            .order('start_time', { ascending: true });

        if (error) {
            console.error('Error fetching exams:', error);
            return res.status(500).json({ error: 'Failed to fetch exams' });
        }

        // Check submission status for each exam
        const examsWithStatus = await Promise.all((exams || []).map(async (exam) => {
            const { data: submissions } = await supabase
                .from('exam_submissions')
                .select('status')
                .eq('exam_id', exam.id)
                .eq('user_id', user_id);

            const hasStarted = submissions?.some(s => s.status === 'in_progress') || false;
            const hasSubmitted = submissions?.some(s => s.status === 'submitted') || false;

            return {
                ...exam,
                has_started: hasStarted,
                has_submitted: hasSubmitted
            };
        }));

        console.log('✓ Found exams:', examsWithStatus.length);
        res.json({ exams: examsWithStatus });
    } catch (err) {
        console.error('❌ Error in getAvailableExams:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

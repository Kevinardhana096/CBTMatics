// Controller untuk CRUD soal
// Menggunakan Supabase Client untuk koneksi yang reliable
// Note: Import/export sekarang ditangani langsung di API route untuk kompatibilitas serverless
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

// Get all questions
exports.getAllQuestions = async (req, res) => {
    try {
        const { page = 1, limit = 10, subject, difficulty } = req.query;
        const offset = (page - 1) * limit;

        let query = getSupabase().from('questions').select('*', { count: 'exact' });

        if (subject) {
            query = query.eq('subject', subject);
        }

        if (difficulty) {
            query = query.eq('difficulty', difficulty);
        }

        query = query.order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        const { data: questions, error, count } = await query;

        if (error) {
            console.error('Error fetching questions:', error);
            return res.status(500).json({ error: 'Failed to fetch questions' });
        }

        res.json({
            questions: questions || [],
            total: count || 0,
            page: parseInt(page),
            totalPages: Math.ceil((count || 0) / limit)
        });
    } catch (err) {
        console.error('Error in getAllQuestions:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get question by ID
exports.getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: question, error } = await getSupabase()
            .from('questions')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.json(question);
    } catch (err) {
        console.error('Error in getQuestionById:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create new question
exports.createQuestion = async (req, res) => {
    try {
        const { question_text, question_type, options, correct_answer, subject, difficulty, points } = req.body;

        // Validate and parse options if it's a string
        let parsedOptions = options;
        if (typeof options === 'string') {
            try {
                parsedOptions = JSON.parse(options);
            } catch (e) {
                console.error('Failed to parse options:', e);
                return res.status(400).json({ error: 'Invalid options format. Must be valid JSON.' });
            }
        }

        console.log('Creating question with data:', {
            question_text: question_text?.substring(0, 100) + '...',
            question_type,
            options: parsedOptions,
            correct_answer,
            subject,
            difficulty,
            points,
            created_by: req.user.id
        });

        const { data: question, error } = await getSupabase()
            .from('questions')
            .insert([{
                question_text,
                question_type,
                options: parsedOptions,
                correct_answer,
                subject,
                difficulty,
                points,
                created_by: req.user.id
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating question:', error);
            return res.status(500).json({ error: 'Failed to create question', details: error.message });
        }

        res.status(201).json({
            message: 'Question created successfully',
            question
        });
    } catch (err) {
        console.error('Error in createQuestion:', err);
        console.error('Error details:', {
            message: err.message,
            code: err.code,
            detail: err.detail,
            stack: err.stack
        });
        res.status(500).json({
            error: 'Server error',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Update question
exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { question_text, question_type, options, correct_answer, subject, difficulty, points } = req.body;

        const { data: question, error } = await getSupabase()
            .from('questions')
            .update({
                question_text,
                question_type,
                options,
                correct_answer,
                subject,
                difficulty,
                points,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error || !question) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.json({
            message: 'Question updated successfully',
            question
        });
    } catch (err) {
        console.error('Error in updateQuestion:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await getSupabase()
            .from('questions')
            .delete()
            .eq('id', id)
            .select('id')
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.json({ message: 'Question deleted successfully' });
    } catch (err) {
        console.error('Error in deleteQuestion:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Note: Import questions is now handled directly in /api/questions/import/route.ts
// for serverless compatibility (no filesystem access needed)

// Export questions to CSV (in-memory, serverless compatible)
exports.exportQuestions = async (req, res) => {
    try {
        const { data: questions, error } = await getSupabase()
            .from('questions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching questions for export:', error);
            return res.status(500).json({ error: 'Failed to export questions' });
        }

        // Convert to CSV format in memory
        const headers = ['question_text', 'question_type', 'option_a', 'option_b', 'option_c', 'option_d', 'option_e', 'correct_answer', 'subject', 'difficulty', 'points'];
        
        const csvRows = [headers.join(',')];
        
        for (const q of questions) {
            const options = q.options || {};
            const row = [
                `"${(q.question_text || '').replace(/"/g, '""')}"`,
                q.question_type || 'multiple_choice',
                `"${(options.A || '').replace(/"/g, '""')}"`,
                `"${(options.B || '').replace(/"/g, '""')}"`,
                `"${(options.C || '').replace(/"/g, '""')}"`,
                `"${(options.D || '').replace(/"/g, '""')}"`,
                `"${(options.E || '').replace(/"/g, '""')}"`,
                q.correct_answer || '',
                q.subject || '',
                q.difficulty || 'medium',
                q.points || 10
            ];
            csvRows.push(row.join(','));
        }

        const csvContent = csvRows.join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=questions_export.csv');
        res.send(csvContent);
    } catch (err) {
        console.error('Error in exportQuestions:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

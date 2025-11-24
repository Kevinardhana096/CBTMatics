// Controller untuk CRUD soal, import/export
const pool = require('../db');
const xlsx = require('xlsx');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const AdmZip = require('adm-zip');

// Setup multer untuk upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'questions-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.csv', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only Excel (.xlsx, .xls), CSV, and ZIP files are allowed'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Export upload middleware untuk digunakan di routes
exports.uploadMiddleware = upload.single('file');

// Get all questions
exports.getAllQuestions = async (req, res) => {
    try {
        const { page = 1, limit = 10, subject, difficulty } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM questions WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (subject) {
            query += ` AND subject = $${paramCount}`;
            params.push(subject);
            paramCount++;
        }

        if (difficulty) {
            query += ` AND difficulty = $${paramCount}`;
            params.push(difficulty);
            paramCount++;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        const countResult = await pool.query('SELECT COUNT(*) FROM questions');

        res.json({
            questions: result.rows,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            totalPages: Math.ceil(countResult.rows[0].count / limit)
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
        const result = await pool.query('SELECT * FROM questions WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.json(result.rows[0]);
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

        const result = await pool.query(
            `INSERT INTO questions (question_text, question_type, options, correct_answer, subject, difficulty, points, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [question_text, question_type, parsedOptions, correct_answer, subject, difficulty, points, req.user.id]
        );

        res.status(201).json({
            message: 'Question created successfully',
            question: result.rows[0]
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

        const result = await pool.query(
            `UPDATE questions 
             SET question_text = $1, question_type = $2, options = $3, correct_answer = $4, 
                 subject = $5, difficulty = $6, points = $7, updated_at = CURRENT_TIMESTAMP
             WHERE id = $8 RETURNING *`,
            [question_text, question_type, options, correct_answer, subject, difficulty, points, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.json({
            message: 'Question updated successfully',
            question: result.rows[0]
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
        const result = await pool.query('DELETE FROM questions WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.json({ message: 'Question deleted successfully' });
    } catch (err) {
        console.error('Error in deleteQuestion:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Import questions from CSV/Excel
exports.importQuestions = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const fileExt = path.extname(req.file.originalname).toLowerCase();

        console.log(`📁 Import file: ${req.file.originalname} (${fileExt})`);

        let questions = [];
        let imageFiles = {}; // Store extracted images

        // Handle ZIP file with images
        if (fileExt === '.zip') {
            console.log('🔄 Processing ZIP file...');
            try {
                // Try to read ZIP file with better error handling
                let zip;
                try {
                    zip = new AdmZip(filePath);
                } catch (zipReadError) {
                    console.error('Failed to read ZIP file:', zipReadError);
                    throw new Error('File ZIP tidak valid atau corrupt. Pastikan file ZIP dibuat dengan benar.');
                }

                const zipEntries = zip.getEntries();

                if (!zipEntries || zipEntries.length === 0) {
                    throw new Error('File ZIP kosong atau tidak memiliki file di dalamnya.');
                }

                console.log(`ZIP contains ${zipEntries.length} entries`);

                // Create directory for question images
                const questionsImagesDir = path.join(__dirname, '../../uploads/questions');
                if (!fs.existsSync(questionsImagesDir)) {
                    fs.mkdirSync(questionsImagesDir, { recursive: true });
                }

                // Extract images from zip
                let imageCount = 0;
                zipEntries.forEach(entry => {
                    // Skip directories and __MACOSX folder (Mac OS metadata)
                    if (entry.isDirectory || entry.entryName.includes('__MACOSX') || entry.entryName.startsWith('.')) {
                        return;
                    }

                    const fileName = path.basename(entry.entryName).toLowerCase();
                    console.log(`Processing entry: ${entry.entryName} (basename: ${fileName})`);

                    // Check if it's an image file
                    if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ||
                        fileName.endsWith('.png') || fileName.endsWith('.gif') ||
                        fileName.endsWith('.svg') || fileName.endsWith('.webp')) {

                        try {
                            // Extract image to uploads/questions/ folder
                            const imageName = path.basename(entry.entryName);
                            const imagePath = path.join(questionsImagesDir, imageName);

                            const imageData = entry.getData();
                            if (imageData && imageData.length > 0) {
                                fs.writeFileSync(imagePath, imageData);

                                // Store the URL path
                                imageFiles[imageName] = `/uploads/questions/${imageName}`;
                                imageFiles[imageName.toLowerCase()] = `/uploads/questions/${imageName}`; // Also store lowercase version
                                imageCount++;
                                console.log(`✓ Extracted image: ${imageName} (${imageData.length} bytes)`);
                            } else {
                                console.warn(`⚠ Skipped empty image: ${imageName}`);
                            }
                        } catch (extractError) {
                            console.error(`Error extracting ${entry.entryName}:`, extractError);
                        }
                    }
                });

                console.log(`Extracted ${imageCount} images from ZIP`);

                // Find CSV file in ZIP
                let csvEntry = zipEntries.find(entry => {
                    const basename = path.basename(entry.entryName).toLowerCase();
                    return !entry.isDirectory &&
                        basename.endsWith('.csv') &&
                        !entry.entryName.includes('__MACOSX') &&
                        !entry.entryName.startsWith('.');
                });

                if (!csvEntry) {
                    throw new Error('Tidak ada file CSV ditemukan di dalam ZIP. Pastikan ZIP berisi file CSV dengan data soal.');
                }

                console.log(`Found CSV file: ${csvEntry.entryName}`);

                // Parse CSV from ZIP
                const csvContent = csvEntry.getData().toString('utf8');
                const csvLines = csvContent.split(/\r?\n/); // Handle both Windows and Unix line endings

                if (csvLines.length < 2) {
                    throw new Error('File CSV kosong atau hanya memiliki header.');
                }

                const headers = csvLines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
                console.log('CSV Headers:', headers);

                for (let i = 1; i < csvLines.length; i++) {
                    if (!csvLines[i].trim()) continue;

                    const values = csvLines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
                    const row = {};

                    headers.forEach((header, index) => {
                        if (values[index]) {
                            row[header] = values[index].trim().replace(/^"|"$/g, '');
                        }
                    });

                    if (!row.question_text) continue;

                    // Process image column if exists
                    let questionText = row.question_text;
                    const imageRef = row.image ? row.image.trim() : null;

                    if (imageRef && (imageFiles[imageRef] || imageFiles[imageRef.toLowerCase()])) {
                        // Get the correct image path (case-insensitive)
                        const imagePath = imageFiles[imageRef] || imageFiles[imageRef.toLowerCase()];
                        // Insert image tag into question text
                        questionText = `<img src="${imagePath}" alt="Question Image" style="max-width: 100%; height: auto; margin: 10px 0;"/><br/>${questionText}`;
                        console.log(`✓ Added image to question: ${imageRef}`);
                    } else if (imageRef) {
                        console.warn(`⚠ Image not found in ZIP: ${imageRef}`);
                    }

                    // Process options with images
                    let options = null;
                    if (row.option_a || row.option_b || row.option_c || row.option_d) {
                        options = {};
                        const optionMapping = {
                            'option_a': 'A',
                            'option_b': 'B',
                            'option_c': 'C',
                            'option_d': 'D',
                            'option_e': 'E'
                        };
                        Object.entries(optionMapping).forEach(([csvKey, objKey]) => {
                            if (row[csvKey]) {
                                let optionValue = row[csvKey];
                                // Check if option has image reference
                                const imageKey = csvKey + '_image';
                                const optImageRef = row[imageKey] ? row[imageKey].trim() : null;

                                if (optImageRef && (imageFiles[optImageRef] || imageFiles[optImageRef.toLowerCase()])) {
                                    const imagePath = imageFiles[optImageRef] || imageFiles[optImageRef.toLowerCase()];
                                    optionValue = `<img src="${imagePath}" alt="Option ${objKey}" style="max-width: 200px; height: auto;"/><br/>${optionValue}`;
                                }
                                options[objKey] = optionValue;
                            }
                        });
                    } else if (row.options && row.options.toLowerCase() !== 'null') {
                        try {
                            options = JSON.parse(row.options);
                        } catch (e) {
                            if (row.options.includes('|')) {
                                const optArray = row.options.split('|').map(opt => opt.trim());
                                options = {};
                                const keys = ['A', 'B', 'C', 'D', 'E'];
                                optArray.forEach((opt, idx) => {
                                    if (idx < keys.length) {
                                        options[keys[idx]] = opt;
                                    }
                                });
                            }
                        }
                    }

                    questions.push({
                        question_text: questionText,
                        question_type: row.question_type || 'multiple_choice',
                        options: options,
                        correct_answer: row.correct_answer || '',
                        subject: row.subject || 'Umum',
                        difficulty: row.difficulty || 'medium',
                        points: parseInt(row.points) || 10
                    });
                }

                console.log(`✓ Processed ${questions.length} questions from ZIP with ${imageCount} images`);

            } catch (zipError) {
                console.error('Error processing ZIP:', zipError);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                return res.status(400).json({
                    error: zipError.message || 'Gagal memproses file ZIP. Pastikan format ZIP benar dan berisi file CSV serta gambar.'
                });
            }
        } else if (fileExt === '.csv') {
            console.log('🔄 Processing CSV file...');
            // Parse CSV using csv-parser library
            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (row) => {
                        let options = null;

                        // Check if row has option_a, option_b, etc columns
                        if (row.option_a || row.option_b || row.option_c || row.option_d) {
                            options = {};
                            const optionMapping = {
                                'option_a': 'A',
                                'option_b': 'B',
                                'option_c': 'C',
                                'option_d': 'D',
                                'option_e': 'E'
                            };
                            Object.entries(optionMapping).forEach(([csvKey, objKey]) => {
                                if (row[csvKey]) {
                                    options[objKey] = row[csvKey];
                                }
                            });
                        } else if (row.options && row.options.toLowerCase() !== 'null') {
                            try {
                                options = JSON.parse(row.options);
                            } catch (e) {
                                // If not JSON, try split by |
                                if (row.options.includes('|')) {
                                    const optArray = row.options.split('|').map(opt => opt.trim());
                                    // Convert array to object format
                                    options = {};
                                    const keys = ['A', 'B', 'C', 'D', 'E'];
                                    optArray.forEach((opt, idx) => {
                                        if (idx < keys.length) {
                                            options[keys[idx]] = opt;
                                        }
                                    });
                                }
                            }
                        }

                        questions.push({
                            question_text: row.question_text || '',
                            question_type: row.question_type || 'multiple_choice',
                            options: options,
                            correct_answer: row.correct_answer || '',
                            subject: row.subject || 'Umum',
                            difficulty: row.difficulty || 'medium',
                            points: parseInt(row.points) || 10
                        });
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });
        } else if (fileExt === '.xlsx' || fileExt === '.xls') {
            console.log('🔄 Processing Excel file...');
            // Parse Excel (.xlsx, .xls)
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet);

            questions = data.map(row => {
                // Support multiple option formats
                let options = null;
                if (row.options) {
                    if (typeof row.options === 'string') {
                        try {
                            options = JSON.parse(row.options);
                        } catch {
                            // If not JSON, try to split by |
                            const optArray = row.options.split('|').map(opt => opt.trim());
                            // Convert array to object format: {A: "...", B: "...", C: "...", D: "..."}
                            options = {};
                            const keys = ['A', 'B', 'C', 'D', 'E'];
                            optArray.forEach((opt, idx) => {
                                if (idx < keys.length) {
                                    options[keys[idx]] = opt;
                                }
                            });
                        }
                    } else if (Array.isArray(row.options)) {
                        // Convert array to object format
                        options = {};
                        const keys = ['A', 'B', 'C', 'D', 'E'];
                        row.options.forEach((opt, idx) => {
                            if (idx < keys.length) {
                                options[keys[idx]] = opt;
                            }
                        });
                    } else if (typeof row.options === 'object') {
                        // Already an object, use as-is
                        options = row.options;
                    }
                } else {
                    // Build options from option_a, option_b, etc columns
                    const optionMapping = {
                        'option_a': 'A',
                        'option_b': 'B',
                        'option_c': 'C',
                        'option_d': 'D',
                        'option_e': 'E'
                    };
                    options = {};
                    let hasOptions = false;
                    Object.entries(optionMapping).forEach(([csvKey, objKey]) => {
                        if (row[csvKey]) {
                            options[objKey] = row[csvKey];
                            hasOptions = true;
                        }
                    });
                    if (!hasOptions) {
                        options = null;
                    }
                }

                return {
                    question_text: row.question_text || row.pertanyaan || row.soal,
                    question_type: row.question_type || row.tipe_soal || 'multiple_choice',
                    options: options,
                    correct_answer: row.correct_answer || row.jawaban_benar || row.jawaban,
                    subject: row.subject || row.mata_pelajaran || row.mapel,
                    difficulty: row.difficulty || row.tingkat_kesulitan || 'medium',
                    points: parseInt(row.points || row.poin || row.nilai) || 10
                };
            });
        }

        // Validate and insert questions
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const insertedQuestions = [];
            const errors = [];

            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                try {
                    // Validate required fields
                    if (!q.question_text || !q.question_type) {
                        errors.push({ row: i + 2, error: 'Missing required fields (question_text or question_type)' });
                        continue;
                    }

                    const result = await client.query(
                        `INSERT INTO questions (question_text, question_type, options, correct_answer, subject, difficulty, points, created_by)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                        [
                            q.question_text,
                            q.question_type,
                            q.options ? JSON.stringify(q.options) : null,
                            q.correct_answer,
                            q.subject || 'Umum',
                            q.difficulty || 'medium',
                            q.points || 10,
                            req.user.id
                        ]
                    );
                    insertedQuestions.push(result.rows[0]);
                } catch (err) {
                    errors.push({ row: i + 2, error: err.message });
                }
            }

            await client.query('COMMIT');

            // Delete uploaded file
            fs.unlinkSync(filePath);

            res.json({
                message: 'Import completed',
                success: insertedQuestions.length,
                failed: errors.length,
                total: questions.length,
                questions: insertedQuestions,
                errors: errors
            });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error in importQuestions:', err);
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: err.message || 'Server error' });
    }
};

// Export questions to CSV
exports.exportQuestions = async (req, res) => {
    try {
        // TODO: Implement CSV export logic
        res.status(501).json({ message: 'Export feature coming soon' });
    } catch (err) {
        console.error('Error in exportQuestions:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

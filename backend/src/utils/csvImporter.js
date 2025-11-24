// CSV/Excel Importer untuk soal
const csv = require('csv-parser');
const fs = require('fs');
const pool = require('../config/db');

/**
 * Import questions from CSV file
 * Expected CSV format:
 * question_text, question_type, options (JSON string), correct_answer, subject, difficulty, points
 */
async function importQuestionsFromCSV(filePath, createdBy) {
    const questions = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                try {
                    questions.push({
                        question_text: row.question_text,
                        question_type: row.question_type,
                        options: JSON.parse(row.options), // Parse JSON string
                        correct_answer: row.correct_answer,
                        subject: row.subject,
                        difficulty: row.difficulty,
                        points: parseInt(row.points),
                        created_by: createdBy
                    });
                } catch (err) {
                    console.error('Error parsing row:', err);
                }
            })
            .on('end', async () => {
                try {
                    // Insert all questions to database
                    const insertedQuestions = [];
                    for (const question of questions) {
                        const result = await pool.query(
                            `INSERT INTO questions (question_text, question_type, options, correct_answer, subject, difficulty, points, created_by)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                            [
                                question.question_text,
                                question.question_type,
                                question.options,
                                question.correct_answer,
                                question.subject,
                                question.difficulty,
                                question.points,
                                question.created_by
                            ]
                        );
                        insertedQuestions.push(result.rows[0]);
                    }
                    resolve({
                        success: true,
                        count: insertedQuestions.length,
                        questions: insertedQuestions
                    });
                } catch (err) {
                    reject(err);
                }
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

/**
 * Export questions to CSV
 */
async function exportQuestionsToCSV(filters = {}) {
    let query = 'SELECT * FROM questions WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.subject) {
        query += ` AND subject = $${paramCount}`;
        params.push(filters.subject);
        paramCount++;
    }

    if (filters.difficulty) {
        query += ` AND difficulty = $${paramCount}`;
        params.push(filters.difficulty);
    }

    const result = await pool.query(query, params);

    // Convert to CSV format
    const csvHeaders = 'question_text,question_type,options,correct_answer,subject,difficulty,points\n';
    const csvRows = result.rows.map(q => {
        return `"${q.question_text}","${q.question_type}","${JSON.stringify(q.options)}","${q.correct_answer}","${q.subject}","${q.difficulty}",${q.points}`;
    }).join('\n');

    return csvHeaders + csvRows;
}

module.exports = {
    importQuestionsFromCSV,
    exportQuestionsToCSV
};

// Question model - representasi tabel questions
const pool = require('../config/db');

class Question {
    static async findById(id) {
        const result = await pool.query('SELECT * FROM questions WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async create(questionData) {
        const { question_text, question_type, options, correct_answer, subject, difficulty, points, created_by } = questionData;
        const result = await pool.query(
            `INSERT INTO questions (question_text, question_type, options, correct_answer, subject, difficulty, points, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [question_text, question_type, options, correct_answer, subject, difficulty, points, created_by]
        );
        return result.rows[0];
    }

    static async update(id, questionData) {
        const { question_text, question_type, options, correct_answer, subject, difficulty, points } = questionData;
        const result = await pool.query(
            `UPDATE questions 
             SET question_text = $1, question_type = $2, options = $3, correct_answer = $4, 
                 subject = $5, difficulty = $6, points = $7, updated_at = CURRENT_TIMESTAMP
             WHERE id = $8 RETURNING *`,
            [question_text, question_type, options, correct_answer, subject, difficulty, points, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('DELETE FROM questions WHERE id = $1', [id]);
    }

    static async getAll(filters = {}) {
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
            paramCount++;
        }

        query += ' ORDER BY created_at DESC';

        if (filters.limit) {
            query += ` LIMIT $${paramCount}`;
            params.push(filters.limit);
            paramCount++;
        }

        if (filters.offset) {
            query += ` OFFSET $${paramCount}`;
            params.push(filters.offset);
        }

        const result = await pool.query(query, params);
        return result.rows;
    }

    static async count(filters = {}) {
        let query = 'SELECT COUNT(*) FROM questions WHERE 1=1';
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
        return parseInt(result.rows[0].count);
    }
}

module.exports = Question;

// Import dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import database config
const pool = require('./src/config/db');

// Import routes
const apiRoutes = require('./src/routes');

// Inisialisasi Express
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors()); // Mengizinkan cross-origin request
app.use(express.json({ limit: '50mb' })); // Untuk membaca body request dalam format JSON dengan limit 50MB
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Untuk parsing URL-encoded bodies dengan limit 50MB

// Serve static files (images, uploads)
app.use('/uploads', express.static('uploads'));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Mount API routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'CBT API Server is running!',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            questions: '/api/questions',
            exams: '/api/exams',
            users: '/api/users',
            reports: '/api/reports',
            health: '/api/health'
        }
    });
});

// Route untuk testing koneksi database (legacy)
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT current_database(), current_user, version()');
        res.json({
            message: 'Koneksi ke database berhasil!',
            data: result.rows[0],
        });
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Gagal terhubung ke database' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 CBT Server running on port ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api`);
    console.log(`========================================`);
});
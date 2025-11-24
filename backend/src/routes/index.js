// Router utama - menggabungkan semua route
const express = require('express');
const router = express.Router();

// Import sub-routes
const authRoutes = require('./authRoutes');
const questionRoutes = require('./questionRoutes');
const examRoutes = require('./examRoutes');
const userRoutes = require('./userRoutes');
const reportRoutes = require('./reportRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/questions', questionRoutes);
router.use('/exams', examRoutes);
router.use('/users', userRoutes);
router.use('/reports', reportRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'CBT API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;

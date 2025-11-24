// Report routes - /api/reports
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const { isTeacher } = require('../middleware/roleCheck');

// Protected routes - require authentication
router.use(auth);

// Get exam report (admin/teacher only)
router.get('/exam/:examId', isTeacher, reportController.getExamReport);

// Get question analytics (admin/teacher only)
router.get('/exam/:examId/analytics', isTeacher, reportController.getQuestionAnalytics);

// Get student performance
router.get('/student/:studentId', reportController.getStudentPerformance);

// Export report to PDF
router.get('/exam/:examId/export-pdf', isTeacher, reportController.exportReportPDF);

module.exports = router;

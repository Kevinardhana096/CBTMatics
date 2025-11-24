// Exam routes - /api/exams
const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const submissionController = require('../controllers/submissionController');
const auth = require('../middleware/auth');
const { isTeacher } = require('../middleware/roleCheck');

// Protected routes - require authentication
router.use(auth);

// Student routes - get available exams
router.get('/available', examController.getAvailableExams);

// Start exam
router.post('/start', submissionController.startExam);

// Save answer (auto-save)
router.post('/save-answer', submissionController.saveAnswer);

// Submit exam
router.post('/submit', submissionController.submitExam);

// Get user submissions
router.get('/my-submissions', submissionController.getUserSubmissions);

// Get user results (completed exams with scores)
router.get('/my-results', submissionController.getUserResults);

// Get submission detail (with aliases for convenience)
router.get('/submissions/:id', submissionController.getSubmissionById);
router.get('/submission/:id', submissionController.getSubmissionById);

// Reset submission (Admin/Teacher only)
router.post('/reset-submission', isTeacher, submissionController.resetSubmission);

// Admin/Teacher routes
router.get('/', examController.getAllExams);
router.get('/:id', examController.getExamById);
router.post('/', isTeacher, examController.createExam);
router.put('/:id', isTeacher, examController.updateExam);
router.delete('/:id', isTeacher, examController.deleteExam);

module.exports = router;

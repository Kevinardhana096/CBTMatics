// Question routes - /api/questions
const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const auth = require('../middleware/auth');
const { isTeacher } = require('../middleware/roleCheck');

// Protected routes - require authentication
router.use(auth);

// Get all questions
router.get('/', questionController.getAllQuestions);

// Get question by ID
router.get('/:id', questionController.getQuestionById);

// Admin/Teacher only routes
router.post('/', isTeacher, questionController.createQuestion);
router.put('/:id', isTeacher, questionController.updateQuestion);
router.delete('/:id', isTeacher, questionController.deleteQuestion);

// Import/Export routes
router.post('/import', isTeacher, questionController.uploadMiddleware, questionController.importQuestions);
router.get('/export', isTeacher, questionController.exportQuestions);

module.exports = router;

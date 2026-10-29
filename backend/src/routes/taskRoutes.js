const express = require('express');
const { createTask, getTasks, updateTaskStatus, deleteTask } = require('../controllers/taskController');
const { protect, requireSameOrigin } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply the 'protect' middleware to all task routes
router.route('/')
  .post(requireSameOrigin, protect, createTask)
  .get(protect, getTasks);

router.route('/:id')
  .put(requireSameOrigin, protect, updateTaskStatus)
  .delete(requireSameOrigin, protect, deleteTask);

module.exports = router;
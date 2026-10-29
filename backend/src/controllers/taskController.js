const Task = require('../models/taskModel');
const { isValidTaskId, validateTask } = require('../validation');

const createTask = async (req, res) => {
  try {
    const { title, description } = req.body || {};
    const validationError = validateTask({ title, description });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const task = await Task.createTask(req.user.id, title.trim(), description?.trim() || null);
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error during task creation' });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.getTasksByUserId(req.user.id);
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!isValidTaskId(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
    if (!['pending', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Status must be pending or completed' });
    }

    const task = await Task.updateTask(id, req.user.id, status);
    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error updating task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidTaskId(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.deleteTask(id, req.user.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error deleting task' });
  }
};

module.exports = { createTask, getTasks, updateTaskStatus, deleteTask };
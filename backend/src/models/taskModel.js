const db = require('../config/db');

const createTask = async (userId, title, description) => {
  const result = await db.query(
    'INSERT INTO tasks (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
    [userId, title, description]
  );
  return result.rows[0];
};

const getTasksByUserId = async (userId) => {
  const result = await db.query(
    'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

const updateTask = async (taskId, userId, status) => {
  const result = await db.query(
    'UPDATE tasks SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
    [status, taskId, userId]
  );
  return result.rows[0];
};

const deleteTask = async (taskId, userId) => {
  const result = await db.query(
    'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
    [taskId, userId]
  );
  return result.rows[0];
};

module.exports = {
  createTask,
  getTasksByUserId,
  updateTask,
  deleteTask
};
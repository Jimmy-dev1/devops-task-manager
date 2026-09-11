const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes'); // Added import
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Apply routes
app.use('/api/auth', authRoutes); // Added route setup
app.use('/api/tasks', taskRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Task Manager API is running!' });
});

// Test database connection
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database', err.stack);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
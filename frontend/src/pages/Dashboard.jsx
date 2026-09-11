import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchTasks();
  }, [navigate]);

  const fetchTasks = async () => {
    try {
      const response = await API.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tasks', { title, description });
      setTitle(''); // Clear the input field
      setDescription('');
      fetchTasks(); // Refresh the list from the database
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
      await API.put(`/tasks/${id}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task status', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Task Dashboard</h2>
        <button onClick={handleLogout} style={{ padding: '5px 10px' }}>Logout</button>
      </div>

      <form onSubmit={handleCreateTask} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
        <h3>New Task</h3>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '95%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <textarea
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '95%', padding: '8px', minHeight: '60px' }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 15px' }}>Add Task</button>
      </form>

      <div>
        <h3>Your Tasks</h3>
        {tasks.length === 0 ? <p>No tasks found.</p> : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {tasks.map(task => (
              <li key={task.id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                    {task.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>{task.description}</p>
                </div>
                <div>
                  <button onClick={() => handleUpdateStatus(task.id, task.status)} style={{ marginRight: '10px', padding: '5px 10px' }}>
                    {task.status === 'pending' ? 'Complete' : 'Undo'}
                  </button>
                  <button onClick={() => handleDelete(task.id)} style={{ backgroundColor: '#ff4c4c', color: 'white', border: 'none', padding: '5px 10px' }}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
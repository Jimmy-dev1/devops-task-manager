import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import API from './api';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

const PrivateRoute = () => {
  const [session, setSession] = useState('checking');

  useEffect(() => {
    API.get('/auth/me')
      .then(() => setSession('authenticated'))
      .catch((error) => {
        setSession(error.response?.status === 401 ? 'unauthenticated' : 'error');
      });
  }, []);

  if (session === 'checking') {
    return <main className="session-message">Checking your session…</main>;
  }
  if (session === 'error') {
    return <main className="session-message">Unable to verify your session. Check your connection and reload.</main>;
  }
  return session === 'authenticated' ? <Dashboard /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const formatDate = (date) => new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
}).format(new Date(date));

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    API.get('/tasks')
      .then((response) => {
        if (active) setTasks(response.data);
      })
      .catch((fetchError) => {
        if (fetchError.response?.status === 401) {
          navigate('/login');
        } else if (active) {
          setError('We could not load your tasks. Please try again.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const completedCount = tasks.filter((task) => task.status === 'completed').length;
  const pendingCount = tasks.length - completedCount;
  const completionRate = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const searchableText = `${task.title} ${task.description || ''}`.toLowerCase();
    return matchesFilter && searchableText.includes(query.trim().toLowerCase());
  }), [filter, query, tasks]);

  const handleCreateTask = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await API.post('/tasks', { title, description });
      setTitle('');
      setDescription('');
      setTasks((currentTasks) => [response.data, ...currentTasks]);
      setNotice('Your task has been added.');
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        navigate('/login');
      } else {
        setError(requestError.response?.data?.message || 'Could not add this task.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (task) => {
    const status = task.status === 'pending' ? 'completed' : 'pending';
    setBusyTaskId(task.id);
    setError('');
    try {
      const response = await API.put(`/tasks/${task.id}`, { status });
      setTasks((currentTasks) => currentTasks.map((item) => (
        item.id === task.id ? response.data : item
      )));
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        navigate('/login');
      } else {
        setError(requestError.response?.data?.message || 'Could not update this task.');
      }
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleDelete = async (taskId) => {
    setBusyTaskId(taskId);
    setError('');
    setNotice('');
    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
      setNotice('Task deleted.');
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        navigate('/login');
      } else {
        setError(requestError.response?.data?.message || 'Could not delete this task.');
      }
    } finally {
      setBusyTaskId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await API.post('/auth/logout');
      navigate('/login');
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Could not sign out. Please try again.');
      }
    }
  };

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Taskflow home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
          <span>taskflow<span className="brand-period">.</span></span>
        </a>

        <p className="sidebar-label">WORKSPACE</p>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <a className="nav-link nav-link-active" href="#overview"><span className="nav-icon">⌂</span> Overview</a>
          <a className="nav-link" href="#tasks"><span className="nav-icon">▤</span> My tasks <span className="nav-count">{pendingCount}</span></a>
        </nav>

        <div className="sidebar-tip">
          <span className="tip-spark">✦</span>
          <p className="tip-title">Small steps add up.</p>
          <p>Keep your focus on what matters today.</p>
        </div>

        <button className="sidebar-logout" type="button" onClick={handleLogout}>
          <span className="nav-icon">↗</span> Sign out
        </button>
      </aside>

      <main className="dashboard-main" id="overview">
        <header className="topbar">
          <span className="breadcrumb">Workspace <span>/</span> Overview</span>
          <div className="topbar-user"><span className="avatar">Y</span><span>Your workspace</span></div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
              <h1>Make room for <span>great work.</span></h1>
              <p className="welcome-copy">A clear plan turns busy days into meaningful progress.</p>
            </div>
            <a className="primary-link" href="#new-task"><span aria-hidden="true">＋</span> Create a task</a>
          </section>

          {(error || notice) && (
            <div className={`feedback-banner${error ? ' feedback-error' : ''}`} role={error ? 'alert' : 'status'}>
              <span>{error || notice}</span>
              <button type="button" aria-label="Dismiss message" onClick={() => { setError(''); setNotice(''); }}>×</button>
            </div>
          )}

          <section className="stats-grid" aria-label="Task summary">
            <article className="stat-card stat-card-total">
              <div className="stat-card-heading"><span>Total tasks</span><span className="stat-icon">▤</span></div>
              <p className="stat-number">{tasks.length}</p>
              <p className="stat-caption">Everything on your list</p>
            </article>
            <article className="stat-card">
              <div className="stat-card-heading"><span>To do</span><span className="stat-icon stat-icon-warm">◷</span></div>
              <p className="stat-number">{pendingCount}</p>
              <p className="stat-caption">One step at a time</p>
            </article>
            <article className="stat-card">
              <div className="stat-card-heading"><span>Completed</span><span className="stat-icon stat-icon-green">✓</span></div>
              <p className="stat-number">{completedCount}</p>
              <p className="stat-caption">{completionRate}% of your tasks</p>
              <div className="progress-track" aria-label={`${completionRate}% complete`}>
                <span style={{ width: `${completionRate}%` }} />
              </div>
            </article>
          </section>

          <section className="work-grid">
            <form className="create-card" id="new-task" onSubmit={handleCreateTask}>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">CAPTURE AN IDEA</p>
                  <h2>New task</h2>
                </div>
                <span className="create-icon" aria-hidden="true">＋</span>
              </div>
              <label htmlFor="task-title">Task name</label>
              <input
                id="task-title"
                type="text"
                placeholder="e.g. Prepare project update"
                value={title}
                maxLength={255}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
              <label htmlFor="task-description">A few details <span className="optional-label">OPTIONAL</span></label>
              <textarea
                id="task-description"
                placeholder="Add context to help you get started..."
                value={description}
                maxLength={5000}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
              />
              <button className="submit-task" type="submit" disabled={saving || !title.trim()}>
                {saving ? 'Adding task…' : 'Add to my list'} <span aria-hidden="true">→</span>
              </button>
            </form>

            <section className="tasks-panel" id="tasks">
              <div className="tasks-panel-heading">
                <div>
                  <p className="eyebrow">STAY ON TRACK</p>
                  <h2>Your tasks <span className="heading-count">{tasks.length}</span></h2>
                </div>
                <div className="search-wrap">
                  <span aria-hidden="true">⌕</span>
                  <input
                    aria-label="Search tasks"
                    type="search"
                    placeholder="Search tasks"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
              </div>

              <div className="task-filters" role="group" aria-label="Filter tasks">
                {[
                  ['all', 'All tasks'],
                  ['pending', 'To do'],
                  ['completed', 'Completed'],
                ].map(([value, label]) => (
                  <button
                    className={filter === value ? 'filter-button filter-active' : 'filter-button'}
                    type="button"
                    key={value}
                    aria-pressed={filter === value}
                    onClick={() => setFilter(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="empty-state"><span className="loading-dot" /> Loading your tasks…</div>
              ) : visibleTasks.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon" aria-hidden="true">{query ? '⌕' : '✦'}</span>
                  <h3>{query || filter !== 'all' ? 'No matching tasks' : 'A fresh start'}</h3>
                  <p>
                    {query || filter !== 'all'
                      ? 'Try another search or choose a different filter.'
                      : 'Add a task to turn your next idea into progress.'}
                  </p>
                </div>
              ) : (
                <ul className="task-list">
                  {visibleTasks.map((task) => (
                    <li className={`task-item${task.status === 'completed' ? ' task-completed' : ''}`} key={task.id}>
                      <button
                        className="task-check"
                        type="button"
                        aria-label={task.status === 'completed' ? `Reopen ${task.title}` : `Complete ${task.title}`}
                        disabled={busyTaskId === task.id}
                        onClick={() => handleUpdateStatus(task)}
                      >
                        {task.status === 'completed' ? '✓' : ''}
                      </button>
                      <div className="task-detail">
                        <h3>{task.title}</h3>
                        {task.description && <p>{task.description}</p>}
                        <span className="task-date">Added {formatDate(task.created_at)}</span>
                      </div>
                      <span className={`task-status${task.status === 'completed' ? ' status-complete' : ''}`}>
                        {task.status === 'completed' ? 'Done' : 'In progress'}
                      </span>
                      <button
                        className="task-delete"
                        type="button"
                        aria-label={`Delete ${task.title}`}
                        disabled={busyTaskId === task.id}
                        onClick={() => handleDelete(task.id)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!loading && tasks.length > 0 && (
                <p className="list-footer">Showing {visibleTasks.length} of {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</p>
              )}
            </section>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

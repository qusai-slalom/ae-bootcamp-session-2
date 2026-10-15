import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import * as api from './api';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const matchesFilter = (task, filter) => {
  if (filter === 'active') return !task.completed;
  if (filter === 'completed') return task.completed;
  return true;
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [filter, setFilter] = useState('all');

  const refresh = useCallback(async () => {
    setTasks(await api.fetchTasks());
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        await refresh();
      } catch (err) {
        setLoadError(`Failed to load tasks: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refresh]);

  // Form handlers rethrow so the form can show the error and keep the user's input.
  const addTask = async (values) => {
    await api.createTask(values);
    await refresh();
  };

  const saveTask = async (task, values) => {
    await api.updateTask(task.id, values);
    await refresh();
  };

  const runAction = async (action) => {
    try {
      await action();
      await refresh();
      setActionError(null);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const toggleTask = (task) => runAction(() => api.updateTask(task.id, { completed: !task.completed }));

  const deleteTask = (task) => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    runAction(() => api.deleteTask(task.id));
  };

  const clearCompleted = () => {
    if (!window.confirm('Delete all completed tasks? This cannot be undone.')) return;
    runAction(api.deleteCompletedTasks);
  };

  const visibleTasks = tasks.filter((task) => matchesFilter(task, filter));
  const hasCompleted = tasks.some((task) => task.completed);

  const renderEmptyState = () => {
    if (tasks.length === 0) return 'No tasks yet. Add one above!';
    return `No ${filter} tasks.`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>To Do App</h1>
        <p>Keep track of your tasks</p>
      </header>

      <main>
        <section className="add-task-section">
          <h2>Add task</h2>
          <TaskForm idPrefix="new" submitLabel="Add task" onSubmit={addTask} />
        </section>

        <section className="tasks-section">
          <h2>Tasks</h2>

          <div className="filters" role="group" aria-label="Filter tasks">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`btn btn-secondary${filter === value ? ' btn-active' : ''}`}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {loading && <p role="status">Loading tasks...</p>}
          {loadError && (
            <p className="error" role="alert">
              {loadError}
            </p>
          )}
          {actionError && (
            <p className="error" role="alert">
              {actionError}
            </p>
          )}

          {!loading && !loadError && (
            <>
              {visibleTasks.length > 0 ? (
                <ul className="task-list">
                  {visibleTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onSave={saveTask}
                      onDelete={deleteTask}
                    />
                  ))}
                </ul>
              ) : (
                <p className="empty-state">{renderEmptyState()}</p>
              )}

              {hasCompleted && (
                <button type="button" className="btn btn-danger" onClick={clearCompleted}>
                  Clear completed
                </button>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

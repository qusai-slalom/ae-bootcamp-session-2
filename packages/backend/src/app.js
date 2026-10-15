const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

const { validateTaskFields } = require('./validation');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const db = new Database(':memory:');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    due_date TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )
`);

// Incomplete first (dated before undated, earliest due first, then oldest);
// completed last, most recently completed first.
const SELECT_ORDERED_TASKS = `
  SELECT * FROM tasks
  ORDER BY
    completed ASC,
    CASE WHEN completed = 0 THEN due_date IS NULL END ASC,
    CASE WHEN completed = 0 THEN due_date END ASC,
    completed_at DESC,
    created_at ASC,
    id ASC
`;

const toTask = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  dueDate: row.due_date,
  completed: row.completed === 1,
  completedAt: row.completed_at,
  createdAt: row.created_at,
});

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const findTask = (id) => db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

const sendServerError = (res, action, error) => {
  console.error(`Error trying to ${action}:`, error);
  res.status(500).json({ error: `Failed to ${action}` });
};

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

app.get('/api/tasks', (req, res) => {
  try {
    res.json(db.prepare(SELECT_ORDERED_TASKS).all().map(toTask));
  } catch (error) {
    sendServerError(res, 'fetch tasks', error);
  }
});

app.post('/api/tasks', (req, res) => {
  try {
    const { values, error } = validateTaskFields(req.body, { requireTitle: true });
    if (error) {
      return res.status(400).json({ error });
    }

    const result = db
      .prepare('INSERT INTO tasks (title, description, due_date) VALUES (?, ?, ?)')
      .run(values.title, values.description ?? '', values.dueDate ?? null);

    res.status(201).json(toTask(findTask(result.lastInsertRowid)));
  } catch (error) {
    sendServerError(res, 'create task', error);
  }
});

app.patch('/api/tasks/:id', (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const existing = findTask(id);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { values, error } = validateTaskFields(req.body, { requireTitle: false });
    if (error) {
      return res.status(400).json({ error });
    }

    const completed = values.completed ?? existing.completed === 1;
    let completedAt = null;
    if (completed) {
      completedAt = existing.completed === 1 ? existing.completed_at : new Date().toISOString();
    }

    db.prepare(
      `UPDATE tasks
       SET title = ?, description = ?, due_date = ?, completed = ?, completed_at = ?
       WHERE id = ?`
    ).run(
      values.title ?? existing.title,
      values.description ?? existing.description,
      'dueDate' in values ? values.dueDate : existing.due_date,
      completed ? 1 : 0,
      completedAt,
      id
    );

    res.json(toTask(findTask(id)));
  } catch (error) {
    sendServerError(res, 'update task', error);
  }
});

// Must be registered before '/api/tasks/:id' so "completed" is not treated as an ID.
app.delete('/api/tasks/completed', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM tasks WHERE completed = 1').run();
    res.json({ message: 'Completed tasks deleted successfully', deleted: result.changes });
  } catch (error) {
    sendServerError(res, 'delete completed tasks', error);
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully', id });
  } catch (error) {
    sendServerError(res, 'delete task', error);
  }
});

module.exports = { app, db };

const request = require('supertest');
const { app, db } = require('../../src/app');

const createTask = async (task = {}) => {
  const response = await request(app)
    .post('/api/tasks')
    .send({ title: 'Test task', ...task });
  expect(response.status).toBe(201);
  return response.body;
};

const completeTask = (id) => request(app).patch(`/api/tasks/${id}`).send({ completed: true });

const getTitles = async () => {
  const response = await request(app).get('/api/tasks');
  return response.body.map((task) => task.title);
};

const setCompletedAt = (id, timestamp) =>
  db.prepare('UPDATE tasks SET completed_at = ? WHERE id = ?').run(timestamp, id);

beforeEach(() => {
  db.exec('DELETE FROM tasks');
});

afterAll(() => {
  db.close();
});

describe('POST /api/tasks', () => {
  it('creates a task with defaults', async () => {
    const task = await createTask({ title: '  Write docs  ' });

    expect(task).toMatchObject({
      title: 'Write docs',
      description: '',
      dueDate: null,
      completed: false,
      completedAt: null,
    });
    expect(task.id).toEqual(expect.any(Number));
    expect(task.createdAt).toEqual(expect.any(String));
  });

  it('stores an optional description and due date', async () => {
    const task = await createTask({ description: 'Notes', dueDate: '2030-05-01' });
    expect(task).toMatchObject({ description: 'Notes', dueDate: '2030-05-01' });
  });

  it.each([
    ['missing', {}],
    ['empty', { title: '' }],
    ['whitespace only', { title: '   ' }],
  ])('returns 400 when the title is %s', async (_label, body) => {
    const response = await request(app).post('/api/tasks').send(body);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Title is required');
  });

  it('returns 400 when the title is too long', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ title: 'a'.repeat(201) });
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/200 characters or fewer/);
  });

  it('returns 400 for an invalid due date', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({ title: 'Task', dueDate: 'not-a-date' });
    expect(response.status).toBe(400);
  });
});

describe('GET /api/tasks', () => {
  it('returns an empty list when there are no tasks', async () => {
    const response = await request(app).get('/api/tasks');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('sorts incomplete tasks by due date, with undated tasks after dated ones', async () => {
    await createTask({ title: 'No date, created first' });
    await createTask({ title: 'Due later', dueDate: '2030-12-01' });
    await createTask({ title: 'Due sooner', dueDate: '2030-01-01' });
    await createTask({ title: 'No date, created second' });

    expect(await getTitles()).toEqual([
      'Due sooner',
      'Due later',
      'No date, created first',
      'No date, created second',
    ]);
  });

  it('orders tasks with the same due date by creation time', async () => {
    await createTask({ title: 'First', dueDate: '2030-01-01' });
    await createTask({ title: 'Second', dueDate: '2030-01-01' });

    expect(await getTitles()).toEqual(['First', 'Second']);
  });

  it('puts completed tasks last, most recently completed first', async () => {
    const a = await createTask({ title: 'A' });
    const b = await createTask({ title: 'B' });
    await createTask({ title: 'C' });

    await completeTask(a.id);
    await completeTask(b.id);
    // Explicit timestamps keep the order deterministic instead of relying on timer resolution.
    setCompletedAt(a.id, '2030-01-01T00:00:00.000Z');
    setCompletedAt(b.id, '2030-01-02T00:00:00.000Z');

    expect(await getTitles()).toEqual(['C', 'B', 'A']);
  });
});

describe('PATCH /api/tasks/:id', () => {
  it('updates title, description and due date', async () => {
    const task = await createTask({ dueDate: '2030-01-01' });

    const response = await request(app)
      .patch(`/api/tasks/${task.id}`)
      .send({ title: 'Renamed', description: 'More detail', dueDate: '2031-02-02' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      title: 'Renamed',
      description: 'More detail',
      dueDate: '2031-02-02',
    });
  });

  it('removes the due date when null is sent', async () => {
    const task = await createTask({ dueDate: '2030-01-01' });

    const response = await request(app).patch(`/api/tasks/${task.id}`).send({ dueDate: null });

    expect(response.body.dueDate).toBeNull();
  });

  it('marks a task completed and reopens it', async () => {
    const task = await createTask();

    const completed = await completeTask(task.id);
    expect(completed.body.completed).toBe(true);
    expect(completed.body.completedAt).toEqual(expect.any(String));

    const reopened = await request(app).patch(`/api/tasks/${task.id}`).send({ completed: false });
    expect(reopened.body.completed).toBe(false);
    expect(reopened.body.completedAt).toBeNull();
  });

  it('keeps other fields unchanged on a partial update', async () => {
    const task = await createTask({ title: 'Keep me', description: 'Keep this too' });

    const response = await completeTask(task.id);

    expect(response.body).toMatchObject({ title: 'Keep me', description: 'Keep this too' });
  });

  it('returns 400 when the new title is empty', async () => {
    const task = await createTask();
    const response = await request(app).patch(`/api/tasks/${task.id}`).send({ title: ' ' });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Title is required');
  });

  it('returns 404 when the task does not exist', async () => {
    const response = await request(app).patch('/api/tasks/999999').send({ title: 'x' });
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });

  it('returns 400 for an invalid id', async () => {
    const response = await request(app).patch('/api/tasks/abc').send({ title: 'x' });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Valid task ID is required');
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('deletes an existing task', async () => {
    const task = await createTask();

    const response = await request(app).delete(`/api/tasks/${task.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Task deleted successfully', id: task.id });

    expect(await getTitles()).toEqual([]);
  });

  it('returns 404 when the task does not exist', async () => {
    const response = await request(app).delete('/api/tasks/999999');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Task not found');
  });

  it('returns 400 for an invalid id', async () => {
    const response = await request(app).delete('/api/tasks/abc');
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Valid task ID is required');
  });
});

describe('DELETE /api/tasks/completed', () => {
  it('deletes only completed tasks', async () => {
    const done = await createTask({ title: 'Done' });
    await createTask({ title: 'Still open' });
    await completeTask(done.id);

    const response = await request(app).delete('/api/tasks/completed');

    expect(response.status).toBe(200);
    expect(response.body.deleted).toBe(1);
    expect(await getTitles()).toEqual(['Still open']);
  });
});

const request = require('supertest');

const { app, db } = require('../src/app');

afterAll(() => {
  db.close();
});

describe('app', () => {
  it('responds to the health check', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', message: 'Backend server is running' });
  });

  it('returns 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown');
    expect(response.status).toBe(404);
  });

  it('returns 400 for a malformed JSON body', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Content-Type', 'application/json')
      .send('{ not json');

    expect(response.status).toBe(400);
  });

  it('allows cross-origin requests', async () => {
    const response = await request(app).get('/').set('Origin', 'http://example.com');
    expect(response.headers['access-control-allow-origin']).toBe('*');
  });

  it('creates the tasks table on startup', () => {
    const table = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tasks'")
      .get();

    expect(table).toEqual({ name: 'tasks' });
  });

  describe('when the database fails', () => {
    beforeEach(() => {
      jest.spyOn(db, 'prepare').mockImplementation(() => {
        throw new Error('database unavailable');
      });
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it.each([
      ['GET', '/api/tasks', undefined, 'Failed to fetch tasks'],
      ['POST', '/api/tasks', { title: 'Task' }, 'Failed to create task'],
      ['PATCH', '/api/tasks/1', { title: 'Task' }, 'Failed to update task'],
      ['DELETE', '/api/tasks/1', undefined, 'Failed to delete task'],
      ['DELETE', '/api/tasks/completed', undefined, 'Failed to delete completed tasks'],
    ])('%s %s returns 500 with a clear message', async (method, url, body, message) => {
      const response = await request(app)[method.toLowerCase()](url).send(body);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: message });
    });
  });
});

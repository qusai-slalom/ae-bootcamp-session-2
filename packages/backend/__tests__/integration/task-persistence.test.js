const fs = require('fs');
const os = require('os');
const path = require('path');

const request = require('supertest');

describe('Task persistence', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-db-'));
  });

  afterEach(() => {
    delete process.env.DB_PATH;
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // Loads a fresh copy of the app, as if the server had just started.
  const startApp = () => {
    process.env.DB_PATH = path.join(tempDir, 'todo.db');
    let loaded;
    jest.isolateModules(() => {
      loaded = require('../../src/app');
    });
    return loaded;
  };

  it('keeps tasks after the app is restarted', async () => {
    const first = startApp();
    await request(first.app).post('/api/tasks').send({ title: 'Survive a restart' });
    first.db.close();

    const second = startApp();
    const response = await request(second.app).get('/api/tasks');
    second.db.close();

    expect(response.body.map((task) => task.title)).toEqual(['Survive a restart']);
  });
});

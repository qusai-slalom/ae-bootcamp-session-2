import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

let tasks;
let nextId;

const makeTask = (overrides) => ({
  id: nextId++,
  title: 'Task',
  description: '',
  dueDate: null,
  completed: false,
  ...overrides,
});

// Stateful fake of the backend API; ordering is the backend's job, so it is not tested here.
const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => res(ctx.json(tasks))),
  rest.post('/api/tasks', async (req, res, ctx) => {
    const task = makeTask(await req.json());
    tasks.push(task);
    return res(ctx.status(201), ctx.json(task));
  }),
  rest.patch('/api/tasks/:id', async (req, res, ctx) => {
    const task = tasks.find((t) => t.id === Number(req.params.id));
    Object.assign(task, await req.json());
    return res(ctx.json(task));
  }),
  rest.delete('/api/tasks/completed', (req, res, ctx) => {
    tasks = tasks.filter((t) => !t.completed);
    return res(ctx.json({ deleted: 1 }));
  }),
  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    tasks = tasks.filter((t) => t.id !== Number(req.params.id));
    return res(ctx.json({ message: 'Task deleted successfully' }));
  })
);

beforeAll(() => server.listen());
beforeEach(() => {
  tasks = [];
  nextId = 1;
  jest.spyOn(window, 'confirm').mockReturnValue(true);
});
afterEach(() => {
  server.resetHandlers();
  jest.restoreAllMocks();
});
afterAll(() => server.close());

describe('App', () => {
  test('shows a loading state, then the tasks', async () => {
    tasks = [makeTask({ title: 'First task' })];
    render(<App />);

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
    expect(await screen.findByText('First task')).toBeInTheDocument();
    expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
  });

  test('shows an empty state when there are no tasks', async () => {
    render(<App />);
    expect(await screen.findByText('No tasks yet. Add one above!')).toBeInTheDocument();
  });

  test('shows an error when tasks cannot be loaded', async () => {
    server.use(rest.get('/api/tasks', (req, res, ctx) => res(ctx.status(500))));
    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/Failed to load tasks/);
  });

  test('adds a task with a due date', async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('No tasks yet. Add one above!');

    await user.type(screen.getByLabelText('Title'), 'Pay rent');
    await user.type(screen.getByLabelText(/Due date/), '2099-03-01');
    await user.click(screen.getByRole('button', { name: 'Add task' }));

    expect(await screen.findByText('Pay rent')).toBeInTheDocument();
    expect(screen.getByText(/Due: Mar 1, 2099/)).toBeInTheDocument();
  });

  test('keeps the input and shows the error when adding fails', async () => {
    server.use(
      rest.post('/api/tasks', (req, res, ctx) =>
        res(ctx.status(400), ctx.json({ error: 'Title must be 200 characters or fewer' }))
      )
    );
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('No tasks yet. Add one above!');

    await user.type(screen.getByLabelText('Title'), 'Will fail');
    await user.click(screen.getByRole('button', { name: 'Add task' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('200 characters or fewer');
    expect(screen.getByLabelText('Title')).toHaveValue('Will fail');
  });

  test('marks a task as completed', async () => {
    tasks = [makeTask({ title: 'Finish report' })];
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('checkbox'));

    expect(await screen.findByRole('checkbox', { checked: true })).toBeInTheDocument();
  });

  test('edits a task', async () => {
    tasks = [makeTask({ title: 'Old title' })];
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: /Edit/ }));
    const title = screen.getByLabelText('Title', { selector: '#edit-1-title' });
    await user.clear(title);
    await user.type(title, 'New title');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('New title')).toBeInTheDocument();
    expect(screen.queryByText('Old title')).not.toBeInTheDocument();
  });

  test('deletes a task after confirmation', async () => {
    tasks = [makeTask({ title: 'Remove me' })];
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: /Delete "Remove me"/ }));

    expect(window.confirm).toHaveBeenCalled();
    expect(await screen.findByText('No tasks yet. Add one above!')).toBeInTheDocument();
  });

  test('does not delete a task when the confirmation is declined', async () => {
    window.confirm.mockReturnValue(false);
    tasks = [makeTask({ title: 'Keep me' })];
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: /Delete "Keep me"/ }));

    expect(screen.getByText('Keep me')).toBeInTheDocument();
  });

  test('filters tasks by status', async () => {
    tasks = [
      makeTask({ title: 'Open task' }),
      makeTask({ title: 'Done task', completed: true }),
    ];
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Open task');

    await user.click(screen.getByRole('button', { name: 'Active' }));
    expect(screen.getByText('Open task')).toBeInTheDocument();
    expect(screen.queryByText('Done task')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Completed' }));
    expect(screen.queryByText('Open task')).not.toBeInTheDocument();
    expect(screen.getByText('Done task')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getByText('Open task')).toBeInTheDocument();
    expect(screen.getByText('Done task')).toBeInTheDocument();
  });

  test('clears all completed tasks after confirmation', async () => {
    tasks = [
      makeTask({ title: 'Open task' }),
      makeTask({ title: 'Done task', completed: true }),
    ];
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Clear completed' }));

    await waitFor(() => expect(screen.queryByText('Done task')).not.toBeInTheDocument());
    expect(within(screen.getByRole('list')).getByText('Open task')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear completed' })).not.toBeInTheDocument();
  });

  test('shows an error when an action fails', async () => {
    tasks = [makeTask({ title: 'Stubborn' })];
    server.use(
      rest.delete('/api/tasks/:id', (req, res, ctx) =>
        res(ctx.status(500), ctx.json({ error: 'Failed to delete task' }))
      )
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole('button', { name: /Delete "Stubborn"/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to delete task');
    expect(screen.getByText('Stubborn')).toBeInTheDocument();
  });
});

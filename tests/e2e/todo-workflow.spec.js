const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');
const { resetTasks, getTasks } = require('./helpers/api');

const daysFromToday = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

test.describe('Todo workflow', () => {
  let todo;

  test.beforeEach(async ({ page, request }) => {
    await resetTasks(request);
    todo = new TodoPage(page);
    await todo.goto();
  });

  test.afterEach(async ({ request }) => {
    await resetTasks(request);
  });

  test('shows an empty state, then adds a task with details', async ({ request }) => {
    await expect(todo.emptyState).toHaveText('No tasks yet. Add one above!');

    await todo.addTask({ title: 'Buy milk', description: 'Two litres', dueDate: '2099-01-31' });

    const item = todo.taskItem('Buy milk');
    await expect(item).toContainText('Two litres');
    await expect(item).toContainText('Due: Jan 31, 2099');
    await expect(todo.emptyState).toBeHidden();

    expect(await getTasks(request)).toEqual([
      expect.objectContaining({
        title: 'Buy milk',
        description: 'Two litres',
        dueDate: '2099-01-31',
        completed: false,
      }),
    ]);
  });

  test('rejects a blank title and keeps the list empty', async ({ request }) => {
    await todo.addTask({ title: '   ' });

    await expect(todo.errorAlert).toHaveText('Title is required');
    await expect(todo.taskTitles).toHaveCount(0);
    expect(await getTasks(request)).toEqual([]);
  });

  test('edits a task title and due date', async ({ request }) => {
    await todo.addTask({ title: 'Old title' });
    await expect(todo.taskItem('Old title')).toBeVisible();

    await todo.editTask('Old title', { title: 'New title', dueDate: '2099-06-01' });

    await expect(todo.taskItem('New title')).toContainText('Due: Jun 1, 2099');
    await expect(todo.taskItem('Old title')).toHaveCount(0);

    const tasks = await getTasks(request);
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({ title: 'New title', dueDate: '2099-06-01' });
  });

  test('completes a task, moves it to the bottom, and reopens it', async ({ request }) => {
    await todo.addTask({ title: 'First' });
    await expect(todo.taskItem('First')).toBeVisible();
    await todo.addTask({ title: 'Second' });
    await expect(todo.taskTitles).toHaveText(['First', 'Second']);

    await todo.toggleTask('First');
    await expect(todo.taskTitles).toHaveText(['Second', 'First']);
    await expect(todo.taskItem('First').getByRole('checkbox')).toBeChecked();
    const completed = (await getTasks(request)).find((task) => task.title === 'First');
    expect(completed.completed).toBe(true);

    await todo.toggleTask('First');
    await expect(todo.taskTitles).toHaveText(['First', 'Second']);
    await expect(todo.taskItem('First').getByRole('checkbox')).not.toBeChecked();
    const reopened = (await getTasks(request)).find((task) => task.title === 'First');
    expect(reopened.completed).toBe(false);
  });

  test('orders tasks by due date and flags overdue tasks', async () => {
    await todo.addTask({ title: 'No date' });
    await expect(todo.taskItem('No date')).toBeVisible();
    await todo.addTask({ title: 'Due later', dueDate: daysFromToday(10) });
    await expect(todo.taskItem('Due later')).toBeVisible();
    await todo.addTask({ title: 'Overdue', dueDate: daysFromToday(-3) });

    await expect(todo.taskTitles).toHaveText(['Overdue', 'Due later', 'No date']);
    await expect(todo.taskItem('Overdue')).toContainText('Overdue');
    await expect(todo.taskItem('Due later')).not.toContainText('Overdue');
  });

  test('deletes a task only after confirmation', async ({ request }) => {
    await todo.addTask({ title: 'Delete me' });
    await expect(todo.taskItem('Delete me')).toBeVisible();

    await todo.deleteTask('Delete me', { confirm: false });
    await expect(todo.taskItem('Delete me')).toBeVisible();
    expect(await getTasks(request)).toHaveLength(1);

    await todo.deleteTask('Delete me');
    await expect(todo.taskItem('Delete me')).toHaveCount(0);
    await expect(todo.emptyState).toHaveText('No tasks yet. Add one above!');
    expect(await getTasks(request)).toEqual([]);
  });

  test('filters tasks by active and completed status', async () => {
    await todo.addTask({ title: 'Open task' });
    await expect(todo.taskItem('Open task')).toBeVisible();
    await todo.addTask({ title: 'Done task' });
    await expect(todo.taskItem('Done task')).toBeVisible();
    await todo.toggleTask('Done task');

    await todo.filterBy('Active');
    await expect(todo.taskTitles).toHaveText(['Open task']);

    await todo.filterBy('Completed');
    await expect(todo.taskTitles).toHaveText(['Done task']);

    await todo.filterBy('All');
    await expect(todo.taskTitles).toHaveText(['Open task', 'Done task']);
  });

  test('clears all completed tasks and keeps the open ones', async ({ request }) => {
    await todo.addTask({ title: 'Open task' });
    await expect(todo.taskItem('Open task')).toBeVisible();
    await todo.addTask({ title: 'Done task' });
    await expect(todo.taskItem('Done task')).toBeVisible();
    await todo.toggleTask('Done task');

    await todo.clearCompleted();

    await expect(todo.taskTitles).toHaveText(['Open task']);
    const tasks = await getTasks(request);
    expect(tasks.map((task) => task.title)).toEqual(['Open task']);
  });
});

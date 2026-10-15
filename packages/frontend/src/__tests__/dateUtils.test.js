import { formatDueDate, isOverdue, todayString } from '../dateUtils';

describe('todayString', () => {
  test('formats a date as YYYY-MM-DD with zero padding', () => {
    expect(todayString(new Date(2030, 0, 5))).toBe('2030-01-05');
  });
});

describe('isOverdue', () => {
  const today = '2030-06-15';

  test('is true for an incomplete task due before today', () => {
    expect(isOverdue({ completed: false, dueDate: '2030-06-14' }, today)).toBe(true);
  });

  test('is false for a task due today', () => {
    expect(isOverdue({ completed: false, dueDate: '2030-06-15' }, today)).toBe(false);
  });

  test('is false for a task due in the future', () => {
    expect(isOverdue({ completed: false, dueDate: '2030-06-16' }, today)).toBe(false);
  });

  test('is false for a completed task, even if past due', () => {
    expect(isOverdue({ completed: true, dueDate: '2030-06-01' }, today)).toBe(false);
  });

  test('is false when there is no due date', () => {
    expect(isOverdue({ completed: false, dueDate: null }, today)).toBe(false);
  });
});

describe('formatDueDate', () => {
  test('returns a human-readable date', () => {
    expect(formatDueDate('2030-01-31')).toBe('Jan 31, 2030');
  });
});

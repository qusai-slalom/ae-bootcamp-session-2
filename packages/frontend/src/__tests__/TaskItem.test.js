import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskItem from '../components/TaskItem';

const baseTask = {
  id: 1,
  title: 'Write tests',
  description: '',
  dueDate: null,
  completed: false,
};

const setup = (task = {}) => {
  const handlers = {
    onToggle: jest.fn(),
    onSave: jest.fn().mockResolvedValue(),
    onDelete: jest.fn(),
  };
  render(
    <ul>
      <TaskItem task={{ ...baseTask, ...task }} {...handlers} />
    </ul>
  );
  return { ...handlers, user: userEvent.setup() };
};

describe('TaskItem', () => {
  test('shows the title, description and formatted due date', () => {
    setup({ description: 'Cover edge cases', dueDate: '2099-01-31' });

    expect(screen.getByText('Write tests')).toBeInTheDocument();
    expect(screen.getByText('Cover edge cases')).toBeInTheDocument();
    expect(screen.getByText(/Due: Jan 31, 2099/)).toBeInTheDocument();
    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
  });

  test('marks an incomplete task with a past due date as overdue', () => {
    setup({ dueDate: '2000-01-01' });
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  test('does not mark a completed task as overdue', () => {
    setup({ dueDate: '2000-01-01', completed: true });
    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
  });

  test('reflects the completed state in the checkbox', () => {
    setup({ completed: true });
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  test('calls onToggle when the checkbox is clicked', async () => {
    const { onToggle, user } = setup();

    await user.click(screen.getByRole('checkbox'));

    expect(onToggle).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  test('calls onDelete when Delete is clicked', async () => {
    const { onDelete, user } = setup();

    await user.click(screen.getByRole('button', { name: /Delete/ }));

    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  test('edits a task and leaves edit mode after saving', async () => {
    const { onSave, user } = setup();

    await user.click(screen.getByRole('button', { name: /Edit/ }));
    const title = screen.getByLabelText('Title');
    expect(title).toHaveValue('Write tests');

    await user.clear(title);
    await user.type(title, 'Write more tests');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 }),
      { title: 'Write more tests', description: '', dueDate: null }
    );
    expect(screen.queryByLabelText('Title')).not.toBeInTheDocument();
  });

  test('cancelling an edit discards changes', async () => {
    const { onSave, user } = setup();

    await user.click(screen.getByRole('button', { name: /Edit/ }));
    await user.type(screen.getByLabelText('Title'), ' changed');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Write tests')).toBeInTheDocument();
  });
});

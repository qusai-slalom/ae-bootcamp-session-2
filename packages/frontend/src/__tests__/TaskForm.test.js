import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '../components/TaskForm';

const setup = (props = {}) => {
  const onSubmit = props.onSubmit || jest.fn().mockResolvedValue();
  render(<TaskForm idPrefix="test" submitLabel="Add task" onSubmit={onSubmit} {...props} />);
  return { onSubmit, user: userEvent.setup() };
};

describe('TaskForm', () => {
  test('submits the entered values and clears the form on success', async () => {
    const { onSubmit, user } = setup();

    await user.type(screen.getByLabelText('Title'), 'Buy milk');
    await user.type(screen.getByLabelText(/Description/), 'Two litres');
    await user.type(screen.getByLabelText(/Due date/), '2030-01-31');
    await user.click(screen.getByRole('button', { name: 'Add task' }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Buy milk',
      description: 'Two litres',
      dueDate: '2030-01-31',
    });
    expect(screen.getByLabelText('Title')).toHaveValue('');
  });

  test('sends a null due date when none is chosen', async () => {
    const { onSubmit, user } = setup();

    await user.type(screen.getByLabelText('Title'), 'No date');
    await user.click(screen.getByRole('button', { name: 'Add task' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ dueDate: null }));
  });

  test('shows an error and does not submit when the title is blank', async () => {
    const { onSubmit, user } = setup();

    await user.type(screen.getByLabelText('Title'), '   ');
    await user.click(screen.getByRole('button', { name: 'Add task' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Title is required');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('shows the error and keeps the input when submitting fails', async () => {
    const { user } = setup({ onSubmit: jest.fn().mockRejectedValue(new Error('Server down')) });

    await user.type(screen.getByLabelText('Title'), 'Keep me');
    await user.click(screen.getByRole('button', { name: 'Add task' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Server down');
    expect(screen.getByLabelText('Title')).toHaveValue('Keep me');
  });

  test('only shows a Cancel button when onCancel is provided', async () => {
    const onCancel = jest.fn();
    const { user } = setup({ onCancel });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalled();
  });

  test('does not render Cancel without onCancel', () => {
    setup();
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  test('prefills fields from initialValues', () => {
    setup({ initialValues: { title: 'Existing', description: 'Notes', dueDate: '2030-02-02' } });

    expect(screen.getByLabelText('Title')).toHaveValue('Existing');
    expect(screen.getByLabelText(/Description/)).toHaveValue('Notes');
    expect(screen.getByLabelText(/Due date/)).toHaveValue('2030-02-02');
  });
});

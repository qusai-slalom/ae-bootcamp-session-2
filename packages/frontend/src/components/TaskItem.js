import React, { useState } from 'react';
import TaskForm from './TaskForm';
import { formatDueDate, isOverdue } from '../dateUtils';

function TaskItem({ task, onToggle, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    const handleSave = async (values) => {
      await onSave(task, values);
      setEditing(false);
    };

    return (
      <li className="task-item">
        <TaskForm
          idPrefix={`edit-${task.id}`}
          initialValues={{
            title: task.title,
            description: task.description,
            dueDate: task.dueDate || '',
          }}
          submitLabel="Save"
          onSubmit={handleSave}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  const overdue = isOverdue(task);

  return (
    <li className={`task-item${task.completed ? ' task-completed' : ''}`}>
      <input
        type="checkbox"
        className="task-checkbox"
        checked={task.completed}
        onChange={() => onToggle(task)}
        aria-label={`Mark "${task.title}" as completed`}
      />
      <div className="task-body">
        <span className="task-title">{task.title}</span>
        {task.description && <p className="task-description">{task.description}</p>}
        {task.dueDate && (
          <p className="task-due">
            Due: {formatDueDate(task.dueDate)}
            {overdue && <span className="badge-overdue">Overdue</span>}
          </p>
        )}
      </div>
      <div className="task-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setEditing(true)}
          aria-label={`Edit "${task.title}"`}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => onDelete(task)}
          aria-label={`Delete "${task.title}"`}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

export default TaskItem;

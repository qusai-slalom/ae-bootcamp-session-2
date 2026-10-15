import React, { useState } from 'react';

const EMPTY_VALUES = { title: '', description: '', dueDate: '' };
const MAX_TITLE_LENGTH = 200;

function TaskForm({ idPrefix, initialValues = EMPTY_VALUES, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState('');

  const titleTooLong = values.title.trim().length > MAX_TITLE_LENGTH;
  const handleChange = (field) => (event) => {
    setValues({ ...values, [field]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!values.title.trim()) {
      setError('Title is required');
      return;
    }

    if (titleTooLong) return;
    try {
      await onSubmit({
        title: values.title,
        description: values.description,
        dueDate: values.dueDate || null,
      });
      setValues(initialValues);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor={`${idPrefix}-title`}>Title</label>
        <input
          id={`${idPrefix}-title`}
          type="text"
          value={values.title}
          aria-invalid={titleTooLong}
          onChange={handleChange('title')}
        />
        {titleTooLong && (
          <p className="error" role="alert">
            Title must be {MAX_TITLE_LENGTH} characters or fewer
          </p>
        )}
      </div>
      <div className="field">
        <label htmlFor={`${idPrefix}-description`}>Description (optional)</label>
        <input
          id={`${idPrefix}-description`}
          type="text"
          value={values.description}
          onChange={handleChange('description')}
        />
      </div>
      <div className="field">
        <label htmlFor={`${idPrefix}-due-date`}>Due date (optional)</label>
        <input
          id={`${idPrefix}-due-date`}
          type="date"
          value={values.dueDate}
          onChange={handleChange('dueDate')}
        />
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;

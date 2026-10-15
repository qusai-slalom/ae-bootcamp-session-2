const MAX_TITLE_LENGTH = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isValidDate = (value) => {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

// Returns { values } with normalized fields, or { error } describing the first problem.
const validateTaskFields = (body, { requireTitle }) => {
  const values = {};

  if (requireTitle || body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      return { error: 'Title is required' };
    }
    const title = body.title.trim();
    if (title.length > MAX_TITLE_LENGTH) {
      return { error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer` };
    }
    values.title = title;
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      return { error: 'Description must be a string' };
    }
    values.description = body.description.trim();
  }

  if (body.dueDate !== undefined) {
    if (body.dueDate === null || body.dueDate === '') {
      values.dueDate = null;
    } else if (isValidDate(body.dueDate)) {
      values.dueDate = body.dueDate;
    } else {
      return { error: 'Due date must be a valid date (YYYY-MM-DD)' };
    }
  }

  if (body.completed !== undefined) {
    if (typeof body.completed !== 'boolean') {
      return { error: 'Completed must be true or false' };
    }
    values.completed = body.completed;
  }

  return { values };
};

module.exports = { MAX_TITLE_LENGTH, validateTaskFields };

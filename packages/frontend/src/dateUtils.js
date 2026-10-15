const pad = (value) => String(value).padStart(2, '0');

export const todayString = (now = new Date()) =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

export const isOverdue = (task, today = todayString()) =>
  !task.completed && Boolean(task.dueDate) && task.dueDate < today;

export const formatDueDate = (dueDate) => {
  const [year, month, day] = dueDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

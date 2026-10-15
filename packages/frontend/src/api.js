const request = async (url, options) => {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return body;
};

const sendJson = (method, url, payload) =>
  request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const fetchTasks = () => request('/api/tasks');

export const createTask = (values) => sendJson('POST', '/api/tasks', values);

export const updateTask = (id, values) => sendJson('PATCH', `/api/tasks/${id}`, values);

export const deleteTask = (id) => request(`/api/tasks/${id}`, { method: 'DELETE' });

export const deleteCompletedTasks = () => request('/api/tasks/completed', { method: 'DELETE' });

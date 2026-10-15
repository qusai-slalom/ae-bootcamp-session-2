const API_URL = `http://localhost:${process.env.BACKEND_PORT || 3030}`;

const getTasks = async (request) => {
  const response = await request.get(`${API_URL}/api/tasks`);
  return response.json();
};

// Removes every task so each test starts from, and leaves behind, an empty list.
const resetTasks = async (request) => {
  const tasks = await getTasks(request);
  await Promise.all(tasks.map((task) => request.delete(`${API_URL}/api/tasks/${task.id}`)));
};

module.exports = { getTasks, resetTasks };

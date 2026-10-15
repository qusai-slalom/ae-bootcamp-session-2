const API_URL = `http://localhost:${process.env.BACKEND_PORT || 3030}`;

// Removes every task so each test starts from, and leaves behind, an empty list.
const resetTasks = async (request) => {
  const response = await request.get(`${API_URL}/api/tasks`);
  const tasks = await response.json();
  await Promise.all(tasks.map((task) => request.delete(`${API_URL}/api/tasks/${task.id}`)));
};

module.exports = { resetTasks };

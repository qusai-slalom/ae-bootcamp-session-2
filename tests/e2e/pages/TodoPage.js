class TodoPage {
  constructor(page) {
    this.page = page;
    this.addForm = page.locator('.add-task-section');
    this.taskTitles = page.locator('.task-title');
    this.emptyState = page.locator('.empty-state');
    this.errorAlert = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.getByText('Loading tasks...').waitFor({ state: 'hidden' });
  }

  taskItem(title) {
    return this.page.getByRole('listitem').filter({ hasText: title });
  }

  async fillForm(form, { title, description, dueDate }) {
    if (title !== undefined) await form.getByLabel('Title').fill(title);
    if (description !== undefined) await form.getByLabel(/Description/).fill(description);
    if (dueDate !== undefined) await form.getByLabel(/Due date/).fill(dueDate);
  }

  async addTask(values) {
    await this.fillForm(this.addForm, values);
    await this.addForm.getByRole('button', { name: 'Add task' }).click();
  }

  async editTask(title, values) {
    await this.taskItem(title).getByRole('button', { name: /^Edit/ }).click();
    // In edit mode the title is an input value, so the item can no longer be found by text.
    const editingItem = this.page
      .getByRole('listitem')
      .filter({ has: this.page.getByRole('button', { name: 'Save' }) });
    await this.fillForm(editingItem, values);
    await editingItem.getByRole('button', { name: 'Save' }).click();
  }

  async toggleTask(title) {
    await this.taskItem(title).getByRole('checkbox').click();
  }

  // Playwright dismisses dialogs by default, so a handler is needed to confirm.
  async deleteTask(title, { confirm = true } = {}) {
    this.page.once('dialog', (dialog) => (confirm ? dialog.accept() : dialog.dismiss()));
    await this.taskItem(title).getByRole('button', { name: /^Delete/ }).click();
  }

  async clearCompleted() {
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.page.getByRole('button', { name: 'Clear completed' }).click();
  }

  async filterBy(name) {
    const filters = this.page.getByRole('group', { name: 'Filter tasks' });
    await filters.getByRole('button', { name }).click();
  }
}

module.exports = { TodoPage };

# Functional Requirements

This document describes what the TODO app must do from the user's perspective. Each requirement states the behavior and the intent behind it.

## 1. Task Creation

- **FR-1.1** The user can add a new task by entering a title and submitting it.
  - *Intent*: Capturing a task should be quick and require minimal input.
- **FR-1.2** A task title is required and cannot be empty or whitespace only. Leading and trailing whitespace is trimmed.
  - *Intent*: Prevent meaningless tasks.
- **FR-1.3** A task title has a maximum length (e.g., 200 characters). The user is told when the limit is exceeded.
  - *Intent*: Keep the list readable and protect the backend from oversized input.
- **FR-1.4** The user can optionally add a description (notes) to a task.
  - *Intent*: Allow extra detail without cluttering the title.
- **FR-1.5** New tasks start as "not completed" and are stored with a creation timestamp.
  - *Intent*: Provide a consistent initial state and support ordering.

## 2. Due Dates

- **FR-2.1** The user can optionally set a due date when creating a task.
  - *Intent*: Help users plan and prioritize time-sensitive work.
- **FR-2.2** The user can add, change, or remove a due date on an existing task.
  - *Intent*: Plans change; due dates must not be locked in.
- **FR-2.3** Tasks whose due date has passed and that are not completed are visually marked as overdue.
  - *Intent*: Draw attention to work that needs action.
- **FR-2.4** Due dates are displayed in a clear, human-readable format.
  - *Intent*: Users should understand deadlines at a glance.

## 3. Viewing Tasks

- **FR-3.1** All tasks are shown in a single list, displaying at minimum the title, completion status, and due date (if set).
  - *Intent*: Give users a complete overview of their work.
- **FR-3.2** An empty state message is shown when there are no tasks.
  - *Intent*: Make it clear the app is working and guide the user to add a task.
- **FR-3.3** The user can filter the list by status: All, Active, Completed.
  - *Intent*: Let users focus on what is relevant right now.

## 4. Task Ordering

- **FR-4.1** Tasks are sorted in a consistent, predictable order:
  1. Incomplete tasks appear before completed tasks.
  2. Among incomplete tasks, those with a due date appear before those without; earlier due dates come first.
  3. Tasks with the same due date (or no due date) are ordered by creation time, oldest first.
  4. Completed tasks appear at the bottom, ordered by most recently completed first.
  - *Intent*: The most urgent work is always at the top, and finished work does not get in the way.
- **FR-4.2** The order updates automatically when a task is added, edited, completed, or reopened.
  - *Intent*: The user never has to manually re-sort.

## 5. Editing Tasks

- **FR-5.1** The user can edit the title, description, and due date of an existing task.
  - *Intent*: Correct mistakes and keep tasks up to date.
- **FR-5.2** Edits are subject to the same validation as task creation (FR-1.2, FR-1.3).
  - *Intent*: Keep data valid regardless of how it was entered.
- **FR-5.3** The user can cancel an edit, which restores the original values.
  - *Intent*: Prevent accidental changes.

## 6. Completing Tasks

- **FR-6.1** The user can mark a task as completed and can mark it as not completed again.
  - *Intent*: Track progress and allow undoing a mistaken click.
- **FR-6.2** Completed tasks are visually distinct (e.g., strikethrough or muted style).
  - *Intent*: Make status clear at a glance.

## 7. Deleting Tasks

- **FR-7.1** The user can delete an individual task.
  - *Intent*: Remove tasks that are no longer relevant.
- **FR-7.2** The user is asked to confirm before a task is permanently deleted.
  - *Intent*: Prevent accidental data loss.
- **FR-7.3** The user can clear all completed tasks in one action (with confirmation).
  - *Intent*: Keep the list tidy without deleting tasks one by one.

## 8. Persistence

- **FR-8.1** Tasks are stored by the backend and are still present after the page is reloaded or the app is restarted.
  - *Intent*: Users must be able to trust that their tasks are not lost.
- **FR-8.2** All task operations (create, read, update, delete) are available through the backend API.
  - *Intent*: Keep the frontend and backend cleanly separated.

## 9. Feedback and Error Handling

- **FR-9.1** The UI reflects the result of every action (task appears, updates, or disappears) without requiring a manual page refresh.
  - *Intent*: The user always knows an action succeeded.
- **FR-9.2** If an action fails (e.g., the server is unreachable), the user sees a clear error message and their input is not lost.
  - *Intent*: Failures should be understandable and recoverable.
- **FR-9.3** A loading indication is shown while tasks are being fetched.
  - *Intent*: Distinguish "loading" from "no tasks".

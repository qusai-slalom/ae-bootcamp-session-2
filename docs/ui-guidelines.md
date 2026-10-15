# UI Guidelines

Simple rules to keep the TODO app's interface consistent, readable, and accessible.

## 1. Styling

- Use plain CSS (the existing `App.css` / `index.css` approach). Do not add CSS frameworks such as Tailwind or Bootstrap.
  - *Intent*: Keep dependencies minimal and the styling easy to follow.
- Build the UI from small, reusable React components (e.g., `TaskItem`, `TaskForm`), each with its own CSS class names.
  - *Intent*: Avoid duplicated markup and keep the look consistent.

## 2. Color Palette

| Purpose | Color |
|---|---|
| Primary (main actions, links) | `#2563eb` |
| Success (completed) | `#16a34a` |
| Danger (delete, errors, overdue) | `#dc2626` |
| Text | `#1f2937` |
| Muted text | `#6b7280` |
| Background | `#ffffff` / `#f5f5f5` |
| Border | `#d1d5db` |

- Use only these colors; do not introduce new ones without updating this file.
  - *Intent*: A small, fixed palette keeps the app visually consistent.
- Never use color as the only way to convey meaning (e.g., overdue tasks also show an "Overdue" label).
  - *Intent*: Users who cannot distinguish colors must still understand the UI.

## 3. Typography and Spacing

- Use the system font stack. Base font size is 16px; never go below 14px.
- Use spacing in multiples of 4px (4, 8, 12, 16, 24).
  - *Intent*: Predictable, readable layout.

## 4. Buttons

- **Primary**: filled with the primary color, white text. One per form or section.
- **Secondary**: white background, border, dark text (e.g., Cancel, Edit).
- **Danger**: filled with the danger color, white text (e.g., Delete).
- All buttons use the same padding and border radius (6px), and have visible hover, focus, and disabled states.
- Button labels are short verbs ("Add task", "Save", "Delete").
  - *Intent*: Users can tell at a glance which action is the main one and which is destructive.

## 5. Forms and Feedback

- Every input has a visible `<label>` (not just a placeholder).
- Validation and error messages appear next to the field in the danger color, in plain language.
- Show a loading indicator while fetching and an empty-state message when there are no tasks.
- Completed tasks use strikethrough and muted text.
  - *Intent*: The user always knows what happened and what to do next.

## 6. Accessibility

- Text contrast must meet WCAG AA (at least 4.5:1).
- All features must work with the keyboard alone, and the focus outline must always be visible.
- Use semantic HTML (`button`, `label`, `ul`/`li`, `main`, `header`); do not use clickable `div`s.
- Icon-only buttons must have an `aria-label`.
- Announce dynamic messages (errors, task added/deleted) with `aria-live`.
  - *Intent*: The app must be usable by everyone, including screen reader and keyboard users.

## 7. Responsive Layout

- Single-column layout that works from 320px wide upward; the content area is at most 800px wide and centered.
- Touch targets are at least 44x44px.
  - *Intent*: The app should be comfortable on both phones and desktops.

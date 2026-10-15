# Coding Guidelines

These guidelines describe the coding style and quality principles for the TODO app. The goal is code that is consistent, easy to read, and easy to change.

## Formatting and Conventions

Use 2-space indentation, single quotes, semicolons, and a trailing newline in every file. Keep lines reasonably short (around 100 characters). Use `camelCase` for variables and functions, `PascalCase` for React components and their files (e.g., `TaskItem.js`), and `UPPER_SNAKE_CASE` for constants. Prefer `const`, use `let` only when reassignment is needed, and never use `var`. Choose descriptive names; a name should explain intent so that comments are rarely needed. When a comment is needed, use it to explain *why*, not *what*.

## Import Organization

The backend uses CommonJS (`require`) and the frontend uses ES modules (`import`). Keep each file consistent with its package. Group imports in this order, with a blank line between groups: Node.js built-ins, third-party packages, then local modules. Place CSS imports last in frontend files. Remove unused imports.

## Code Quality Principles

- **DRY**: Do not copy and paste logic. When the same code appears a second or third time, extract it into a shared function or component.
- **Single responsibility**: Each function and component should do one thing. Split large ones into smaller pieces.
- **Keep it simple**: Prefer the simplest solution that works. Do not add features or abstractions that are not needed yet.
- **Handle errors explicitly**: Validate input at the API boundary, return clear error messages and proper HTTP status codes, and never swallow errors silently.
- **No dead code**: Delete commented-out code and unused variables rather than leaving them behind.
- **Security basics**: Use parameterized queries for the database, never build SQL from user input, and never commit secrets. Read configuration from environment variables.

## Linting

Use ESLint to catch problems early and enforce the rules above automatically. Run the linter before committing and fix all warnings and errors rather than disabling rules. A formatter such as Prettier is also recommended so that formatting is never a topic in code review.

## Tests

New features and bug fixes should include tests, as described in [testing-guidelines.md](testing-guidelines.md).

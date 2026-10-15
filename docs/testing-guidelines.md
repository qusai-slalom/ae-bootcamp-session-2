# Testing Guidelines

Testing principles for the TODO app, to keep code quality and reliability high across the project.

## General Principles

- All new features must include appropriate tests.
- Tests must be maintainable and follow best practices (clear names, one behavior per test, no duplicated setup).
- All tests must be isolated and independent: each test sets up its own data and never relies on another test.
- Setup and teardown hooks are required so tests pass on repeated runs (e.g., `beforeEach` / `afterEach`).

## Test Types

| Type | Tool | Location | File naming |
|---|---|---|---|
| Unit (backend) | Jest | `packages/backend/__tests__/` | `*.test.js` / `*.test.ts` |
| Unit (frontend) | Jest | `packages/frontend/src/__tests__/` | `*.test.js` / `*.test.ts` |
| Integration | Jest + Supertest | `packages/backend/__tests__/integration/` | `*.test.js` / `*.test.ts` |
| End-to-end (E2E) | Playwright | `tests/e2e/` | `*.spec.js` / `*.spec.ts` |

### Unit Tests

- Use Jest to test individual functions and React components in isolation.
- Name each test file after what it tests (e.g., `app.test.js` for `app.js`).

### Integration Tests

- Use Jest + Supertest to test backend API endpoints with real HTTP requests.
- Name files after what they test (e.g., `todos-api.test.js` for the TODO API endpoints).

### End-to-End (E2E) Tests

- Use Playwright (the required framework) to test complete UI workflows through browser automation.
- Name files after the user journey they test (e.g., `todo-workflow.spec.js`).
- Use one browser only.
- Use the Page Object Model (POM) pattern for maintainability.
- Limit to 5-8 critical user journeys, focusing on happy paths and key edge cases rather than exhaustive coverage.

## Port Configuration

Always read ports from environment variables with sensible defaults, so CI/CD workflows can detect them dynamically.

- Backend: `const PORT = process.env.PORT || 3030;`
- Frontend: React's default is 3000, and can be overridden with the `PORT` environment variable.

## Running Tests

- `npm test`: unit and integration tests for all packages
- `npm run test:e2e`: Playwright E2E tests
- `npm run test:all`: all tests

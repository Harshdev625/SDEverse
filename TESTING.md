# Testing & Coverage Guide

## Run Tests

### Frontend

```bash
cd client
npm test
npm run test:coverage
npm run test:ui
```

### Backend

```bash
cd server
npm test
npm run test:coverage
npm run test:ui
```

## View Coverage in Browser (Page Report)

Vitest generates HTML coverage pages similar to enterprise/JUnit-style report browsing:

- Frontend report: `client/coverage/index.html`
- Backend report: `server/coverage/index.html`

Open either file directly in your browser after running coverage.

## Big-Tech Quality Setup Included

- CI workflow on push/PR: `.github/workflows/tests.yml`
- Coverage quality gates in:
  - `client/vite.config.js`
  - `server/vitest.config.mjs`
- UI test dashboards via `npm run test:ui` in both apps.

## Suggested Team Policy

- Run `npm run test:coverage` before opening PR.
- Keep coverage above configured thresholds.
- Add tests for every bug fix and every new utility/service module.

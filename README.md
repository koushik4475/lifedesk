# LifeDesk

A calm, offline-first personal command centre for tasks, routines, notes, planning, everyday money and important dates.

> **V1 · Local-first · No account · No subscription**

## Features

- **Today dashboard:** overdue and due-today tasks, daily habit check-ins, month balance, upcoming tasks and a compact week view.
- **Tasks:** create, edit, complete, delete, priorities, categories, due date/time, filters and daily/weekly/monthly recurrence. Completing a recurring task creates its next occurrence while preserving the completed item.
- **Planner:** day, week and month calendar views with task/event indicators, date navigation, all-day and timed personal events.
- **Habits:** configurable target weekdays, date-specific check-ins, current streak and weekly completion indicators.
- **Notes:** create, edit, pin, search, tag and delete short notes.
- **Money:** manually log income and expenses, category, date and note; monthly totals and transaction list.
- **Records:** renewal, warranty, subscription and expiry reminders with metadata only.
- **Backup and restore:** versioned JSON export, validated import, merge or replace; replace downloads a safety backup first.
- **Settings:** light/dark appearance, currency, week start, data import/export and clear-all-data confirmation.
- **PWA:** installable application shell with offline caching after the first successful load.

## Local development

Requires Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run e2e
```

## Architecture

- React + TypeScript + Vite; React Router for navigation.
- Tailwind CSS v4 build integration plus project-owned component styles and design tokens.
- Dexie.js / IndexedDB for structured local persistence. Database schema is versioned.
- Zod validates backup envelope and version before import.
- date-fns handles calendar/date operations; dates representing calendar days are stored as local YYYY-MM-DD values.
- Vitest + Testing Library for unit/component tests; Playwright for browser smoke tests.
- vite-plugin-pwa generates the service worker and application manifest.

## Privacy and data

LifeDesk V1 has no login, cloud account, cross-device sync, analytics, ads, paid APIs or background server. User data remains in IndexedDB in the current browser profile. It is **not encrypted** and this is not a secure vault. Clearing site data, uninstalling the browser, or changing browsers/devices can remove access. Export JSON backups regularly and store them somewhere safe. Never store passwords, Aadhaar/PAN numbers, identity scans, financial credentials or other secrets. The expense log is manual and does not connect to banks. In-app due/overdue indicators are provided; the app does not promise notifications while the browser is closed.

## Free deployment — Cloudflare Pages

1. In Cloudflare Dashboard, open **Workers & Pages → Create → Pages → Connect to Git**.
2. Select this repository and set production branch `main`.
3. Build command: `npm run build`; output directory: `dist`.
4. No environment variables are required. Deploy and verify the `*.pages.dev` URL, refreshed deep links, installability and offline reload after the first load.

`public/_redirects` provides the SPA fallback. Custom domains are optional and may cost money.

## Repository status

LifeDesk V1 implementation is in progress. CI is configured to run lint, type-checking, unit tests, production build, and Playwright smoke tests on pushes and pull requests. A successful GitHub Actions run and a verified Pages URL are required before calling this a production release.

## License

MIT — see [LICENSE](LICENSE).

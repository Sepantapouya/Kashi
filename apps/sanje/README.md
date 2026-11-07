# Sanje dashboard

Independent React + Vite app using Kashi components and deterministic sample data.

## Local development

From the repository root, run `npm install`, then `npm run sanje`.
Open http://127.0.0.1:4401/dashboard/.
Node 24 is recommended. Kashi packages must be built with `npm run build` on a fresh checkout.

## Build and hosting

Run `npm run sanje:build`. Deploy `apps/sanje/dist` to its own host with SPA fallback to `index.html`.
Set `PUBLIC_SANJE_URL` in the docs deployment to the dashboard origin.
Set `VITE_SANJE_SITE_URL` before building the dashboard to change its marketing-site link.

Routes: /dashboard/, /funnel/, /channels/, /sessions/, /events/, /saved/, /settings/, /guide/.
Date, channel, device, event and search filters are encoded in the URL.

Dashboard features include selectable metrics, period comparison, a configurable monthly sales goal, funnel drill-down, channel comparison, session timelines, filtered CSV export, saved report views, global search (Cmd/Ctrl+K), responsive navigation and dark/light themes. Saved views and preferences persist in localStorage. CSV exports use the entire filtered result set, including rows outside the current table page.

The sample dataset covers 30 days. Period comparison is available for 7- and 14-day views. City and device are deterministic sample attributes.
The app has sample data and browser-local theme preferences. Live ingestion and authentication require a backend.

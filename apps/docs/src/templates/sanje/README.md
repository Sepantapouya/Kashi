# Sanje — Kashi Pro preview

An RTL Persian frontend website template, built with Kashi components. It is currently a demo inside the docs app, not a standalone customer download or a working analytics service.

## Pages

- `/templates/landing/`: product landing
- `/templates/sanje/pricing/`: sample plan selection
- `/templates/sanje/blog/`: article index
- `/templates/sanje/articles/{conversion-funnel,persian-reports,growth-metrics}/`: full articles
- `/templates/sanje/contact/`: contact form
- `/templates/sanje/{login,signup,reset}/`: account flow previews
- `/templates/sanje/dashboard/`: overview of the sample store, with a shared reporting period and channel

- `/templates/sanje/{funnel,channels,events}/`: funnel, acquisition comparison and searchable event log
- `/templates/sanje/guide/`: four-step walkthrough with live report links

## Editing

- `content.ts`: shared identity, routes, and article content
- `Shell.tsx`: shared header, mobile menu, footer
- `reportData.ts`: deterministic sample sessions and aggregate calculations
- `Reports.tsx`: linked reports; date/channel filters propagate in the URL
- `Pages.tsx`: page layouts, article renderer, demo form behavior
- `../Landing.tsx`: homepage, pricing, and dashboard components
- `../../styles/sanje.css`: shared page styles
- `../../styles/landing.css`: landing styles
- `../../layouts/Sanje.astro`: document, font/theme setup, demo notice

In the repository, run `npm run dev -w @kashi-ui/docs` with the Node version from `.nvmrc` after installing/building the workspace packages. Production preview build: `npm run build -w @kashi-ui/docs`.

## Demo boundaries

Forms validate locally, show an explicit demo result, and clear their values. They do not submit, store, or log entered data. Do not enter real credentials. Theme preference alone is saved in localStorage. Plan selection routes to the signup/contact preview; no purchase occurs. Chart data is illustrative, not fetched analytics. The small dashboard embedded on the landing page is illustrative; the full dashboard links to working reports.

Before selling a standalone download: extract a self-contained project, pin compatible published Kashi dependencies, add product-specific license and delivery terms, document integration points, and verify installation/build from the downloaded archive. Before running an actual service: implement server authentication, data storage, email delivery, payment verification and service-specific security controls.

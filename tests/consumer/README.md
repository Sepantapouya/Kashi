# Consumer test app

A minimal Next.js App Router project that `scripts/consumer-test.mjs` copies to a temp folder, installs
the freshly built `@kashi-ui/*` packages into (through a local npm registry), adds every shadcn registry
item from the freshly built docs site, and builds. Run it with `npm run test:consumer` after `npm run build`.

- `src/app/server/page.tsx` is a server component that imports from `@kashi-ui/react` directly.
- `src/app/page.tsx` is a client page that uses the copied files in `src/components/kashi/`.

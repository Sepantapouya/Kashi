// The course gate lives in apps/docs/middleware.ts (Vercel loads that file on its own, with no imports).
// This re-export lets the Astro dev server (pm-gate-dev.ts) use the same code.
export { pmGate, PM_BASE, PM_LOGIN, PM_COOKIE } from "../../middleware";

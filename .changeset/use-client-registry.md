---
"@kashi-ui/react": patch
---

Works in Next.js App Router server components: every component module now starts with `"use client"`, so `import { Button } from "@kashi-ui/react"` in a server page no longer fails with "Event handlers cannot be passed to Client Component props". Timers use `useRef(undefined)` so the source also type-checks with React 19 types (needed for the new shadcn registry, which copies the source into your project).

# Service status

`node scripts/status/collect.mjs [output.json]` collects real public checks. The default output seeds the static `/status/` page. Runtime refresh reads `status.json` from the public `status` branch. GitHub Actions runs at minutes 17 and 47, with no guarantee of exact timing. Manual dispatch is supported. No secrets or npm install needed.

The dedicated branch is overwritten with a rolling 90-day / 5,000-sample JSON history; the main branch and stats branch are never modified by the collector. Vercel excludes deployments for status. If no history exists, the action starts empty. Invalid previous history fails rather than deleting it.

Each check has a 20-second request timeout. Site: HTML for homepage and installation must contain کاشی. npm: latest metadata and gzip signature for every workspace package tarball. Figma: successful download with ZIP signature. File probes read the first chunk only; they do not validate archive integrity or runtime functionality. A failed measurement is not proof of an outage. One vantage point, no Iran-local probes.

The UI expires current state after two hours. Daily colors aggregate recorded samples; gaps remain unknown. Percentages count successful checks, not time-based availability. Times use Asia/Tehran. Tests: `node --test scripts/status/model.test.mjs`.

After merging and pushing, run the Service status workflow once to initialize the branch; scheduled runs then maintain it. No deploy or workflow run is performed by local development.

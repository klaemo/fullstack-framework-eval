# Benchmark Methodology

This document defines how to collect comparable benchmark numbers for the six independent SSR news implementations:

- `astro`
- `nextjs`
- `react-router`
- `react-router-rsc`
- `hono-jsx`
- `tanstack-start`

Collect all measurements from the repository root unless a command explicitly changes directories.

## Runtime Baseline

- Date recorded: 2026-07-01
- Node.js version: `v24.18.0`
- Dependency installation is not part of benchmark timing.
- Production builds and local production servers are the only valid measurement targets.
- Development servers are allowed only for implementation sanity checks.

Before collecting final numbers, rerun:

```sh
node --version
```

If the output differs from `v24.18.0`, record the new value with the final results.

## App Commands

Use one app per port when running side by side where the production server supports host/port environment variables. The current Hono Vite production wrapper listens on its default `3000`, so run Hono separately unless its production server entry is changed to accept a custom port.

| App | Port | Build command | Production start command |
| --- | ---: | --- | --- |
| Astro | 4101 | `cd astro && NODE_ENV=production npm run build` | `cd astro && HOST=127.0.0.1 PORT=4101 NODE_ENV=production npm run start` |
| Next.js | 4102 | `cd nextjs && NODE_ENV=production npm run build` | `cd nextjs && HOSTNAME=127.0.0.1 PORT=4102 NODE_ENV=production npm run start` |
| React Router | 4103 | `cd react-router && NODE_ENV=production npm run build` | `cd react-router && HOST=127.0.0.1 PORT=4103 NODE_ENV=production npm run start` |
| React Router RSC | 4104 | `cd react-router-rsc && NODE_ENV=production npm run build` | `cd react-router-rsc && HOST=127.0.0.1 PORT=4104 NODE_ENV=production npm run start` |
| Hono JSX | 3000 | `cd hono-jsx && NODE_ENV=production npm run build` | `cd hono-jsx && NODE_ENV=production npm run start` |
| TanStack Start | 4105 | `cd tanstack-start && NODE_ENV=production npm run build` | `cd tanstack-start && HOST=127.0.0.1 PORT=4105 NODE_ENV=production npm run start` |

Measure these routes for every app:

- `/`
- `/articles/cities-prepare-hotter-denser-decade`

## Cold Build Timing

Use `/usr/bin/time -p` and measure three cold-cache production builds per app. Record every run and use the median.

Clean only framework build outputs and generated framework caches before each timed build:

| App | Cleanup before each run |
| --- | --- |
| Astro | `cd astro && rm -rf dist .astro` |
| Next.js | `cd nextjs && rm -rf .next` |
| React Router | `cd react-router && rm -rf build .react-router/types` |
| React Router RSC | `cd react-router-rsc && rm -rf build .react-router/types` |
| Hono JSX | `cd hono-jsx && rm -rf dist public/assets` |
| TanStack Start | `cd tanstack-start && rm -rf .output node_modules/.nitro` |

Command shape:

```sh
cd astro
rm -rf dist .astro
NODE_ENV=production /usr/bin/time -p npm run build
```

Record the `real` value as the build time. Keep `user` and `sys` as supporting data if useful.

## Served HTML Bytes

Measure uncompressed response-body bytes from the local production server. Use `curl` without compression.

Command shape:

```sh
curl -sS -H 'Accept-Encoding: identity' http://127.0.0.1:4101/ | wc -c
curl -sS -H 'Accept-Encoding: identity' http://127.0.0.1:4101/articles/cities-prepare-hotter-denser-decade | wc -c
```

Record one byte count per route after a successful production build and server start.

## Initial-Route JavaScript Bytes

Measure uncompressed filesystem bytes for JavaScript required by `/`. Do not use compressed transfer sizes for this KPI.

Rules:

- Include only JavaScript needed for the initial `/` route.
- Include framework/runtime chunks that the route references.
- Include route-level and client-island chunks for `/`.
- Exclude source maps, CSS, images, server bundles, and article-only route chunks.
- When the framework emits a manifest, use the manifest and generated HTML to identify the route's initial scripts.
- Record the exact file list used for each app.

Starting points:

| App | Candidate files to inspect |
| --- | --- |
| Astro | `astro/dist/client/**/*.js` and rendered HTML for `/` |
| Next.js | `nextjs/.next/static/**/*.js`, `nextjs/.next/server/app/page_client-reference-manifest.js`, and rendered HTML for `/` |
| React Router | `react-router/build/client/.vite/manifest.json` plus `react-router/build/client/assets/*.js` |
| React Router RSC | `react-router-rsc/build/client/assets/*.js` plus RSC build manifest output |
| Hono JSX | `hono-jsx/public/assets/.vite/manifest.json` and the `src/client.ts` entry |
| TanStack Start | `tanstack-start/.output/public/assets/*.js` plus rendered HTML for `/` |

Byte-count command shape after deciding the exact file list:

```sh
wc -c path/to/chunk-a.js path/to/chunk-b.js
```

## Server Render Timing

Primary tool: `oha`.

Warm the route once, then run a 30-second test at concurrency 10 against each production server.

Command shape:

```sh
curl -sS -o /dev/null http://127.0.0.1:4101/
oha -z 30s -c 10 --no-tui http://127.0.0.1:4101/
```

Record:

- Requests per second
- Mean latency
- P50, P90, P99 latency
- Non-2xx/3xx responses
- Tool version, if reported by `oha --version`

Optional sanity check:

```sh
autocannon -d 30 -c 10 http://127.0.0.1:4101/
```

Use `oha` as the source of record unless there is a clear tool failure.

## Browser Web Vitals

Use the browser against the local production server. Measure `/` for every app; also measure the article route if time allows.

Record:

- Browser name and version
- Viewport
- Network and CPU throttling settings
- Cache state
- Number of runs
- Median values for LCP, CLS, INP when available
- FCP and TTFB as supporting metrics

Recommended baseline:

- Viewport: `1440 x 1000`
- Cache: disabled for first-load measurements
- Throttling: no artificial throttling unless all apps use the same setting
- Runs: at least 3 per route, median reported

## Qualitative Comparison Method

Capture qualitative notes for:

- Data loading: static module data, async boundary shape, route loader, server component data access, and Hono handler data.
- Routing: file-based routing, route modules, server routes, nested layouts, dynamic route conventions, route params, and where routing code lives.
- Layout and templating: how the homepage and article route share header, footer, metadata, and content components.
- Image handling: built-in optimization, adapter requirement, third-party requirement, or manual/static asset handling.
- Production server shape: what artifact is generated and which command runs it.
- Integration complexity: CSS/client asset wiring, server output ergonomics, and framework-specific caveats.

Benchmark results are recorded in the root [readme.md](../readme.md).

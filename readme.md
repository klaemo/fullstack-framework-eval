# Full Stack Framework SSR Benchmark

This repository compares six independent SSR implementations of the same news-style page:

- `astro`
- `nextjs`
- `react-router`
- `react-router-rsc`
- `hono-jsx`
- `tanstack-start`

Each app renders the same homepage at `/` and the same article route at `/articles/cities-prepare-hotter-denser-decade`. The benchmark compares build time, served HTML size, initial JavaScript size, local production render timing, browser Web Vitals, and qualitative framework ergonomics.

See [spec/benchmark-methodology.md](spec/benchmark-methodology.md) for the measurement commands and collection rules. See [dx.md](dx.md) for a developer experience and ecosystem analysis focused on extending these setups.

## Results

These numbers were collected on 2026-07-01 with Node.js `v24.18.0`, `oha 1.14.0`, `agent-browser 0.31.1`, and Headless Chrome `150.0.0.0`.

Measurement notes:

- `oha` was run with `NO_COLOR=false` because this local environment sets `NO_COLOR=1`, which `oha 1.14.0` parses as an invalid boolean value.
- Server timing used 30s at concurrency 10 after one warmup request per route.
- Browser measurements used `agent-browser vitals`, Headless Chrome, viewport `1440 x 1000`, a fresh browser session per run, no artificial throttling, and 3 first-load runs per homepage. The table reports medians.
- INP is not available from these synthetic page loads because there is no user interaction during measurement.
- The initial JavaScript byte column is route-specific in the table below. The headline KPI remains the `/` route.

## Interpreting The Results

Astro's `0.0 KB` initial JavaScript result means no external route JavaScript chunk was emitted for the benchmark page. It does not mean the page has no client-side behavior. The small menu, save-story, and newsletter interactions are emitted as an inline script in the HTML.

React Router RSC's HTML payload is larger than standard React Router because it embeds React Flight data alongside the rendered HTML. Standard React Router mostly sends HTML plus a compact loader-data stream. RSC sends HTML plus serialized server component tree data, client component references, module IDs, props, class names, and text needed by the client runtime. The upside is that server components do not hydrate like normal client React components; only explicit client components should hydrate. In this small page, that hydration saving is not large enough to outweigh the Flight/runtime overhead.

RSC tends to pay off when it keeps substantial code or data work out of the browser: dependency-heavy rendering, markdown or CMS shaping, dashboards with many server-rendered panels, permission-aware views, server-only data access, or large component trees where only small leaves are interactive. In this benchmark the page is small and the interactive code is already tiny, so the Flight protocol overhead has little useful work to amortize.

## Build Timing

| App | Run 1 real | Run 2 real | Run 3 real | Median real | Notes |
| --- | ---: | ---: | ---: | ---: | --- |
| Astro | 1.48s | 0.97s | 0.94s | 0.97s | First run paid extra dependency/config warmup despite cleaned framework outputs. |
| Next.js | 4.63s | 3.34s | 3.39s | 3.39s | `next build` with Turbopack, TypeScript, and app route analysis. |
| React Router | 0.92s | 0.72s | 0.68s | 0.72s | Vite client and SSR builds. |
| React Router RSC | 1.25s | 1.04s | 1.04s | 1.04s | Experimental RSC build runs five build phases. |
| Hono JSX | 1.49s | 0.79s | 0.74s | 0.79s | Separate Vite client and server builds. |
| TanStack Start | 5.17s | 1.05s | 1.01s | 1.05s | First run paid extra Nitro/Vite warmup; build emits client, SSR service, and Nitro server output with `srvx` FastResponse enabled. |

## Route Bytes And Timing

Sizes are shown as decimal KB.

| App | Route | HTML KB | Initial JS KB | `oha` req/s | Mean latency | P50 | P90 | P99 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Astro | `/` | 8.3 | 0.0 | 6,192 | 1.6 ms | 1.5 ms | 1.9 ms | 4.9 ms |
| Astro | `/articles/cities-prepare-hotter-denser-decade` | 4.0 | 0.0 | 8,359 | 1.2 ms | 1.1 ms | 1.4 ms | 4.0 ms |
| Next.js | `/` | 24.5 | 649.2 | 702 | 14.2 ms | 13.7 ms | 15.5 ms | 25.0 ms |
| Next.js | `/articles/cities-prepare-hotter-denser-decade` | 14.8 | 649.2 | 842 | 11.9 ms | 11.5 ms | 12.9 ms | 20.5 ms |
| React Router | `/` | 13.3 | 323.3 | 1,065 | 9.4 ms | 9.4 ms | 11.2 ms | 14.4 ms |
| React Router | `/articles/cities-prepare-hotter-denser-decade` | 8.0 | 323.3 | 1,415 | 7.1 ms | 6.9 ms | 8.9 ms | 12.8 ms |
| React Router RSC | `/` | 21.7 | 332.9 | 730 | 13.7 ms | 12.8 ms | 18.3 ms | 25.3 ms |
| React Router RSC | `/articles/cities-prepare-hotter-denser-decade` | 11.2 | 332.9 | 1,249 | 8.0 ms | 7.4 ms | 10.5 ms | 20.6 ms |
| Hono JSX | `/` | 7.7 | 0.6 | 7,223 | 1.4 ms | 1.2 ms | 2.2 ms | 2.7 ms |
| Hono JSX | `/articles/cities-prepare-hotter-denser-decade` | 3.2 | 0.6 | 12,632 | 0.8 ms | 0.7 ms | 1.3 ms | 1.6 ms |
| TanStack Start | `/` | 11.4 | 327.3 | 3,676 | 2.7 ms | 2.3 ms | 4.3 ms | 7.8 ms |
| TanStack Start | `/articles/cities-prepare-hotter-denser-decade` | 5.8 | 327.3 | 5,804 | 1.7 ms | 1.4 ms | 2.8 ms | 4.6 ms |

## Web Vitals

| App | Route | LCP | CLS | INP | FCP | TTFB | Notes |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| Astro | `/` | 76.0 ms | 0.0000 | n/a | 76.0 ms | 4.0 ms | Median of three `agent-browser vitals` first-load runs; LCP runs were 268 ms, 76 ms, 68 ms. |
| Next.js | `/` | 84.0 ms | 0.0000 | n/a | 84.0 ms | 12.3 ms | Median of three `agent-browser vitals` first-load runs. |
| React Router | `/` | 156.0 ms | 0.0000 | n/a | 156.0 ms | 10.0 ms | Median of three `agent-browser vitals` first-load runs. |
| React Router RSC | `/` | 168.0 ms | 0.0000 | n/a | 168.0 ms | 12.6 ms | Median of three `agent-browser vitals` first-load runs. |
| Hono JSX | `/` | 76.0 ms | 0.0000 | n/a | 76.0 ms | 2.2 ms | Median of three `agent-browser vitals` first-load runs. |
| TanStack Start | `/` | 72.0 ms | 0.0000 | n/a | 72.0 ms | 6.2 ms | Median of three `agent-browser vitals` first-load runs after enabling Nitro/srvx FastResponse. |

## Qualitative Comparison

| App | Data loading | Routing model | Layout reuse | Image handling | Production server shape | Integration complexity |
| --- | --- | --- | --- | --- | --- | --- |
| Astro | Static local module with async getter called from `.astro` route frontmatter. | File-based pages, dynamic route at `src/pages/articles/[slug].astro`. | `Layout.astro`, `NewsChrome.astro`, and route-level content components. | Static local images served from `public/images`; no numeric optimization comparison. | Node adapter emits `dist/server/entry.mjs`, run with `node`. | Integrated SSR output plus Tailwind through Vite plugin. |
| Next.js | App Router server components call local async getters. | App Router files, dynamic segment at `app/articles/[slug]/page.tsx`; routes force dynamic SSR. | Root layout plus reusable server/client components under `app/components`. | Uses built-in `next/image`; document as native image optimization path. | `.next` production build, run with `next start`. | Most integrated setup; client interactivity isolated by `"use client"`. |
| React Router | Route `loader` returns homepage/article data. | Route modules registered through `app/routes.ts`, dynamic route file `articles.$slug.tsx`. | Shared React components under `app/components`. | Static local images from `public/images`; no built-in optimizer in this implementation. | `build/server/index.js`, run with `react-router-serve`. | Explicit loader and route module model with normal client hydration. |
| React Router RSC | Server components call local async getters; client state isolated in client component file. | Route modules with `ServerComponent`, dynamic route file `articles.$slug.tsx`. | Shared server components plus explicit client controls. | Static local images from `public/images`; no built-in optimizer in this implementation. | RSC build under `build/server`, run with `react-router-serve`. | Experimental RSC build has more generated artifacts and client/server boundaries to inspect. |
| Hono JSX | Hono handlers call local async getters before server-rendering JSX. | Explicit server routes in `src/index.tsx`, dynamic param at `/articles/:slug`. | Shared JSX functions under `src/components/news.tsx`. | Static local images from `public/images`; manual asset serving. | Vite server bundle at `dist/index.js`, run with `node`. | Manual HTML shell, static serving, Vite manifest, and browser script wiring. |
| TanStack Start | Route `loader`s call local async getters and serialize loader data into the SSR stream. | File routes under `src/routes`, dynamic route file `articles.$slug.tsx`, generated typed route tree. | Root document plus shared React components under `src/components`. | Static local images from `public/images`; no built-in optimizer in this implementation. | Nitro Node output under `.output/server/index.mjs`, run with `node`. | Integrated router/build/server output, but route-tree generation and Nitro/Vite artifacts add framework-specific moving parts. |

## Caveats

- React Router RSC repeatedly logs a generated SSR stream failure under the documented `oha -z 30s -c 10` load. The article-route run itself completed with 100% HTTP success and the table reports those numbers, but the server logged `TypeError: Invalid state: Unable to enqueue` immediately afterward and exited.
- HTML parity checks confirmed the same semantic homepage shape in all apps: one `h1`, four story `article` elements, one `nav`, one newsletter `form`, three buttons, and four images. Article pages each render one `h1`, one `article`, one `nav`, two buttons, and one image.
- Extra repeated text in Next.js and React Router RSC HTML comes from serialized framework/RSC payload data rather than additional semantic content.

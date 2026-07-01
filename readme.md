# Full Stack Framework SSR Benchmark

This repository compares five independent SSR implementations of the same news-style page:

- `astro`
- `nextjs`
- `react-router`
- `react-router-rsc`
- `hono-jsx`

Each app renders the same homepage at `/` and the same article route at `/articles/cities-prepare-hotter-denser-decade`. The benchmark compares build time, served HTML bytes, initial JavaScript bytes, local production render timing, browser Web Vitals, and qualitative framework ergonomics.

See [spec/benchmark-methodology.md](spec/benchmark-methodology.md) for the measurement commands and collection rules.

## Results

These numbers were collected on 2026-07-01 with Node.js `v24.18.0`, `oha 1.14.0`, and Google Chrome `149.0.7827.201`.

Measurement notes:

- `oha` was run with `NO_COLOR=false` because this local environment sets `NO_COLOR=1`, which `oha 1.14.0` parses as an invalid boolean value.
- Server timing used 30 seconds at concurrency 10 after one warmup request per route.
- Browser measurements used headless Chrome, viewport `1440 x 1000`, cache disabled through DevTools, no artificial throttling, and three first-load runs per homepage. The table reports medians.
- INP is not available from these synthetic page loads because there is no user interaction during measurement.
- The initial JavaScript byte column is route-specific in the table below. The headline KPI remains the `/` route.

## Build Timing

| App | Run 1 real | Run 2 real | Run 3 real | Median real | Notes |
| --- | ---: | ---: | ---: | ---: | --- |
| Astro | 2.04s | 1.09s | 1.03s | 1.09s | First run paid extra dependency/config warmup despite cleaned framework outputs. |
| Next.js | 6.64s | 6.77s | 6.21s | 6.64s | `next build` with Turbopack, TypeScript, and app route analysis. |
| React Router | 1.37s | 0.84s | 1.72s | 1.37s | Vite client and SSR builds; local run-to-run variance is visible. |
| React Router RSC | 1.78s | 1.46s | 1.98s | 1.78s | Experimental RSC build runs five build phases. |
| Hono JSX | 0.95s | 0.85s | 1.16s | 0.95s | Separate Vite client and server builds. |

## Route Bytes And Timing

| App | Route | HTML bytes | Initial JS bytes | `oha` req/s | Mean latency | P50 | P90 | P99 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Astro | `/` | 8,331 | 0 | 5,148.6580 | 1.9403 ms | 1.5279 ms | 2.6400 ms | 9.7335 ms |
| Astro | `/articles/cities-prepare-hotter-denser-decade` | 3,966 | 0 | 6,409.5392 | 1.5584 ms | 1.1612 ms | 2.3020 ms | 7.5120 ms |
| Next.js | `/` | 24,515 | 649,211 | 562.2715 | 17.7911 ms | 14.7026 ms | 25.6170 ms | 65.0602 ms |
| Next.js | `/articles/cities-prepare-hotter-denser-decade` | 14,757 | 649,211 | 770.5595 | 12.9789 ms | 11.8533 ms | 15.1057 ms | 32.1095 ms |
| React Router | `/` | 13,293 | 323,255 | 1,052.2552 | 9.4990 ms | 8.9991 ms | 12.0845 ms | 22.5872 ms |
| React Router | `/articles/cities-prepare-hotter-denser-decade` | 7,967 | 323,266 | 1,330.3844 | 7.5122 ms | 7.2987 ms | 10.0817 ms | 17.0856 ms |
| React Router RSC | `/` | 21,737 | 332,912 | 688.7433 | 14.5183 ms | 13.3655 ms | 19.6958 ms | 32.7178 ms |
| React Router RSC | `/articles/cities-prepare-hotter-denser-decade` | 11,206 | 332,929 | 1,089.1320 | 9.1785 ms | 8.3917 ms | 11.9960 ms | 25.2668 ms |
| Hono JSX | `/` | 7,680 | 601 | 6,450.3229 | 1.5486 ms | 1.2451 ms | 2.3338 ms | 4.9642 ms |
| Hono JSX | `/articles/cities-prepare-hotter-denser-decade` | 3,199 | 601 | 11,371.7337 | 0.8780 ms | 0.7244 ms | 1.3939 ms | 2.4823 ms |

## Web Vitals

| App | Route | LCP | CLS | INP | FCP | TTFB | Notes |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| Astro | `/` | 120.0 ms | 0.0000 | n/a | 120.0 ms | 4.9 ms | Median of three headless Chrome first-load runs. |
| Next.js | `/` | 68.0 ms | 0.0000 | n/a | 68.0 ms | 5.6 ms | Median of three headless Chrome first-load runs. |
| React Router | `/` | 136.0 ms | 0.0000 | n/a | 136.0 ms | 4.6 ms | Median of three headless Chrome first-load runs. |
| React Router RSC | `/` | 120.0 ms | 0.0000 | n/a | 120.0 ms | 7.3 ms | Median of three headless Chrome first-load runs; one run had a much slower load event at 819.8 ms. |
| Hono JSX | `/` | 72.0 ms | 0.0000 | n/a | 72.0 ms | 1.4 ms | Median of three headless Chrome first-load runs. |

## Qualitative Comparison

| App | Data loading | Routing model | Layout reuse | Image handling | Production server shape | Integration complexity |
| --- | --- | --- | --- | --- | --- | --- |
| Astro | Static local module with async getter called from `.astro` route frontmatter. | File-based pages, dynamic route at `src/pages/articles/[slug].astro`. | `Layout.astro`, `NewsChrome.astro`, and route-level content components. | Static local images served from `public/images`; no numeric optimization comparison. | Node adapter emits `dist/server/entry.mjs`, run with `node`. | Integrated SSR output plus Tailwind through Vite plugin. |
| Next.js | App Router server components call local async getters. | App Router files, dynamic segment at `app/articles/[slug]/page.tsx`; routes force dynamic SSR. | Root layout plus reusable server/client components under `app/components`. | Uses built-in `next/image`; document as native image optimization path. | `.next` production build, run with `next start`. | Most integrated setup; client interactivity isolated by `"use client"`. |
| React Router | Route `loader` returns homepage/article data. | Route modules registered through `app/routes.ts`, dynamic route file `articles.$slug.tsx`. | Shared React components under `app/components`. | Static local images from `public/images`; no built-in optimizer in this implementation. | `build/server/index.js`, run with `react-router-serve`. | Explicit loader and route module model with normal client hydration. |
| React Router RSC | Server components call local async getters; client state isolated in client component file. | Route modules with `ServerComponent`, dynamic route file `articles.$slug.tsx`. | Shared server components plus explicit client controls. | Static local images from `public/images`; no built-in optimizer in this implementation. | RSC build under `build/server`, run with `react-router-serve`. | Experimental RSC build has more generated artifacts and client/server boundaries to inspect. |
| Hono JSX | Hono handlers call local async getters before server-rendering JSX. | Explicit server routes in `src/index.tsx`, dynamic param at `/articles/:slug`. | Shared JSX functions under `src/components/news.tsx`. | Static local images from `public/images`; manual asset serving. | Vite server bundle at `dist/index.js`, run with `node`. | Manual HTML shell, static serving, Vite manifest, and browser script wiring. |

## Caveats

- React Router RSC's article route repeatedly triggers a generated SSR stream failure under the documented `oha -z 30s -c 10` load. In a follow-up five-run audit against a fresh production server, the first article-route run returned 100% HTTP success and then logged `TypeError: Invalid state: Unable to enqueue`; subsequent runs failed with connection refused because the server was no longer accepting connections. The successful first-run timing is recorded above, but the route has a repeatable runtime stability caveat.
- HTML parity checks confirmed the same semantic homepage shape in all apps: one `h1`, four story `article` elements, one `nav`, one newsletter `form`, three buttons, and four images. Article pages each render one `h1`, one `article`, one `nav`, two buttons, and one image.
- Extra repeated text in Next.js and React Router RSC HTML comes from serialized framework/RSC payload data rather than additional semantic content.

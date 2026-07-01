# Full Stack Framework News Benchmark

## Scope
Implement a comparable benchmark across five independent projects in this repository:

- `astro`
- `nextjs`
- `react-router`
- `react-router-rsc`
- `hono-jsx`

Each project should render the same news-style homepage and article detail page using that framework's idiomatic SSR setup, with Tailwind CSS for styling, mostly static content, and one or two small interactive elements. The benchmark should support comparing initial-route JavaScript size, served HTML size, server render time, cold-cache production build time, browser-measured Core Web Vitals, and qualitative framework ergonomics for data loading, routing, templating/layout reuse, image optimization support, and local production server setup.

Out of scope:

- Creating a shared package imported by all projects. The projects should remain fully independent.
- Implementing a production CMS or real news API.
- Using SSG/prerendered static pages for the benchmark routes. The primary comparison should exercise SSR request handling.
- Committing or publishing deployments as part of this plan.
- Deploying to hosted platforms. Server timing is a local production server benchmark only.

## Context
The repository currently contains separate app directories rather than a workspace:

- `astro` is an Astro starter app with only `astro` installed. Tailwind is not installed yet.
- `nextjs` is a Next.js App Router starter and already includes Tailwind v4 through `tailwindcss`, `@tailwindcss/postcss`, `app/globals.css`, and `postcss.config.mjs`.
- `react-router` is a React Router framework-mode app. It already has Tailwind v4 through `tailwindcss`, `@tailwindcss/vite`, `app/app.css`, and `vite.config.ts`.
- `react-router-rsc` is a React Router RSC app. It already has Tailwind v4 through `tailwindcss`, `@tailwindcss/vite`, `@vitejs/plugin-rsc`, `app/app.css`, and `vite.config.ts`.
- `hono-jsx` is a Hono Node server using TypeScript and Hono JSX. It does not have Tailwind installed yet.

The current apps are mostly starter pages. That gives a clean baseline for replacing starter content with consistent benchmark pages. Because the main numeric KPIs are initial-route JavaScript bytes, served HTML bytes, server render time, cold-cache production build time, and browser-measured Core Web Vitals, the benchmark should avoid accidental shared infrastructure and avoid framework-unrepresentative client JavaScript.

Use Node.js v24 for all installs, builds, local production servers, and benchmark runs. The current local runtime used while preparing the plan is `v24.18.0`; record the exact `node --version` output again in `spec/benchmark-methodology.md` when collecting final benchmark numbers.

## Approach
Use the same page content model in each project, copied locally into each app as plain framework-native data. The repeated structure should make output comparable while preserving independence.

Implementation should proceed phase by phase. Do not start broad work from later phases until the current phase is complete or there is a documented reason to unblock work out of order. As implementation progresses, update this plan in place and check off each completed item immediately so the document remains the source of truth for remaining work.

All benchmark routes should use SSR, not SSG. If a framework would naturally prerender static pages, configure the benchmark routes to render per request or use that framework's server output mode. The local benchmark should build each project in production mode and run the generated server artifact locally.

The benchmark homepage should include:

- A header with masthead, section navigation, and a small interactive menu or theme toggle.
- A lead story with image, headline, dek, byline, and topic metadata.
- A top stories grid.
- A latest news list.
- A market/weather/sidebar-style rail.
- A newsletter signup or "save story" interaction as the second optional client-side element.
- Footer metadata.

The benchmark article route should live at `/articles/:slug` or the closest framework-native equivalent, reuse the same header and footer as the homepage, and render one article from the same local content model. This second route is primarily for qualitative comparison of routing, layouts, route params, shared templates, and data loading.

Each implementation should be idiomatic:

- Astro should use SSR/server output, render mostly static `.astro` components per request, and use a small client island only for interactivity.
- Next.js should use App Router server components by default, `next/image` for images, and a tiny client component for interactivity.
- React Router should use route modules, loader data where representative, and normal client hydration.
- React Router RSC should keep the page as a server component and add client components only where required.
- Hono should render Hono JSX on the server and use Vite to bundle Tailwind CSS plus the minimal browser script for interactivity.

Use local image assets per project so image behavior is not dependent on external hosts. For the benchmark, use the same filenames and dimensions in each app, copied into each app's own public/static asset folder. Image optimization should not be a numeric KPI; capture it only as a qualitative feature comparison noting which frameworks include a native solution and which require adapters or third-party tooling.

Recommended shared data shape, duplicated per project:

```ts
export const homepage = {
  edition: "Global",
  updatedAt: "2026-07-01T08:30:00.000Z",
  lead: {
    section: "World",
    title: "Cities prepare for a hotter, denser decade",
    dek: "New infrastructure plans are reshaping transit, housing, and public space.",
    image: "/images/lead-city.jpg",
    imageAlt: "Dense city skyline with transit lines at sunrise",
    byline: "Mara Keene",
    readTime: "6 min read",
  },
  topStories: [
    { section: "Business", title: "Chip demand redraws the server map", href: "#" },
    { section: "Culture", title: "Streaming bundles start to look like cable", href: "#" },
    { section: "Science", title: "Ocean sensors reveal faster coastal warming", href: "#" },
  ],
  latest: [
    { time: "08:15", title: "Election officials test new audit process", href: "#" },
    { time: "07:50", title: "Airlines add summer capacity on regional routes", href: "#" },
    { time: "07:20", title: "Researchers publish battery recycling benchmark", href: "#" },
  ],
  article: {
    slug: "cities-prepare-hotter-denser-decade",
    body: [
      "City planners are pairing cooling corridors with denser housing policy.",
      "The result is a new generation of infrastructure plans built around shade, transit, and resilience.",
    ],
  },
};
```

Recommended interactivity contract:

```ts
type InteractiveState = {
  compactNavOpen: boolean;
  savedStoryIds: string[];
};
```

Keep the interactions intentionally small so initial-route JavaScript bytes reflect each framework's minimum realistic hydration cost rather than app complexity.

## Affected files
- `astro/package.json` — add Tailwind v4 dependencies and scripts if needed.
- `astro/astro.config.mjs` — add the Astro Tailwind/Vite integration appropriate for Tailwind v4 and configure SSR/server output.
- `astro/src/styles/global.css` — add Tailwind import and shared base styles.
- `astro/src/layouts/Layout.astro` — import global CSS and set benchmark metadata.
- `astro/src/pages/index.astro` — replace starter content with the news homepage.
- `astro/src/pages/articles/[slug].astro` — add the article detail route.
- `astro/src/components/*` — add local Astro components for the homepage and interactive island.
- `astro/public/images/*` — add local benchmark images.
- `nextjs/app/page.tsx` — replace starter content with the news homepage server component.
- `nextjs/app/articles/[slug]/page.tsx` — add the article detail route and force dynamic SSR if needed.
- `nextjs/app/layout.tsx` — set benchmark metadata and keep global CSS.
- `nextjs/app/components/*` — add server and client components for the homepage.
- `nextjs/public/images/*` — add local benchmark images.
- `react-router/app/routes/home.tsx` — replace starter route with news homepage route and loader if used.
- `react-router/app/routes/articles.$slug.tsx` — add the article detail route.
- `react-router/app/root.tsx` — set shared metadata behavior and keep Tailwind CSS import.
- `react-router/app/components/*` — add route-local components and interactive widgets.
- `react-router/public/images/*` — add local benchmark images.
- `react-router-rsc/app/routes/home.tsx` — replace starter RSC route with the news homepage server component.
- `react-router-rsc/app/routes/articles.$slug.tsx` — add the article detail route.
- `react-router-rsc/app/root.tsx` — keep RSC-compatible document shell and CSS.
- `react-router-rsc/app/components/*` — add server and client components for RSC implementation.
- `react-router-rsc/public/images/*` — add local benchmark images.
- `hono-jsx/package.json` — add Hono's Vite plugins, Tailwind tooling, and separate server/client build scripts.
- `hono-jsx/tsconfig.json` — keep `jsxImportSource: "hono/jsx"` and ensure JSX files compile.
- `hono-jsx/src/index.tsx` — rename or replace `index.ts` with Hono JSX rendering.
- `hono-jsx/src/routes/article.tsx` — add the article detail route or equivalent route-local component.
- `hono-jsx/src/client.ts` — add minimal browser interactivity entry bundled by Vite.
- `hono-jsx/src/styles/input.css` — add Tailwind import and base styles.
- `hono-jsx/vite.config.ts` — configure `@hono/vite-dev-server`, `@hono/vite-build/node`, Tailwind, and the client bundle.
- `hono-jsx/src/vite-assets.ts` — resolve Vite dev-server tags and production manifest assets for Hono HTML rendering.
- `hono-jsx/public/assets/*` — receive generated Vite client assets served by Hono.
- `hono-jsx/public/images/*` — add local benchmark images.
- `spec/benchmark-methodology.md` — document commands and measurement process for initial-route JavaScript bytes, served HTML bytes, server render timing, cold-cache production build timing, browser-measured Core Web Vitals, and qualitative feature comparison.

## Implementation plan
### Phase 1: Normalize project independence and Tailwind availability
- [x] Confirm each app installs and builds from its own folder with its own `package-lock.json`.
- [x] Configure every app so benchmark routes use SSR/server output rather than SSG/prerendered static output.
- [x] Add Tailwind v4 to `astro` using Astro's current recommended Tailwind path.
- [x] Add Tailwind v4 to `hono-jsx` through Vite so CSS and client JavaScript are bundled together.
- [x] Use `@hono/vite-dev-server` for the Hono development server instead of manually running separate Vite and Hono watchers.
- [x] Use `@hono/vite-build/node` for the Hono production server build and a separate Vite client build for browser assets.
- [x] Verify `nextjs`, `react-router`, and `react-router-rsc` already compile Tailwind classes from their app source files.
- [x] Avoid adding root-level workspace dependencies or cross-project imports.
- [x] Document Node.js v24 as the benchmark runtime baseline and set package engines accordingly.

Astro Tailwind target:

```js
// astro/astro.config.mjs
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

Hono Vite target:

```json
{
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build --mode client",
    "build:server": "vite build",
    "start": "node dist/index.js"
  },
  "devDependencies": {
    "@hono/vite-build": "^1.11.1",
    "@hono/vite-dev-server": "^0.26.0",
    "@tailwindcss/vite": "^4",
    "tailwindcss": "^4",
    "vite": "^8"
  }
}
```

Use the latest compatible package versions when implementing; the example versions reflect the Hono Vite plugin line available during planning.

```ts
// hono-jsx/vite.config.ts
import build from "@hono/vite-build/node";
import devServer from "@hono/vite-dev-server";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  if (mode === "client") {
    return {
      plugins: [tailwindcss()],
      build: {
        manifest: true,
        outDir: "public/assets",
        emptyOutDir: true,
        copyPublicDir: false,
        rollupOptions: {
          input: "src/client.ts",
        },
      },
    };
  }

  return {
    plugins: [
      tailwindcss(),
      devServer({
        entry: "src/index.tsx",
      }),
      build({
        entry: "src/index.tsx",
      }),
    ],
    build: {
      emptyOutDir: false,
    },
  };
});
```

The Hono client entry should import Tailwind so Vite emits the stylesheet:

```ts
// hono-jsx/src/client.ts
import "./styles/input.css";
```

Hono should not hard-code Vite output filenames. In development, `@hono/vite-dev-server` serves the Hono app through Vite, so render the client entry directly. In production, read `.vite/manifest.json` from the client build output and emit the hashed CSS and JavaScript assets:

```ts
// hono-jsx/src/vite-assets.ts
import { readFileSync } from "node:fs";

type ViteManifest = Record<string, { file: string; css?: string[] }>;

export function renderViteAssets() {
  if (process.env.NODE_ENV !== "production") {
    return (
      <>
        <script type="module" src="http://127.0.0.1:5173/@vite/client"></script>
        <script type="module" src="http://127.0.0.1:5173/src/client.ts"></script>
      </>
    );
  }

  const manifest = JSON.parse(
    readFileSync(new URL("../public/assets/.vite/manifest.json", import.meta.url), "utf8"),
  ) as ViteManifest;
  const entry = manifest["src/client.ts"];

  return (
    <>
      {entry.css?.map((href) => <link rel="stylesheet" href={`/public/assets/${href}`} />)}
      <script type="module" src={`/public/assets/${entry.file}`}></script>
    </>
  );
}
```

### Phase 2: Add local benchmark content and assets
- [x] Create the same local content data in each app, using framework-native files rather than a shared package.
- [x] Add a tiny async data boundary in each app without reading from the filesystem, such as awaiting an in-memory promise before returning homepage or article data.
- [x] Add the same local benchmark images to each app's public asset directory.
- [x] Define image dimensions and alt text consistently across implementations.
- [x] Remove unused starter welcome components and starter image assets only when no longer referenced. Starter components and image assets were removed during Phase 3 after the benchmark homepages replaced the temporary starter routes.
- [x] Keep the page route at `/` for every app.
- [x] Add the same article detail route at `/articles/:slug` or the closest framework-native equivalent for every app.

Example duplicated content module:

```ts
export const metrics = [
  { label: "Markets", value: "+0.8%" },
  { label: "Weather", value: "24C" },
  { label: "Briefing", value: "12 stories" },
];

export async function getArticle(slug: string) {
  await Promise.resolve();
  return homepage.article.slug === slug ? homepage.article : null;
}
```

### Phase 3: Implement the benchmark homepage per framework
- [x] Build Astro `.astro` components for layout, lead story, story grid, latest list, and sidebar.
- [x] Build the Astro article route using shared header/footer layout components.
- [x] Add a small Astro client island for nav toggle or saved-story state.
- [x] Build the Next.js page as server components by default and isolate interactivity behind a `"use client"` component.
- [x] Build the Next.js article route using the shared app layout and force request-time rendering if static inference would otherwise apply.
- [x] Use `next/image` for Next.js benchmark images and document the resulting image optimization path.
- [x] Build the React Router route using route data loading where it reflects framework usage.
- [x] Build the React Router article route using route params and shared layout/components.
- [x] Build the React Router RSC route as a server component and isolate client-only state into explicit client components.
- [x] Build the React Router RSC article route using route params and shared layout/components.
- [x] Build the Hono JSX route with server-rendered markup and linked Vite-generated CSS/JavaScript assets.
- [x] Build the Hono article route with explicit route params and shared header/footer functions/components.

Phase 3 notes:

- The homepage and article route now share a `Framework Gazette` header/footer shell in every app.
- Next.js uses `next/image` for all benchmark images, so image optimization will be captured as Next's built-in App Router image path in the Phase 4 qualitative matrix.
- Astro and Hono use minimal browser scripts for the compact nav, save button, and newsletter state; Next.js, React Router, and React Router RSC isolate those interactions in explicit client components.

Next.js client island target:

```tsx
"use client";

import { useState } from "react";

export function SaveStoryButton({ storyId }: { storyId: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      className="border px-3 py-2 text-sm font-medium"
      data-story-id={storyId}
      onClick={() => setSaved((value) => !value)}
    >
      {saved ? "Saved" : "Save"}
    </button>
  );
}
```

Hono JSX rendering target:

```tsx
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { renderViteAssets } from "./vite-assets";

const app = new Hono();

app.use("/public/*", serveStatic({ root: "./" }));

app.use(
  jsxRenderer(({ children }) => (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {renderViteAssets()}
      </head>
      <body>{children}</body>
    </html>
  )),
);

app.get("/", (c) => c.render(<NewsHome />));

serve({ fetch: app.fetch, port: 3000 });
```

### Phase 4: Add benchmark measurement scripts and documentation
- [ ] Add a `spec/benchmark-methodology.md` document with exact per-project build and start commands.
- [ ] Record the exact Node.js version used for benchmark collection with `node --version`; expected major version is Node.js v24.
- [ ] Document initial-route JavaScript measurement as uncompressed filesystem bytes for the JavaScript needed by `/`.
- [ ] Document served HTML measurement as uncompressed response-body bytes for `/` from the local production server.
- [ ] Document cold-cache production build time measurement for each framework, including the exact cache/build directories removed before timing.
- [ ] Document server render timing using the globally installed `oha` or `autocannon` tools.
- [ ] Document Core Web Vitals measurement using the browser against each app's local production server, capturing at least LCP, CLS, INP where available, and FCP/TTFB as supporting metrics.
- [ ] Run server render timing only against each framework's production build/start command and generated server artifact, setting `NODE_ENV=production` when the command does not do so itself.
- [ ] Capture data loading notes in a qualitative feature matrix: static module data, async boundary shape, route loader, server component data access, and Hono handler data.
- [ ] Capture routing model notes in a qualitative feature matrix: file-based routing, route modules, server routes, nested layouts, dynamic route conventions, route params, and where routing code lives.
- [ ] Capture layout/templating notes in a qualitative feature matrix based on how the homepage and article route share header, footer, metadata, and content components.
- [ ] Capture image optimization notes only as qualitative feature comparison: built-in solution, adapter requirement, third-party requirement, or manual/static asset handling.
- [ ] Capture framework integration complexity notes, including whether Hono's `@hono/vite-dev-server` and `@hono/vite-build` plugins make CSS/client asset wiring and production builds ergonomic enough compared with the integrated framework setups.
- [ ] Capture local production server notes for each app, including what artifact is generated and which command runs it.

Example render timing command shape:

```sh
NODE_ENV=production npm run start
oha -z 30s -c 10 http://localhost:3000/
autocannon -d 30 -c 10 http://localhost:3000/
```

Use one tool as the primary measurement source and optionally use the other as a sanity check. Record the selected tool, duration, concurrency, warmup behavior, and production start command for each framework.

Build timing should be measured separately from dependency installation. Use a cold-cache production build for each run: remove framework build output, framework caches, generated type/build artifacts, and any local cache directories identified in `spec/benchmark-methodology.md`. Record every run plus median where practical.

Example build timing command shape:

```sh
rm -rf .next dist build .astro
NODE_ENV=production /usr/bin/time -p npm run build
```

Example HTML byte command shape:

```sh
curl -s http://localhost:3000/ | wc -c
```

Core Web Vitals should be captured from the browser against the production server for `/` and, if practical, `/articles/cities-prepare-hotter-denser-decade`. Record viewport, throttling/network settings, cache state, number of runs, and median values so the numbers are comparable across frameworks.

### Phase 5: Verify comparable output
- [ ] Run install/build/typecheck commands independently in each project.
- [ ] Before running any benchmark, start each app's local production server and open `/` plus `/articles/cities-prepare-hotter-denser-decade` in the browser to verify the page looks correct and actually works.
- [ ] Verify `/` renders the same content hierarchy in each framework.
- [ ] Confirm only the intended interactive elements hydrate or execute client JavaScript.
- [ ] Compare generated HTML for semantic parity across frameworks.
- [ ] Compare `/articles/:slug` behavior and shared layout implementation across frameworks.
- [ ] Compare generated client assets and record initial-route JavaScript filesystem bytes in `spec/benchmark-methodology.md`.
- [ ] Record served HTML response bytes for `/` in `spec/benchmark-methodology.md`.
- [ ] Record cold-cache production build timing numbers in `spec/benchmark-methodology.md`.
- [ ] Record browser-measured Core Web Vitals for each framework in `spec/benchmark-methodology.md`.
- [ ] Record qualitative feature matrix notes for data loading, routing, layout reuse, image optimization support, local production server shape, and integration complexity.
- [ ] Record any framework-specific caveats instead of hiding them behind normalization.

## Verification
- Astro install/build: `cd astro && npm install && npm run build`
- Astro preview: `cd astro && npm run preview`
- Next.js type/lint/build: `cd nextjs && npm run lint && npm run build`
- Next.js start: `cd nextjs && npm run start`
- React Router type/build: `cd react-router && npm run typecheck && npm run build`
- React Router start: `cd react-router && npm run start`
- React Router RSC type/build: `cd react-router-rsc && npm run typecheck && npm run build`
- React Router RSC start: `cd react-router-rsc && npm run start`
- Hono type/build: `cd hono-jsx && npm run build`
- Hono start: `cd hono-jsx && npm run start`
- Manual checks: before collecting benchmark numbers, use the browser to visit `/` and `/articles/cities-prepare-hotter-denser-decade` from each app's local production server; verify the same content, correct visual layout, shared header/footer layout, responsive layout, nav toggle and saved-story/newsletter interaction, local image loading, and no app imports code from another app.
- Benchmark checks: record initial-route JavaScript filesystem bytes, served homepage HTML bytes, production server render timing, cold-cache production build timing, and browser-measured Core Web Vitals for each app using the documented methodology.

## Risks and open questions
- Tailwind v4 setup differs by framework; Astro and Hono should use the lightest current integration that does not distort the benchmark.
- Next.js has built-in image optimization through `next/image`; Astro, React Router, React Router RSC, and Hono may require explicit adapters or third-party tooling for equivalent optimization. The benchmark should document this difference rather than neutralize it.
- React Router RSC APIs are still newer than standard React Router framework mode, so build output and deployment notes may change faster.
- Hono JSX will likely have the smallest framework client bundle because interactivity is manual. The benchmark should separate "framework client JavaScript" from "application interactivity JavaScript".
- Server render timing must be measured in production mode after warmup. Development servers are not valid for KPI comparisons.
- Cold-cache production build timing can be noisy because framework caches, TypeScript caches, and OS filesystem cache affect results. The methodology must state exactly what was cleaned between runs.
- Some frameworks aggressively infer static rendering for static data. The implementation must explicitly prevent SSG/prerendering for benchmark routes so server render timing measures request-time SSR.
- Running every app on port `3000` will collide during manual testing. Use one app at a time or assign explicit ports during measurement.
- The exact image assets are not specified yet. Use locally committed placeholder editorial images with identical dimensions in every project, or generate a small consistent set before implementation.

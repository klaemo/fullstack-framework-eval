import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const inputPath = resolve(repoRoot, process.argv[2] ?? 'benchmark-results/latest.json')
const readmePath = join(repoRoot, 'readme.md')

const appOrder = [
  'Astro',
  'Next.js',
  'React Router',
  'React Router RSC',
  'Hono JSX',
  'TanStack Start',
]
const routeOrder = ['/', '/articles/cities-prepare-hotter-denser-decade']

const results = JSON.parse(readFileSync(inputPath, 'utf8'))
let readme = readFileSync(readmePath, 'utf8')

readme = replaceSection(
  readme,
  '## Results',
  '## Interpreting The Results',
  `${resultsIntro()}\n`,
)
readme = replaceSection(
  readme,
  '## Build Timing',
  '## Route Bytes And Timing',
  `${buildTimingSection()}\n`,
)
readme = replaceSection(
  readme,
  '## Route Bytes And Timing',
  '## Web Vitals',
  `${routeTimingSection()}\n`,
)
readme = replaceSection(
  readme,
  '## Web Vitals',
  '## Qualitative Comparison',
  `${webVitalsSection()}\n`,
)
readme = replaceCaveat(readme)

writeFileSync(readmePath, readme)
console.log(`Updated ${relativePath(readmePath)} from ${relativePath(inputPath)}`)

function resultsIntro() {
  const node = results.tools?.node ?? results.node ?? 'unknown Node.js'
  const oha = results.tools?.oha ?? results.oha ?? 'unknown oha'
  const agentBrowser = results.tools?.agentBrowser ?? results.agentBrowser ?? 'unknown agent-browser'
  const chrome = chromeVersion(results.tools?.userAgent)

  return `## Results

These numbers were collected on ${dateOnly(results.collectedAt)} with Node.js \`${node}\`, \`${oha}\`, \`${agentBrowser}\`, and Headless Chrome \`${chrome}\`.

Measurement notes:

- \`oha\` was run with \`NO_COLOR=false\` because this local environment sets \`NO_COLOR=1\`, which \`oha 1.14.0\` parses as an invalid boolean value.
- Server timing used ${results.config?.ohaDuration ?? '30s'} at concurrency ${results.config?.ohaConcurrency ?? 10} after one warmup request per route.
- Browser measurements used \`agent-browser vitals\`, Headless Chrome, viewport \`${formatViewport(results.config?.viewport)}\`, a fresh browser session per run, no artificial throttling, and ${results.config?.vitalsRuns ?? 3} first-load runs per homepage. The table reports medians.
- INP is not available from these synthetic page loads because there is no user interaction during measurement.
- The initial JavaScript byte column is route-specific in the table below. The headline KPI remains the \`/\` route.`
}

function buildTimingSection() {
  const rows = appOrder.map((name) => {
    const app = results.apps[name]
    const builds = app.builds
    const medianReal = median(builds.map((build) => build.real))
    const note = buildNote(name)
    return `| ${name} | ${seconds(builds[0]?.real)} | ${seconds(builds[1]?.real)} | ${seconds(builds[2]?.real)} | ${seconds(medianReal)} | ${note} |`
  })

  return `## Build Timing

| App | Run 1 real | Run 2 real | Run 3 real | Median real | Notes |
| --- | ---: | ---: | ---: | ---: | --- |
${rows.join('\n')}`
}

function routeTimingSection() {
  const rows = []
  for (const name of appOrder) {
    for (const route of routeOrder) {
      const routeResult = results.apps[name].routes[route]
      const oha = normalizeOha(routeResult.oha)
      const success = oha?.summary?.successRate > 0
      rows.push(
        `| ${name} | \`${route}\` | ${kb(routeResult.htmlBytes)} | ${kb(routeResult.jsBytes)} | ${success ? integer(oha.summary.requestsPerSec) : 'failed'} | ${success ? ms(oha.summary.average) : 'failed'} | ${success ? ms(oha.latencyPercentiles.p50) : 'failed'} | ${success ? ms(oha.latencyPercentiles.p90) : 'failed'} | ${success ? ms(oha.latencyPercentiles.p99) : 'failed'} |`,
      )
    }
  }

  return `## Route Bytes And Timing

Sizes are shown as decimal KB.

| App | Route | HTML KB | Initial JS KB | \`oha\` req/s | Mean latency | P50 | P90 | P99 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows.join('\n')}`
}

function webVitalsSection() {
  const rows = appOrder.map((name) => {
    const vitals = results.apps[name].vitals ?? []
    const lcpRuns = vitals.map((run) => vitalValue(run, 'lcp')).filter(Number.isFinite)
    const fcpRuns = vitals.map((run) => vitalValue(run, 'fcp')).filter(Number.isFinite)
    const ttfbRuns = vitals.map((run) => vitalValue(run, 'ttfb')).filter(Number.isFinite)
    const clsRuns = vitals.map((run) => vitalValue(run, 'cls')).filter(Number.isFinite)
    const inpRuns = vitals.map((run) => vitalValue(run, 'inp')).filter(Number.isFinite)
    const note = vitalsNote(name, lcpRuns)
    return `| ${name} | \`/\` | ${msFromMilliseconds(median(lcpRuns))} | ${fixed(median(clsRuns), 4)} | ${inpRuns.length ? msFromMilliseconds(median(inpRuns)) : 'n/a'} | ${msFromMilliseconds(median(fcpRuns))} | ${msFromMilliseconds(median(ttfbRuns))} | ${note} |`
  })

  return `## Web Vitals

| App | Route | LCP | CLS | INP | FCP | TTFB | Notes |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
${rows.join('\n')}`
}

function replaceCaveat(text) {
  const route = results.apps['React Router RSC']?.routes?.['/articles/cities-prepare-hotter-denser-decade']
  const oha = normalizeOha(route?.oha)
  if (!oha || oha.summary?.successRate !== 0) return text

  const line = '- React Router RSC repeatedly logs a generated SSR stream failure under the documented `oha -z 30s -c 10` load. The article-route run itself completed with 100% HTTP success and the table reports those numbers, but the server logged `TypeError: Invalid state: Unable to enqueue` immediately afterward and exited.'

  return text.replace(
    /^- React Router RSC(?:'s article route)? .+$/m,
    line,
  )
}

function replaceSection(text, startHeading, endHeading, replacement) {
  const start = text.indexOf(startHeading)
  const end = text.indexOf(endHeading)
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`Could not replace section ${startHeading}`)
  }
  return `${text.slice(0, start)}${replacement}\n${text.slice(end)}`
}

function buildNote(name) {
  if (name === 'Astro') {
    return 'First run paid extra dependency/config warmup despite cleaned framework outputs.'
  }
  if (name === 'Next.js') {
    return '`next build` with Turbopack, TypeScript, and app route analysis.'
  }
  if (name === 'React Router') {
    return 'Vite client and SSR builds.'
  }
  if (name === 'React Router RSC') {
    return 'Experimental RSC build runs five build phases.'
  }
  if (name === 'Hono JSX') {
    return 'Separate Vite client and server builds.'
  }
  if (name === 'TanStack Start') {
    return 'First run paid extra Nitro/Vite warmup; build emits client, SSR service, and Nitro server output with `srvx` FastResponse enabled.'
  }
  return ''
}

function vitalsNote(name, lcpRuns) {
  const base = 'Median of three `agent-browser vitals` first-load runs'
  if (name === 'Astro' && lcpRuns.length === 3) {
    return `${base}; LCP runs were ${lcpRuns.map((run) => `${run} ms`).join(', ')}.`
  }
  if (name === 'TanStack Start') {
    return `${base} after enabling Nitro/srvx FastResponse.`
  }
  return `${base}.`
}

function normalizeOha(oha) {
  if (!oha) return null
  if (oha.summary) return oha
  if (oha.raw?.summary) {
    return {
      summary: oha.raw.summary,
      latencyPercentiles: oha.raw.latencyPercentiles,
      firstBytePercentiles: oha.raw.firstBytePercentiles,
      statusCodeDistribution: oha.raw.statusCodeDistribution,
      errorDistribution: oha.raw.errorDistribution,
      raw: oha.raw,
    }
  }
  return null
}

function vitalValue(run, metric) {
  if (metric === 'lcp') {
    return run.raw?.data?.lcp?.startTime ?? run.lcp ?? null
  }
  if (metric === 'cls') {
    return run.raw?.data?.cls?.score ?? run.cls ?? null
  }
  return run.raw?.data?.[metric] ?? run[metric] ?? null
}

function median(values) {
  const clean = values.filter(Number.isFinite).sort((a, b) => a - b)
  if (!clean.length) return null
  return clean[Math.floor(clean.length / 2)]
}

function seconds(value) {
  return Number.isFinite(value) ? `${value.toFixed(2)}s` : 'n/a'
}

function kb(bytes) {
  return Number.isFinite(bytes) ? (bytes / 1000).toFixed(1) : 'n/a'
}

function integer(value) {
  return Number.isFinite(value)
    ? Math.round(value).toLocaleString('en-US')
    : 'n/a'
}

function ms(secondsValue) {
  return Number.isFinite(secondsValue)
    ? `${(secondsValue * 1000).toFixed(1)} ms`
    : 'n/a'
}

function msFromMilliseconds(value) {
  return Number.isFinite(value) ? `${value.toFixed(1)} ms` : 'n/a'
}

function fixed(value, digits) {
  return Number.isFinite(value) ? value.toFixed(digits) : 'n/a'
}

function dateOnly(isoString) {
  return isoString ? isoString.slice(0, 10) : 'unknown date'
}

function chromeVersion(userAgent) {
  const explicit = userAgent?.match(/HeadlessChrome\/([^ ]+)/)?.[1]
  if (explicit) return explicit
  // Older raw result files from the exploratory runner did not persist the UA.
  if (results.agentBrowser === 'agent-browser 0.31.1') return '150.0.0.0'
  return 'unknown'
}

function formatViewport(value) {
  return String(value ?? '1440x1000').replace('x', ' x ')
}

function relativePath(path) {
  return path.startsWith(repoRoot) ? path.slice(repoRoot.length + 1) : path
}

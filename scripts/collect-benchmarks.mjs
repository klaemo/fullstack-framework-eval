import { spawn, spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const articlePath = '/articles/cities-prepare-hotter-denser-decade'
const routes = ['/', articlePath]

const appConfigs = [
  {
    name: 'Astro',
    dir: 'astro',
    port: 4101,
    cleanup: ['dist', '.astro'],
    startEnv: { HOST: '127.0.0.1', PORT: '4101', NODE_ENV: 'production' },
    urlToFile(url) {
      return url.startsWith('/_astro/')
        ? join(repoRoot, 'astro/dist/client', url)
        : null
    },
  },
  {
    name: 'Next.js',
    dir: 'nextjs',
    port: 4102,
    cleanup: ['.next'],
    startEnv: {
      HOSTNAME: '127.0.0.1',
      PORT: '4102',
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1',
    },
    urlToFile(url) {
      return url.startsWith('/_next/static/')
        ? join(
            repoRoot,
            'nextjs/.next/static',
            url.slice('/_next/static/'.length),
          )
        : null
    },
  },
  {
    name: 'React Router',
    dir: 'react-router',
    port: 4103,
    cleanup: ['build', '.react-router/types'],
    startEnv: { HOST: '127.0.0.1', PORT: '4103', NODE_ENV: 'production' },
    urlToFile(url) {
      return url.startsWith('/assets/')
        ? join(repoRoot, 'react-router/build/client', url)
        : null
    },
  },
  {
    name: 'React Router RSC',
    dir: 'react-router-rsc',
    port: 4104,
    cleanup: ['build', '.react-router/types'],
    startEnv: { HOST: '127.0.0.1', PORT: '4104', NODE_ENV: 'production' },
    urlToFile(url) {
      return url.startsWith('/assets/')
        ? join(repoRoot, 'react-router-rsc/build/client', url)
        : null
    },
  },
  {
    name: 'Hono JSX',
    dir: 'hono-jsx',
    port: 3000,
    cleanup: ['dist', 'public/assets'],
    startEnv: { NODE_ENV: 'production' },
    urlToFile(url) {
      return url.startsWith('/assets/')
        ? join(repoRoot, 'hono-jsx/public', url)
        : null
    },
  },
  {
    name: 'TanStack Start',
    dir: 'tanstack-start',
    port: 4105,
    cleanup: ['.output', 'node_modules/.nitro'],
    startEnv: { HOST: '127.0.0.1', PORT: '4105', NODE_ENV: 'production' },
    urlToFile(url) {
      return url.startsWith('/assets/')
        ? join(repoRoot, 'tanstack-start/.output/public', url)
        : null
    },
  },
]

const args = parseArgs(process.argv.slice(2))
const outputPath = resolve(
  repoRoot,
  args.output ?? 'benchmark-results/latest.json',
)
const buildRuns = Number(args.buildRuns ?? 3)
const vitalsRuns = Number(args.vitalsRuns ?? 3)
const ohaDuration = args.ohaDuration ?? '30s'
const ohaConcurrency = String(args.ohaConcurrency ?? 10)
const skipVitals = Boolean(args.skipVitals)
const skipOha = Boolean(args.skipOha)

function parseArgs(argv) {
  const parsed = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--skip-vitals') {
      parsed.skipVitals = true
    } else if (arg === '--skip-oha') {
      parsed.skipOha = true
    } else if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const value = argv[i + 1]
      if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for ${arg}`)
      }
      parsed[toCamelCase(key)] = value
      i++
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }
  return parsed
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

function run(cmd, cmdArgs, options = {}) {
  const result = spawnSync(cmd, cmdArgs, {
    cwd: options.cwd ?? repoRoot,
    env: { ...process.env, ...(options.env ?? {}) },
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 40,
  })

  return {
    status: result.status,
    signal: result.signal,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    error: result.error ? String(result.error) : null,
  }
}

function compactCommandResult(result) {
  return {
    status: result.status,
    signal: result.signal,
    error: result.error,
    stderr: result.status === 0 ? tail(result.stderr) : result.stderr,
    stdout: result.status === 0 ? tail(result.stdout) : result.stdout,
  }
}

function tail(text, max = 4000) {
  return text.length > max ? text.slice(-max) : text
}

function parseTime(stderr) {
  return {
    real: matchNumber(stderr, /^real\s+([\d.]+)/m),
    user: matchNumber(stderr, /^user\s+([\d.]+)/m),
    sys: matchNumber(stderr, /^sys\s+([\d.]+)/m),
  }
}

function matchNumber(text, pattern) {
  const match = text.match(pattern)
  return match ? Number(match[1]) : null
}

function cleanApp(app) {
  for (const item of app.cleanup) {
    rmSync(join(repoRoot, app.dir, item), { recursive: true, force: true })
  }
}

function timeBuild(app, runNumber) {
  cleanApp(app)
  const result = run('/usr/bin/time', ['-p', 'npm', 'run', 'build'], {
    cwd: join(repoRoot, app.dir),
    env: { NODE_ENV: 'production' },
  })
  return {
    run: runNumber,
    ...parseTime(result.stderr),
    ...compactCommandResult(result),
  }
}

function finalBuild(app) {
  cleanApp(app)
  return compactCommandResult(
    run('npm', ['run', 'build'], {
      cwd: join(repoRoot, app.dir),
      env: { NODE_ENV: 'production' },
    }),
  )
}

function startServer(app) {
  const child = spawn('npm', ['run', 'start'], {
    cwd: join(repoRoot, app.dir),
    env: { ...process.env, ...app.startEnv },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let output = ''
  child.stdout.on('data', (chunk) => {
    output += chunk.toString()
  })
  child.stderr.on('data', (chunk) => {
    output += chunk.toString()
  })
  return { child, getOutput: () => output }
}

async function stopServer(server) {
  if (server.child.exitCode != null) return
  server.child.kill('SIGINT')
  await new Promise((resolve) => {
    const timeout = setTimeout(resolve, 5000)
    server.child.once('exit', () => {
      clearTimeout(timeout)
      resolve()
    })
  })
  if (server.child.exitCode == null) server.child.kill('SIGKILL')
}

async function waitFor(url, timeoutMs = 30000) {
  const start = Date.now()
  let lastError = ''
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, {
        headers: { 'Accept-Encoding': 'identity' },
      })
      if (response.status < 500) return
      lastError = `status ${response.status}`
    } catch (error) {
      lastError = String(error)
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`Timed out waiting for ${url}: ${lastError}`)
}

async function fetchTextAndBytes(url) {
  const response = await fetch(url, {
    headers: { 'Accept-Encoding': 'identity' },
  })
  const buffer = Buffer.from(await response.arrayBuffer())
  return {
    status: response.status,
    bytes: buffer.length,
    text: buffer.toString('utf8'),
  }
}

function extractJsUrls(html) {
  const urls = new Set()
  const patterns = [
    /<script\b[^>]*\bsrc=["']([^"']+\.js(?:\?[^"']*)?)["'][^>]*>/gi,
    /<link\b[^>]*\bhref=["']([^"']+\.js(?:\?[^"']*)?)["'][^>]*>/gi,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(html))) {
      urls.add(match[1].replace(/^https?:\/\/[^/]+/, '').split('?')[0])
    }
  }

  return [...urls]
}

function jsBytesFor(app, html) {
  const urls = extractJsUrls(html)
  const files = []
  for (const url of urls) {
    const file = app.urlToFile(url)
    if (file && existsSync(file) && statSync(file).isFile()) files.push(file)
  }
  const uniqueFiles = [...new Set(files)]
  return {
    bytes: uniqueFiles.reduce((sum, file) => sum + statSync(file).size, 0),
    files: uniqueFiles.map((file) => relative(repoRoot, file)),
    urls,
  }
}

function runOha(url) {
  const result = run(
    'oha',
    [
      '-z',
      ohaDuration,
      '-c',
      ohaConcurrency,
      '--no-tui',
      '--output-format',
      'json',
      url,
    ],
    { env: { NO_COLOR: 'false' } },
  )

  if (result.status !== 0) {
    return {
      status: result.status,
      error: result.stderr || result.stdout,
    }
  }

  const raw = JSON.parse(result.stdout)
  return {
    status: 0,
    summary: raw.summary,
    latencyPercentiles: raw.latencyPercentiles,
    firstBytePercentiles: raw.firstBytePercentiles,
    statusCodeDistribution: raw.statusCodeDistribution,
    errorDistribution: raw.errorDistribution,
    raw,
  }
}

function runAgentBrowser(args, session) {
  return run('agent-browser', ['--session', session, ...args], {
    env: {
      AGENT_BROWSER_NAMESPACE: 'fullstack-framework-eval',
      AGENT_BROWSER_HIDE_SCROLLBARS: 'true',
    },
  })
}

function getAgentBrowserUserAgent() {
  const session = `benchmark-ua-${Date.now()}`
  const open = runAgentBrowser(['open', 'about:blank'], session)
  if (open.status !== 0) return null
  const evalResult = runAgentBrowser(['eval', 'navigator.userAgent'], session)
  runAgentBrowser(['close'], session)
  if (evalResult.status !== 0) return null
  try {
    return JSON.parse(evalResult.stdout.trim())
  } catch {
    return evalResult.stdout.trim()
  }
}

function runVitals(app, runNumber) {
  const session = `benchmark-vitals-${app.dir}-${runNumber}-${Date.now()}`
  runAgentBrowser(['set', 'viewport', '1440', '1000'], session)
  const result = runAgentBrowser(
    ['vitals', `http://127.0.0.1:${app.port}/`, '--json'],
    session,
  )
  runAgentBrowser(['close'], session)

  if (result.status !== 0) {
    return {
      run: runNumber,
      status: result.status,
      error: result.stderr || result.stdout,
    }
  }

  const raw = JSON.parse(result.stdout)
  return {
    run: runNumber,
    status: 0,
    lcp: raw.data?.lcp?.startTime ?? null,
    cls: raw.data?.cls?.score ?? null,
    inp: raw.data?.inp ?? null,
    fcp: raw.data?.fcp ?? null,
    ttfb: raw.data?.ttfb ?? null,
    raw,
  }
}

function save(results) {
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify(results, null, 2)}\n`)
}

async function main() {
  const results = {
    collectedAt: new Date().toISOString(),
    repoRoot: '.',
    routes,
    config: {
      buildRuns,
      vitalsRuns,
      ohaDuration,
      ohaConcurrency: Number(ohaConcurrency),
      viewport: '1440x1000',
    },
    tools: {
      node: run('node', ['--version']).stdout.trim(),
      oha: run('oha', ['--version']).stdout.trim(),
      agentBrowser: run('agent-browser', ['--version']).stdout.trim(),
      userAgent: skipVitals ? null : getAgentBrowserUserAgent(),
    },
    apps: {},
  }

  for (const app of appConfigs) {
    console.log(`\n=== ${app.name}: cold builds ===`)
    const appResult = {
      dir: app.dir,
      port: app.port,
      builds: [],
      routes: {},
      vitals: [],
    }
    results.apps[app.name] = appResult

    for (let index = 1; index <= buildRuns; index++) {
      const build = timeBuild(app, index)
      appResult.builds.push(build)
      console.log(`${app.name} build ${index}: real=${build.real}s`)
      if (build.status !== 0) throw new Error(`${app.name} build failed`)
      save(results)
    }

    console.log(`=== ${app.name}: final production server ===`)
    appResult.finalBuild = finalBuild(app)
    if (appResult.finalBuild.status !== 0) {
      throw new Error(`${app.name} final build failed`)
    }

    const server = startServer(app)
    try {
      await waitFor(`http://127.0.0.1:${app.port}/`)

      for (const route of routes) {
        const url = `http://127.0.0.1:${app.port}${route}`
        const response = await fetchTextAndBytes(url)
        const js = jsBytesFor(app, response.text)
        appResult.routes[route] = {
          status: response.status,
          htmlBytes: response.bytes,
          jsBytes: js.bytes,
          jsFiles: js.files,
          jsUrls: js.urls,
        }
        console.log(`${app.name} ${route}: html=${response.bytes} js=${js.bytes}`)
      }

      if (!skipVitals) {
        console.log(`=== ${app.name}: agent-browser vitals ===`)
        for (let index = 1; index <= vitalsRuns; index++) {
          const vital = runVitals(app, index)
          appResult.vitals.push(vital)
          console.log(
            `${app.name} vitals ${index}: LCP=${vital.lcp} FCP=${vital.fcp} TTFB=${vital.ttfb} CLS=${vital.cls}`,
          )
          save(results)
        }
      }

      if (!skipOha) {
        console.log(`=== ${app.name}: oha ===`)
        for (const route of routes) {
          const url = `http://127.0.0.1:${app.port}${route}`
          await fetch(url).catch(() => {})
          const oha = runOha(url)
          appResult.routes[route].oha = oha
          const rps = oha.summary?.successRate === 0
            ? 'failed'
            : Math.round(oha.summary?.requestsPerSec ?? 0)
          console.log(`${app.name} ${route}: req/s=${rps}`)
          save(results)
        }
      }
    } finally {
      await stopServer(server)
      appResult.serverOutput = tail(server.getOutput(), 12000)
      save(results)
    }
  }

  save(results)
  console.log(`\nWrote ${relative(repoRoot, outputPath)}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

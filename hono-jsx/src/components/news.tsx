import type { Article, getHomepage } from "../data/news";

type Homepage = Awaited<ReturnType<typeof getHomepage>>;

const navItems = ["World", "Business", "Culture", "Science"];

export function NewsChrome({ children }: { children: unknown }) {
  return (
    <>
      <header class="border-b border-[var(--rule)] bg-[var(--paper)]">
        <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between gap-4">
            <a href="/" class="font-serif text-3xl font-black tracking-normal sm:text-5xl">Framework Gazette</a>
            <div class="hidden items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)] md:flex">
              <span>Global desk</span>
              <span class="h-2 w-2 bg-[var(--accent)]"></span>
              <span>08:30 UTC</span>
            </div>
            <button type="button" class="border border-[var(--ink)] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] md:hidden" data-menu-toggle aria-expanded="false" aria-controls="compact-nav">
              Menu
            </button>
          </div>
          <nav id="compact-nav" class="mt-4 hidden border-t border-[var(--rule)] pt-3 text-sm font-bold uppercase tracking-[0.16em] text-[var(--steel)] md:block" data-menu-panel>
            <ul class="grid gap-2 md:flex md:gap-8">
              {navItems.map((item) => <li><a href="/">{item}</a></li>)}
            </ul>
          </nav>
        </div>
      </header>
      {children}
      <footer class="border-t border-[var(--rule)] bg-[#eee7db]">
        <div class="mx-auto grid max-w-7xl gap-3 px-4 py-8 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)] sm:px-6 md:grid-cols-3 lg:px-8">
          <p>Framework Gazette</p>
          <p>Independent SSR benchmark edition</p>
          <p class="md:text-right">Images served locally</p>
        </div>
      </footer>
    </>
  );
}

export function NewsHome({ homepage }: { homepage: Homepage }) {
  const updated = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(homepage.updatedAt));

  return (
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section class="grid gap-8 border-b border-[var(--rule)] pb-8 lg:grid-cols-[1.35fr_0.65fr]">
        <article class="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <a href={`/articles/${homepage.lead.slug}`} class="group block overflow-hidden bg-[#d9e1e2] [clip-path:polygon(0_0,100%_0,100%_88%,88%_100%,0_100%)]">
            <img src={homepage.lead.image.src} alt={homepage.lead.image.alt} width={homepage.lead.image.width} height={homepage.lead.image.height} class="aspect-[5/3] h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
          </a>
          <div class="flex flex-col justify-between gap-6">
            <div>
              <p class="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)]">{homepage.lead.section}</p>
              <h1 class="max-w-3xl font-serif text-5xl font-black leading-[0.95] tracking-normal sm:text-6xl lg:text-7xl">
                <a href={`/articles/${homepage.lead.slug}`}>{homepage.lead.title}</a>
              </h1>
              <p class="mt-5 max-w-xl text-xl leading-8 text-[var(--muted)]">{homepage.lead.dek}</p>
            </div>
            <div class="flex flex-wrap items-center gap-3 text-sm font-bold text-[var(--steel)]">
              <span>{homepage.lead.byline}</span>
              <span class="h-1 w-1 bg-[var(--muted)]"></span>
              <span>{homepage.lead.readTime}</span>
              <button type="button" class="border border-[var(--ink)] px-3 py-2 text-xs font-black uppercase tracking-[0.16em]" data-save-story data-story-id={homepage.lead.slug}>Save</button>
            </div>
          </div>
        </article>
        <aside class="border-t border-[var(--rule)] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div class="flex items-center justify-between border-b border-[var(--rule)] pb-3">
            <h2 class="text-sm font-black uppercase tracking-[0.2em]">Desk wire</h2>
            <span class="text-xs font-bold text-[var(--muted)]">{updated}</span>
          </div>
          <dl class="mt-4 grid grid-cols-3 gap-2">
            {homepage.metrics.map((metric) => (
              <div class="border border-[var(--rule)] bg-[#fbf8f1] p-3">
                <dt class="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{metric.label}</dt>
                <dd class="mt-2 text-xl font-black">{metric.value}</dd>
              </div>
            ))}
          </dl>
          <form class="mt-5 grid gap-3" data-newsletter>
            <label class="text-sm font-bold" for="hono-newsletter">Morning brief</label>
            <div class="flex gap-2">
              <input id="hono-newsletter" type="email" placeholder="email@example.com" class="min-w-0 flex-1 border border-[var(--rule)] bg-white px-3 py-2 text-sm" />
              <button class="bg-[var(--ink)] px-4 py-2 text-sm font-bold text-white" type="submit">Join</button>
            </div>
            <p class="text-xs font-bold text-[var(--muted)]" data-newsletter-status>One briefing, no noise.</p>
          </form>
        </aside>
      </section>
      <section class="grid gap-8 py-8 lg:grid-cols-[1fr_0.78fr]">
        <div>
          <div class="mb-4 flex items-center justify-between border-b border-[var(--rule)] pb-3">
            <h2 class="text-sm font-black uppercase tracking-[0.2em]">Top stories</h2>
          </div>
          <div class="grid gap-4 md:grid-cols-3">
            {homepage.topStories.map((story, index) => {
              const image = index === 1 ? homepage.images.business : homepage.images.coastline;
              return (
                <article class="border-b border-[var(--rule)] pb-4 md:border-b-0 md:border-r md:pr-4">
                  <p class="text-xs font-black uppercase tracking-[0.16em] text-[var(--accent)]">{story.section}</p>
                  <h3 class="mt-3 text-2xl font-black leading-tight"><a href={story.href}>{story.title}</a></h3>
                  <img src={image.src} alt={image.alt} width={image.width} height={image.height} class="mt-4 aspect-[5/3] w-full border border-[var(--rule)] object-cover" />
                </article>
              );
            })}
          </div>
        </div>
        <div>
          <div class="mb-4 border-b border-[var(--rule)] pb-3">
            <h2 class="text-sm font-black uppercase tracking-[0.2em]">Latest</h2>
          </div>
          <ol class="divide-y divide-[var(--rule)]">
            {homepage.latest.map((item) => (
              <li class="grid grid-cols-[4rem_1fr] gap-4 py-4">
                <time class="text-sm font-black text-[var(--accent)]">{item.time}</time>
                <a href={item.href} class="text-xl font-bold leading-snug">{item.title}</a>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}

export function ArticleView({ article }: { article: Article }) {
  return (
    <main class="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <p class="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)]">{article.section}</p>
      <h1 class="mt-4 font-serif text-5xl font-black leading-none sm:text-7xl">{article.title}</h1>
      <p class="mt-5 text-2xl leading-9 text-[var(--muted)]">{article.dek}</p>
      <div class="mt-6 flex flex-wrap items-center gap-3 border-y border-[var(--rule)] py-3 text-sm font-bold text-[var(--steel)]">
        <span>{article.byline}</span>
        <span class="h-1 w-1 bg-[var(--muted)]"></span>
        <span>{article.readTime}</span>
        <button type="button" class="border border-[var(--ink)] px-3 py-2 text-xs font-black uppercase tracking-[0.16em]" data-save-story data-story-id={article.slug}>Save</button>
      </div>
      <img src={article.image.src} alt={article.image.alt} width={article.image.width} height={article.image.height} class="mt-8 aspect-[5/3] w-full border border-[var(--rule)] object-cover" />
      <article class="mt-8 grid gap-6 text-xl leading-9">
        {article.body.map((paragraph) => <p>{paragraph}</p>)}
      </article>
    </main>
  );
}

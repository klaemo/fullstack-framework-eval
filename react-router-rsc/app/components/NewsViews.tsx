import type { Article, getHomepage } from "../data/news";
import { NewsletterForm, SaveStoryButton } from "./InteractiveControls";

type Homepage = Awaited<ReturnType<typeof getHomepage>>;

export function NewsHome({ homepage }: { homepage: Homepage }) {
  const updated = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(homepage.updatedAt));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-8 border-b border-[var(--rule)] pb-8 lg:grid-cols-[1.35fr_0.65fr]">
        <article className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <a href={`/articles/${homepage.lead.slug}`} className="group block overflow-hidden bg-[#d9e1e2] [clip-path:polygon(0_0,100%_0,100%_88%,88%_100%,0_100%)]">
            <img src={homepage.lead.image.src} alt={homepage.lead.image.alt} width={homepage.lead.image.width} height={homepage.lead.image.height} className="aspect-[5/3] h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
          </a>
          <div className="flex flex-col justify-between gap-6">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)]">{homepage.lead.section}</p>
              <h1 className="max-w-3xl font-serif text-5xl font-black leading-[0.95] tracking-normal sm:text-6xl lg:text-7xl">
                <a href={`/articles/${homepage.lead.slug}`}>{homepage.lead.title}</a>
              </h1>
              <p className="mt-5 max-w-xl text-xl leading-8 text-[var(--muted)]">{homepage.lead.dek}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-[var(--steel)]">
              <span>{homepage.lead.byline}</span>
              <span className="h-1 w-1 bg-[var(--muted)]" />
              <span>{homepage.lead.readTime}</span>
              <SaveStoryButton storyId={homepage.lead.slug} />
            </div>
          </div>
        </article>
        <aside className="border-t border-[var(--rule)] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Desk wire</h2>
            <span className="text-xs font-bold text-[var(--muted)]">{updated}</span>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-2">
            {homepage.metrics.map((metric) => (
              <div className="border border-[var(--rule)] bg-[#fbf8f1] p-3" key={metric.label}>
                <dt className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{metric.label}</dt>
                <dd className="mt-2 text-xl font-black">{metric.value}</dd>
              </div>
            ))}
          </dl>
          <NewsletterForm />
        </aside>
      </section>
      <section className="grid gap-8 py-8 lg:grid-cols-[1fr_0.78fr]">
        <div>
          <div className="mb-4 flex items-center justify-between border-b border-[var(--rule)] pb-3">
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Top stories</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {homepage.topStories.map((story, index) => {
              const image = index === 1 ? homepage.images.business : homepage.images.coastline;
              return (
                <article className="border-b border-[var(--rule)] pb-4 md:border-b-0 md:border-r md:pr-4" key={story.title}>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--accent)]">{story.section}</p>
                  <h3 className="mt-3 text-2xl font-black leading-tight">
                    <a href={story.href}>{story.title}</a>
                  </h3>
                  <img src={image.src} alt={image.alt} width={image.width} height={image.height} className="mt-4 aspect-[5/3] w-full border border-[var(--rule)] object-cover" />
                </article>
              );
            })}
          </div>
        </div>
        <div>
          <div className="mb-4 border-b border-[var(--rule)] pb-3">
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Latest</h2>
          </div>
          <ol className="divide-y divide-[var(--rule)]">
            {homepage.latest.map((item) => (
              <li className="grid grid-cols-[4rem_1fr] gap-4 py-4" key={item.title}>
                <time className="text-sm font-black text-[var(--accent)]">{item.time}</time>
                <a href={item.href} className="text-xl font-bold leading-snug">
                  {item.title}
                </a>
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
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)]">{article.section}</p>
      <h1 className="mt-4 font-serif text-5xl font-black leading-none sm:text-7xl">{article.title}</h1>
      <p className="mt-5 text-2xl leading-9 text-[var(--muted)]">{article.dek}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-[var(--rule)] py-3 text-sm font-bold text-[var(--steel)]">
        <span>{article.byline}</span>
        <span className="h-1 w-1 bg-[var(--muted)]" />
        <span>{article.readTime}</span>
        <SaveStoryButton storyId={article.slug} />
      </div>
      <img src={article.image.src} alt={article.image.alt} width={article.image.width} height={article.image.height} className="mt-8 aspect-[5/3] w-full border border-[var(--rule)] object-cover" />
      <article className="mt-8 grid gap-6 text-xl leading-9">
        {article.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </article>
    </main>
  );
}

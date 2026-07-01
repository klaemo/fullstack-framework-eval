import Image from "next/image";
import type { Article } from "../data/news";
import { SaveStoryButton } from "./InteractiveControls";

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
      <Image src={article.image.src} alt={article.image.alt} width={article.image.width} height={article.image.height} priority className="mt-8 aspect-[5/3] w-full border border-[var(--rule)] object-cover" />
      <article className="mt-8 grid gap-6 text-xl leading-9">
        {article.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </article>
    </main>
  );
}

import Image from "next/image";
import { notFound } from "next/navigation";
import { getArticle } from "../../data/news";

export const dynamic = "force-dynamic";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <main>
      <p>{article.section}</p>
      <h1>{article.title}</h1>
      <p>{article.dek}</p>
      <Image
        src={article.image.src}
        alt={article.image.alt}
        width={article.image.width}
        height={article.image.height}
      />
      <p>
        {article.byline} - {article.readTime}
      </p>
      {article.body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </main>
  );
}

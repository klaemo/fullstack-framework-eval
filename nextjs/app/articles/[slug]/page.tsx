import { notFound } from "next/navigation";
import { ArticleView } from "../../components/ArticleView";
import { NewsChrome } from "../../components/NewsChrome";
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
    <NewsChrome>
      <ArticleView article={article} />
    </NewsChrome>
  );
}

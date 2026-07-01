import { getArticle } from "../data/news";
import { ArticleView, NewsChrome } from "../components/news";

export async function renderArticle(slug: string) {
  const article = await getArticle(slug);

  if (!article) {
    return null;
  }

  return <NewsChrome><ArticleView article={article} /></NewsChrome>;
}

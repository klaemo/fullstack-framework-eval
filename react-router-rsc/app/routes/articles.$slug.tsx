import type { Route } from "./+types/articles.$slug";
import { NewsChrome } from "../components/NewsChrome";
import { ArticleView } from "../components/NewsViews";
import { getArticle } from "../data/news";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Article | Framework Gazette" },
    { name: "description", content: "Framework benchmark article route" },
  ];
}

export async function ServerComponent({ params }: Route.ComponentProps) {
  const article = await getArticle(params.slug);

  if (!article) {
    throw new Response("Article not found", { status: 404 });
  }

  return (
    <NewsChrome>
      <ArticleView article={article} />
    </NewsChrome>
  );
}

import { data, useLoaderData } from "react-router";
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

export async function loader({ params }: Route.LoaderArgs) {
  const article = await getArticle(params.slug);

  if (!article) {
    throw data("Article not found", { status: 404 });
  }

  return article;
}

export default function ArticleRoute() {
  const article = useLoaderData<typeof loader>();

  return (
    <NewsChrome>
      <ArticleView article={article} />
    </NewsChrome>
  );
}

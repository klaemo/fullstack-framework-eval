import { data, useLoaderData } from "react-router";
import type { Route } from "./+types/articles.$slug";
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
    <main>
      <p>{article.section}</p>
      <h1>{article.title}</h1>
      <p>{article.dek}</p>
      <img
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

import { getArticle } from "../data/news";

export async function renderArticle(slug: string) {
  const article = await getArticle(slug);

  if (!article) {
    return null;
  }

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
        <p>{paragraph}</p>
      ))}
    </main>
  );
}


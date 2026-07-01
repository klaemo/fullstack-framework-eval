import { createFileRoute, notFound } from '@tanstack/react-router'
import { NewsChrome } from '../components/NewsChrome'
import { ArticleView } from '../components/NewsViews'
import { getArticle } from '../data/news'

export const Route = createFileRoute('/articles/$slug')({
  loader: async ({ params }) => {
    const article = await getArticle(params.slug)

    if (!article) {
      throw notFound()
    }

    return { article }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData ? `${loaderData.article.title} | Framework Gazette` : 'Article | Framework Gazette',
      },
      {
        name: 'description',
        content: loaderData?.article.dek ?? 'Framework Gazette article',
      },
    ],
  }),
  component: ArticleRoute,
})

function ArticleRoute() {
  const { article } = Route.useLoaderData()

  return (
    <NewsChrome>
      <ArticleView article={article} />
    </NewsChrome>
  )
}

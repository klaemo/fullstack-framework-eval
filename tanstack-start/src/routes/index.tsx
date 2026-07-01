import { createFileRoute } from '@tanstack/react-router'
import { NewsChrome } from '../components/NewsChrome'
import { NewsHome } from '../components/NewsViews'
import { getHomepage } from '../data/news'

export const Route = createFileRoute('/')({
  loader: async () => ({ homepage: await getHomepage() }),
  head: () => ({
    meta: [
      {
        title: 'Framework Gazette',
      },
      {
        name: 'description',
        content: 'Independent SSR benchmark edition',
      },
    ],
  }),
  component: Home,
})

function Home() {
  const { homepage } = Route.useLoaderData()

  return (
    <NewsChrome>
      <NewsHome homepage={homepage} />
    </NewsChrome>
  )
}

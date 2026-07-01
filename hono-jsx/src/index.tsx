import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { NewsChrome, NewsHome } from './components/news';
import { getHomepage } from './data/news';
import { renderArticle } from './routes/article';
import { renderViteAssets } from './vite-assets';

const app = new Hono();

app.use('/images/*', serveStatic({ root: './public' }));
app.use('/assets/*', serveStatic({ root: './public' }));

function document(title: string, children: unknown) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="SSR benchmark news edition" />
        <title>{title}</title>
        {renderViteAssets()}
      </head>
      <body>{children}</body>
    </html>
  );
}

app.get('/', async (c) => {
  const homepage = await getHomepage();

  return c.html(document('Framework Gazette', <NewsChrome><NewsHome homepage={homepage} /></NewsChrome>));
});

app.get('/articles/:slug', async (c) => {
  const article = await renderArticle(c.req.param('slug'));

  if (!article) {
    return c.notFound();
  }

  return c.html(document('Article | Framework Gazette', article));
});

export default app;

import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { renderArticle } from './routes/article';

const app = new Hono();

app.use('/images/*', serveStatic({ root: './public' }));

app.get('/', (c) => {
  return c.html(<h1 class="text-2xl font-semibold">Hello Hono!</h1>);
});

app.get('/articles/:slug', async (c) => {
  const article = await renderArticle(c.req.param('slug'));

  if (!article) {
    return c.notFound();
  }

  return c.html(article);
});

export default app;

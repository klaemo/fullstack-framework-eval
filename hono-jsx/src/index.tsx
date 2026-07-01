import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.html(<h1 class="text-2xl font-semibold">Hello Hono!</h1>);
});

export default app;

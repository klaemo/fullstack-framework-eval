import build from '@hono/vite-build/node';
import devServer from '@hono/vite-dev-server';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      plugins: [tailwindcss()],
      build: {
        manifest: true,
        outDir: 'public/assets',
        emptyOutDir: true,
        copyPublicDir: false,
        rollupOptions: {
          input: 'src/client.ts',
        },
      },
    };
  }

  return {
    plugins: [
      tailwindcss(),
      devServer({
        entry: 'src/index.tsx',
      }),
      build({
        entry: 'src/index.tsx',
      }),
    ],
    build: {
      emptyOutDir: false,
    },
  };
});

import express from 'express';
import { fileURLToPath } from 'node:url';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use((_request, response, next) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });
  app.get('/healthz', (_request, response) => response.json({ status: 'ok', app: 'MarginDesk' }));
  app.use(express.static(fileURLToPath(new URL('./dist/', import.meta.url)), {
    dotfiles: 'deny',
    index: 'index.html',
    maxAge: 0
  }));
  app.use((_request, response) => response.status(404).type('text').send('Page not found'));
  return app;
}

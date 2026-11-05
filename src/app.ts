import express, { type Express } from 'express';
import { buildOpenApiDocument } from './openapi';

function createApp(): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  const openApiDocument = buildOpenApiDocument();

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/openapi.json', (_req, res) => {
    res.json(openApiDocument);
  });

  return app;
}

export { createApp };

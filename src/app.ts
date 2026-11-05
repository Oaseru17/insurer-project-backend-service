import express, { type Express, Router } from 'express';
import { createCarrierModule } from './modules/carrier';
import { createCustomerModule, seedCustomers } from './modules/customer';
import { createFormModule } from './modules/form';
import { API_V1, buildOpenApiDocument } from './openapi';
import { errorHandler, NotFoundError } from './shared/http';
import { createLogger, type Logger } from './shared/logger';

interface AppDeps {
  logger?: Logger;
}

// Composition root: the only place modules are built and wired together.
function createApp({ logger = createLogger() }: AppDeps = {}): Express {
  const customers = createCustomerModule();
  seedCustomers(customers.service);
  const carriers = createCarrierModule({ customers: customers.service });
  const forms = createFormModule({ customers: customers.service, carriers: carriers.service });
  const openApiDocument = buildOpenApiDocument();

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.get('/openapi.json', (_req, res) => {
    res.json(openApiDocument);
  });

  // Versioned in the URL; a v2 would be a second router mounted alongside this one.
  const v1 = Router();
  v1.use('/customers', customers.router);
  v1.use('/carriers', carriers.router);
  v1.use('/forms', forms.router);
  app.use(API_V1, v1);

  app.use((req, _res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.path}`));
  });
  app.use(errorHandler(logger));

  return app;
}

export { type AppDeps, createApp };

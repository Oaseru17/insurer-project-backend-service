import { createApp } from './app';
import { createLogger } from './shared/logger';

const port = Number(process.env.PORT ?? 4000);
const logger = createLogger();

createApp({ logger }).listen(port, () => {
  logger.info('insurer-project-backend-service listening', { url: `http://localhost:${port}` });
});

import { createApp } from './app';

const port = Number(process.env.PORT ?? 4000);

createApp().listen(port, () => {
  process.stdout.write(`olli-backend-service listening on http://localhost:${port}\n`);
});

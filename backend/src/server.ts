import { createServer, type Server } from 'node:http';

import app from './app';
import { env } from './config/env';

const server: Server = createServer(app);

const startServer = (): void => {
  server.listen(env.APP_PORT, () => {
    console.log(
      `[NEMP] Backend started successfully on http://localhost:${env.APP_PORT}/api/${env.API_VERSION}`,
    );
  });

  server.on('error', (error: Error) => {
    console.error('[NEMP] Backend failed to start.', error.message);
    process.exit(1);
  });
};

const shutdown = (signal: NodeJS.Signals): void => {
  console.log(`[NEMP] Received ${signal}. Shutting down gracefully...`);

  server.close((error?: Error) => {
    if (error) {
      console.error('[NEMP] Error during shutdown.', error.message);
      process.exit(1);
    }

    console.log('[NEMP] Backend shutdown complete.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();

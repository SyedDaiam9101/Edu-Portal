import { buildApp } from './app';
import { env } from './config/env';

async function main() {
  const app = await buildApp({ env });

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, 'shutdown: start');
    try {
      await app.close();
      app.log.info('shutdown: complete');
      process.exit(0);
    } catch (error) {
      app.log.error({ error }, 'shutdown: failed');
      process.exit(1);
    }
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  try {
    await app.listen({ host: env.HOST, port: env.PORT });
  } catch (error) {
    app.log.error({ error }, 'server: failed to start');
    process.exit(1);
  }
}

void main();


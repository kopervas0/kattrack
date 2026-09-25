import { createApp } from './app';
import { env } from './config/env';
import { migrate } from './db/migrate';

async function main() {
  await migrate();

  const app = createApp();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`KatTrack API listening on port ${env.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start KatTrack API', err);
  process.exit(1);
});

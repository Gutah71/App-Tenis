import 'dotenv/config';
import app from './app';
import { autoFinishExpiredTournaments } from './services/schedulerService';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const ONE_HOUR_MS = 60 * 60 * 1000;

app.listen(PORT, () => {
  console.log(`[server] Running at http://localhost:${PORT}`);
  console.log(`[server] Environment: ${process.env.NODE_ENV ?? 'development'}`);

  // Run immediately on startup, then every hour
  autoFinishExpiredTournaments().catch(() => undefined);
  setInterval(() => autoFinishExpiredTournaments().catch(() => undefined), ONE_HOUR_MS);
});

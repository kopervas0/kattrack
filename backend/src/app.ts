import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/authRoutes';
import { applicationRoutes } from './routes/applicationRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { settingsRoutes } from './routes/settingsRoutes';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(errorHandler);

  return app;
}

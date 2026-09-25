import { Router } from 'express';
import { SettingsRepository } from '../repositories/settingsRepository';

const settingsRepository = new SettingsRepository();

export const settingsRoutes = Router();

// Public subset of settings — the login/register pages and the dashboard need
// them before (or regardless of) the user's role. The user limit is not a secret either.
settingsRoutes.get('/public', async (_req, res, next) => {
  try {
    const { registrationEnabled, announcement, maxApplicationsPerUser } = await settingsRepository.getAll();
    return res.json({ settings: { registrationEnabled, announcement, maxApplicationsPerUser } });
  } catch (err) {
    return next(err);
  }
});

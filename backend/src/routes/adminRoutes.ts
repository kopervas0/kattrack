import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { requireAdmin, requireAuth } from '../middleware/auth';

export const adminRoutes = Router();

adminRoutes.use(requireAuth, requireAdmin);

adminRoutes.get('/users', adminController.listUsers);
adminRoutes.patch('/users/:id/block', adminController.setBlocked);
adminRoutes.patch('/users/:id/role', adminController.setRole);
adminRoutes.delete('/users/:id', adminController.deleteUser);
adminRoutes.get('/stats', adminController.stats);
adminRoutes.get('/settings', adminController.getSettings);
adminRoutes.put('/settings', adminController.updateSettings);

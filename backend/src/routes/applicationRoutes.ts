import { Router } from 'express';
import * as applicationController from '../controllers/applicationController';
import { requireAuth } from '../middleware/auth';

export const applicationRoutes = Router();

applicationRoutes.use(requireAuth);

applicationRoutes.get('/', applicationController.list);
applicationRoutes.get('/stats', applicationController.stats);
applicationRoutes.get('/:id', applicationController.get);
applicationRoutes.post('/', applicationController.create);
applicationRoutes.patch('/:id', applicationController.update);
applicationRoutes.delete('/:id', applicationController.remove);

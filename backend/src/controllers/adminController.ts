import { Response, NextFunction } from 'express';
import { AdminService } from '../services/adminService';
import { AuthenticatedRequest } from '../middleware/auth';

const adminService = new AdminService();

export async function listUsers(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const users = await adminService.listUsers();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
}

export async function setBlocked(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await adminService.setBlocked(req.userId!, Number(req.params.id), req.body.isBlocked);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

export async function setRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await adminService.setRole(req.userId!, Number(req.params.id), req.body.role);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

export async function deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await adminService.deleteUser(req.userId!, Number(req.params.id));
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

export async function stats(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await adminService.stats();
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

export async function getSettings(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const settings = await adminService.getSettings();
    return res.json({ settings });
  } catch (err) {
    return next(err);
  }
}

export async function updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const settings = await adminService.updateSettings(req.body ?? {});
    return res.json({ settings });
  } catch (err) {
    return next(err);
  }
}

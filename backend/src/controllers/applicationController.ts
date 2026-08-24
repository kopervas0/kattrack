import { Response, NextFunction } from 'express';
import { ApplicationService } from '../services/applicationService';
import { AuthenticatedRequest } from '../middleware/auth';

const applicationService = new ApplicationService();

export async function list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const applications = await applicationService.list(req.userId!, status);
    return res.json({ applications });
  } catch (err) {
    return next(err);
  }
}

export async function stats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const counts = await applicationService.stats(req.userId!);
    return res.json({ counts });
  } catch (err) {
    return next(err);
  }
}

export async function get(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const application = await applicationService.get(Number(req.params.id), req.userId!);
    return res.json({ application });
  } catch (err) {
    return next(err);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const application = await applicationService.create(req.userId!, req.body);
    return res.status(201).json({ application });
  } catch (err) {
    return next(err);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const application = await applicationService.update(Number(req.params.id), req.userId!, req.body);
    return res.json({ application });
  } catch (err) {
    return next(err);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await applicationService.remove(Number(req.params.id), req.userId!);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

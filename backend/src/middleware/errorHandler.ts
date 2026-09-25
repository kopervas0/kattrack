import { NextFunction, Request, Response } from 'express';
import { AuthError } from '../services/authService';
import { NotFoundError, ValidationError } from '../services/applicationService';
import { ForbiddenError } from '../services/errors';

// Centralized error handler — controllers just throw, this maps
// domain errors to the right HTTP status once, in one place.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof AuthError) {
    return res.status(401).json({ error: err.message });
  }
  if (err instanceof ForbiddenError) {
    return res.status(403).json({ error: err.message });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
}

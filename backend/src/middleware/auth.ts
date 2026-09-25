import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { UserRepository } from '../repositories/userRepository';
import { UserRole } from '../types';

const authService = new AuthService();
const userRepository = new UserRepository();

export interface AuthenticatedRequest extends Request {
  userId?: number;
  userRole?: UserRole;
}

// Besides checking the JWT, the user is re-read from the database on every request,
// so blocking a user or changing their role takes effect immediately, not when the token expires.
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  const token = header.slice('Bearer '.length);
  let userId: number;
  try {
    userId = authService.verifyToken(token).userId;
  } catch {
    return res.status(401).json({ error: 'Невалидный или истёкший токен' });
  }
  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ error: 'Аккаунт заблокирован администратором' });
    }
    req.userId = user.id;
    req.userRole = user.role;
    return next();
  } catch (err) {
    return next(err);
  }
}

// Must be used after requireAuth.
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Доступно только администратору' });
  }
  return next();
}

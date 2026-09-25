import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { UserRepository } from '../repositories/userRepository';
import { AuthenticatedRequest } from '../middleware/auth';

const authService = new AuthService();
const userRepository = new UserRepository();

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email и password обязательны' });
    }
    const result = await authService.register(email, password);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email и password обязательны' });
    }
    const result = await authService.login(email, password);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

// Returns the current user (with the up-to-date role) for the token in the Authorization header.
export async function me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = await userRepository.findById(req.userId!);
    return res.json({ user: { id: user!.id, email: user!.email, role: user!.role } });
  } catch (err) {
    return next(err);
  }
}

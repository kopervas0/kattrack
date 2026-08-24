import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository';
import { env } from '../config/env';
import { AuthTokenPayload, PublicUser } from '../types';

export class AuthError extends Error {}

// Service layer: business rules live here, independent of Express and of raw SQL.
export class AuthService {
  constructor(private readonly users: UserRepository = new UserRepository()) {}

  async register(email: string, password: string): Promise<{ user: PublicUser; token: string }> {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new AuthError('Пользователь с таким email уже зарегистрирован');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.create(email, passwordHash);
    return { user: { id: user.id, email: user.email }, token: this.issueToken(user.id, user.email) };
  }

  async login(email: string, password: string): Promise<{ user: PublicUser; token: string }> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new AuthError('Неверный email или пароль');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AuthError('Неверный email или пароль');
    }
    return { user: { id: user.id, email: user.email }, token: this.issueToken(user.id, user.email) };
  }

  private issueToken(userId: number, email: string): string {
    const payload: AuthTokenPayload = { userId, email };
    return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
  }

  verifyToken(token: string): AuthTokenPayload {
    return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
  }
}

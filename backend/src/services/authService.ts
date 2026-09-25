import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/userRepository';
import { SettingsRepository } from '../repositories/settingsRepository';
import { env } from '../config/env';
import { AuthTokenPayload, PublicUser, User } from '../types';
import { ForbiddenError } from './errors';

export class AuthError extends Error {}

// Service layer: business rules live here, independent of Express and of raw SQL.
export class AuthService {
  constructor(
    private readonly users: UserRepository = new UserRepository(),
    private readonly settings: SettingsRepository = new SettingsRepository(),
  ) {}

  async register(email: string, password: string): Promise<{ user: PublicUser; token: string }> {
    const { registrationEnabled } = await this.settings.getAll();
    if (!registrationEnabled) {
      throw new ForbiddenError('Регистрация новых пользователей временно отключена администратором');
    }
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new AuthError('Пользователь с таким email уже зарегистрирован');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.create(email, passwordHash);
    return this.session(user);
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
    if (user.isBlocked) {
      throw new ForbiddenError('Аккаунт заблокирован администратором');
    }
    return this.session(user);
  }

  private session(user: User): { user: PublicUser; token: string } {
    const payload: AuthTokenPayload = { userId: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
    return { user: { id: user.id, email: user.email, role: user.role }, token };
  }

  verifyToken(token: string): AuthTokenPayload {
    return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
  }
}

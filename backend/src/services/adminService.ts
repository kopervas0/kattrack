import { UserRepository } from '../repositories/userRepository';
import { ApplicationRepository } from '../repositories/applicationRepository';
import { SettingsRepository } from '../repositories/settingsRepository';
import { AdminUserView, AppSettings, SystemStats, UserRole } from '../types';
import { NotFoundError, ValidationError } from './applicationService';
import { ForbiddenError } from './errors';

const ROLES: UserRole[] = ['user', 'admin'];
const MAX_ANNOUNCEMENT_LENGTH = 500;

// Everything an administrator can do. Rules that protect the admin from
// locking themselves out (self-block, self-demote, self-delete) live here.
export class AdminService {
  constructor(
    private readonly users: UserRepository = new UserRepository(),
    private readonly applications: ApplicationRepository = new ApplicationRepository(),
    private readonly settings: SettingsRepository = new SettingsRepository(),
  ) {}

  listUsers(): Promise<AdminUserView[]> {
    return this.users.listWithStats();
  }

  async setBlocked(actorId: number, targetId: number, isBlocked: unknown): Promise<void> {
    if (typeof isBlocked !== 'boolean') {
      throw new ValidationError('isBlocked должен быть true или false');
    }
    if (actorId === targetId) {
      throw new ForbiddenError('Нельзя заблокировать собственный аккаунт');
    }
    if (!(await this.users.setBlocked(targetId, isBlocked))) {
      throw new NotFoundError('Пользователь не найден');
    }
  }

  async setRole(actorId: number, targetId: number, role: unknown): Promise<void> {
    if (!ROLES.includes(role as UserRole)) {
      throw new ValidationError(`Недопустимая роль: ${String(role)}`);
    }
    if (actorId === targetId) {
      throw new ForbiddenError('Нельзя изменить роль собственного аккаунта');
    }
    if (!(await this.users.setRole(targetId, role as UserRole))) {
      throw new NotFoundError('Пользователь не найден');
    }
  }

  async deleteUser(actorId: number, targetId: number): Promise<void> {
    if (actorId === targetId) {
      throw new ForbiddenError('Нельзя удалить собственный аккаунт');
    }
    if (!(await this.users.delete(targetId))) {
      throw new NotFoundError('Пользователь не найден');
    }
  }

  async stats(): Promise<SystemStats> {
    const [users, byStatus] = await Promise.all([
      this.users.countStats(),
      this.applications.countByStatus(null),
    ]);
    const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0);
    return { users, applications: { total, byStatus } };
  }

  getSettings(): Promise<AppSettings> {
    return this.settings.getAll();
  }

  async updateSettings(input: Record<string, unknown>): Promise<AppSettings> {
    const patch: Partial<AppSettings> = {};

    if (input.registrationEnabled !== undefined) {
      if (typeof input.registrationEnabled !== 'boolean') {
        throw new ValidationError('registrationEnabled должен быть true или false');
      }
      patch.registrationEnabled = input.registrationEnabled;
    }
    if (input.maxApplicationsPerUser !== undefined) {
      const limit = input.maxApplicationsPerUser;
      if (typeof limit !== 'number' || !Number.isInteger(limit) || limit < 0) {
        throw new ValidationError('maxApplicationsPerUser должен быть целым числом ≥ 0 (0 — без лимита)');
      }
      patch.maxApplicationsPerUser = limit;
    }
    if (input.announcement !== undefined) {
      if (typeof input.announcement !== 'string' || input.announcement.length > MAX_ANNOUNCEMENT_LENGTH) {
        throw new ValidationError(`announcement должен быть строкой до ${MAX_ANNOUNCEMENT_LENGTH} символов`);
      }
      patch.announcement = input.announcement.trim();
    }

    return this.settings.update(patch);
  }
}

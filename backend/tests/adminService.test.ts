import { AdminService } from '../src/services/adminService';
import { NotFoundError, ValidationError } from '../src/services/applicationService';
import { ForbiddenError } from '../src/services/errors';
import { UserRepository } from '../src/repositories/userRepository';
import { ApplicationRepository } from '../src/repositories/applicationRepository';
import { SettingsRepository } from '../src/repositories/settingsRepository';

function makeService(
  users: Partial<UserRepository> = {},
  applications: Partial<ApplicationRepository> = {},
  settings: Partial<SettingsRepository> = {},
) {
  return new AdminService(
    users as UserRepository,
    applications as ApplicationRepository,
    settings as SettingsRepository,
  );
}

describe('AdminService', () => {
  it('does not let an admin block themselves', async () => {
    const users = { setBlocked: jest.fn() };
    const service = makeService(users);

    await expect(service.setBlocked(1, 1, true)).rejects.toBeInstanceOf(ForbiddenError);
    expect(users.setBlocked).not.toHaveBeenCalled();
  });

  it('blocks another user', async () => {
    const users = { setBlocked: jest.fn().mockResolvedValue(true) };
    const service = makeService(users);

    await service.setBlocked(1, 2, true);

    expect(users.setBlocked).toHaveBeenCalledWith(2, true);
  });

  it('throws NotFoundError when the target user does not exist', async () => {
    const service = makeService({ delete: jest.fn().mockResolvedValue(false) });

    await expect(service.deleteUser(1, 999)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('does not let an admin change their own role', async () => {
    const service = makeService({ setRole: jest.fn() });

    await expect(service.setRole(1, 1, 'user')).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('rejects an unknown role', async () => {
    const service = makeService({ setRole: jest.fn() });

    await expect(service.setRole(1, 2, 'superuser')).rejects.toBeInstanceOf(ValidationError);
  });

  it('validates the application limit setting', async () => {
    const settings = { update: jest.fn() };
    const service = makeService({}, {}, settings);

    await expect(service.updateSettings({ maxApplicationsPerUser: -1 })).rejects.toBeInstanceOf(ValidationError);
    await expect(service.updateSettings({ maxApplicationsPerUser: 2.5 })).rejects.toBeInstanceOf(ValidationError);
    expect(settings.update).not.toHaveBeenCalled();
  });

  it('saves only the provided valid settings', async () => {
    const settings = { update: jest.fn().mockResolvedValue({}) };
    const service = makeService({}, {}, settings);

    await service.updateSettings({ registrationEnabled: false, announcement: '  Привет  ' });

    expect(settings.update).toHaveBeenCalledWith({ registrationEnabled: false, announcement: 'Привет' });
  });

  it('aggregates system-wide stats', async () => {
    const service = makeService(
      { countStats: jest.fn().mockResolvedValue({ total: 3, admins: 1, blocked: 0, newLast7Days: 2 }) },
      { countByStatus: jest.fn().mockResolvedValue({ applied: 4, interview: 2, offer: 1, rejected: 3 }) },
    );

    const stats = await service.stats();

    expect(stats.users.total).toBe(3);
    expect(stats.applications.total).toBe(10);
  });
});

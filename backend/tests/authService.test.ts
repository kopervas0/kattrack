import { AuthService, AuthError } from '../src/services/authService';
import { UserRepository } from '../src/repositories/userRepository';
import { SettingsRepository } from '../src/repositories/settingsRepository';
import { ForbiddenError } from '../src/services/errors';
import bcrypt from 'bcryptjs';

function makeSettings(registrationEnabled = true): SettingsRepository {
  return {
    getAll: jest.fn().mockResolvedValue({ registrationEnabled, maxApplicationsPerUser: 0, announcement: '' }),
  } as unknown as SettingsRepository;
}

function makeUser(passwordHash: string, overrides: Record<string, unknown> = {}) {
  return { id: 1, email: 'a@a.com', passwordHash, role: 'user', isBlocked: false, createdAt: '', ...overrides };
}

describe('AuthService', () => {
  it('rejects registration when the email is already taken', async () => {
    const repo = {
      findByEmail: jest.fn().mockResolvedValue(makeUser('x')),
    } as unknown as UserRepository;
    const service = new AuthService(repo, makeSettings());

    await expect(service.register('a@a.com', 'password123')).rejects.toBeInstanceOf(AuthError);
  });

  it('rejects login with a wrong password', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 10);
    const repo = {
      findByEmail: jest.fn().mockResolvedValue(makeUser(passwordHash)),
    } as unknown as UserRepository;
    const service = new AuthService(repo, makeSettings());

    await expect(service.login('a@a.com', 'wrong-password')).rejects.toBeInstanceOf(AuthError);
  });

  it('issues a token on successful login', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 10);
    const repo = {
      findByEmail: jest.fn().mockResolvedValue(makeUser(passwordHash)),
    } as unknown as UserRepository;
    const service = new AuthService(repo, makeSettings());

    const result = await service.login('a@a.com', 'correct-password');

    expect(result.user.email).toBe('a@a.com');
    expect(typeof result.token).toBe('string');
    expect(result.user.role).toBe('user');
    expect(service.verifyToken(result.token).email).toBe('a@a.com');
  });

  it('rejects registration when the admin has disabled it', async () => {
    const repo = { findByEmail: jest.fn(), create: jest.fn() } as unknown as UserRepository;
    const service = new AuthService(repo, makeSettings(false));

    await expect(service.register('new@a.com', 'password123')).rejects.toBeInstanceOf(ForbiddenError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('rejects login for a blocked user', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 10);
    const repo = {
      findByEmail: jest.fn().mockResolvedValue(makeUser(passwordHash, { isBlocked: true })),
    } as unknown as UserRepository;
    const service = new AuthService(repo, makeSettings());

    await expect(service.login('a@a.com', 'correct-password')).rejects.toBeInstanceOf(ForbiddenError);
  });
});

import { AuthService, AuthError } from '../src/services/authService';
import { UserRepository } from '../src/repositories/userRepository';
import bcrypt from 'bcryptjs';

describe('AuthService', () => {
  it('rejects registration when the email is already taken', async () => {
    const repo = {
      findByEmail: jest.fn().mockResolvedValue({ id: 1, email: 'a@a.com', passwordHash: 'x', createdAt: '' }),
    } as unknown as UserRepository;
    const service = new AuthService(repo);

    await expect(service.register('a@a.com', 'password123')).rejects.toBeInstanceOf(AuthError);
  });

  it('rejects login with a wrong password', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 10);
    const repo = {
      findByEmail: jest.fn().mockResolvedValue({ id: 1, email: 'a@a.com', passwordHash, createdAt: '' }),
    } as unknown as UserRepository;
    const service = new AuthService(repo);

    await expect(service.login('a@a.com', 'wrong-password')).rejects.toBeInstanceOf(AuthError);
  });

  it('issues a token on successful login', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 10);
    const repo = {
      findByEmail: jest.fn().mockResolvedValue({ id: 1, email: 'a@a.com', passwordHash, createdAt: '' }),
    } as unknown as UserRepository;
    const service = new AuthService(repo);

    const result = await service.login('a@a.com', 'correct-password');

    expect(result.user.email).toBe('a@a.com');
    expect(typeof result.token).toBe('string');
    expect(service.verifyToken(result.token).email).toBe('a@a.com');
  });
});

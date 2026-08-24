import { ApplicationService, NotFoundError, ValidationError } from '../src/services/applicationService';
import { ApplicationRepository } from '../src/repositories/applicationRepository';
import { Application } from '../src/types';

// Unit tests hit the service layer with a mocked repository, so they
// run in CI without needing a real PostgreSQL instance.
function makeApplication(overrides: Partial<Application> = {}): Application {
  return {
    id: 1,
    userId: 1,
    company: 'Профиторг',
    position: 'Junior Full Stack Developer',
    url: null,
    status: 'applied',
    salaryFrom: 88000,
    salaryTo: 145000,
    notes: null,
    appliedAt: '2026-08-23',
    createdAt: '2026-08-23T00:00:00.000Z',
    updatedAt: '2026-08-23T00:00:00.000Z',
    ...overrides,
  };
}

describe('ApplicationService', () => {
  it('creates an application when required fields are present', async () => {
    const repo = {
      create: jest.fn().mockResolvedValue(makeApplication()),
    } as unknown as ApplicationRepository;
    const service = new ApplicationService(repo);

    const result = await service.create(1, { company: 'Профиторг', position: 'Junior Full Stack Developer' });

    expect(result.company).toBe('Профиторг');
    expect(repo.create).toHaveBeenCalledWith(1, { company: 'Профиторг', position: 'Junior Full Stack Developer' });
  });

  it('rejects creation without a company or position', async () => {
    const repo = {} as ApplicationRepository;
    const service = new ApplicationService(repo);

    await expect(service.create(1, { company: '', position: '' })).rejects.toBeInstanceOf(ValidationError);
  });

  it('rejects an unknown status filter', async () => {
    const repo = {} as ApplicationRepository;
    const service = new ApplicationService(repo);

    await expect(service.list(1, 'not-a-status')).rejects.toBeInstanceOf(ValidationError);
  });

  it('throws NotFoundError when updating an application that does not belong to the user', async () => {
    const repo = {
      update: jest.fn().mockResolvedValue(null),
    } as unknown as ApplicationRepository;
    const service = new ApplicationService(repo);

    await expect(service.update(99, 1, { status: 'offer' })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('computes status counts via the repository', async () => {
    const repo = {
      countByStatus: jest.fn().mockResolvedValue({ applied: 3, interview: 1, offer: 0, rejected: 2 }),
    } as unknown as ApplicationRepository;
    const service = new ApplicationService(repo);

    const stats = await service.stats(1);

    expect(stats.applied).toBe(3);
    expect(stats.interview).toBe(1);
  });
});

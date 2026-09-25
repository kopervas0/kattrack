import { ApplicationRepository } from '../repositories/applicationRepository';
import { SettingsRepository } from '../repositories/settingsRepository';
import { Application, ApplicationStatus, CreateApplicationInput, UpdateApplicationInput } from '../types';

export class NotFoundError extends Error {}
export class ValidationError extends Error {}

const VALID_STATUSES: ApplicationStatus[] = ['applied', 'interview', 'offer', 'rejected'];

export class ApplicationService {
  constructor(
    private readonly applications: ApplicationRepository = new ApplicationRepository(),
    private readonly settings: SettingsRepository = new SettingsRepository(),
  ) {}

  async list(userId: number, status?: string) {
    if (status && !VALID_STATUSES.includes(status as ApplicationStatus)) {
      throw new ValidationError(`Недопустимый статус: ${status}`);
    }
    return this.applications.listByUser(userId, status as ApplicationStatus | undefined);
  }

  async stats(userId: number) {
    return this.applications.countByStatus(userId);
  }

  async get(id: number, userId: number): Promise<Application> {
    const application = await this.applications.findById(id, userId);
    if (!application) {
      throw new NotFoundError('Отклик не найден');
    }
    return application;
  }

  async create(userId: number, input: CreateApplicationInput): Promise<Application> {
    if (!input.company?.trim() || !input.position?.trim()) {
      throw new ValidationError('company и position обязательны');
    }
    const { maxApplicationsPerUser } = await this.settings.getAll();
    if (maxApplicationsPerUser > 0) {
      const count = await this.applications.countByUser(userId);
      if (count >= maxApplicationsPerUser) {
        throw new ValidationError(
          `Достигнут лимит откликов (${maxApplicationsPerUser}), установленный администратором`,
        );
      }
    }
    return this.applications.create(userId, input);
  }

  async update(id: number, userId: number, input: UpdateApplicationInput): Promise<Application> {
    const updated = await this.applications.update(id, userId, input);
    if (!updated) {
      throw new NotFoundError('Отклик не найден');
    }
    return updated;
  }

  async remove(id: number, userId: number): Promise<void> {
    const deleted = await this.applications.delete(id, userId);
    if (!deleted) {
      throw new NotFoundError('Отклик не найден');
    }
  }
}

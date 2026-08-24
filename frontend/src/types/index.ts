export type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected';

export interface PublicUser {
  id: number;
  email: string;
}

export interface Application {
  id: number;
  userId: number;
  company: string;
  position: string;
  url: string | null;
  status: ApplicationStatus;
  salaryFrom: number | null;
  salaryTo: number | null;
  notes: string | null;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationFormValues {
  company: string;
  position: string;
  url: string;
  status: ApplicationStatus;
  salaryFrom: string;
  salaryTo: string;
  notes: string;
  appliedAt: string;
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Отклик отправлен',
  interview: 'Собеседование',
  offer: 'Оффер',
  rejected: 'Отказ',
};

export type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected';

export type UserRole = 'user' | 'admin';

export interface PublicUser {
  id: number;
  email: string;
  role: UserRole;
}

export interface AdminUserView {
  id: number;
  email: string;
  role: UserRole;
  isBlocked: boolean;
  createdAt: string;
  applicationsCount: number;
}

export interface AppSettings {
  registrationEnabled: boolean;
  // 0 means "no limit"
  maxApplicationsPerUser: number;
  announcement: string;
}

export interface SystemStats {
  users: { total: number; admins: number; blocked: number; newLast7Days: number };
  applications: { total: number; byStatus: Record<ApplicationStatus, number> };
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

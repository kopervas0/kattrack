export type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected';

export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  role: UserRole;
  isBlocked: boolean;
  createdAt: string;
}

export interface PublicUser {
  id: number;
  email: string;
  role: UserRole;
}

// A user row as the admin panel sees it: no password hash, plus usage info.
export interface AdminUserView {
  id: number;
  email: string;
  role: UserRole;
  isBlocked: boolean;
  createdAt: string;
  applicationsCount: number;
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

export interface CreateApplicationInput {
  company: string;
  position: string;
  url?: string;
  status?: ApplicationStatus;
  salaryFrom?: number;
  salaryTo?: number;
  notes?: string;
  appliedAt?: string;
}

export type UpdateApplicationInput = Partial<CreateApplicationInput>;

export interface AuthTokenPayload {
  userId: number;
  email: string;
  role: UserRole;
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

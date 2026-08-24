export type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected';

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  createdAt: string;
}

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
}

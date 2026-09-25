import {
  AdminUserView,
  AppSettings,
  Application,
  ApplicationStatus,
  PublicUser,
  SystemStats,
  UserRole,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

let authToken: string | null = localStorage.getItem('kattrack_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('kattrack_token', token);
  } else {
    localStorage.removeItem('kattrack_token');
  }
}

export function getAuthToken() {
  return authToken;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error ?? 'Ошибка запроса', res.status);
  }

  return data as T;
}

export const authApi = {
  register: (email: string, password: string) =>
    request<{ user: PublicUser; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ user: PublicUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ user: PublicUser }>('/auth/me'),
};

export const settingsApi = {
  getPublic: () => request<{ settings: AppSettings }>('/settings/public'),
};

export const adminApi = {
  listUsers: () => request<{ users: AdminUserView[] }>('/admin/users'),
  setBlocked: (id: number, isBlocked: boolean) =>
    request<void>(`/admin/users/${id}/block`, { method: 'PATCH', body: JSON.stringify({ isBlocked }) }),
  setRole: (id: number, role: UserRole) =>
    request<void>(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  deleteUser: (id: number) => request<void>(`/admin/users/${id}`, { method: 'DELETE' }),
  stats: () => request<SystemStats>('/admin/stats'),
  getSettings: () => request<{ settings: AppSettings }>('/admin/settings'),
  updateSettings: (patch: Partial<AppSettings>) =>
    request<{ settings: AppSettings }>('/admin/settings', { method: 'PUT', body: JSON.stringify(patch) }),
};

export const applicationsApi = {
  list: (status?: ApplicationStatus) =>
    request<{ applications: Application[] }>(`/applications${status ? `?status=${status}` : ''}`),
  stats: () => request<{ counts: Record<ApplicationStatus, number> }>('/applications/stats'),
  create: (payload: Partial<Application>) =>
    request<{ application: Application }>('/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: Partial<Application>) =>
    request<{ application: Application }>(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  remove: (id: number) =>
    request<void>(`/applications/${id}`, { method: 'DELETE' }),
};

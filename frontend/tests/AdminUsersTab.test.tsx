import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminUsersTab } from '../src/components/admin/AdminUsersTab';
import { adminApi } from '../src/api/client';

vi.mock('../src/api/client', () => ({
  adminApi: {
    listUsers: vi.fn(),
    setBlocked: vi.fn(),
    setRole: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

const USERS = [
  { id: 1, email: 'admin@kattrack.local', role: 'admin', isBlocked: false, createdAt: '2026-09-01', applicationsCount: 0 },
  { id: 2, email: 'user@mail.ru', role: 'user', isBlocked: false, createdAt: '2026-09-02', applicationsCount: 4 },
];

describe('AdminUsersTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApi.listUsers).mockResolvedValue({ users: USERS } as never);
    vi.mocked(adminApi.setBlocked).mockResolvedValue(undefined);
  });

  it('hides actions for the current admin and shows them for others', async () => {
    render(<AdminUsersTab currentUserId={1} />);

    await screen.findByText('user@mail.ru');

    expect(screen.getAllByText('Заблокировать')).toHaveLength(1);
    expect(screen.getByText('(вы)')).toBeInTheDocument();
  });

  it('blocks a user and reloads the list', async () => {
    render(<AdminUsersTab currentUserId={1} />);

    fireEvent.click(await screen.findByText('Заблокировать'));

    await waitFor(() => expect(adminApi.setBlocked).toHaveBeenCalledWith(2, true));
    expect(adminApi.listUsers).toHaveBeenCalledTimes(2);
  });

  it('filters users by email', async () => {
    render(<AdminUsersTab currentUserId={1} />);
    await screen.findByText('user@mail.ru');

    fireEvent.change(screen.getByPlaceholderText('Поиск по email'), { target: { value: 'mail.ru' } });

    expect(screen.queryByText('admin@kattrack.local')).not.toBeInTheDocument();
    expect(screen.getByText('user@mail.ru')).toBeInTheDocument();
  });
});

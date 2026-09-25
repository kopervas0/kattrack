import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api/client';
import { AdminUserView } from '../../types';

interface Props {
  currentUserId: number;
}

export function AdminUsersTab({ currentUserId }: Props) {
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const { users: list } = await adminApi.listUsers();
      setUsers(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function run(action: () => Promise<void>) {
    setError(null);
    try {
      await action();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось выполнить действие');
    }
  }

  function handleDelete(target: AdminUserView) {
    const question = `Удалить пользователя ${target.email} и все его отклики (${target.applicationsCount})? Это необратимо.`;
    if (!window.confirm(question)) return;
    run(() => adminApi.deleteUser(target.id));
  }

  const visible = users.filter((u) => u.email.toLowerCase().includes(search.trim().toLowerCase()));

  if (loading) return <p>Загрузка…</p>;

  return (
    <div>
      <input
        className="search-input"
        type="search"
        placeholder="Поиск по email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Откликов</th>
            <th>Зарегистрирован</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((u) => {
            const isSelf = u.id === currentUserId;
            return (
              <tr key={u.id} className={u.isBlocked ? 'blocked' : ''}>
                <td>
                  {u.email} {isSelf && <span className="badge">(вы)</span>}
                </td>
                <td>{u.role === 'admin' ? 'Администратор' : 'Пользователь'}</td>
                <td>{u.isBlocked ? 'Заблокирован' : 'Активен'}</td>
                <td>{u.applicationsCount}</td>
                <td>{new Date(u.createdAt).toLocaleDateString('ru-RU')}</td>
                <td className="row-actions">
                  {!isSelf && (
                    <>
                      <button onClick={() => run(() => adminApi.setBlocked(u.id, !u.isBlocked))}>
                        {u.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                      </button>
                      <button
                        onClick={() => run(() => adminApi.setRole(u.id, u.role === 'admin' ? 'user' : 'admin'))}
                      >
                        {u.role === 'admin' ? 'Снять админа' : 'Сделать админом'}
                      </button>
                      <button className="danger" onClick={() => handleDelete(u)}>
                        Удалить
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {visible.length === 0 && <p className="empty-state">Пользователи не найдены</p>}
    </div>
  );
}

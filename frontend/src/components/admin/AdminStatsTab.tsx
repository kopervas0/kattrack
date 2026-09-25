import { useEffect, useState } from 'react';
import { adminApi } from '../../api/client';
import { ApplicationStatus, STATUS_LABELS, SystemStats } from '../../types';

export function AdminStatsTab() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .stats()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Не удалось загрузить статистику'));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p>Загрузка…</p>;

  return (
    <div>
      <h2>Пользователи</h2>
      <div className="stat-grid">
        <StatCard label="Всего" value={stats.users.total} />
        <StatCard label="Администраторов" value={stats.users.admins} />
        <StatCard label="Заблокировано" value={stats.users.blocked} />
        <StatCard label="Новых за 7 дней" value={stats.users.newLast7Days} />
      </div>

      <h2>Отклики (все пользователи)</h2>
      <div className="stat-grid">
        <StatCard label="Всего" value={stats.applications.total} />
        {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((status) => (
          <StatCard key={status} label={STATUS_LABELS[status]} value={stats.applications.byStatus[status]} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card">
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}

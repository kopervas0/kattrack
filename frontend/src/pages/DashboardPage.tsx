import { useCallback, useEffect, useState } from 'react';
import { applicationsApi } from '../api/client';
import { Application, ApplicationStatus } from '../types';
import { StatsBar } from '../components/StatsBar';
import { ApplicationList } from '../components/ApplicationList';
import { ApplicationForm } from '../components/ApplicationForm';
import { useAuth } from '../context/AuthContext';

const EMPTY_COUNTS: Record<ApplicationStatus, number> = { applied: 0, interview: 0, offer: 0, rejected: 0 };

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | undefined>(undefined);
  const [editing, setEditing] = useState<Application | 'new' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (status?: ApplicationStatus) => {
    setLoading(true);
    setError(null);
    try {
      const [{ applications: list }, { counts: stats }] = await Promise.all([
        applicationsApi.list(status),
        applicationsApi.stats(),
      ]);
      setApplications(list);
      setCounts(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить отклики');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh(statusFilter);
  }, [refresh, statusFilter]);

  async function handleSave(values: Partial<Application>) {
    if (editing && editing !== 'new') {
      await applicationsApi.update(editing.id, values);
    } else {
      await applicationsApi.create(values);
    }
    setEditing(null);
    await refresh(statusFilter);
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Удалить этот отклик?')) return;
    await applicationsApi.remove(id);
    await refresh(statusFilter);
  }

  return (
    <div className="dashboard">
      <header>
        <h1>KatTrack</h1>
        <div>
          <span>{user?.email}</span>
          <button onClick={logout}>Выйти</button>
        </div>
      </header>

      <StatsBar counts={counts} activeStatus={statusFilter} onFilter={setStatusFilter} />

      <button className="add-button" onClick={() => setEditing('new')}>
        + Добавить отклик
      </button>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Загрузка…</p>
      ) : (
        <ApplicationList applications={applications} onSelect={setEditing} onDelete={handleDelete} />
      )}

      {editing && (
        <div className="modal">
          <ApplicationForm
            initial={editing === 'new' ? undefined : editing}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}
    </div>
  );
}

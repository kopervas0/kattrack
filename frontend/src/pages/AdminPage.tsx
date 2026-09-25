import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminUsersTab } from '../components/admin/AdminUsersTab';
import { AdminStatsTab } from '../components/admin/AdminStatsTab';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';

type Tab = 'users' | 'stats' | 'settings';

const TABS: Record<Tab, string> = {
  users: 'Пользователи',
  stats: 'Статистика',
  settings: 'Настройки',
};

export function AdminPage() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('users');

  return (
    <div className="dashboard">
      <header>
        <h1>
          KatTrack <span className="role-badge">админ-панель</span>
        </h1>
        <div className="header-actions">
          <Link to="/">← К откликам</Link>
          <span>{user?.email}</span>
          <button onClick={logout}>Выйти</button>
        </div>
      </header>

      <nav className="tabs">
        {(Object.keys(TABS) as Tab[]).map((key) => (
          <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
            {TABS[key]}
          </button>
        ))}
      </nav>

      <section className="admin-section">
        {tab === 'users' && <AdminUsersTab currentUserId={user!.id} />}
        {tab === 'stats' && <AdminStatsTab />}
        {tab === 'settings' && <AdminSettingsTab />}
      </section>
    </div>
  );
}

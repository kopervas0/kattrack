import { FormEvent, useEffect, useState } from 'react';
import { adminApi } from '../../api/client';
import { AppSettings } from '../../types';

export function AdminSettingsTab() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi
      .getSettings()
      .then(({ settings: loaded }) => setSettings(loaded))
      .catch((err) => setError(err instanceof Error ? err.message : 'Не удалось загрузить настройки'));
  }, []);

  function change<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSaved(false);
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setError(null);
    setSaving(true);
    try {
      const { settings: updated } = await adminApi.updateSettings(settings);
      setSettings(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return error ? <p className="error">{error}</p> : <p>Загрузка…</p>;

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={settings.registrationEnabled}
          onChange={(e) => change('registrationEnabled', e.target.checked)}
        />
        Разрешить регистрацию новых пользователей
      </label>

      <label>
        Лимит откликов на одного пользователя
        <input
          type="number"
          min={0}
          step={1}
          value={settings.maxApplicationsPerUser}
          onChange={(e) => change('maxApplicationsPerUser', Number(e.target.value))}
        />
        <small>0 — без ограничений. Уже созданные отклики не удаляются.</small>
      </label>

      <label>
        Объявление для всех пользователей
        <textarea
          rows={3}
          maxLength={500}
          value={settings.announcement}
          onChange={(e) => change('announcement', e.target.value)}
          placeholder="Например: плановые работы в субботу с 10:00 до 12:00"
        />
        <small>Показывается на странице откликов. Оставьте пустым, чтобы скрыть.</small>
      </label>

      {error && <p className="error">{error}</p>}
      {saved && <p className="success">Настройки сохранены</p>}
      <button type="submit" disabled={saving}>
        {saving ? 'Сохраняем…' : 'Сохранить'}
      </button>
    </form>
  );
}

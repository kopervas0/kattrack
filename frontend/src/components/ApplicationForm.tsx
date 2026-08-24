import { FormEvent, useState } from 'react';
import { Application, ApplicationFormValues, ApplicationStatus, STATUS_LABELS } from '../types';

const EMPTY_FORM: ApplicationFormValues = {
  company: '',
  position: '',
  url: '',
  status: 'applied',
  salaryFrom: '',
  salaryTo: '',
  notes: '',
  appliedAt: new Date().toISOString().slice(0, 10),
};

interface Props {
  initial?: Application;
  onSubmit: (values: Partial<Application>) => Promise<void>;
  onCancel?: () => void;
}

export function ApplicationForm({ initial, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<ApplicationFormValues>(
    initial
      ? {
          company: initial.company,
          position: initial.position,
          url: initial.url ?? '',
          status: initial.status,
          salaryFrom: initial.salaryFrom?.toString() ?? '',
          salaryTo: initial.salaryTo?.toString() ?? '',
          notes: initial.notes ?? '',
          appliedAt: initial.appliedAt.slice(0, 10),
        }
      : EMPTY_FORM,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        company: values.company,
        position: values.position,
        url: values.url || undefined,
        status: values.status,
        salaryFrom: values.salaryFrom ? Number(values.salaryFrom) : undefined,
        salaryTo: values.salaryTo ? Number(values.salaryTo) : undefined,
        notes: values.notes || undefined,
        appliedAt: values.appliedAt || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить отклик');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="application-form">
      <label>
        Компания
        <input
          required
          value={values.company}
          onChange={(e) => setValues({ ...values, company: e.target.value })}
        />
      </label>
      <label>
        Позиция
        <input
          required
          value={values.position}
          onChange={(e) => setValues({ ...values, position: e.target.value })}
        />
      </label>
      <label>
        Ссылка на вакансию
        <input value={values.url} onChange={(e) => setValues({ ...values, url: e.target.value })} />
      </label>
      <label>
        Статус
        <select
          value={values.status}
          onChange={(e) => setValues({ ...values, status: e.target.value as ApplicationStatus })}
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className="salary-row">
        <label>
          Зарплата от
          <input
            type="number"
            value={values.salaryFrom}
            onChange={(e) => setValues({ ...values, salaryFrom: e.target.value })}
          />
        </label>
        <label>
          Зарплата до
          <input
            type="number"
            value={values.salaryTo}
            onChange={(e) => setValues({ ...values, salaryTo: e.target.value })}
          />
        </label>
      </div>
      <label>
        Дата отклика
        <input
          type="date"
          value={values.appliedAt}
          onChange={(e) => setValues({ ...values, appliedAt: e.target.value })}
        />
      </label>
      <label>
        Заметки
        <textarea value={values.notes} onChange={(e) => setValues({ ...values, notes: e.target.value })} />
      </label>
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Сохранение…' : 'Сохранить'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}

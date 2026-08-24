import { Application, STATUS_LABELS } from '../types';

interface Props {
  applications: Application[];
  onSelect: (application: Application) => void;
  onDelete: (id: number) => void;
}

export function ApplicationList({ applications, onSelect, onDelete }: Props) {
  if (applications.length === 0) {
    return <p className="empty-state">Пока нет ни одного отклика — добавьте первый.</p>;
  }

  return (
    <ul className="application-list" data-testid="application-list">
      {applications.map((application) => (
        <li key={application.id} className={`application-card status-${application.status}`}>
          <div className="application-card__main" onClick={() => onSelect(application)}>
            <strong>{application.position}</strong>
            <span>{application.company}</span>
            <span className="badge">{STATUS_LABELS[application.status]}</span>
            {(application.salaryFrom || application.salaryTo) && (
              <span className="salary">
                {application.salaryFrom ?? '?'}–{application.salaryTo ?? '?'} ₽
              </span>
            )}
          </div>
          <button aria-label={`Удалить отклик ${application.position}`} onClick={() => onDelete(application.id)}>
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}

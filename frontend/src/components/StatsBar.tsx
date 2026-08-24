import { ApplicationStatus, STATUS_LABELS } from '../types';

interface Props {
  counts: Record<ApplicationStatus, number>;
  activeStatus?: ApplicationStatus;
  onFilter: (status?: ApplicationStatus) => void;
}

export function StatsBar({ counts, activeStatus, onFilter }: Props) {
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <div className="stats-bar">
      <button className={activeStatus === undefined ? 'active' : ''} onClick={() => onFilter(undefined)}>
        Все ({total})
      </button>
      {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((status) => (
        <button
          key={status}
          className={activeStatus === status ? 'active' : ''}
          onClick={() => onFilter(status)}
        >
          {STATUS_LABELS[status]} ({counts[status]})
        </button>
      ))}
    </div>
  );
}

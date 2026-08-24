import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApplicationList } from '../src/components/ApplicationList';
import { Application } from '../src/types';

function makeApplication(overrides: Partial<Application> = {}): Application {
  return {
    id: 1,
    userId: 1,
    company: 'Профиторг',
    position: 'Junior Full Stack Developer',
    url: null,
    status: 'applied',
    salaryFrom: 88000,
    salaryTo: 145000,
    notes: null,
    appliedAt: '2026-08-23',
    createdAt: '2026-08-23T00:00:00.000Z',
    updatedAt: '2026-08-23T00:00:00.000Z',
    ...overrides,
  };
}

describe('ApplicationList', () => {
  it('shows an empty state when there are no applications', () => {
    render(<ApplicationList applications={[]} onSelect={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/пока нет ни одного отклика/i)).toBeInTheDocument();
  });

  it('renders each application with company, position and status', () => {
    const applications = [makeApplication(), makeApplication({ id: 2, company: 'Другая компания', status: 'offer' })];
    render(<ApplicationList applications={applications} onSelect={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Профиторг')).toBeInTheDocument();
    expect(screen.getByText('Другая компания')).toBeInTheDocument();
    expect(screen.getByText('Оффер')).toBeInTheDocument();
  });

  it('calls onDelete when the remove button is clicked', () => {
    const onDelete = vi.fn();
    render(<ApplicationList applications={[makeApplication()]} onSelect={vi.fn()} onDelete={onDelete} />);

    fireEvent.click(screen.getByLabelText(/удалить отклик/i));

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('calls onSelect when an application card is clicked', () => {
    const onSelect = vi.fn();
    const application = makeApplication();
    render(<ApplicationList applications={[application]} onSelect={onSelect} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByText('Junior Full Stack Developer'));

    expect(onSelect).toHaveBeenCalledWith(application);
  });
});

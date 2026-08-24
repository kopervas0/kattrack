import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatsBar } from '../src/components/StatsBar';

describe('StatsBar', () => {
  it('renders the total and per-status counts', () => {
    render(
      <StatsBar
        counts={{ applied: 3, interview: 1, offer: 0, rejected: 2 }}
        onFilter={vi.fn()}
      />,
    );

    expect(screen.getByText('Все (6)')).toBeInTheDocument();
    expect(screen.getByText(/Отклик отправлен \(3\)/)).toBeInTheDocument();
  });

  it('calls onFilter with the clicked status', () => {
    const onFilter = vi.fn();
    render(
      <StatsBar counts={{ applied: 3, interview: 1, offer: 0, rejected: 2 }} onFilter={onFilter} />,
    );

    fireEvent.click(screen.getByText(/Оффер/));

    expect(onFilter).toHaveBeenCalledWith('offer');
  });
});

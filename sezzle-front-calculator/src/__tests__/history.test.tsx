import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('Calculator History Functionality', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('stores operations in history and loads into input when clicked', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ operation: '10+20', result: 30, error: null })
    } as Response);

    render(<App />);

    const input = screen.getByRole('textbox', { name: /calculator input/i }) as HTMLInputElement;
    await userEvent.type(input, '10+20');

    const equalsBtn = screen.getByRole('button', { name: /calculate result/i });
    await userEvent.click(equalsBtn);

    // Clear input
    const clearBtn = screen.getByRole('button', { name: /clear expression/i });
    await userEvent.click(clearBtn);
    expect(input.value).toBe('');

    // Open history modal
    const historyBtn = screen.getByRole('button', { name: /open history/i });
    await userEvent.click(historyBtn);

    expect(screen.getByText('Operation History')).toBeInTheDocument();
    const historyEntry = screen.getByRole('button', { name: '10+20' });
    expect(historyEntry).toBeInTheDocument();

    // Click history entry
    await userEvent.click(historyEntry);

    // Modal closes and input receives historical operation
    expect(screen.queryByText('Operation History')).not.toBeInTheDocument();
    expect(input.value).toBe('10+20');
  });
});

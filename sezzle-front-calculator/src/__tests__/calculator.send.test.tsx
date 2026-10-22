import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('Calculator Send Behaviour', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('does NOT call backend when expression is empty and shows red error', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<App />);

    const equalsBtn = screen.getByRole('button', { name: /calculate result/i });
    await userEvent.click(equalsBtn);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Error: Input bad written')).toBeInTheDocument();
  });

  it('does NOT call backend when expression is invalid (e.g. 23+)', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<App />);

    const input = screen.getByRole('textbox', { name: /calculator input/i });
    await userEvent.type(input, '23+');

    const equalsBtn = screen.getByRole('button', { name: /calculate result/i });
    await userEvent.click(equalsBtn);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByText('operator without right number')).toBeInTheDocument();
  });

  it('calls backend when expression is valid', async () => {
    const mockResponse = {
      operation: '2+3',
      result: 5,
      error: null
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response);

    render(<App />);

    const input = screen.getByRole('textbox', { name: /calculator input/i });
    await userEvent.type(input, '2+3');

    const equalsBtn = screen.getByRole('button', { name: /calculate result/i });
    await userEvent.click(equalsBtn);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/v1/calculate'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ operation: '2+3' })
      })
    );
  });
});

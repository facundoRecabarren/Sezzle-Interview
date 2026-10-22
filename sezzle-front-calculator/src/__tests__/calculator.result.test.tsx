import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('Calculator Result & Backend Error Modal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('displays calculated result when backend responds with 200', async () => {
    const mockResponse = {
      operation: '2+3*4',
      result: 14,
      error: null
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response);

    render(<App />);

    const input = screen.getByRole('textbox', { name: /calculator input/i });
    await userEvent.type(input, '2+3*4');

    const equalsBtn = screen.getByRole('button', { name: /calculate result/i });
    await userEvent.click(equalsBtn);

    expect(await screen.findByText('= 14')).toBeInTheDocument();
  });

  it('displays error modal when backend responds with 400 error (e.g. division by zero)', async () => {
    const mockErrorResponse = {
      operation: '4/0',
      result: null,
      error: 'Error: division by zero'
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => mockErrorResponse
    } as Response);

    render(<App />);

    const input = screen.getByRole('textbox', { name: /calculator input/i });
    await userEvent.type(input, '4/0');

    const equalsBtn = screen.getByRole('button', { name: /calculate result/i });
    await userEvent.click(equalsBtn);

    expect(await screen.findByText('Backend Error')).toBeInTheDocument();
    expect(screen.getByText('Error: division by zero')).toBeInTheDocument();

    // Close modal
    const ackBtn = screen.getByRole('button', { name: /acknowledge error/i });
    await userEvent.click(ackBtn);
    expect(screen.queryByText('Backend Error')).not.toBeInTheDocument();
  });
});

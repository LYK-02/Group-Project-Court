import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../App.jsx';

describe('Client Foundation & Neo-Brutalist Shell', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders courtroom hero headline and core branding', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        status: 'healthy',
        version: '1.0.0',
        uptimeSeconds: 42,
        database: { status: 'healthy', latencyMs: 2 },
      }),
    });

    render(<App />);

    expect(
      screen.getByRole('heading', { name: /someone didn't do the work\./i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Docket № 2026-FINAL-EXAM/i)).toBeInTheDocument();
    expect(screen.getByText(/Justice for the Carrying Member/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/API: healthy/i)).toBeInTheDocument();
    });
  });

  it('displays API health status after probe resolves', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        status: 'healthy',
        version: '1.0.0',
        uptimeSeconds: 10,
        database: { status: 'healthy', latencyMs: 4 },
      }),
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/API: healthy/i)).toBeInTheDocument();
    });
  });

  it('validates interactive form field input and displays error state', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ status: 'healthy' }),
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/API: healthy/i)).toBeInTheDocument();
    });

    const validateButton = screen.getByRole('button', { name: /validate input/i });
    fireEvent.click(validateButton);

    expect(
      screen.getByText(/this field cannot be empty in court testimony\./i)
    ).toBeInTheDocument();

    const input = screen.getByLabelText(/defendant display name/i);
    fireEvent.change(input, { target: { value: 'Jordan Lee' } });

    expect(
      screen.queryByText(/this field cannot be empty in court testimony\./i)
    ).not.toBeInTheDocument();
  });
});

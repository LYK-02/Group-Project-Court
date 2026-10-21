import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../App.jsx';
import { createDefaultFetchMock } from './setup.js';

describe('Client Foundation & Neo-Brutalist Shell', () => {
  beforeEach(() => {
    global.fetch = createDefaultFetchMock();
  });

  it('renders courtroom hero headline and core branding', async () => {
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
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/API: healthy/i)).toBeInTheDocument();
    });
  });

  it('validates interactive form field input and displays error state', async () => {
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

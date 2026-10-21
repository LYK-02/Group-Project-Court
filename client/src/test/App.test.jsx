import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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

  it('opens authentication modal when clicking Witness Login button', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/API: healthy/i)).toBeInTheDocument();
    });

    const loginButton = screen.getByRole('button', { name: /witness login/i });
    fireEvent.click(loginButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /accredited sign-in/i })).toBeInTheDocument();
  });

  it('tests all navigation buttons and switches views smoothly', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/API: healthy/i)).toBeInTheDocument();
    });

    // 1. Click Tasks nav button
    const tasksNav = screen.getByRole('button', { name: /tasks/i });
    fireEvent.click(tasksNav);
    expect(screen.getByText(/access to team task boards/i)).toBeInTheDocument();

    // 2. Click Teams & Roster nav button
    const teamsNav = screen.getByRole('button', { name: /teams & roster/i });
    fireEvent.click(teamsNav);
    expect(screen.getByText(/access to project rosters/i)).toBeInTheDocument();

    // 3. Click Audit Ledger nav button
    const auditNav = screen.getByRole('button', { name: /audit ledger/i });
    fireEvent.click(auditNav);
    expect(screen.getByText(/access to the immutable team audit ledger/i)).toBeInTheDocument();

    // 4. Click Courtroom nav button to return home
    const courtroomNav = screen.getByRole('button', { name: /courtroom/i });
    fireEvent.click(courtroomNav);
    expect(screen.getByRole('heading', { name: /someone didn't do the work\./i })).toBeInTheDocument();
  });

  it('opens auth modal via Establish Team and switches between Login and Register tabs', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/API: healthy/i)).toBeInTheDocument();
    });

    const establishButton = screen.getByRole('button', { name: /establish team/i });
    fireEvent.click(establishButton);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: /witness registration/i })).toBeInTheDocument();

    // Switch to Log In tab inside modal
    const loginTab = within(dialog).getByRole('button', { name: /^log in$/i });
    fireEvent.click(loginTab);
    expect(within(dialog).getByRole('heading', { name: /accredited sign-in/i })).toBeInTheDocument();

    // Close dialog with close button
    const closeBtn = within(dialog).getByRole('button', { name: /close dialog/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('verifies that unwanted demo buttons and scaffolding text are completely removed', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/API: healthy/i)).toBeInTheDocument();
    });

    // Verify obsolete test buttons do not exist
    expect(screen.queryByRole('button', { name: /^hot red$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^vivid yellow$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^soft violet$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^neutral white$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^validate input$/i })).not.toBeInTheDocument();

    // Verify obsolete dummy copy does not exist
    expect(screen.queryByText(/git log indicates jordan pushed 0 commits/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/design system specification/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/accessible form controls/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/verified tokens: canvas/i)).not.toBeInTheDocument();

    // Verify Platform Verification Gate scaffolding is removed
    expect(screen.queryByText(/platform verification gate/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/rest api verified/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^health check$/i })).not.toBeInTheDocument();
  });

  it('opens and closes keyboard shortcuts modal via trigger button and hotkey ?', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/API: healthy/i)).toBeInTheDocument();
    });

    // 1. Open via navbar button
    const shortcutsBtn = screen.getByRole('button', { name: /view keyboard shortcuts/i });
    fireEvent.click(shortcutsBtn);

    expect(screen.getByRole('heading', { name: /courtroom keyboard shortcuts/i })).toBeInTheDocument();

    // Close via Dismiss button
    const gotItBtn = screen.getByRole('button', { name: /got it \(dismiss\)/i });
    fireEvent.click(gotItBtn);
    expect(screen.queryByRole('heading', { name: /courtroom keyboard shortcuts/i })).not.toBeInTheDocument();

    // 2. Open via '?' key
    fireEvent.keyDown(window, { key: '?' });
    expect(screen.getByRole('heading', { name: /courtroom keyboard shortcuts/i })).toBeInTheDocument();

    // Close via Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('heading', { name: /courtroom keyboard shortcuts/i })).not.toBeInTheDocument();
  });

  it('navigates views using number key accelerators 1, 2, 3, 4', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/API: healthy/i)).toBeInTheDocument();
    });

    // Press '2' for tasks
    fireEvent.keyDown(window, { key: '2' });
    expect(screen.getByText(/access to team task boards/i)).toBeInTheDocument();

    // Press '3' for teams
    fireEvent.keyDown(window, { key: '3' });
    expect(screen.getByText(/access to project rosters/i)).toBeInTheDocument();

    // Press '4' for audit
    fireEvent.keyDown(window, { key: '4' });
    expect(screen.getByText(/access to the immutable team audit ledger/i)).toBeInTheDocument();

    // Press '1' for courtroom
    fireEvent.keyDown(window, { key: '1' });
    expect(screen.getByRole('heading', { name: /someone didn't do the work\./i })).toBeInTheDocument();
  });
});

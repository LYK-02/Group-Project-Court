import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../features/auth/AuthContext.jsx';
import { AuthModal } from '../features/auth/AuthModal.jsx';
import { TeamProvider } from '../features/teams/TeamContext.jsx';
import { TeamDashboard } from '../features/teams/TeamDashboard.jsx';
import { createDefaultFetchMock } from './setup.js';

describe('Phase 2: Authentication and Teams UI Components', () => {
  beforeEach(() => {
    global.fetch = createDefaultFetchMock();
  });

  describe('<AuthModal />', () => {
    it('does not render when isOpen is false', async () => {
      render(
        <AuthProvider>
          <AuthModal isOpen={false} onClose={() => {}} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('renders login tab by default with email and password inputs', async () => {
      render(
        <AuthProvider>
          <AuthModal isOpen={true} onClose={() => {}} initialTab="login" />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      expect(screen.getByRole('heading', { name: /accredited sign-in/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/university \/ work email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/student \/ display name/i)).not.toBeInTheDocument();
    });

    it('switches to create account tab and shows display name field', async () => {
      render(
        <AuthProvider>
          <AuthModal isOpen={true} onClose={() => {}} initialTab="login" />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const createTab = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(createTab);

      expect(screen.getByRole('heading', { name: /witness registration/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/student \/ display name/i)).toBeInTheDocument();
    });

    it('displays error banner when submission fails', async () => {
      global.fetch = vi.fn().mockImplementation(async (url) => {
        if (url.includes('/auth/login')) {
          return {
            ok: false,
            status: 401,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({
              error: { code: 'UNAUTHORIZED', message: 'Invalid email or password.' },
            }),
          };
        }
        return {
          ok: false,
          status: 401,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ error: { code: 'UNAUTHORIZED' } }),
        };
      });

      render(
        <AuthProvider>
          <AuthModal isOpen={true} onClose={() => {}} initialTab="login" />
        </AuthProvider>
      );

      fireEvent.change(screen.getByLabelText(/university \/ work email/i), {
        target: { value: 'bad@test.edu' },
      });
      fireEvent.change(screen.getByLabelText(/^password/i), {
        target: { value: 'wrongpass' },
      });

      fireEvent.click(screen.getByRole('button', { name: /enter courtroom/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password\./i)).toBeInTheDocument();
      });
    });
  });

  describe('<TeamDashboard />', () => {
    it('displays empty state when user has no teams', async () => {
      global.fetch = vi.fn().mockImplementation(async (url) => {
        if (url.includes('/auth/me')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({
              user: { id: 'u-1', displayName: 'Ada Lovelace', email: 'ada@example.edu' },
            }),
          };
        }
        if (url.includes('/teams')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ teams: [] }),
          };
        }
        return { ok: true, status: 200, headers: new Headers(), json: async () => ({}) };
      });

      render(
        <AuthProvider>
          <TeamProvider>
            <TeamDashboard />
          </TeamProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/no teams enrolled/i)).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /new team/i })).toBeInTheDocument();
    });

    it('renders team list, active roster, and owner controls when user owns a team', async () => {
      const mockTeam = {
        id: 'team-uuid-1',
        name: 'Apollo Guidance Systems',
        ownerId: 'u-1',
        role: 'owner',
        createdAt: new Date().toISOString(),
        memberCount: 2,
        members: [
          {
            id: 'u-1',
            displayName: 'Margaret Hamilton',
            email: 'margaret@apollo.edu',
            role: 'owner',
            joinedAt: new Date().toISOString(),
          },
          {
            id: 'u-2',
            displayName: 'Hal Laning',
            email: 'hal@apollo.edu',
            role: 'member',
            joinedAt: new Date().toISOString(),
          },
        ],
      };

      global.fetch = vi.fn().mockImplementation(async (url) => {
        if (url.includes('/auth/me')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({
              user: { id: 'u-1', displayName: 'Margaret Hamilton', email: 'margaret@apollo.edu' },
            }),
          };
        }
        if (url.endsWith('/teams')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ teams: [mockTeam] }),
          };
        }
        if (url.includes('/teams/team-uuid-1')) {
          return {
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ team: mockTeam }),
          };
        }
        return { ok: true, status: 200, headers: new Headers(), json: async () => ({}) };
      });

      render(
        <AuthProvider>
          <TeamProvider>
            <TeamDashboard />
          </TeamProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Apollo Guidance Systems' })).toBeInTheDocument();
        expect(screen.getByText(/You are Owner/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /issue invite code/i })).toBeInTheDocument();
      expect(screen.getByText('Hal Laning')).toBeInTheDocument();
      expect(screen.getByLabelText(/discharge hal laning/i)).toBeInTheDocument();
    });
  });
});

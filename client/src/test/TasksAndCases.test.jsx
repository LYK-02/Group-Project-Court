import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskBoard } from '../features/tasks/TaskBoard.jsx';
import { CourtroomView } from '../features/cases/CourtroomView.jsx';
import { PublicVerdictView } from '../features/cases/PublicVerdictView.jsx';
import { AuditTimeline } from '../features/audit/AuditTimeline.jsx';
import { AuthProvider } from '../features/auth/AuthContext.jsx';
import { TeamProvider } from '../features/teams/TeamContext.jsx';

describe('Phases 3-5: Tasks, Courtroom Cases, Voting, Verdicts, and Public Dossier UI', () => {
  const mockUser = {
    id: 'user-1234',
    displayName: 'Ada Lovelace',
    email: 'ada@analytical.engine',
  };

  const mockTeam = {
    id: 'team-5678',
    name: 'Analytical Engine Team',
    role: 'owner',
    members: [
      { userId: 'user-1234', displayName: 'Ada Lovelace', role: 'owner' },
      { userId: 'user-9999', displayName: 'Charles Babbage', role: 'member' },
    ],
  };

  const mockTasks = [
    {
      id: 'task-1',
      title: 'Draft Bernoulli Number Algorithm',
      description: 'First computer program in history',
      status: 'in_progress',
      dueAt: null,
      assignee: { id: 'user-1234', displayName: 'Ada Lovelace' },
      creator: { id: 'user-1234', displayName: 'Ada Lovelace' },
    },
    {
      id: 'task-2',
      title: 'Assemble Mechanical Cogwheels',
      description: 'Precision brass gears for calculating unit',
      status: 'todo',
      dueAt: null,
      assignee: null,
      creator: { id: 'user-1234', displayName: 'Ada Lovelace' },
    },
  ];

  const mockCases = [
    {
      id: 'case-1',
      teamId: 'team-5678',
      title: 'The Great Cogwheel Delay',
      description: 'Brass cogs delayed by 6 months.',
      status: 'open',
      createdAt: new Date().toISOString(),
      closedAt: null,
      verdict: null,
      creator: { id: 'user-1234', displayName: 'Ada Lovelace' },
      voteStats: { fair: 1, needsReview: 0, unfair: 3, total: 4 },
    },
  ];

  const mockCaseDetail = {
    ...mockCases[0],
    evidence: [
      {
        id: 'ev-1',
        kind: 'note',
        content: 'Machine shop was closed due to rain.',
        visibility: 'team',
        createdAt: new Date().toISOString(),
        submitter: { id: 'user-9999', displayName: 'Charles Babbage' },
      },
    ],
    userVote: 'unfair',
  };

  const mockAudit = [
    {
      id: 'audit-1',
      teamId: 'team-5678',
      action: 'case.opened',
      entityType: 'case',
      entityId: 'case-1',
      metadata: { title: 'The Great Cogwheel Delay' },
      createdAt: new Date().toISOString(),
      actor: { id: 'user-1234', displayName: 'Ada Lovelace' },
    },
  ];

  function createCustomFetchMock() {
    return vi.fn().mockImplementation(async (url) => {
      const u = typeof url === 'string' ? url : url.url;

      if (u.includes('/auth/me')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ user: mockUser }),
        };
      }

      if (u.includes('/teams/team-5678/tasks')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ tasks: mockTasks }),
        };
      }

      if (u.includes('/teams/team-5678/cases/case-1')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ case: mockCaseDetail }),
        };
      }

      if (u.includes('/teams/team-5678/cases')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ cases: mockCases }),
        };
      }

      if (u.includes('/teams/team-5678/audit')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ auditEvents: mockAudit }),
        };
      }

      if (u.includes('/teams/team-5678')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ team: mockTeam }),
        };
      }

      if (u.includes('/teams')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ teams: [mockTeam] }),
        };
      }

      if (u.includes('/public/cases/test-public-token')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            case: {
              title: 'Public Cogwheel Trial',
              description: 'Publicly audited milestone audit record.',
              status: 'closed',
              verdict: 'GUILTY AS CHARGED: Sentenced to git conflict resolution duty.',
              verdictRuleVersion: 'v1.0-strict-consensus',
              voteStats: { fair: 0, needsReview: 0, unfair: 4, total: 4 },
              evidence: [{ kind: 'note', content: 'Exhibit A', createdAt: new Date().toISOString() }],
            },
          }),
        };
      }

      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      };
    });
  }

  beforeEach(() => {
    global.fetch = createCustomFetchMock();
  });

  describe('<TaskBoard />', () => {
    it('renders Kanban board with To-Do and In-Progress task items', async () => {
      render(
        <AuthProvider>
          <TeamProvider>
            <TaskBoard />
          </TeamProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Draft Bernoulli Number Algorithm')).toBeInTheDocument();
      });

      expect(screen.getByText('Assemble Mechanical Cogwheels')).toBeInTheDocument();
      expect(screen.getAllByText('Ada Lovelace').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Unassigned')).toBeInTheDocument();

      // Test deliverable search filtering
      const searchInput = screen.getByPlaceholderText(/search deliverables/i);
      fireEvent.change(searchInput, { target: { value: 'Bernoulli' } });
      expect(screen.getByText('Draft Bernoulli Number Algorithm')).toBeInTheDocument();
      expect(screen.queryByText('Assemble Mechanical Cogwheels')).not.toBeInTheDocument();

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Assemble Mechanical Cogwheels')).toBeInTheDocument();
    });

    it('opens create task modal when clicking Assign New Task button', async () => {
      render(
        <AuthProvider>
          <TeamProvider>
            <TaskBoard />
          </TeamProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Task Kanban & Deliverables/i)).toBeInTheDocument();
      });

      const assignBtn = screen.getByRole('button', { name: /assign new task/i });
      fireEvent.click(assignBtn);

      expect(screen.getByRole('heading', { name: /assign deliverable/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/task title/i)).toBeInTheDocument();
    });
  });

  describe('<CourtroomView />', () => {
    it('renders cases docket and allows entering single case dossier', async () => {
      render(
        <AuthProvider>
          <TeamProvider>
            <CourtroomView />
          </TeamProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('The Great Cogwheel Delay')).toBeInTheDocument();
      });

      const enterBtn = screen.getByRole('button', { name: /enter courtroom/i });
      fireEvent.click(enterBtn);

      await waitFor(() => {
        expect(screen.getByText(/Juror Voting Station/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Fair \(Exonerate\)/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /needs review/i })).toBeInTheDocument();
      expect(screen.getByText(/Unfair \(Impose Duty\)/i)).toBeInTheDocument();
      expect(screen.getByText(/The Great Cogwheel Delay/i)).toBeInTheDocument();
      expect(screen.getByText(/Machine shop was closed due to rain/i)).toBeInTheDocument();
    });
  });

  describe('<PublicVerdictView />', () => {
    it('retrieves and displays sanitized public verdict and jury vote tally', async () => {
      render(<PublicVerdictView token="test-public-token" onBack={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText('Public Cogwheel Trial')).toBeInTheDocument();
      });

      expect(screen.getByText(/Public Case Dossier/i)).toBeInTheDocument();
      expect(screen.getByText(/GUILTY AS CHARGED/i)).toBeInTheDocument();
      expect(screen.getByText(/Jury Deliberation Breakdown/i)).toBeInTheDocument();
      expect(screen.getByText('Exhibit A')).toBeInTheDocument();
    });
  });

  describe('<AuditTimeline />', () => {
    it('renders chronological forensic audit trail', async () => {
      render(
        <AuthProvider>
          <TeamProvider>
            <AuditTimeline />
          </TeamProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Forensic Audit Ledger/i)).toBeInTheDocument();
      });

      expect(screen.getByText('case.opened')).toBeInTheDocument();
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    });
  });
});

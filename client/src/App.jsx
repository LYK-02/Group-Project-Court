import { useState, useEffect } from 'react';
import {
  Gavel,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { Navbar } from './components/Navbar.jsx';
import { Button } from './components/Button.jsx';
import { Card } from './components/Card.jsx';
import { Badge } from './components/Badge.jsx';
import { VerdictStamp } from './components/VerdictStamp.jsx';
import { ShortcutsModal } from './components/ShortcutsModal.jsx';
import { AuthProvider, useAuth } from './features/auth/AuthContext.jsx';
import { AuthModal } from './features/auth/AuthModal.jsx';
import { TeamProvider, useTeam } from './features/teams/TeamContext.jsx';
import { TeamDashboard } from './features/teams/TeamDashboard.jsx';
import { TaskBoard } from './features/tasks/TaskBoard.jsx';
import { CourtroomView } from './features/cases/CourtroomView.jsx';
import { PublicVerdictView } from './features/cases/PublicVerdictView.jsx';
import { AuditTimeline } from './features/audit/AuditTimeline.jsx';
import { api } from './lib/api.js';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { activeTeam } = useTeam();

  const [activeView, setActiveView] = useState('courtroom'); // 'courtroom' | 'tasks' | 'teams' | 'audit'
  const [publicToken, setPublicToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('share') || null;
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);

  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState(null);

  const openAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  // Keyboard accelerators listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when user is typing in form controls
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
      } else if (e.key === '1') {
        setActiveView('courtroom');
      } else if (e.key === '2') {
        setActiveView('tasks');
      } else if (e.key === '3') {
        setActiveView('teams');
      } else if (e.key === '4') {
        setActiveView('audit');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch API health
  const checkHealth = async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const data = await api.get('/health');
      setHealthData(data);
    } catch (err) {
      setHealthError(err.message || 'API connection failed');
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <Navbar
        apiStatus={healthLoading ? 'checking...' : healthData?.status || 'offline'}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAuth={openAuth}
        onOpenShortcuts={() => setShortcutsModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {healthError && (
          <div className="p-4 bg-hot-red text-white font-bold border-3 border-ink shadow-hard-sm flex items-center justify-between">
            <span>API Connection Alert: {healthError}</span>
            <Button variant="neutral" size="sm" onClick={checkHealth}>
              Retry
            </Button>
          </div>
        )}
        {/* =========================================================================
            PUBLIC CASE VIEW (IF ACCESSING VIA SHARE LINK)
           ========================================================================= */}
        {publicToken ? (
          <PublicVerdictView
            token={publicToken}
            onBack={() => {
              setPublicToken(null);
              window.history.replaceState({}, '', window.location.pathname);
            }}
          />
        ) : (
          <>
            {/* =====================================================================
                VIEW 1: TEAMS & ROSTER JURISDICTION
               ===================================================================== */}
            {activeView === 'teams' && (
              isAuthenticated ? (
                <TeamDashboard />
              ) : (
                <section className="bg-white border-4 border-ink p-8 sm:p-12 shadow-hard-lg max-w-2xl mx-auto text-center space-y-6">
                  <div className="w-16 h-16 bg-vivid-yellow border-3 border-ink shadow-hard-sm mx-auto flex items-center justify-center">
                    <Lock className="w-8 h-8 text-ink stroke-[2.5]" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase text-ink">
                    Authentication Required
                  </h2>
                  <p className="text-sm sm:text-base text-neutral-700 max-w-md mx-auto leading-relaxed">
                    Access to project rosters, invite tokens, and jurisdictional member management is restricted to accredited witnesses.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                    <Button variant="secondary" size="md" onClick={() => openAuth('login')}>
                      Log In
                    </Button>
                    <Button variant="primary" size="md" onClick={() => openAuth('register')}>
                      Create Account
                    </Button>
                  </div>
                </section>
              )
            )}

            {/* =====================================================================
                VIEW 2: TASK BOARD & KANBAN
               ===================================================================== */}
            {activeView === 'tasks' && (
              isAuthenticated ? (
                <TaskBoard />
              ) : (
                <section className="bg-white border-4 border-ink p-8 sm:p-12 shadow-hard-lg max-w-2xl mx-auto text-center space-y-6">
                  <div className="w-16 h-16 bg-soft-violet border-3 border-ink shadow-hard-sm mx-auto flex items-center justify-center">
                    <Lock className="w-8 h-8 text-ink stroke-[2.5]" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase text-ink">
                    Authentication Required
                  </h2>
                  <p className="text-sm sm:text-base text-neutral-700 max-w-md mx-auto leading-relaxed">
                    Access to team task boards, kanban lanes, and milestone deliverables is restricted to accredited members.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                    <Button variant="secondary" size="md" onClick={() => openAuth('login')}>
                      Log In
                    </Button>
                    <Button variant="primary" size="md" onClick={() => openAuth('register')}>
                      Create Account
                    </Button>
                  </div>
                </section>
              )
            )}

            {/* =====================================================================
                VIEW 3: FORENSIC AUDIT LEDGER
               ===================================================================== */}
            {activeView === 'audit' && (
              isAuthenticated ? (
                <AuditTimeline />
              ) : (
                <section className="bg-white border-4 border-ink p-8 sm:p-12 shadow-hard-lg max-w-2xl mx-auto text-center space-y-6">
                  <div className="w-16 h-16 bg-neutral-200 border-3 border-ink shadow-hard-sm mx-auto flex items-center justify-center">
                    <Lock className="w-8 h-8 text-ink stroke-[2.5]" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase text-ink">
                    Authentication Required
                  </h2>
                  <p className="text-sm sm:text-base text-neutral-700 max-w-md mx-auto leading-relaxed">
                    Access to the immutable team audit ledger and forensic logs requires accredited witness credentials.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                    <Button variant="secondary" size="md" onClick={() => openAuth('login')}>
                      Log In
                    </Button>
                    <Button variant="primary" size="md" onClick={() => openAuth('register')}>
                      Create Account
                    </Button>
                  </div>
                </section>
              )
            )}

            {/* =====================================================================
                VIEW 4: COURTROOM DOCKET (IF AUTHENTICATED) OR HERO (IF LOGGED OUT)
               ===================================================================== */}
            {activeView === 'courtroom' && (
              isAuthenticated ? (
                <CourtroomView onOpenPublicCase={(token) => setPublicToken(token)} />
              ) : (
                <>
                  <section
                    id="courtroom-mode"
                    aria-labelledby="courtroom-headline"
                    className="relative bg-white border-4 border-ink p-6 sm:p-12 shadow-hard-lg bg-grid-pattern overflow-hidden"
                  >
              {/* Top Tape Sticker Motif */}
              <div className="inline-block bg-vivid-yellow border-2 border-ink px-4 py-1 text-xs font-black uppercase tracking-widest -rotate-2 mb-6 shadow-hard-sm">
                Docket № 2026-FINAL-EXAM • Evidence Admitted
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-6">
                  <h1
                    id="courtroom-headline"
                    className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-[0.95] text-ink"
                  >
                    Someone <span className="bg-hot-red px-2 text-white border-3 border-ink inline-block transform -rotate-1">didn't</span> do the work.
                  </h1>

                  <p className="text-lg sm:text-xl font-medium text-neutral-800 max-w-2xl leading-relaxed">
                    Group Project Court is a playful web app for student teams. Track tasks with server-authoritative
                    integrity, open consensus-based dispute cases, submit verified evidence notes, and let the jury vote on a satirical verdict.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => {
                        if (isAuthenticated) {
                          setActiveView('teams');
                        } else {
                          openAuth('register');
                        }
                      }}
                    >
                      {isAuthenticated ? (activeTeam ? `Team: ${activeTeam.name}` : 'Manage Teams') : 'Establish Team'}
                    </Button>

                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => {
                        if (isAuthenticated) {
                          setActiveView('teams');
                        } else {
                          openAuth('login');
                        }
                      }}
                    >
                      {isAuthenticated ? 'Join via Invite' : 'Witness Login'}
                    </Button>
                  </div>

                  {/* Satirical entertainment disclaimer per PRD */}
                  <div className="bg-canvas border-2 border-ink p-3 text-xs font-medium flex items-start gap-2.5 max-w-xl">
                    <AlertTriangle className="w-5 h-5 text-hot-red shrink-0 mt-0.5" />
                    <span>
                      <strong>Academic Notice:</strong> This project is a satirical collaboration tool. Verdicts represent playful peer polls, not formal disciplinary sanctions or academic-integrity decisions.
                    </span>
                  </div>
                </div>

                {/* Theatrical Courtroom Graphic Stamp */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-canvas border-3 border-ink shadow-hard space-y-6">
                  <VerdictStamp verdict="GUILTY" subtitle="14 CONSECUTIVE GHOSTED COMMITS" variant="red" />
                  
                  <div className="text-center space-y-1">
                    <span className="text-xs uppercase font-bold text-neutral-600 block">Jury Vote Tally</span>
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="unfair">Unfair: 4</Badge>
                      <Badge variant="fair">Fair: 0</Badge>
                    </div>
                  </div>

                  <div className="w-full border-t-2 border-ink pt-3 text-center text-xs font-mono font-bold">
                    RULE VERSION: V1.0-STRICT-CONSENSUS
                  </div>
                </div>
              </div>
            </section>


            {/* Jurisdictional Workflow Overview */}
            <section aria-labelledby="workflow-title" className="space-y-6">
              <div className="border-b-3 border-ink pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 id="workflow-title" className="text-2xl sm:text-3xl font-black uppercase text-ink">
                    Jurisdictional Protocol
                  </h2>
                  <p className="text-sm text-neutral-700 font-medium">
                    Four-stage peer accountability system for resolving milestone defaults and ghosted deliverables.
                  </p>
                </div>
                <Badge variant="fair" size="md">
                  Standard Court Flow
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card shadow="normal" className="p-6 bg-white space-y-3">
                  <div className="w-10 h-10 bg-vivid-yellow border-2 border-ink flex items-center justify-center font-black text-lg">
                    1
                  </div>
                  <h3 className="font-black uppercase text-base text-ink">
                    Track Milestones & Tasks
                  </h3>
                  <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                    Assign sprint responsibilities on the interactive Kanban board. All status transitions are logged with immutable forensic timestamps.
                  </p>
                </Card>

                <Card shadow="normal" className="p-6 bg-white space-y-3">
                  <div className="w-10 h-10 bg-hot-red text-white border-2 border-ink flex items-center justify-center font-black text-lg">
                    2
                  </div>
                  <h3 className="font-black uppercase text-base text-ink">
                    File Dispute & Admit Evidence
                  </h3>
                  <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                    When ghosting or milestone failure occurs, file a petition with sworn testimony and verified Git commit URLs in the evidence locker.
                  </p>
                </Card>

                <Card shadow="normal" className="p-6 bg-white space-y-3">
                  <div className="w-10 h-10 bg-soft-violet border-2 border-ink flex items-center justify-center font-black text-lg">
                    3
                  </div>
                  <h3 className="font-black uppercase text-base text-ink">
                    Jury Poll & Verdict Engine
                  </h3>
                  <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                    Team peers cast secret juror votes. The server calculates majority consensus and delivers an official satirical ruling stamped on public record.
                  </p>
                </Card>
              </div>
            </section>
                </>
              )
            )}
          </>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />

      {/* Keyboard Shortcuts Docket Modal */}
      <ShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t-4 border-ink bg-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-hot-red" />
            <span className="font-black uppercase text-sm">Group Project Court</span>
            <span className="text-xs text-neutral-500">• Peer Accountability & Verdict Engine</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setShortcutsModalOpen(true)}
              className="text-neutral-700 hover:text-ink underline decoration-2 cursor-pointer flex items-center gap-1.5"
            >
              <span>Shortcuts</span>
              <kbd className="bg-canvas border border-ink px-1.5 py-0.5 font-mono text-[10px]">?</kbd>
            </button>
            <span className="text-neutral-400">•</span>
            <span className="text-neutral-600">Satirical & Playful Student Tribunal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <TeamProvider>
        <AppContent />
      </TeamProvider>
    </AuthProvider>
  );
}

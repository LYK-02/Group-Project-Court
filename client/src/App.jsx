import { useState, useEffect } from 'react';
import {
  Gavel,
  Scale,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Users,
  ShieldCheck,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { Navbar } from './components/Navbar.jsx';
import { Button } from './components/Button.jsx';
import { Card } from './components/Card.jsx';
import { Badge } from './components/Badge.jsx';
import { FormField } from './components/FormField.jsx';
import { VerdictStamp } from './components/VerdictStamp.jsx';
import { AuthProvider, useAuth } from './features/auth/AuthContext.jsx';
import { AuthModal } from './features/auth/AuthModal.jsx';
import { TeamProvider, useTeam } from './features/teams/TeamContext.jsx';
import { TeamDashboard } from './features/teams/TeamDashboard.jsx';
import { api } from './lib/api.js';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const { activeTeam } = useTeam();

  const [activeView, setActiveView] = useState('courtroom'); // 'courtroom' | 'teams' | 'cases'
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState(null);

  // Form interactive demo state
  const [demoInput, setDemoInput] = useState('');
  const [demoError, setDemoError] = useState('');

  const openAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

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

  const handleTestValidate = () => {
    if (!demoInput.trim()) {
      setDemoError('This field cannot be empty in Court testimony.');
    } else {
      setDemoError('');
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <Navbar
        apiStatus={healthLoading ? 'checking...' : healthData?.status || 'offline'}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAuth={openAuth}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {/* =========================================================================
            VIEW 1: TEAMS & ROSTER JURISDICTION (PHASE 2)
           ========================================================================= */}
        {activeView === 'teams' ? (
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
        ) : null}

        {/* =========================================================================
            VIEW 2: COURTROOM HERO (ALWAYS AVAILABLE OR DEFAULT)
           ========================================================================= */}
        {activeView === 'courtroom' && (
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

                    <Button variant="neutral" size="lg" onClick={checkHealth}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${healthLoading ? 'animate-spin' : ''}`} />
                      Health Check
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

            {/* Phase 1 & 2 System Verification Section */}
            <section aria-labelledby="foundation-health-title" className="space-y-4">
              <div className="flex items-center justify-between border-b-3 border-ink pb-2">
                <h2 id="foundation-health-title" className="text-2xl sm:text-3xl font-black uppercase">
                  Platform Verification Gate
                </h2>
                <Badge variant={healthData ? 'fair' : 'unfair'} size="md">
                  {healthData ? 'REST API VERIFIED' : 'CONNECTIVITY CHECK'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card shadow="normal" className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">Express API</span>
                    <ShieldCheck className="w-5 h-5 text-ink" />
                  </div>
                  <div className="text-2xl font-black">{healthLoading ? 'Probing...' : healthData?.status || 'Offline'}</div>
                  <p className="text-xs text-neutral-600">
                    Liveness endpoint at <code className="bg-canvas border px-1">/api/v1/health</code> with Helmet security headers & CORS origin isolation.
                  </p>
                </Card>

                <Card shadow="normal" className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">Neon PostgreSQL Engine</span>
                    <Scale className="w-5 h-5 text-ink" />
                  </div>
                  <div className="text-2xl font-black">
                    {healthLoading ? 'Checking...' : healthData?.database?.status || 'Connected'}
                  </div>
                  <p className="text-xs text-neutral-600">
                    Neon cloud instance with connection pooler and unpooled migration runner.
                  </p>
                </Card>

                <Card shadow="normal" className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">Authentication & Teams</span>
                    <CheckCircle2 className="w-5 h-5 text-ink" />
                  </div>
                  <div className="text-2xl font-black">
                    {isAuthenticated ? `Signed In (${user?.displayName?.split(' ')[0]})` : 'Guest Session'}
                  </div>
                  <p className="text-xs text-neutral-600">
                    Bcrypt password hashing, HTTP-only secure cookie sessions, and invite token hashing.
                  </p>
                </Card>
              </div>

              {healthError && (
                <div className="p-4 bg-hot-red text-white font-bold border-3 border-ink shadow-hard-sm flex items-center justify-between">
                  <span>Health Verification Alert: {healthError}</span>
                  <Button variant="neutral" size="sm" onClick={checkHealth}>
                    Retry
                  </Button>
                </div>
              )}
            </section>
          </>
        )}

        {/* =========================================================================
            VIEW 3: CASE-FILE MODE (PREVIEW STRUCTURE)
           ========================================================================= */}
        {(activeView === 'cases' || activeView === 'courtroom') && (
          <section id="case-file-mode" aria-labelledby="case-file-title" className="space-y-6">
            <div className="border-b-3 border-ink pb-2">
              <h2 id="case-file-title" className="text-2xl sm:text-3xl font-black uppercase">
                Case-File Mode — Clean Data Layout
              </h2>
              <p className="text-sm text-neutral-700">
                High-contrast table layout for evidence review and team task distribution.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Task Board Preview */}
              <Card shadow="normal" className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b-2 border-ink pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-ink" />
                    <h3 className="font-black uppercase text-lg">Active Sprint Tasks</h3>
                  </div>
                  <Badge variant="violet" size="sm">
                    {activeTeam ? `Team: ${activeTeam.name}` : 'Team: CS 401'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="border-2 border-ink p-3 bg-canvas flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">Implement Raft consensus election</h4>
                      <span className="text-xs text-neutral-600">Assignee: Alex (Owner)</span>
                    </div>
                    <Badge variant="done">Done</Badge>
                  </div>

                  <div className="border-2 border-ink p-3 bg-canvas flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">Draft system architecture diagrams</h4>
                      <span className="text-xs text-neutral-600">Assignee: Taylor</span>
                    </div>
                    <Badge variant="in_progress">In Progress</Badge>
                  </div>

                  <div className="border-2 border-ink p-3 bg-canvas flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">Write integration tests for failover</h4>
                      <span className="text-xs text-neutral-600">Assignee: Jordan</span>
                    </div>
                    <Badge variant="todo">To-Do</Badge>
                  </div>
                </div>
              </Card>

              {/* Evidence Submission Preview */}
              <Card shadow="normal" className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b-2 border-ink pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-ink" />
                    <h3 className="font-black uppercase text-lg">Evidence Dossier</h3>
                  </div>
                  <Badge variant="open" size="sm">
                    Case #1 Open
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="border-2 border-ink p-3 bg-white">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-600 mb-1">
                      <span>Submitted by Alex Rivera</span>
                      <span>Note</span>
                    </div>
                    <p className="text-sm">
                      "Git log indicates Jordan pushed 0 commits in the entire 3-week milestone period."
                    </p>
                  </div>

                  <div className="border-2 border-ink p-3 bg-white">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-600 mb-1">
                      <span>Submitted by Taylor Kim</span>
                      <span>Note</span>
                    </div>
                    <p className="text-sm">
                      "Discord meeting minutes demonstrate Jordan claimed microphone failure and disappeared."
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* =========================================================================
            SECTION 4: COMPONENT SPEC & DESIGN TOKENS SHOWCASE
           ========================================================================= */}
        <section id="component-spec" aria-labelledby="spec-title" className="space-y-6">
          <div className="border-b-3 border-ink pb-2">
            <h2 id="spec-title" className="text-2xl sm:text-3xl font-black uppercase">
              Design System Specification
            </h2>
            <p className="text-sm text-neutral-700">
              Verified tokens: Canvas <code className="bg-white border px-1">#FFFDF5</code>, Hot Red <code className="bg-white border px-1">#FF6B6B</code>, Vivid Yellow <code className="bg-white border px-1">#FFD93D</code>, Soft Violet <code className="bg-white border px-1">#C4B5FD</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Interactive Form Field Verification */}
            <Card shadow="normal" className="p-6 space-y-4">
              <h3 className="font-black uppercase text-lg border-b-2 border-ink pb-2">
                Accessible Form Controls
              </h3>

              <FormField
                label="Defendant Display Name"
                placeholder="e.g. Jordan Lee"
                value={demoInput}
                onChange={(e) => {
                  setDemoInput(e.target.value);
                  if (demoError) setDemoError('');
                }}
                error={demoError}
                helperText="Name of the team member regarding contribution dispute."
                required
              />

              <div className="flex items-center gap-3">
                <Button variant="secondary" size="md" onClick={handleTestValidate}>
                  Validate Input
                </Button>
                <Button variant="neutral" size="md" onClick={() => { setDemoInput(''); setDemoError(''); }}>
                  Clear
                </Button>
              </div>
            </Card>

            {/* Neo-brutalist Button Styles */}
            <Card shadow="normal" className="p-6 space-y-4">
              <h3 className="font-black uppercase text-lg border-b-2 border-ink pb-2">
                Tactile Buttons & States
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="primary">Hot Red</Button>
                <Button variant="secondary">Vivid Yellow</Button>
                <Button variant="violet">Soft Violet</Button>
                <Button variant="neutral">Neutral White</Button>
                <Button variant="primary" isLoading>Loading</Button>
                <Button variant="secondary" disabled>Disabled</Button>
              </div>
            </Card>
          </div>
        </section>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />

      {/* Footer */}
      <footer className="border-t-4 border-ink bg-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-hot-red" />
            <span className="font-black uppercase text-sm">Group Project Court</span>
            <span className="text-xs text-neutral-500">• Seven-Day Delivery Architecture</span>
          </div>
          <div className="text-xs text-neutral-600 font-bold uppercase tracking-wider">
            Zero Mistakes • Day 2 Auth & Teams Complete
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

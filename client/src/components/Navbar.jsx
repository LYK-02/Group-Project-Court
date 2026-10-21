import { useState } from 'react';
import { Gavel, Menu, X, Activity, User, LogOut, Users, CheckSquare, History } from 'lucide-react';
import { Badge } from './Badge.jsx';
import { Button } from './Button.jsx';
import { useAuth } from '../features/auth/AuthContext.jsx';
import { useTeam } from '../features/teams/TeamContext.jsx';

export function Navbar({
  apiStatus = 'unknown',
  activeView = 'courtroom',
  setActiveView = () => {},
  onOpenAuth = () => {},
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { activeTeam } = useTeam();

  const handleNavClick = (view) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b-4 border-ink bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Court Branding */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleNavClick('courtroom')}
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-ink text-left cursor-pointer"
            >
              <div className="w-12 h-12 bg-hot-red border-3 border-ink shadow-hard-sm flex items-center justify-center transform group-hover:-rotate-6 transition-transform">
                <Gavel className="w-7 h-7 text-ink stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight uppercase text-ink leading-tight">
                  Group Project Court
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  Justice for the Carrying Member
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
            <button
              type="button"
              onClick={() => handleNavClick('courtroom')}
              className={`font-bold uppercase tracking-wider text-sm flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeView === 'courtroom'
                  ? 'text-ink underline decoration-hot-red decoration-3 underline-offset-4'
                  : 'text-neutral-600 hover:text-ink'
              }`}
            >
              <Gavel className="w-4 h-4" />
              <span>Courtroom</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('tasks')}
              className={`font-bold uppercase tracking-wider text-sm flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeView === 'tasks'
                  ? 'text-ink underline decoration-soft-violet decoration-3 underline-offset-4'
                  : 'text-neutral-600 hover:text-ink'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Tasks</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('teams')}
              className={`font-bold uppercase tracking-wider text-sm flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeView === 'teams'
                  ? 'text-ink underline decoration-vivid-yellow decoration-3 underline-offset-4'
                  : 'text-neutral-600 hover:text-ink'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Teams & Roster</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('audit')}
              className={`font-bold uppercase tracking-wider text-sm flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeView === 'audit'
                  ? 'text-ink underline decoration-neutral-800 decoration-3 underline-offset-4'
                  : 'text-neutral-600 hover:text-ink'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit Ledger</span>
            </button>

            {/* Live API Health Status Badge */}
            <div className="flex items-center gap-2 pl-2 border-l-2 border-neutral-300">
              <Activity className="w-4 h-4 text-neutral-600" />
              <Badge
                variant={apiStatus === 'healthy' ? 'fair' : apiStatus === 'degraded' ? 'needs_review' : 'draft'}
                size="sm"
                pill
              >
                API: {apiStatus}
              </Badge>
            </div>

            {/* Auth State & User Controls */}
            <div className="flex items-center gap-3 pl-3 border-l-2 border-neutral-300">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {activeTeam && (
                    <span className="bg-canvas border-2 border-ink px-2.5 py-1 text-xs font-black uppercase text-ink shadow-hard-xs hidden lg:inline-block">
                      Team: {activeTeam.name}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 bg-neutral-100 border-2 border-ink px-2.5 py-1 text-xs font-bold text-ink">
                    <User className="w-3.5 h-3.5 text-neutral-600" />
                    <span>{user?.displayName}</span>
                  </div>
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={logout}
                    title="Log out of session"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1" />
                    Exit
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={() => onOpenAuth('login')}
                  >
                    Log In
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onOpenAuth('register')}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile menu trigger */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border-2 border-ink bg-vivid-yellow shadow-hard-sm cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-3 border-ink bg-canvas px-4 pt-3 pb-6 space-y-3">
          <button
            type="button"
            onClick={() => handleNavClick('courtroom')}
            className="w-full text-left py-2 font-bold uppercase border-b-2 border-ink cursor-pointer flex items-center gap-2"
          >
            <Gavel className="w-4 h-4" />
            <span>Courtroom Docket</span>
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('tasks')}
            className="w-full text-left py-2 font-bold uppercase border-b-2 border-ink cursor-pointer flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Task Board</span>
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('teams')}
            className="w-full text-left py-2 font-bold uppercase border-b-2 border-ink cursor-pointer flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Teams & Roster</span>
            </span>
            {activeTeam && <span className="text-xs font-normal">({activeTeam.name})</span>}
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('audit')}
            className="w-full text-left py-2 font-bold uppercase border-b-2 border-ink cursor-pointer flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            <span>Audit Ledger</span>
          </button>

          <div className="pt-2 flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="flex items-center justify-between border-t-2 border-ink pt-3">
                <span className="text-xs font-bold font-mono">{user?.displayName}</span>
                <Button variant="neutral" size="sm" onClick={logout}>
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 border-t-2 border-ink pt-3">
                <Button variant="neutral" size="sm" onClick={() => onOpenAuth('login')}>
                  Log In
                </Button>
                <Button variant="primary" size="sm" onClick={() => onOpenAuth('register')}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

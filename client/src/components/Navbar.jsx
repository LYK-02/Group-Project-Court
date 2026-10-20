import { useState } from 'react';
import { Gavel, Menu, X, Activity } from 'lucide-react';
import { Badge } from './Badge.jsx';

export function Navbar({ apiStatus = 'unknown' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b-4 border-ink bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Court Branding */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
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
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
            <a
              href="#courtroom-mode"
              className="font-bold uppercase tracking-wider text-sm hover:underline decoration-hot-red decoration-2 underline-offset-4"
            >
              Courtroom
            </a>
            <a
              href="#case-file-mode"
              className="font-bold uppercase tracking-wider text-sm hover:underline decoration-vivid-yellow decoration-2 underline-offset-4"
            >
              Case Files
            </a>
            <a
              href="#component-spec"
              className="font-bold uppercase tracking-wider text-sm hover:underline decoration-soft-violet decoration-2 underline-offset-4"
            >
              Design Tokens
            </a>

            {/* Live API Health Status Badge */}
            <div className="flex items-center gap-2 pl-4 border-l-2 border-neutral-300">
              <Activity className="w-4 h-4 text-neutral-600" />
              <Badge
                variant={apiStatus === 'healthy' ? 'fair' : apiStatus === 'degraded' ? 'needs_review' : 'draft'}
                size="sm"
                pill
              >
                API: {apiStatus}
              </Badge>
            </div>
          </nav>

          {/* Mobile menu trigger */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border-2 border-ink bg-vivid-yellow shadow-hard-sm"
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
          <a
            href="#courtroom-mode"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-bold uppercase border-b-2 border-ink"
          >
            Courtroom Mode
          </a>
          <a
            href="#case-file-mode"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-bold uppercase border-b-2 border-ink"
          >
            Case Files Mode
          </a>
          <a
            href="#component-spec"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 font-bold uppercase border-b-2 border-ink"
          >
            Design Tokens
          </a>
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase">System Status:</span>
            <Badge variant={apiStatus === 'healthy' ? 'fair' : 'draft'} size="sm">
              {apiStatus}
            </Badge>
          </div>
        </div>
      )}
    </header>
  );
}

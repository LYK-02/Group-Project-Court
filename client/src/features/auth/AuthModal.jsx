import { useState, useEffect } from 'react';
import { X, Lock, Mail, User as UserIcon, AlertTriangle } from 'lucide-react';
import { useAuth } from './AuthContext.jsx';
import { FormField } from '../../components/FormField.jsx';
import { Button } from '../../components/Button.jsx';

export function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState(initialTab); // 'login' | 'register'
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Sync tab with initialTab prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setFormError(null);
      setPassword('');
    }
  }, [isOpen, initialTab]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (tab === 'login') {
        await login({ email, password });
      } else {
        if (!displayName.trim() || displayName.trim().length < 2) {
          throw new Error('Display name must be at least 2 characters long.');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long.');
        }
        await register({ displayName, email, password });
      }
      onClose();
    } catch (err) {
      setFormError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-canvas border-3 border-ink shadow-hard-lg overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="bg-vivid-yellow border-b-3 border-ink px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-ink stroke-[2.5]" />
            <h2 id="auth-modal-title" className="text-lg font-black uppercase tracking-wider text-ink">
              {tab === 'login' ? 'Accredited Sign-In' : 'Witness Registration'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 border-2 border-ink bg-white hover:bg-neutral-100 neo-press cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-ink" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b-3 border-ink bg-white font-bold text-xs uppercase tracking-wider">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setFormError(null);
            }}
            className={`py-3 px-4 text-center cursor-pointer transition-colors border-r-3 border-ink ${
              tab === 'login'
                ? 'bg-canvas text-ink font-black'
                : 'bg-white text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setFormError(null);
            }}
            className={`py-3 px-4 text-center cursor-pointer transition-colors ${
              tab === 'register'
                ? 'bg-canvas text-ink font-black'
                : 'bg-white text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div
              className="bg-hot-red/10 border-2 border-hot-red text-ink p-3 text-xs font-bold flex items-start gap-2 shadow-hard-sm"
              role="alert"
            >
              <AlertTriangle className="w-4 h-4 text-hot-red shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {tab === 'register' && (
            <FormField
              label="Student / Display Name"
              id="auth-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Ada Lovelace"
              required
              helperText="The name that will appear on court filings and verdicts"
            />
          )}

          <FormField
            label="University / Work Email"
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@university.edu"
            required
            helperText={tab === 'register' ? 'We do not sell data. Strictly for project tracking.' : undefined}
          />

          <FormField
            label="Password"
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            helperText={tab === 'register' ? 'Minimum 8 characters with letters and numbers' : undefined}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant={tab === 'login' ? 'secondary' : 'primary'}
              fullWidth
              size="md"
              isLoading={submitting}
            >
              {tab === 'login' ? 'Enter Courtroom' : 'Establish Record'}
            </Button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-neutral-600">
              {tab === 'login' ? "Don't have an account yet?" : 'Already registered with this court?'}
              <button
                type="button"
                onClick={() => {
                  setTab(tab === 'login' ? 'register' : 'login');
                  setFormError(null);
                }}
                className="ml-1 text-ink font-bold underline hover:text-hot-red cursor-pointer"
              >
                {tab === 'login' ? 'Sign up here' : 'Log in here'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

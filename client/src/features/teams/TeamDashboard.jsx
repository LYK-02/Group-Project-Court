import { useState } from 'react';
import {
  Users,
  Plus,
  Key,
  Copy,
  Check,
  Trash2,
  Shield,
  Calendar,
  AlertCircle,
  X,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useTeam } from './TeamContext.jsx';
import { Card } from '../../components/Card.jsx';
import { Button } from '../../components/Button.jsx';
import { Badge } from '../../components/Badge.jsx';
import { FormField } from '../../components/FormField.jsx';

export function TeamDashboard() {
  const { user } = useAuth();
  const {
    teams,
    activeTeam,
    activeTeamId,
    setActiveTeamId,
    createTeam,
    joinTeam,
    createInvite,
    removeMember,
  } = useTeam();

  // Dialog state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeInvite, setActiveInvite] = useState(null); // { code, expiresAt }
  const [copied, setCopied] = useState(false);

  // Form states
  const [newTeamName, setNewTeamName] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [formError, setFormError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isOwner = activeTeam?.ownerId === user?.id || activeTeam?.role === 'owner';

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setFormError(null);
    setActionLoading(true);

    try {
      await createTeam(newTeamName.trim());
      setNewTeamName('');
      setShowCreateModal(false);
    } catch (err) {
      setFormError(err.message || 'Failed to establish new team.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    setFormError(null);
    setActionLoading(true);

    try {
      await joinTeam(inviteCodeInput.trim());
      setInviteCodeInput('');
      setShowJoinModal(false);
    } catch (err) {
      setFormError(err.message || 'Failed to redeem invitation code.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateInvite = async () => {
    if (!activeTeamId) return;
    setActionLoading(true);
    setFormError(null);

    try {
      const res = await createInvite(activeTeamId, 72);
      setActiveInvite(res.invite);
      setCopied(false);
    } catch (err) {
      setFormError(err.message || 'Failed to issue invite.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleRemoveMember = async (targetUserId, targetName) => {
    if (!confirm(`Are you certain you want to discharge "${targetName}" from this team?`)) {
      return;
    }

    try {
      await removeMember(activeTeamId, targetUserId);
    } catch (err) {
      alert(err.message || 'Failed to remove member.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-3 border-ink p-4 shadow-hard">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-vivid-yellow border-2 border-ink shadow-hard-sm">
            <Users className="w-6 h-6 text-ink stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-ink">
              Team Roster & Jurisdiction
            </h1>
            <p className="text-xs text-neutral-600 font-mono">
              Active Member: <span className="font-bold text-ink">{user?.displayName}</span> ({user?.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setFormError(null);
              setShowJoinModal(true);
            }}
          >
            <Key className="w-4 h-4 mr-1.5" />
            Join via Code
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFormError(null);
              setShowCreateModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Team
          </Button>
        </div>
      </div>

      {/* Main Grid: Team Selector Sidebar & Active Team Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Team List / Selector */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-neutral-600 flex items-center justify-between">
            <span>Your Teams ({teams.length})</span>
          </h2>

          {teams.length === 0 ? (
            <Card className="text-center py-8">
              <Users className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <p className="font-bold text-sm text-ink mb-1">No Teams Enrolled</p>
              <p className="text-xs text-neutral-600 mb-4">
                Establish a new project team or redeem an invite code to begin.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Team
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => setShowJoinModal(true)}
                >
                  Enter Invite Code
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {teams.map((t) => {
                const isSelected = t.id === activeTeamId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTeamId(t.id)}
                    className={`w-full text-left p-4 border-3 border-ink transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-vivid-yellow shadow-hard translate-x-1'
                        : 'bg-white hover:bg-neutral-50 shadow-hard-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-black text-ink text-base truncate">{t.name}</p>
                      <Badge variant={t.role === 'owner' ? 'critical' : 'neutral'}>
                        {t.role || (t.ownerId === user?.id ? 'owner' : 'member')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-neutral-600 font-mono">
                      <span>{t.memberCount ?? 1} members</span>
                      <span>Created {new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Columns: Active Team Roster & Controls */}
        <div className="lg:col-span-2 space-y-6">
          {activeTeam ? (
            <Card
              title={activeTeam.name}
              badge={
                <Badge variant={isOwner ? 'critical' : 'active'}>
                  {isOwner ? 'You are Owner' : 'Team Member'}
                </Badge>
              }
            >
              {/* Team Metadata Banner */}
              <div className="bg-[#FFFDF5] border-2 border-ink p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-mono text-neutral-600 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Founded: {new Date(activeTeam.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs font-mono text-neutral-600">
                    Jurisdiction ID: <span className="font-bold text-ink">{activeTeam.id}</span>
                  </p>
                </div>

                {isOwner && (
                  <Button
                    variant="violet"
                    size="sm"
                    onClick={handleGenerateInvite}
                    isLoading={actionLoading}
                  >
                    <Key className="w-4 h-4 mr-1.5" />
                    Issue Invite Code
                  </Button>
                )}
              </div>

              {/* Active Invite Display Banner if created */}
              {activeInvite && (
                <div className="mb-6 p-4 bg-vivid-yellow border-3 border-ink shadow-hard-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 font-black text-sm uppercase text-ink">
                      <Key className="w-4 h-4" />
                      <span>Valid Invitation Code Issued</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveInvite(null)}
                      className="text-ink hover:text-hot-red cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-700 mb-3 font-mono">
                    Share this code with teammates. Valid for 72 hours (expires{' '}
                    {new Date(activeInvite.expiresAt).toLocaleString()}).
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="bg-white border-2 border-ink px-3 py-2 font-mono text-xs font-black select-all flex-1 truncate">
                      {activeInvite.code}
                    </code>
                    <Button
                      variant="neutral"
                      size="sm"
                      onClick={() => handleCopyCode(activeInvite.code)}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-1 text-mint-green" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" /> Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Member Roster Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-ink flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-hot-red" />
                  <span>Enrolled Members ({activeTeam.members?.length || 1})</span>
                </h3>

                <div className="overflow-x-auto border-3 border-ink">
                  <table className="w-full text-left border-collapse bg-white">
                    <thead>
                      <tr className="bg-canvas border-b-3 border-ink text-xs font-black uppercase tracking-wider">
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">Court Role</th>
                        <th className="p-3">Joined Date</th>
                        {isOwner && <th className="p-3 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-ink/10 text-sm">
                      {(activeTeam.members || []).map((m) => {
                        const isSelf = m.id === user?.id;
                        const isMemberOwner = m.role === 'owner';

                        return (
                          <tr key={m.id} className="hover:bg-neutral-50 transition-colors">
                            <td className="p-3 font-bold text-ink">
                              {m.displayName}
                              {isSelf && (
                                <span className="ml-2 text-xs bg-ink text-canvas px-1.5 py-0.5 rounded-none font-mono">
                                  You
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-neutral-600 font-mono text-xs">{m.email}</td>
                            <td className="p-3">
                              <Badge variant={isMemberOwner ? 'critical' : 'neutral'}>
                                {isMemberOwner ? (
                                  <span className="flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Owner
                                  </span>
                                ) : (
                                  'Member'
                                )}
                              </Badge>
                            </td>
                            <td className="p-3 text-neutral-600 font-mono text-xs">
                              {new Date(m.joinedAt).toLocaleDateString()}
                            </td>
                            {isOwner && (
                              <td className="p-3 text-right">
                                {!isMemberOwner && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMember(m.id, m.displayName)}
                                    className="p-1 text-hot-red hover:bg-hot-red/10 border border-transparent hover:border-hot-red cursor-pointer transition-colors"
                                    title="Discharge member from team"
                                    aria-label={`Discharge ${m.displayName}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="text-center py-16">
              <Users className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-black uppercase text-ink mb-2">No Team Selected</h3>
              <p className="text-sm text-neutral-600 max-w-sm mx-auto mb-6">
                Select an existing team from the jurisdiction roster or create a new team for your course project.
              </p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Establish First Team
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Modal: Create Team */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
        >
          <div className="w-full max-w-md bg-canvas border-3 border-ink shadow-hard-lg overflow-hidden animate-scale-up">
            <div className="bg-hot-red text-ink border-b-3 border-ink px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-wider text-ink">
                Establish Team Roster
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 border-2 border-ink bg-white hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5 text-ink" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="p-6 space-y-4">
              {formError && (
                <div className="bg-hot-red/10 border-2 border-hot-red text-ink p-3 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-hot-red shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <FormField
                label="Team / Course Project Name"
                id="create-team-name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g. CS401 Autonomous Rover"
                required
                helperText="Must be between 2 and 100 characters."
              />

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="secondary"
                  isLoading={actionLoading}
                >
                  Create Team
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Join Team via Invite Code */}
      {showJoinModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowJoinModal(false);
          }}
        >
          <div className="w-full max-w-md bg-canvas border-3 border-ink shadow-hard-lg overflow-hidden animate-scale-up">
            <div className="bg-vivid-yellow text-ink border-b-3 border-ink px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-wider text-ink">
                Redeem Team Invitation
              </h2>
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                className="p-1 border-2 border-ink bg-white hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5 text-ink" />
              </button>
            </div>

            <form onSubmit={handleJoinTeam} className="p-6 space-y-4">
              {formError && (
                <div className="bg-hot-red/10 border-2 border-hot-red text-ink p-3 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-hot-red shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <FormField
                label="32-Character Invite Code"
                id="join-invite-code"
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value)}
                placeholder="Paste invitation code here..."
                required
                helperText="Ask your project owner for an invitation token."
              />

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowJoinModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={actionLoading}
                >
                  Join Team
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

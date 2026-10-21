import { useState, useEffect, useCallback } from 'react';
import {
  Gavel,
  Scale,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Plus,
  RefreshCw,
  ExternalLink,
  Lock,
  Link as LinkIcon,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Card } from '../../components/Card.jsx';
import { Button } from '../../components/Button.jsx';
import { Badge } from '../../components/Badge.jsx';
import { FormField } from '../../components/FormField.jsx';
import { VerdictStamp } from '../../components/VerdictStamp.jsx';
import { useTeam } from '../teams/TeamContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../../lib/api.js';

export function CourtroomView({ onOpenPublicCase }) {
  const { user } = useAuth();
  const { activeTeam, activeTeamId } = useTeam();

  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [caseDetail, setCaseDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  // New Case Modal State
  const [isFilingOpen, setIsFilingOpen] = useState(false);
  const [caseTitle, setCaseTitle] = useState('');
  const [caseDescription, setCaseDescription] = useState('');
  const [filingError, setFilingError] = useState('');
  const [filingSubmitting, setFilingSubmitting] = useState(false);

  // Evidence Form State
  const [evidenceKind, setEvidenceKind] = useState('note');
  const [evidenceContent, setEvidenceContent] = useState('');
  const [evidenceVisibility, setEvidenceVisibility] = useState('team');
  const [evidenceSubmitting, setEvidenceSubmitting] = useState(false);
  const [evidenceError, setEvidenceError] = useState('');

  // Public Share State
  const [shareData, setShareData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Load team cases list
  const fetchCases = useCallback(async () => {
    if (!activeTeamId) {
      setCases([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/teams/${activeTeamId}/cases`);
      setCases(res.cases || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch cases docket');
    } finally {
      setLoading(false);
    }
  }, [activeTeamId]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Fast action accelerator: 'n' opens file dispute modal when on cases list
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (!selectedCaseId && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setIsFilingOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCaseId]);

  // Load single case dossier
  const fetchCaseDetail = useCallback(async (caseId) => {
    if (!caseId || !activeTeamId) {
      setCaseDetail(null);
      return;
    }

    try {
      setDetailLoading(true);
      const res = await api.get(`/teams/${activeTeamId}/cases/${caseId}`);
      setCaseDetail(res.case);
    } catch (err) {
      setError(err.message || 'Failed to load case dossier');
    } finally {
      setDetailLoading(false);
    }
  }, [activeTeamId]);

  useEffect(() => {
    if (selectedCaseId) {
      fetchCaseDetail(selectedCaseId);
    }
  }, [selectedCaseId, fetchCaseDetail]);

  const handleFileCase = async (e) => {
    e.preventDefault();
    if (!caseTitle.trim()) {
      setFilingError('Case title is required.');
      return;
    }

    setFilingSubmitting(true);
    setFilingError('');

    try {
      const res = await api.post(`/teams/${activeTeamId}/cases`, {
        title: caseTitle.trim(),
        description: caseDescription.trim() || undefined,
        status: 'open',
      });

      setCaseTitle('');
      setCaseDescription('');
      setIsFilingOpen(false);
      await fetchCases();
      if (res.case?.id) {
        setSelectedCaseId(res.case.id);
      }
    } catch (err) {
      setFilingError(err.message || 'Failed to file case');
    } finally {
      setFilingSubmitting(false);
    }
  };

  const handleVote = async (choice) => {
    if (!caseDetail) return;
    try {
      await api.post(`/teams/${activeTeamId}/cases/${caseDetail.id}/votes`, { choice });
      await fetchCaseDetail(caseDetail.id);
      await fetchCases();
    } catch (err) {
      alert(`Vote failed: ${err.message}`);
    }
  };

  const handleCloseCase = async () => {
    if (!caseDetail) return;
    if (!confirm('Deliver final verdict and conclude this jury trial? This cannot be undone.')) return;

    try {
      await api.post(`/teams/${activeTeamId}/cases/${caseDetail.id}/close`);
      await fetchCaseDetail(caseDetail.id);
      await fetchCases();
    } catch (err) {
      alert(`Failed to close case: ${err.message}`);
    }
  };

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    if (!evidenceContent.trim()) {
      setEvidenceError('Evidence content or link cannot be empty.');
      return;
    }

    setEvidenceSubmitting(true);
    setEvidenceError('');

    try {
      await api.post(`/teams/${activeTeamId}/cases/${caseDetail.id}/evidence`, {
        kind: evidenceKind,
        content: evidenceContent.trim(),
        visibility: evidenceVisibility,
      });

      setEvidenceContent('');
      await fetchCaseDetail(caseDetail.id);
    } catch (err) {
      setEvidenceError(err.message || 'Failed to submit evidence');
    } finally {
      setEvidenceSubmitting(false);
    }
  };

  const handleShareCase = async () => {
    if (!caseDetail) return;
    try {
      const res = await api.post(`/teams/${activeTeamId}/cases/${caseDetail.id}/share`);
      setShareData(res);
      await fetchCaseDetail(caseDetail.id);
    } catch (err) {
      alert(`Failed to generate share link: ${err.message}`);
    }
  };

  const handleRevokeShare = async () => {
    if (!caseDetail) return;
    try {
      await api.delete(`/teams/${activeTeamId}/cases/${caseDetail.id}/share`);
      setShareData(null);
      await fetchCaseDetail(caseDetail.id);
    } catch (err) {
      alert(`Failed to revoke share link: ${err.message}`);
    }
  };

  const copyShareLink = (token) => {
    const fullUrl = `${window.location.origin}${window.location.pathname}?share=${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeTeamId) {
    return (
      <div className="bg-white border-4 border-ink p-8 shadow-hard-lg max-w-xl mx-auto text-center space-y-4">
        <Scale className="w-12 h-12 text-ink mx-auto stroke-[2.5]" />
        <h2 className="text-2xl font-black uppercase">Courtroom Adjourned</h2>
        <p className="text-sm text-neutral-600">
          Select an accredited project team from the Teams tab to initiate a dispute case or deliberate on peer contributions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* =========================================================================
          VIEW A: SINGLE CASE DOSSIER & JURY DELIBERATION
         ========================================================================= */}
      {selectedCaseId && caseDetail ? (
        <div className="space-y-6">
          {/* Back button & Action Bar */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="neutral"
              size="sm"
              onClick={() => {
                setSelectedCaseId(null);
                setShareData(null);
              }}
              className="flex items-center gap-1.5"
            >
              <span>← Back to Court Docket</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="neutral"
                size="sm"
                onClick={() => fetchCaseDetail(selectedCaseId)}
                disabled={detailLoading}
                className="flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${detailLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Dossier</span>
              </Button>
            </div>
          </div>

          {/* Case Header Card */}
          <Card shadow="hard" className="p-6 sm:p-8 bg-white space-y-4 border-4 border-ink">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-3 border-ink pb-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant={caseDetail.status === 'open' ? 'needs_review' : 'fair'}
                  size="md"
                >
                  Status: {caseDetail.status.toUpperCase()}
                </Badge>
                <span className="text-xs font-mono font-bold text-neutral-500">
                  Case ID: #{caseDetail.id.slice(0, 8)}
                </span>
              </div>

              <div className="text-xs text-neutral-600 font-bold">
                Filed by{' '}
                <strong className="text-ink">
                  {caseDetail.creator?.displayName || 'Unknown Filer'}
                </strong>{' '}
                on {new Date(caseDetail.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-ink">
                {caseDetail.title}
              </h1>
              {caseDetail.description && (
                <p className="text-sm sm:text-base text-neutral-800 leading-relaxed font-medium bg-canvas p-4 border-2 border-ink">
                  {caseDetail.description}
                </p>
              )}
            </div>

            {/* Verdict Display (if closed) */}
            {caseDetail.status === 'closed' && (
              <div className="mt-6 p-6 bg-vivid-yellow/20 border-4 border-ink shadow-hard-md space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <Gavel className="w-8 h-8 text-hot-red stroke-[2.5]" />
                    <div>
                      <h2 className="text-lg font-black uppercase text-ink">
                        Official Bench Ruling & Consensus Verdict
                      </h2>
                      <span className="text-xs font-mono text-neutral-600">
                        Rule Engine: {caseDetail.verdictRuleVersion || 'v1.0'}
                      </span>
                    </div>
                  </div>

                  <VerdictStamp
                    verdict={
                      caseDetail.verdict?.includes('GUILTY')
                        ? 'GUILTY'
                        : caseDetail.verdict?.includes('ACQUITTED')
                        ? 'ACQUITTED'
                        : 'COMPROMISE'
                    }
                    variant={
                      caseDetail.verdict?.includes('GUILTY')
                        ? 'red'
                        : caseDetail.verdict?.includes('ACQUITTED')
                        ? 'green'
                        : 'yellow'
                    }
                    subtitle="Adjudicated by Jury"
                  />
                </div>

                <div className="p-4 bg-white border-2 border-ink font-bold text-sm sm:text-base text-ink leading-relaxed">
                  {caseDetail.verdict}
                </div>
              </div>
            )}
          </Card>

          {/* Juror Voting Panel & Deliberation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card shadow="normal" className="lg:col-span-2 p-6 bg-white space-y-6">
              <div className="flex items-center justify-between border-b-2 border-ink pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-6 h-6 text-hot-red stroke-[2.5]" />
                  <h2 className="text-xl font-black uppercase text-ink">
                    Juror Voting Station
                  </h2>
                </div>
                <Badge variant="needs_review" size="sm">
                  {caseDetail.voteStats?.total || 0} Votes Cast
                </Badge>
              </div>

              {/* Vote Stats Bar */}
              <div className="space-y-2" aria-live="polite">
                <div className="flex items-center justify-between text-xs font-black uppercase">
                  <span className="text-[#15803d]">Fair: {caseDetail.voteStats?.fair || 0}</span>
                  <span className="text-amber-800">
                    Needs Review: {caseDetail.voteStats?.needsReview || 0}
                  </span>
                  <span className="text-hot-red">Unfair: {caseDetail.voteStats?.unfair || 0}</span>
                </div>

                <div className="w-full h-5 bg-neutral-200 border-2 border-ink flex overflow-hidden">
                  <div
                    style={{
                      width: `${
                        caseDetail.voteStats?.total > 0
                          ? (caseDetail.voteStats.fair / caseDetail.voteStats.total) * 100
                          : 33.33
                      }%`,
                    }}
                    className="bg-[#22c55e] border-r border-ink transition-all"
                  />
                  <div
                    style={{
                      width: `${
                        caseDetail.voteStats?.total > 0
                          ? (caseDetail.voteStats.needsReview / caseDetail.voteStats.total) * 100
                          : 33.33
                      }%`,
                    }}
                    className="bg-vivid-yellow border-r border-ink transition-all"
                  />
                  <div
                    style={{
                      width: `${
                        caseDetail.voteStats?.total > 0
                          ? (caseDetail.voteStats.unfair / caseDetail.voteStats.total) * 100
                          : 33.33
                      }%`,
                    }}
                    className="bg-hot-red transition-all"
                  />
                </div>
              </div>

              {/* Voting Options */}
              {caseDetail.status === 'open' ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase text-neutral-600">
                    Cast your confidential verdict. You may update your vote until court closes:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleVote('fair')}
                      className={`p-4 border-3 border-ink font-black uppercase text-sm flex flex-col items-center justify-center gap-1 transition-transform cursor-pointer ${
                        caseDetail.userVote === 'fair'
                          ? 'bg-[#22c55e] text-white shadow-hard-sm scale-[1.02]'
                          : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0_#000]'
                      }`}
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      <span>Fair (Exonerate)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVote('needs_review')}
                      className={`p-4 border-3 border-ink font-black uppercase text-sm flex flex-col items-center justify-center gap-1 transition-transform cursor-pointer ${
                        caseDetail.userVote === 'needs_review'
                          ? 'bg-vivid-yellow text-ink shadow-hard-sm scale-[1.02]'
                          : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0_#000]'
                      }`}
                    >
                      <HelpCircle className="w-6 h-6" />
                      <span>Needs Review</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVote('unfair')}
                      className={`p-4 border-3 border-ink font-black uppercase text-sm flex flex-col items-center justify-center gap-1 transition-transform cursor-pointer ${
                        caseDetail.userVote === 'unfair'
                          ? 'bg-hot-red text-white shadow-hard-sm scale-[1.02]'
                          : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0_#000]'
                      }`}
                    >
                      <AlertTriangle className="w-6 h-6" />
                      <span>Unfair (Impose Duty)</span>
                    </button>
                  </div>

                  {caseDetail.userVote && (
                    <div className="text-xs font-bold text-neutral-600 text-center pt-2">
                      Your registered vote:{' '}
                      <strong className="uppercase text-ink font-black">
                        {caseDetail.userVote}
                      </strong>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-neutral-100 border-2 border-neutral-300 text-center text-xs font-bold text-neutral-600 uppercase">
                  Voting is concluded. The verdict has been etched into court record.
                </div>
              )}

              {/* Close Trial Button for Team Owner or Filer */}
              {caseDetail.status === 'open' &&
                (activeTeam?.role === 'owner' || caseDetail.creator?.id === user?.id) && (
                  <div className="pt-4 border-t-2 border-ink flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-neutral-600 font-bold">
                      Team owner / filer privilege: Deliver final consensus verdict.
                    </div>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleCloseCase}
                      className="flex items-center gap-2"
                    >
                      <Gavel className="w-4 h-4" />
                      <span>Deliver Verdict & Close Trial</span>
                    </Button>
                  </div>
                )}
            </Card>

            {/* Public Sharing & Link Generation */}
            <Card shadow="normal" className="p-6 bg-white space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-ink pb-3">
                <Share2 className="w-5 h-5 text-hot-red stroke-[2.5]" />
                <h3 className="font-black uppercase text-sm sm:text-base">
                  Public Summons & Share
                </h3>
              </div>

              <p className="text-xs text-neutral-600 font-medium">
                Generate a high-entropy public link to share this case readout with advisors, professors, or team channels.
              </p>

              {shareData || caseDetail.isShared ? (
                <div className="space-y-3 p-3 bg-canvas border-2 border-ink">
                  <div className="text-xs font-bold text-[#15803d] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Public Share Active</span>
                  </div>

                  {shareData?.token && (
                    <div className="space-y-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => copyShareLink(shareData.token)}
                        className="w-full flex items-center justify-center gap-1.5 text-xs"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
                      </Button>

                      {onOpenPublicCase && (
                        <Button
                          variant="neutral"
                          size="sm"
                          onClick={() => onOpenPublicCase(shareData.token)}
                          className="w-full flex items-center justify-center gap-1.5 text-xs"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>View Public Page</span>
                        </Button>
                      )}
                    </div>
                  )}

                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={handleRevokeShare}
                    className="w-full text-xs text-hot-red hover:bg-hot-red/10"
                  >
                    Revoke Public Access
                  </Button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShareCase}
                  className="w-full flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Generate Share Link</span>
                </Button>
              )}
            </Card>
          </div>

          {/* Evidence Locker */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Submit Evidence Form */}
            {caseDetail.status === 'open' ? (
              <Card shadow="normal" className="p-6 bg-white space-y-4">
                <div className="flex items-center gap-2 border-b-2 border-ink pb-3">
                  <FileText className="w-5 h-5 text-hot-red stroke-[2.5]" />
                  <h3 className="font-black uppercase text-sm sm:text-base">
                    Submit Exhibit / Evidence
                  </h3>
                </div>

                {evidenceError && (
                  <div className="bg-hot-red/10 border-2 border-hot-red p-2 text-hot-red text-xs font-bold">
                    {evidenceError}
                  </div>
                )}

                <form onSubmit={handleAddEvidence} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-black uppercase text-ink">
                      Evidence Kind
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEvidenceKind('note')}
                        className={`p-2 border-2 border-ink text-xs font-black uppercase ${
                          evidenceKind === 'note' ? 'bg-vivid-yellow' : 'bg-white'
                        }`}
                      >
                        Witness Note
                      </button>
                      <button
                        type="button"
                        onClick={() => setEvidenceKind('url')}
                        className={`p-2 border-2 border-ink text-xs font-black uppercase ${
                          evidenceKind === 'url' ? 'bg-vivid-yellow' : 'bg-white'
                        }`}
                      >
                        Web / Git URL
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-black uppercase text-ink">
                      {evidenceKind === 'url' ? 'Link URL' : 'Written Testimony'}
                    </label>
                    {evidenceKind === 'url' ? (
                      <input
                        type="url"
                        placeholder="https://github.com/org/repo/pull/42"
                        value={evidenceContent}
                        onChange={(e) => setEvidenceContent(e.target.value)}
                        className="w-full bg-white border-2 border-ink p-2 text-sm focus:outline-none focus:ring-2 focus:ring-vivid-yellow font-mono"
                        required
                      />
                    ) : (
                      <textarea
                        rows={3}
                        placeholder="Detail the circumstances, timestamp, or milestone disparity..."
                        value={evidenceContent}
                        onChange={(e) => setEvidenceContent(e.target.value)}
                        className="w-full bg-white border-2 border-ink p-2 text-sm focus:outline-none focus:ring-2 focus:ring-vivid-yellow"
                        required
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-black uppercase text-ink">
                      Visibility
                    </label>
                    <select
                      value={evidenceVisibility}
                      onChange={(e) => setEvidenceVisibility(e.target.value)}
                      className="w-full bg-white border-2 border-ink p-2 text-xs font-bold"
                    >
                      <option value="team">Team Visible (Public to Roster)</option>
                      <option value="private_to_submitter">Private (Only You See This)</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="w-full"
                    isLoading={evidenceSubmitting}
                  >
                    Submit Exhibit
                  </Button>
                </form>
              </Card>
            ) : (
              <Card shadow="normal" className="p-6 bg-neutral-100 space-y-3">
                <div className="flex items-center gap-2 text-neutral-600 font-black uppercase text-sm">
                  <Lock className="w-5 h-5" />
                  <span>Evidence Locker Sealed</span>
                </div>
                <p className="text-xs text-neutral-600 font-medium">
                  This trial has officially concluded. New exhibits may no longer be admitted to the record.
                </p>
              </Card>
            )}

            {/* Exhibits List */}
            <Card shadow="normal" className="lg:col-span-2 p-6 bg-white space-y-4">
              <div className="flex items-center justify-between border-b-2 border-ink pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-ink stroke-[2.5]" />
                  <h3 className="font-black uppercase text-sm sm:text-base">
                    Admitted Exhibits & Evidence ({caseDetail.evidence?.length || 0})
                  </h3>
                </div>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {!caseDetail.evidence || caseDetail.evidence.length === 0 ? (
                  <div className="border-2 border-dashed border-neutral-300 p-6 text-center text-xs font-bold uppercase text-neutral-500">
                    No exhibits submitted yet. File witness testimony above.
                  </div>
                ) : (
                  caseDetail.evidence.map((exhibit) => (
                    <div
                      key={exhibit.id}
                      className="p-3 bg-canvas border-2 border-ink space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-neutral-300 pb-1.5">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={exhibit.kind === 'url' ? 'needs_review' : 'draft'}
                            size="sm"
                          >
                            {exhibit.kind.toUpperCase()}
                          </Badge>
                          <span className="font-bold text-ink">
                            By {exhibit.submitter?.displayName || 'Witness'}
                          </span>
                        </div>
                        <span className="text-neutral-500 font-mono">
                          {new Date(exhibit.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {exhibit.kind === 'url' ? (
                        <a
                          href={exhibit.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-hot-red font-bold hover:underline flex items-center gap-1.5 break-all"
                        >
                          <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{exhibit.content}</span>
                        </a>
                      ) : (
                        <p className="text-neutral-800 font-medium whitespace-pre-wrap leading-relaxed">
                          {exhibit.content}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW B: TEAM COURT DOCKET (CASES LIST)
           ========================================================================= */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border-4 border-ink p-6 shadow-hard-md">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-ink flex items-center gap-2">
                  <Gavel className="w-7 h-7 text-hot-red stroke-[2.5]" />
                  <span>Dispute Docket & Courtroom</span>
                </h1>
                <Badge variant="needs_review" size="md">
                  {cases.length} Cases
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 font-bold mt-1">
                Active jurisdictional peer disputes for team:{' '}
                <span className="text-hot-red">{activeTeam?.name}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="neutral"
                size="sm"
                onClick={fetchCases}
                disabled={loading}
                className="flex items-center gap-1.5"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Docket</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsFilingOpen(true)}
                className="flex items-center gap-1.5"
                title="File new dispute petition (Shortcut: N)"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>File New Dispute</span>
                <kbd className="hidden sm:inline bg-canvas border border-ink px-1 text-[10px] font-mono font-black ml-1">N</kbd>
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-hot-red/10 border-3 border-hot-red p-4 text-hot-red font-bold text-sm flex items-center gap-2 shadow-hard-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Cases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cases.length === 0 ? (
              <div className="md:col-span-2 border-4 border-dashed border-neutral-300 p-12 text-center bg-white space-y-3">
                <Scale className="w-12 h-12 text-neutral-400 mx-auto" />
                <h2 className="text-xl font-black uppercase text-neutral-600">
                  Clean Docket — No Disputes Filed
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
                  All peer contributions are presently in harmony. If a milestone disparity occurs, file a dispute above.
                </p>
              </div>
            ) : (
              cases.map((c) => (
                <Card
                  key={c.id}
                  shadow="normal"
                  className="p-6 bg-white space-y-4 hover:translate-y-[-2px] transition-transform flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={c.status === 'open' ? 'needs_review' : 'fair'}
                        size="sm"
                      >
                        {c.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs font-mono text-neutral-500 font-bold">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h2 className="text-lg font-black uppercase text-ink leading-tight">
                      {c.title}
                    </h2>

                    {c.description && (
                      <p className="text-xs text-neutral-700 line-clamp-3 leading-relaxed">
                        {c.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 pt-3 border-t-2 border-ink">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-600">
                      <span>Filer: {c.creator?.displayName}</span>
                      <span>Votes: {c.voteStats?.total || 0}</span>
                    </div>

                    <Button
                      variant={c.status === 'open' ? 'secondary' : 'neutral'}
                      size="sm"
                      onClick={() => setSelectedCaseId(c.id)}
                      className="w-full flex items-center justify-center gap-1.5"
                    >
                      <span>Enter Courtroom</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: File New Dispute */}
      {isFilingOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-ink p-6 sm:p-8 shadow-hard-lg max-w-lg w-full space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b-3 border-ink pb-3">
              <h2 className="text-xl font-black uppercase text-ink flex items-center gap-2">
                <Gavel className="w-5 h-5 text-hot-red" />
                <span>File Dispute Petition</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsFilingOpen(false)}
                className="font-black text-xl hover:text-hot-red transition-colors"
              >
                ✕
              </button>
            </div>

            {filingError && (
              <div className="bg-hot-red/10 border-2 border-hot-red p-3 text-hot-red text-xs font-bold">
                {filingError}
              </div>
            )}

            <form onSubmit={handleFileCase} className="space-y-4">
              <FormField
                label="Case Title / Charge"
                placeholder="e.g. Unfinished Backend Service Module"
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
                required
              />

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-ink">
                  Detailed Charges & Circumstances
                </label>
                <textarea
                  rows={4}
                  value={caseDescription}
                  onChange={(e) => setCaseDescription(e.target.value)}
                  placeholder="Outline the missing work, broken promises, or deadline impact..."
                  className="w-full bg-white border-3 border-ink p-2 text-sm focus:outline-none focus:ring-2 focus:ring-vivid-yellow"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-ink">
                <Button
                  type="button"
                  variant="neutral"
                  size="md"
                  onClick={() => setIsFilingOpen(false)}
                >
                  Dismiss
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={filingSubmitting}
                >
                  File Dispute
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

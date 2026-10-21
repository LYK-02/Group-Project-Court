import { useState, useEffect } from 'react';
import { Gavel, Scale, AlertCircle, FileText, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/Card.jsx';
import { Button } from '../../components/Button.jsx';
import { Badge } from '../../components/Badge.jsx';
import { VerdictStamp } from '../../components/VerdictStamp.jsx';
import { api } from '../../lib/api.js';

export function PublicVerdictView({ token, onBack }) {
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPublicCase() {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/public/cases/${encodeURIComponent(token.trim())}`);
        setCaseData(res.case);
      } catch (err) {
        setError(err.message || 'Public case dossier could not be retrieved.');
      } finally {
        setLoading(false);
      }
    }

    loadPublicCase();
  }, [token]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-ink border-t-hot-red rounded-none animate-spin mx-auto" />
        <h2 className="text-xl font-black uppercase text-ink">Retrieving Public Court Record...</h2>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-xl mx-auto bg-white border-4 border-ink p-8 shadow-hard-lg text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-hot-red mx-auto stroke-[2.5]" />
        <h2 className="text-2xl font-black uppercase text-ink">Case Record Unavailable</h2>
        <p className="text-sm text-neutral-600 font-medium">
          {error || 'This public case docket may have been revoked or does not exist.'}
        </p>
        <Button variant="primary" size="md" onClick={onBack} className="mt-4">
          Return to Group Project Court
        </Button>
      </div>
    );
  }

  const isUnfairMajority =
    caseData.voteStats?.unfair >= caseData.voteStats?.fair &&
    caseData.voteStats?.unfair >= caseData.voteStats?.needsReview;

  const isFairMajority =
    caseData.voteStats?.fair > caseData.voteStats?.unfair &&
    caseData.voteStats?.fair >= caseData.voteStats?.needsReview;

  const verdictType = isUnfairMajority ? 'GUILTY' : isFairMajority ? 'ACQUITTED' : 'COMPROMISE';
  const stampVariant = isUnfairMajority ? 'red' : isFairMajority ? 'green' : 'yellow';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95">
      {/* Return button */}
      <div>
        <Button
          variant="neutral"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courtroom</span>
        </Button>
      </div>

      {/* Main Public Dossier Card */}
      <Card shadow="hard" className="p-6 sm:p-10 bg-white border-4 border-ink space-y-8">
        {/* Court Summons Header */}
        <div className="border-b-4 border-ink pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-vivid-yellow border-3 border-ink shadow-hard-sm flex items-center justify-center">
              <Scale className="w-7 h-7 text-ink stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-hot-red">
                Official Peer Tribunal Record
              </span>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-ink">
                Public Case Dossier
              </h1>
            </div>
          </div>

          <Badge variant="needs_review" size="md">
            Verified Public Record
          </Badge>
        </div>

        {/* Case Title & Statement */}
        <div className="space-y-3">
          <h2 className="text-xl sm:text-3xl font-black uppercase text-ink leading-tight">
            {caseData.title}
          </h2>

          {caseData.description && (
            <div className="bg-canvas border-3 border-ink p-4 sm:p-6 text-sm sm:text-base text-neutral-800 leading-relaxed font-medium">
              {caseData.description}
            </div>
          )}
        </div>

        {/* Official Verdict Banner */}
        {caseData.verdict && (
          <div className="p-6 bg-vivid-yellow/20 border-4 border-ink shadow-hard-md space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Gavel className="w-8 h-8 text-hot-red stroke-[2.5]" />
                <h3 className="text-lg font-black uppercase text-ink">
                  Consensus Bench Ruling
                </h3>
              </div>

              <VerdictStamp
                verdict={verdictType}
                variant={stampVariant}
                subtitle="Public Record"
              />
            </div>

            <p className="bg-white border-2 border-ink p-4 text-sm sm:text-base font-bold text-ink leading-relaxed">
              {caseData.verdict}
            </p>
          </div>
        )}

        {/* Jury Vote Stats */}
        <div className="space-y-3 border-t-3 border-ink pt-6">
          <h3 className="text-sm font-black uppercase tracking-wider text-ink flex items-center gap-2">
            <Scale className="w-4 h-4 text-hot-red" />
            <span>Jury Deliberation Breakdown ({caseData.voteStats?.total || 0} Total Votes)</span>
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#22c55e]/15 border-2 border-ink p-3 text-center">
              <div className="text-xl font-black text-[#15803d]">
                {caseData.voteStats?.fair || 0}
              </div>
              <div className="text-[11px] font-black uppercase text-[#15803d]">Fair / Exonerated</div>
            </div>

            <div className="bg-vivid-yellow/20 border-2 border-ink p-3 text-center">
              <div className="text-xl font-black text-amber-800">
                {caseData.voteStats?.needsReview || 0}
              </div>
              <div className="text-[11px] font-black uppercase text-amber-800">Needs Review</div>
            </div>

            <div className="bg-hot-red/15 border-2 border-ink p-3 text-center">
              <div className="text-xl font-black text-hot-red">
                {caseData.voteStats?.unfair || 0}
              </div>
              <div className="text-[11px] font-black uppercase text-hot-red">Unfair / Penalty</div>
            </div>
          </div>
        </div>

        {/* Public Exhibits */}
        {caseData.evidence && caseData.evidence.length > 0 && (
          <div className="space-y-4 border-t-3 border-ink pt-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-ink flex items-center gap-2">
              <FileText className="w-4 h-4 text-ink" />
              <span>Public Admitted Exhibits ({caseData.evidence.length})</span>
            </h3>

            <div className="space-y-3">
              {caseData.evidence.map((ex, idx) => (
                <div key={idx} className="p-3 bg-canvas border-2 border-ink space-y-1 text-xs">
                  <div className="flex items-center justify-between text-neutral-500 font-mono text-[10px]">
                    <span className="font-bold uppercase">Exhibit #{idx + 1} ({ex.kind})</span>
                    <span>{new Date(ex.createdAt).toLocaleDateString()}</span>
                  </div>

                  {ex.kind === 'url' ? (
                    <a
                      href={ex.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-hot-red font-mono font-bold hover:underline flex items-center gap-1 break-all"
                    >
                      <LinkIcon className="w-3 h-3 flex-shrink-0" />
                      <span>{ex.content}</span>
                    </a>
                  ) : (
                    <p className="text-neutral-800 font-medium whitespace-pre-wrap">{ex.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

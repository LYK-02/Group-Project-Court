import { useState, useEffect, useCallback } from 'react';
import { History, User, RefreshCw, AlertCircle } from 'lucide-react';
import { Card } from '../../components/Card.jsx';
import { Button } from '../../components/Button.jsx';
import { Badge } from '../../components/Badge.jsx';
import { useTeam } from '../teams/TeamContext.jsx';
import { api } from '../../lib/api.js';

export function AuditTimeline() {
  const { activeTeam, activeTeamId } = useTeam();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAudit = useCallback(async () => {
    if (!activeTeamId) {
      setEvents([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/teams/${activeTeamId}/audit`);
      setEvents(res.auditEvents || []);
    } catch (err) {
      setError(err.message || 'Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  }, [activeTeamId]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  if (!activeTeamId) {
    return (
      <div className="bg-white border-4 border-ink p-8 shadow-hard-lg max-w-xl mx-auto text-center space-y-4">
        <History className="w-12 h-12 text-ink mx-auto stroke-[2.5]" />
        <h2 className="text-2xl font-black uppercase">No Active Team Selected</h2>
        <p className="text-sm text-neutral-600">
          Select a project team to view its forensic immutable activity log and jury filings.
        </p>
      </div>
    );
  }

  const getActionBadgeVariant = (action) => {
    if (action.includes('created') || action.includes('joined') || action.includes('opened')) {
      return 'fair';
    }
    if (action.includes('closed') || action.includes('deleted') || action.includes('revoked')) {
      return 'unfair';
    }
    return 'needs_review';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border-4 border-ink p-6 shadow-hard-md">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-ink flex items-center gap-2">
              <History className="w-7 h-7 text-hot-red stroke-[2.5]" />
              <span>Forensic Audit Ledger</span>
            </h1>
            <Badge variant="needs_review" size="md">
              {events.length} Records
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 font-bold mt-1">
            Immutable chronological transaction logs for team:{' '}
            <span className="text-hot-red">{activeTeam?.name}</span>
          </p>
        </div>

        <Button
          variant="neutral"
          size="sm"
          onClick={fetchAudit}
          disabled={loading}
          className="flex items-center gap-1.5"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </Button>
      </div>

      {error && (
        <div className="bg-hot-red/10 border-3 border-hot-red p-4 text-hot-red font-bold text-sm flex items-center gap-2 shadow-hard-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Timeline Stream */}
      <Card shadow="normal" className="p-6 bg-white space-y-4">
        {events.length === 0 ? (
          <div className="border-2 border-dashed border-neutral-300 p-8 text-center text-sm font-bold uppercase text-neutral-500">
            No audit records found for this jurisdiction yet.
          </div>
        ) : (
          <div className="relative border-l-4 border-ink ml-4 pl-6 space-y-6">
            {events.map((event) => (
              <div key={event.id} className="relative group">
                {/* Timeline node pip */}
                <div className="absolute -left-[35px] top-1 w-5 h-5 bg-vivid-yellow border-3 border-ink rounded-none shadow-[2px_2px_0_#000]" />

                <div className="bg-canvas border-3 border-ink p-4 shadow-hard-sm space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={getActionBadgeVariant(event.action)} size="sm">
                        {event.action}
                      </Badge>
                      <span className="text-xs font-mono font-bold uppercase text-neutral-600">
                        {event.entityType} #{event.entityId?.slice(0, 8)}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-neutral-500 font-bold">
                      {new Date(event.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-ink">
                    <User className="w-3.5 h-3.5 text-neutral-600" />
                    <span>
                      Actor:{' '}
                      <strong className="text-hot-red">
                        {event.actor?.displayName || 'System'}
                      </strong>
                    </span>
                    {event.actor?.email && (
                      <span className="text-neutral-500 font-mono">
                        ({event.actor.email})
                      </span>
                    )}
                  </div>

                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="bg-white border-2 border-ink p-2 text-xs font-mono overflow-x-auto">
                      <pre className="text-[11px] text-neutral-800 whitespace-pre-wrap">
                        {JSON.stringify(event.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

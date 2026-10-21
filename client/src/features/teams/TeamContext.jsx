import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api.js';
import { useAuth } from '../auth/AuthContext.jsx';

const TeamContext = createContext(null);

export function TeamProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [teams, setTeams] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [activeTeamDetails, setActiveTeamDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeams = useCallback(async () => {
    if (!isAuthenticated) {
      setTeams([]);
      setActiveTeamId(null);
      setActiveTeamDetails(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/teams');
      setTeams(res.teams || []);

      // If no team is currently active and user has teams, default to first team
      if (res.teams?.length > 0 && !activeTeamId) {
        setActiveTeamId(res.teams[0].id);
      }
    } catch (err) {
      console.error('Failed to load user teams:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, activeTeamId]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Load detailed roster whenever activeTeamId changes
  const fetchActiveTeamDetails = useCallback(async (teamId) => {
    if (!teamId || !isAuthenticated) {
      setActiveTeamDetails(null);
      return;
    }

    try {
      const res = await api.get(`/teams/${teamId}`);
      setActiveTeamDetails(res.team);
    } catch (err) {
      console.error('Failed to load team roster:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeTeamId) {
      fetchActiveTeamDetails(activeTeamId);
    }
  }, [activeTeamId, fetchActiveTeamDetails]);

  const createTeam = async (name) => {
    setError(null);
    try {
      const res = await api.post('/teams', { name });
      const newTeam = res.team;
      setTeams((prev) => [newTeam, ...prev]);
      setActiveTeamId(newTeam.id);
      await fetchActiveTeamDetails(newTeam.id);
      return newTeam;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const joinTeam = async (inviteCode) => {
    setError(null);
    try {
      const res = await api.post(`/invites/${encodeURIComponent(inviteCode.trim())}/join`);
      await fetchTeams();
      if (res.team?.id) {
        setActiveTeamId(res.team.id);
        await fetchActiveTeamDetails(res.team.id);
      }
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const createInvite = async (teamId, expiresInHours = 72) => {
    return api.post(`/teams/${teamId}/invites`, { expiresInHours });
  };

  const removeMember = async (teamId, userId) => {
    const res = await api.delete(`/teams/${teamId}/members/${userId}`);
    await fetchActiveTeamDetails(teamId);
    return res;
  };

  const value = {
    teams,
    activeTeamId,
    activeTeam: activeTeamDetails || teams.find((t) => t.id === activeTeamId) || null,
    setActiveTeamId,
    loading,
    error,
    refreshTeams: fetchTeams,
    refreshActiveTeam: () => fetchActiveTeamDetails(activeTeamId),
    createTeam,
    joinTeam,
    createInvite,
    removeMember,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}

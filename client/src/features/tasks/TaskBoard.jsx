import { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare,
  User,
  Plus,
  Trash2,
  AlertCircle,
  Calendar,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { Card } from '../../components/Card.jsx';
import { Button } from '../../components/Button.jsx';
import { Badge } from '../../components/Badge.jsx';
import { FormField } from '../../components/FormField.jsx';
import { useTeam } from '../teams/TeamContext.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../../lib/api.js';

export function TaskBoard() {
  const { user } = useAuth();
  const { activeTeam, activeTeamId } = useTeam();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('all');

  // New task modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [newDueAt, setNewDueAt] = useState('');
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fast action accelerator: 'n' opens new task dialog
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!activeTeamId) {
      setTasks([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/teams/${activeTeamId}/tasks`);
      setTasks(res.tasks || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [activeTeamId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setModalError('Task title is required.');
      return;
    }

    setSubmitting(true);
    setModalError('');

    try {
      const payload = {
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        assigneeId: newAssigneeId || undefined,
        dueAt: newDueAt ? new Date(newDueAt).toISOString() : undefined,
      };

      await api.post(`/teams/${activeTeamId}/tasks`, payload);
      setNewTitle('');
      setNewDescription('');
      setNewAssigneeId('');
      setNewDueAt('');
      setIsModalOpen(false);
      await fetchTasks();
    } catch (err) {
      setModalError(err.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/teams/${activeTeamId}/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to permanently delete this task?')) return;
    try {
      await api.delete(`/teams/${activeTeamId}/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      alert(`Failed to delete task: ${err.message}`);
    }
  };

  if (!activeTeamId) {
    return (
      <div className="bg-white border-4 border-ink p-8 shadow-hard-lg max-w-xl mx-auto text-center space-y-4">
        <CheckSquare className="w-12 h-12 text-ink mx-auto stroke-[2.5]" />
        <h2 className="text-2xl font-black uppercase">No Active Team Selected</h2>
        <p className="text-sm text-neutral-600">
          Select or create a project team in the Teams tab to manage milestone tasks and peer responsibilities.
        </p>
      </div>
    );
  }

  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.assignee?.displayName?.toLowerCase().includes(q);

    const matchesAssignee =
      filterAssignee === 'all' ||
      (filterAssignee === 'unassigned' && !t.assignee) ||
      t.assignee?.id === filterAssignee ||
      t.assigneeId === filterAssignee;

    return matchesSearch && matchesAssignee;
  });

  const columns = [
    {
      id: 'todo',
      title: 'To-Do / Assigned',
      bgColor: 'bg-neutral-100',
      badgeColor: 'draft',
      tasks: filteredTasks.filter((t) => t.status === 'todo'),
    },
    {
      id: 'in_progress',
      title: 'In Progress / Active',
      bgColor: 'bg-vivid-yellow/20',
      badgeColor: 'needs_review',
      tasks: filteredTasks.filter((t) => t.status === 'in_progress'),
    },
    {
      id: 'done',
      title: 'Completed / Evidenced',
      bgColor: 'bg-[#22c55e]/15',
      badgeColor: 'fair',
      tasks: filteredTasks.filter((t) => t.status === 'done'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Task Board Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border-4 border-ink p-6 shadow-hard-md">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-ink">
              Task Kanban & Deliverables
            </h1>
            <Badge variant="fair" size="md">
              {filteredTasks.length} of {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 font-bold mt-1">
            Track individual accountability for team: <span className="text-hot-red">{activeTeam?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="neutral"
            size="sm"
            onClick={fetchTasks}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5"
            title="Assign deliverable (Shortcut: N)"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Assign New Task</span>
            <kbd className="hidden sm:inline bg-canvas border border-ink px-1 text-[10px] font-mono font-black ml-1">N</kbd>
          </Button>
        </div>
      </div>

      {/* Search & Assignee Filter Bar */}
      <div className="bg-white border-3 border-ink p-4 shadow-hard-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deliverables by title or assignee..."
            className="w-full bg-canvas border-2 border-ink pl-9 pr-8 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-vivid-yellow"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-ink cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 shrink-0">
            Assignee:
          </span>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="w-full sm:w-auto bg-canvas border-2 border-ink py-2 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-vivid-yellow"
          >
            <option value="all">All Members ({tasks.length})</option>
            <option value="unassigned">Unassigned Only</option>
            {activeTeam?.members?.map((m) => (
              <option key={m.userId || m.id} value={m.userId || m.id}>
                {m.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-hot-red/10 border-3 border-hot-red p-4 text-hot-red font-bold text-sm flex items-center gap-2 shadow-hard-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div
            key={col.id}
            className={`border-4 border-ink p-4 shadow-hard-md flex flex-col min-h-[500px] ${col.bgColor}`}
          >
            <div className="flex items-center justify-between border-b-3 border-ink pb-3 mb-4">
              <h2 className="font-black uppercase tracking-wide text-sm sm:text-base flex items-center gap-2">
                <span>{col.title}</span>
              </h2>
              <Badge variant={col.badgeColor} size="sm">
                {col.tasks.length}
              </Badge>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {col.tasks.length === 0 ? (
                <div className="border-2 border-dashed border-neutral-400 p-6 text-center text-xs font-bold uppercase text-neutral-500">
                  No tasks in this lane
                </div>
              ) : (
                col.tasks.map((task) => (
                  <Card
                    key={task.id}
                    shadow="normal"
                    className="p-4 bg-white space-y-3 hover:translate-y-[-2px] transition-transform"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-black text-sm text-ink leading-tight">
                        {task.title}
                      </h3>
                      {(activeTeam?.role === 'owner' || task.creator?.id === user?.id) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-neutral-400 hover:text-hot-red transition-colors p-1"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-neutral-700 leading-snug line-clamp-3">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200 text-xs">
                      {task.assignee ? (
                        <div className="flex items-center gap-1 font-bold bg-vivid-yellow/30 border border-ink px-2 py-0.5">
                          <User className="w-3 h-3 text-ink" />
                          <span className="truncate max-w-[120px]">
                            {task.assignee.displayName}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-neutral-500 font-bold italic px-1">
                          <span>Unassigned</span>
                        </div>
                      )}

                      {task.dueAt && (
                        <div className="flex items-center gap-1 text-neutral-600 font-bold ml-auto">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(task.dueAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Move Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                      {col.id === 'in_progress' && (
                        <Button
                          variant="neutral"
                          size="sm"
                          onClick={() => handleStatusChange(task.id, 'todo')}
                          className="text-[10px] px-2 py-1 flex items-center gap-1"
                          title="Move Back to Todo"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          <span>To-Do</span>
                        </Button>
                      )}

                      {col.id === 'todo' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStatusChange(task.id, 'in_progress')}
                          className="text-[10px] px-2 py-1 ml-auto flex items-center gap-1"
                          title="Start Progress"
                        >
                          <span>Start</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      )}

                      {col.id === 'in_progress' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStatusChange(task.id, 'done')}
                          className="text-[10px] px-2 py-1 ml-auto flex items-center gap-1"
                          title="Mark Complete"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Complete</span>
                        </Button>
                      )}

                      {col.id === 'done' && (
                        <Button
                          variant="neutral"
                          size="sm"
                          onClick={() => handleStatusChange(task.id, 'in_progress')}
                          className="text-[10px] px-2 py-1 flex items-center gap-1"
                          title="Reopen Task"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          <span>Reopen</span>
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Task */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-ink p-6 sm:p-8 shadow-hard-lg max-w-lg w-full space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b-3 border-ink pb-3">
              <h2 className="text-xl font-black uppercase text-ink flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-hot-red" />
                <span>Assign Deliverable</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="font-black text-xl hover:text-hot-red transition-colors"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="bg-hot-red/10 border-2 border-hot-red p-3 text-hot-red text-xs font-bold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <FormField
                label="Task Title"
                placeholder="e.g. Implement PostgreSQL schema migrations"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-ink">
                  Task Details & Evidence Expectations
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Specific requirements, acceptance criteria, or branch names..."
                  className="w-full bg-white border-3 border-ink p-2 text-sm focus:outline-none focus:ring-2 focus:ring-vivid-yellow"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-ink">
                  Assignee (Team Member)
                </label>
                <select
                  value={newAssigneeId}
                  onChange={(e) => setNewAssigneeId(e.target.value)}
                  className="w-full bg-white border-3 border-ink p-2 text-sm focus:outline-none focus:ring-2 focus:ring-vivid-yellow font-bold"
                >
                  <option value="">-- Unassigned (Free for Grab) --</option>
                  {activeTeam?.members?.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.displayName} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-ink">
                  Deadline / Due Date
                </label>
                <input
                  type="date"
                  value={newDueAt}
                  onChange={(e) => setNewDueAt(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white border-3 border-ink p-2 text-sm focus:outline-none focus:ring-2 focus:ring-vivid-yellow font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-ink">
                <Button
                  type="button"
                  variant="neutral"
                  size="md"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={submitting}
                >
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

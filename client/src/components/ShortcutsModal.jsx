import { useEffect } from 'react';
import { X, Command, Keyboard } from 'lucide-react';
import { Button } from './Button.jsx';

export function ShortcutsModal({ isOpen, onClose }) {
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

  const shortcuts = [
    {
      category: 'Navigation Accelerators',
      items: [
        { key: '1', label: 'Courtroom Docket' },
        { key: '2', label: 'Task Kanban Board' },
        { key: '3', label: 'Teams & Roster Jurisdiction' },
        { key: '4', label: 'Forensic Audit Ledger' },
      ],
    },
    {
      category: 'Tactical Actions',
      items: [
        { key: 'N', label: 'New Task / File Dispute (in active view)' },
        { key: '?', label: 'Toggle Keyboard Shortcuts Docket' },
        { key: 'Esc', label: 'Dismiss Modal / Close Dialog' },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-canvas border-3 border-ink shadow-hard-lg overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="bg-vivid-yellow border-b-3 border-ink px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-ink stroke-[2.5]" />
            <h2 id="shortcuts-modal-title" className="text-lg font-black uppercase tracking-wider text-ink">
              Courtroom Keyboard Shortcuts
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

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <p className="text-xs text-neutral-700 font-medium leading-relaxed">
            Fast keyboard accelerators for accredited students. Shortcuts are inactive when typing in text fields.
          </p>

          <div className="space-y-5">
            {shortcuts.map((group) => (
              <div key={group.category} className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-600 flex items-center gap-1.5 border-b-2 border-ink pb-1">
                  <Command className="w-3.5 h-3.5" />
                  <span>{group.category}</span>
                </h3>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {group.items.map((sc) => (
                    <div
                      key={sc.key}
                      className="flex items-center justify-between p-2.5 bg-white border-2 border-ink shadow-[2px_2px_0_#000]"
                    >
                      <span className="text-xs font-bold text-ink">{sc.label}</span>
                      <kbd className="inline-block bg-canvas border-2 border-ink px-2.5 py-1 text-xs font-mono font-black text-ink shadow-[1px_1px_0_#000]">
                        {sc.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="neutral" size="sm" onClick={onClose}>
              Got It (Dismiss)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

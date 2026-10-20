
/**
 * Theatrical courtroom verdict stamp motif with slight rotation and bold border.
 */
export function VerdictStamp({
  verdict = 'GUILTY',
  subtitle,
  variant = 'red',
  className = '',
}) {
  const variants = {
    red: 'border-hot-red text-hot-red shadow-[6px_6px_0_#FF6B6B]',
    yellow: 'border-vivid-yellow text-ink bg-vivid-yellow shadow-[6px_6px_0_#000]',
    ink: 'border-ink text-ink shadow-[6px_6px_0_#000]',
    green: 'border-[#22c55e] text-[#15803d] shadow-[6px_6px_0_#22c55e]',
  };

  return (
    <div
      className={`inline-block border-4 uppercase font-black px-6 py-3 tracking-widest text-center select-none transform -rotate-3 transition-transform hover:rotate-0 ${variants[variant] || variants.red} ${className}`}
      role="status"
      aria-label={`Official Court Verdict: ${verdict}`}
    >
      <div className="text-2xl sm:text-4xl leading-none">{verdict}</div>
      {subtitle && (
        <div className="text-xs tracking-wider mt-1 border-t-2 border-current pt-1 font-bold">
          {subtitle}
        </div>
      )}
    </div>
  );
}

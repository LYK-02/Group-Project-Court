
/**
 * Reusable neo-brutalist tactile button with bold border and hard shadow.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  id,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-bold uppercase tracking-wider border-3 border-ink neo-press select-none transition-all focus:outline-none focus-visible:outline-ink focus-visible:outline-offset-2';

  const variants = {
    primary: 'bg-hot-red text-ink shadow-hard hover:bg-[#ff5252]',
    secondary: 'bg-vivid-yellow text-ink shadow-hard hover:bg-[#ffd014]',
    violet: 'bg-soft-violet text-ink shadow-hard hover:bg-[#b5a3fb]',
    neutral: 'bg-white text-ink shadow-hard hover:bg-neutral-100',
    outline: 'bg-transparent text-ink border-3 border-ink shadow-hard hover:bg-white',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 h-9',
    md: 'text-sm px-5 py-2.5 h-11',
    lg: 'text-base px-7 py-3.5 h-14',
  };

  const widthStyle = fullWidth ? 'w-full' : '';
  const disabledStyle = disabled || isLoading ? 'opacity-50 cursor-not-allowed shadow-none active:translate-x-0 active:translate-y-0' : 'cursor-pointer';

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${widthStyle} ${disabledStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 border-2 border-ink border-t-transparent rounded-full" viewBox="0 0 24 24" />
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

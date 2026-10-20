
/**
 * Reusable neo-brutalist Card container with black border and hard drop shadow.
 */
export function Card({
  children,
  className = '',
  shadow = 'normal',
  bg = 'white',
  interactive = false,
  ...props
}) {
  const backgrounds = {
    white: 'bg-white',
    canvas: 'bg-canvas',
    yellow: 'bg-vivid-yellow',
    red: 'bg-hot-red',
    violet: 'bg-soft-violet',
  };

  const shadows = {
    none: '',
    sm: 'shadow-hard-sm',
    normal: 'shadow-hard',
    md: 'shadow-hard-md',
    lg: 'shadow-hard-lg',
  };

  const interactiveStyle = interactive ? 'neo-card-lift cursor-pointer' : '';

  return (
    <div
      className={`border-3 border-ink ${backgrounds[bg] || backgrounds.white} ${shadows[shadow] || shadows.normal} ${interactiveStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

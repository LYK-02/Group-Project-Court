import React from 'react';

/**
 * Reusable neo-brutalist form input/textarea with prominent label, border, and error state.
 */
export function FormField({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  as = 'input',
  rows = 4,
  disabled = false,
  className = '',
  ...props
}) {
  const inputId = id || `field-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const baseInputStyles =
    'w-full bg-white text-ink border-3 border-ink px-4 py-2.5 font-medium rounded-none transition-all placeholder:text-neutral-500 focus:outline-none focus:bg-[#fffde7] focus:shadow-hard-sm disabled:bg-neutral-100 disabled:cursor-not-allowed';

  const errorStyles = error ? 'border-hot-red ring-2 ring-hot-red' : '';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-bold uppercase tracking-wider text-ink flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-hot-red ml-1" aria-hidden="true">*</span>}
          </span>
          {required && <span className="text-xs text-neutral-600 font-normal">Required</span>}
        </label>
      )}

      {as === 'textarea' ? (
        <textarea
          id={inputId}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
          className={`${baseInputStyles} ${errorStyles}`}
          {...props}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined}
          className={`${baseInputStyles} ${errorStyles}`}
          {...props}
        />
      )}

      {error ? (
        <p id={`${inputId}-error`} className="text-xs font-bold text-hot-red mt-0.5" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-help`} className="text-xs text-neutral-600 mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

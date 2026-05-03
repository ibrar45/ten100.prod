export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center rounded-[var(--radius-md)] px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

  const variants = {
    primary: 'bg-[var(--color-primary)] text-white hover:brightness-95',
    secondary:
      'border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:bg-slate-50',
    success: 'bg-[var(--color-success)] text-white hover:brightness-95',
    danger: 'bg-[var(--color-danger)] text-white hover:brightness-95',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

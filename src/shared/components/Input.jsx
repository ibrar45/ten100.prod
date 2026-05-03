export default function Input({ className = '', ...rest }) {
  return (
    <input
      className={`h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] ${className}`}
      {...rest}
    />
  )
}

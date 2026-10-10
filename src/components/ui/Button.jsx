const VARIANTS = {
  primary: 'bg-brand-red text-white hover:bg-brand-redDark active:scale-[0.98]',
  outline: 'border border-brand-red text-brand-red hover:bg-brand-red/5',
  ghost: 'text-brand-dark hover:bg-black/5'
};

export function Button({ variant = 'primary', className = '', disabled, children, ...props }) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-card px-5 py-3 text-sm font-semibold
        transition disabled:opacity-40 disabled:pointer-events-none ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

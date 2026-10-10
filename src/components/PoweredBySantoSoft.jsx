export function PoweredBySantoSoft({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-1.5 py-4 ${className}`}>
      <span className="text-xs text-brand-dark/50">Powered by</span>
      <img src="/branding/santosoft-logo.png" alt="SantoSoft" className="h-5 w-auto opacity-75" />
    </div>
  );
}

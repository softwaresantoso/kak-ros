export function Card({ className = '', children, ...props }) {
  return (
    <div className={`rounded-card bg-white shadow-sm border border-black/5 ${className}`} {...props}>
      {children}
    </div>
  );
}

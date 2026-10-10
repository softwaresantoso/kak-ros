export function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 text-brand-dark/60">
      <p className="font-semibold text-brand-dark">{title}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
    </div>
  );
}

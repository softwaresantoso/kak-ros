import { Card } from '../ui/Card';

export function StatCard({ label, value, sub }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-brand-dark/50 font-medium">{label}</p>
      <p className="font-extrabold text-2xl mt-1">{value}</p>
      {sub && <p className="text-xs text-brand-dark/40 mt-0.5">{sub}</p>}
    </Card>
  );
}

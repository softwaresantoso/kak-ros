import { Card } from '../ui/Card';

export function TopProductsList({ products }) {
  if (products.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-sm font-semibold mb-1">Menu Terlaris</p>
        <p className="text-sm text-brand-dark/40">Belum ada penjualan.</p>
      </Card>
    );
  }

  const max = Math.max(...products.map((p) => p.qty));

  return (
    <Card className="p-4">
      <p className="text-sm font-semibold mb-3">Menu Terlaris</p>
      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.name}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">{p.name}</span>
              <span className="text-brand-dark/50">{p.qty} terjual</span>
            </div>
            <div className="h-2 rounded-full bg-black/5">
              <div
                className="h-2 rounded-full bg-brand-red"
                style={{ width: `${(p.qty / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
